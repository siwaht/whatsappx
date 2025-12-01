import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEvolutionAPI } from '@/lib/evolution-api';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ instanceName: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { instanceName } = await params;
        const searchParams = request.nextUrl.searchParams;
        const remoteJid = searchParams.get('remoteJid');

        if (!remoteJid) {
            return NextResponse.json(
                { error: 'Remote JID is required' },
                { status: 400 }
            );
        }

        const api = getEvolutionAPI();

        const messages = await api.findMessages(instanceName, {
            remoteJid,
            limit: 50,
        });

        return NextResponse.json(messages);
    } catch (error: any) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}
