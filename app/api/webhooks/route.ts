import { NextRequest, NextResponse } from 'next/server';
import { Evolution } from '@/lib/evolution';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await db.webhookEvent.create({
      data: {
        event: body.event,
        instance: body.instance,
        data: body.data,
        destination: body.destination,
      },
    });

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const instanceName = searchParams.get('instance');

    if (!instanceName) {
      return NextResponse.json(
        { error: 'Instance name is required' },
        { status: 400 }
      );
    }

    const result = await Evolution.webhook.getWebhook(instanceName);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to get webhook configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { instanceName, enabled, url, events, webhookByEvents } = body;

    if (!instanceName) {
      return NextResponse.json(
        { error: 'Instance name is required' },
        { status: 400 }
      );
    }

    const result = await Evolution.webhook.setWebhook(instanceName, {
      enabled,
      url,
      events,
      webhookByEvents,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to set webhook configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Webhook configured successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
