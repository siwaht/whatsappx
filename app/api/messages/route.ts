import { NextRequest, NextResponse } from 'next/server';
import { Evolution } from '@/lib/evolution';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instanceName, number, text, mediaUrl, mediaType, fileName, caption } = body;

    if (!instanceName || typeof instanceName !== 'string') {
      return NextResponse.json(
        { error: 'Instance name is required' },
        { status: 400 }
      );
    }

    if (!number || typeof number !== 'string') {
      return NextResponse.json(
        { error: 'Recipient number is required' },
        { status: 400 }
      );
    }

    let result;

    if (mediaUrl) {
      result = await Evolution.message.sendMedia(instanceName, {
        number,
        mediaUrl,
        mediaType,
        fileName,
        caption,
      });
    } else {
      if (!text) {
        return NextResponse.json(
          { error: 'Message text is required' },
          { status: 400 }
        );
      }

      result = await Evolution.message.sendText(instanceName, {
        number,
        text,
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
