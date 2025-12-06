import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEvolutionAPI, EvolutionAPIClient } from '@/lib/evolution-api';
import { prisma } from '@/lib/prisma';

async function getClient(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: { evolutionApiUrl: true, evolutionApiKey: true }
  });

  if (user?.evolutionApiUrl && user?.evolutionApiKey) {
    return new EvolutionAPIClient(user.evolutionApiUrl, user.evolutionApiKey);
  }
  return getEvolutionAPI();
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ instanceName: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.permissions.includes('instances.delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { instanceName } = await params;
    const api = await getClient(session.user.id);
    await api.deleteInstance(instanceName);

    return NextResponse.json({ message: 'Instance deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting instance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete instance' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ instanceName: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.permissions.includes('instances.update')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { instanceName } = await params;
    const body = await request.json();
    const { action } = body;
    const api = await getClient(session.user.id);

    switch (action) {
      case 'restart':
        await api.restartInstance(instanceName);
        return NextResponse.json({ message: 'Instance restarted successfully' });

      case 'connect':
        const connectResult = await api.connectInstance(instanceName);
        return NextResponse.json(connectResult);

      case 'logout':
        await api.logoutInstance(instanceName);
        return NextResponse.json({ message: 'Instance logged out successfully' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error updating instance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update instance' },
      { status: 500 }
    );
  }
}
