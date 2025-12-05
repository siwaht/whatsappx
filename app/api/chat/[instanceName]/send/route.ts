import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEvolutionAPI } from '@/lib/evolution-api';
import { getEvolutionClientForUser } from '@/lib/evolution-client';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ instanceName: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { instanceName } = await params;
        const body = await request.json();
        const { number, text } = body;

        if (!number || !text) {
            return NextResponse.json(
                { error: 'Number and text are required' },
                { status: 400 }
            );
        }

        const api = await getEvolutionClientForUser(parseInt(session.user.id));

        const message = await api.sendText(instanceName, {
            number,
            text,
            linkPreview: true,
        });

        return NextResponse.json(message);
    } catch (error: any) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send message' },
            { status: 500 }
        );
    }
}
