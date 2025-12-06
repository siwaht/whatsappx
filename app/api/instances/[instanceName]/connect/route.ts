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

export async function GET(
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
        const api = await getClient(session.user.id);

        const result = await api.connectInstance(instanceName);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error connecting instance:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to connect instance' },
            { status: 500 }
        );
    }
}
