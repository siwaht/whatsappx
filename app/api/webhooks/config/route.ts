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

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const instanceName = searchParams.get('instance');

        if (!instanceName) {
            return NextResponse.json({ error: 'Instance name is required' }, { status: 400 });
        }

        const api = await getClient(session.user.id);
        const webhook = await api.getWebhook(instanceName);

        return NextResponse.json(webhook);
    } catch (error: any) {
        console.error('Error fetching webhook config:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch webhook config' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { instanceName, enabled, url, events } = body;

        if (!instanceName) {
            return NextResponse.json({ error: 'Instance name is required' }, { status: 400 });
        }

        const api = await getClient(session.user.id);

        // Evolution API expects specific format for setWebhook
        const result = await api.setWebhook(instanceName, {
            enabled,
            url,
            webhookByEvents: true,
            events
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error updating webhook config:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update webhook config' },
            { status: 500 }
        );
    }
}
