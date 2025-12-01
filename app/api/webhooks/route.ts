import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEvolutionAPI } from '@/lib/evolution-api';
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

    // Handle messages.upsert event for AI processing
    if (eventType === 'messages.upsert') {
      const message = body.data;

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
              const api = getEvolutionAPI();
              await api.sendText(instanceName, {
                number: remoteJid.replace('@s.whatsapp.net', ''),
                text: aiResponse,
                delay: 1200,
                linkPreview: true
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

    const api = getEvolutionAPI();
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

    const api = getEvolutionAPI();
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
