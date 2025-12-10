import { NextRequest, NextResponse } from 'next/server';
import { EvolutionAPIClient } from '@/lib/evolution-api';
import { getPicaClient } from '@/lib/pica';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, credentials } = body;

        if (!type || !credentials) {
            return NextResponse.json({ error: 'Missing type or credentials' }, { status: 400 });
        }

        if (type === 'evolution') {
            const { url, apiKey } = credentials;
            if (!url || !apiKey) {
                return NextResponse.json({ error: 'Missing Evolution API URL or Key' }, { status: 400 });
            }

            try {
                const client = new EvolutionAPIClient(url, apiKey);
                // Try to fetch instances to verify connection
                await client.fetchInstances();
                return NextResponse.json({ success: true, message: 'Evolution API Connected Successfully' });
            } catch (error: any) {
                console.error('Evolution Verification Error:', error);
                return NextResponse.json({
                    success: false,
                    error: error.message || 'Failed to connect to Evolution API'
                }, { status: 400 });
            }
        }

        if (type === 'pica') {
            const { secretKey } = credentials;
            if (!secretKey) {
                return NextResponse.json({ error: 'Missing Pica Secret Key' }, { status: 400 });
            }

            try {
                const client = getPicaClient(secretKey);
                // Try to list connections to verify key
                await client.listConnections();
                return NextResponse.json({ success: true, message: 'Pica Integration Connected Successfully' });
            } catch (error: any) {
                console.error('Pica Verification Error:', error);
                return NextResponse.json({
                    success: false,
                    error: error.message || 'Failed to connect to Pica API'
                }, { status: 400 });
            }
        }

        return NextResponse.json({ error: 'Invalid verification type' }, { status: 400 });

    } catch (error: any) {
        console.error('Verification Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
