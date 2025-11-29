import { NextRequest, NextResponse } from 'next/server';
import { Evolution } from '@/lib/evolution';

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

    const result = await Evolution.contact.fetchContacts(instanceName);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to fetch contacts' },
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
