import { NextRequest, NextResponse } from 'next/server';
import { Evolution } from '@/lib/evolution';

export async function GET() {
  try {
    const result = await Evolution.instance.fetchInstances();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to fetch instances' },
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instanceName } = body;

    if (!instanceName || typeof instanceName !== 'string') {
      return NextResponse.json(
        { error: 'Instance name is required' },
        { status: 400 }
      );
    }

    const result = await Evolution.instance.create(instanceName);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to create instance' },
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
