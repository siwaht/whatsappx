import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPicaClient } from '@/lib/pica';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const platform = searchParams.get('platform');

        if (!platform) {
            return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
        }

        const secretKey = request.headers.get('x-pica-secret') || undefined;
        const pica = getPicaClient(secretKey);
        const actions = await pica.listAvailableActions(platform);

        return NextResponse.json(actions);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to list actions' },
            { status: 500 }
        );
    }
}
