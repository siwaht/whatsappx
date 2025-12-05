import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEvolutionAPI } from '@/lib/evolution-api';
import { getEvolutionClientForInstance, getEvolutionClientForUser } from '@/lib/evolution-client';
import { prisma } from '@/lib/prisma';

// POST /api/webhooks - Receive webhook events (no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const instanceName = body.instance || 'unknown';
    const eventType = body.event || 'unknown';

    // Store webhook event in database
    await prisma.webhookEvent.create({
      data: {
        instanceName,
        eventType,
        payload: body,
      }
    });

    // Handle messages.upsert event for AI processing and stats
    if (eventType === 'messages.upsert') {
      const message = body.data;

      // Save message stat
      if (message.message) {
        await prisma.messageStat.create({
          data: {
            instanceName,
            remoteJid: message.key.remoteJid,
            direction: message.key.fromMe ? 'SEND' : 'RECEIVE',
            messageType: Object.keys(message.message)[0] || 'unknown',
            status: 'DELIVERED', // Default status for upsert
          }
        });

        // Sync Contact
        if (!message.key.fromMe) {
          // Keep legacy cache for now
          await prisma.contactCache.upsert({
            where: { remoteJid: message.key.remoteJid },
            update: {
              pushName: message.pushName || undefined,
              instanceName,
              updatedAt: new Date(),
            },
            create: {
              instanceName,
              remoteJid: message.key.remoteJid,
              pushName: message.pushName,
              isGroup: message.key.remoteJid.endsWith('@g.us'),
            }
          });

          // Sync to Contact table
          await prisma.contact.upsert({
            where: {
              instanceName_remoteJid: {
                instanceName,
                remoteJid: message.key.remoteJid,
              },
            },
            update: {
              pushName: message.pushName || undefined,
              lastSeenAt: new Date(),
            },
            create: {
              instanceName,
              remoteJid: message.key.remoteJid,
              pushName: message.pushName,
              name: message.pushName || message.key.remoteJid.split('@')[0],
              phone: message.key.remoteJid.split('@')[0],
            },
          });
        }

        // Sync Conversation
        const conversation = await prisma.conversation.upsert({
          where: {
            instanceName_remoteJid: {
              instanceName,
              remoteJid: message.key.remoteJid,
            },
          },
          update: {
            lastMessageAt: new Date(),
            lastMessage:
              message.message?.conversation ||
              message.message?.extendedTextMessage?.text ||
              message.message?.imageMessage?.caption ||
              'Media message',
            unreadCount: message.key.fromMe ? undefined : { increment: 1 },
          },
          create: {
            instanceName,
            remoteJid: message.key.remoteJid,
            lastMessageAt: new Date(),
            lastMessage:
              message.message?.conversation ||
              message.message?.extendedTextMessage?.text ||
              message.message?.imageMessage?.caption ||
              'Media message',
            unreadCount: message.key.fromMe ? 0 : 1,
            contact: {
              connectOrCreate: {
                where: {
                  instanceName_remoteJid: {
                    instanceName,
                    remoteJid: message.key.remoteJid,
                  },
                },
                create: {
                  instanceName,
                  remoteJid: message.key.remoteJid,
                  pushName: message.pushName,
                  name: message.pushName || message.key.remoteJid.split('@')[0],
                  phone: message.key.remoteJid.split('@')[0],
                },
              },
            },
          },
        });

        // Sync Message
        const messageContent =
          message.message?.conversation ||
          message.message?.extendedTextMessage?.text ||
          message.message?.imageMessage?.caption ||
          '';

        const messageType = Object.keys(message.message || {})[0] || 'unknown';

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            keyId: message.key.id,
            fromMe: message.key.fromMe,
            type: messageType,
            content: messageContent,
            status: 'delivered',
            timestamp: new Date(message.messageTimestamp * 1000),
          },
        });
      }

      // Ignore messages sent by the bot itself or status updates
      if (!message.key.fromMe && message.message) {
        const remoteJid = message.key.remoteJid;
        const textMessage = message.message.conversation ||
          message.message.extendedTextMessage?.text ||
          null;

        if (textMessage) {
          // Check if instance has an active AI agent linked
          const config = await prisma.instanceConfig.findUnique({
            where: { instanceName },
            include: { aiAgent: true },
          });

          if (config?.aiAgent && config.aiAgent.isActive) {
            const { getAIClient } = await import('@/lib/ai');
            const aiClient = getAIClient();

            const aiResponse = await aiClient.generateCompletion(
              config.aiAgent.systemPrompt,
              textMessage,
              config.aiAgent.model,
              config.aiAgent.temperature
            );

            if (aiResponse) {
              const api = await getEvolutionClientForInstance(instanceName);
              await api.sendText(instanceName, {
                number: remoteJid.replace('@s.whatsapp.net', ''),
                text: aiResponse,
                delay: 1200,
                linkPreview: true
              });

              // Log the AI response as a sent message stat
              await prisma.messageStat.create({
                data: {
                  instanceName,
                  remoteJid,
                  direction: 'SEND',
                  messageType: 'conversation',
                  status: 'SENT',
                }
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/webhooks - Get webhook configuration
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.permissions.includes('webhooks.read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const instanceName = searchParams.get('instance');

    if (!instanceName) {
      return NextResponse.json(
        { error: 'Instance name is required' },
        { status: 400 }
      );
    }

    const api = await getEvolutionClientForUser(parseInt(session.user.id));
    const config = await api.getWebhook(instanceName);

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Error fetching webhook config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get webhook configuration' },
      { status: 500 }
    );
  }
}

// PUT /api/webhooks - Update webhook configuration
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.permissions.includes('webhooks.update')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { instanceName, enabled, url, events, webhookByEvents } = body;

    if (!instanceName) {
      return NextResponse.json(
        { error: 'Instance name is required' },
        { status: 400 }
      );
    }

    const api = await getEvolutionClientForUser(parseInt(session.user.id));
    await api.setWebhook(instanceName, {
      enabled,
      url,
      events,
      webhook_by_events: webhookByEvents,
    });

    return NextResponse.json({ message: 'Webhook configured successfully' });
  } catch (error: any) {
    console.error('Error updating webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to set webhook configuration' },
      { status: 500 }
    );
  }
}
