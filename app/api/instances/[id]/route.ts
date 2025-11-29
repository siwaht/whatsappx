import { NextRequest, NextResponse } from 'next/server';
import { Evolution } from '@/lib/evolution';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instanceName = params.id;

    const result = await Evolution.instance.delete(instanceName);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to delete instance' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Instance deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const instanceName = params.id;
    const body = await request.json();
    const { action } = body;

    if (action === 'restart') {
      const result = await Evolution.instance.restart(instanceName);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error?.message || 'Failed to restart instance' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'Instance restarted successfully' });
    }

    if (action === 'connect') {
      const result = await Evolution.instance.connect(instanceName);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error?.message || 'Failed to connect instance' },
          { status: 500 }
        );
      }

      return NextResponse.json(result.data);
    }

    if (action === 'logout') {
      const result = await Evolution.instance.logout(instanceName);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error?.message || 'Failed to logout instance' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'Instance logged out successfully' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
