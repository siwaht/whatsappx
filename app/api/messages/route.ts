import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getEvolutionAPI } from '@/lib/evolution-api';
import { getEvolutionClientForUser } from '@/lib/evolution-client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });

    const messages = await prisma.message.findMany({
      where: { conversationId: parseInt(conversationId) },
      orderBy: { timestamp: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { instanceName, remoteJid, content, conversationId } = body;

    const api = await getEvolutionClientForUser(parseInt(session.user.id));
    const result = await api.sendText(instanceName, {
      number: remoteJid.replace('@s.whatsapp.net', ''),
      text: content,
      delay: 0,
      linkPreview: true
    });

    // Save to DB
    // Note: Webhook will also save it, but we might want to save it immediately for UI responsiveness
    // However, to avoid duplicates, we should rely on webhook or use the ID returned by Evolution.
    // Evolution returns the message object.

    // Ideally, we wait for webhook. But for better UX, we can optimistically add it.
    // For now, let's just return the result and let the frontend poll or wait for webhook.
    // Or we can create it here if we have the ID.

    if (result?.data?.key?.id) {
      await prisma.message.create({
        data: {
          conversationId: parseInt(conversationId),
          keyId: result.data.key.id,
          fromMe: true,
          type: 'text',
          content: content,
          status: 'sent',
          timestamp: new Date(),
        }
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
