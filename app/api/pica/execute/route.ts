import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPicaClient } from '@/lib/pica';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { connectionKey, actionKey, params } = body;

        if (!connectionKey || !actionKey) {
            return NextResponse.json({ error: 'Connection Key and Action Key are required' }, { status: 400 });
        }

        const secretKey = request.headers.get('x-pica-secret') || undefined;
        const pica = getPicaClient(secretKey);

        const result = await pica.executeAction(connectionKey, actionKey, params);

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to execute action' },
            { status: 500 }
        );
    }
}
