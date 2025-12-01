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
        const api = getEvolutionAPI();

        // Evolution API endpoint to get QR code / connection status
        // Depending on version, this might be /instance/connect/{instanceName}
        const result = await api.connectInstance(instanceName);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error fetching QR code:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch QR code' },
            { status: 500 }
        );
    }
}
