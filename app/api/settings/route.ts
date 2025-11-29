import { NextRequest, NextResponse } from 'next/server';
import { Evolution } from '@/lib/evolution';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { instanceName, rejectCall, alwaysOnline, readMessages, readStatus, syncFullHistory } = body;

    if (!instanceName) {
      return NextResponse.json(
        { error: 'Instance name is required' },
        { status: 400 }
      );
    }

    const result = await Evolution.instance.setSettings(instanceName, {
      rejectCall,
      alwaysOnline,
      readMessages,
      readStatus,
      syncFullHistory,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
