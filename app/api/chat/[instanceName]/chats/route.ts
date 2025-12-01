import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEvolutionAPI } from '@/lib/evolution-api';

export async function GET(
    request: NextRequest,
    { params }: { params: { instanceName: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { instanceName } = params;
        const api = getEvolutionAPI();

        const chats = await api.findChats(instanceName);

        return NextResponse.json(chats);
    } catch (error: any) {
        console.error('Error fetching chats:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch chats' },
            { status: 500 }
        );
    }
}
