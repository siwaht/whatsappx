import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
        const { aiAgentId } = body;

        const config = await prisma.instanceConfig.upsert({
            where: { instanceName },
            update: { aiAgentId },
            create: {
                instanceName,
                userId: parseInt(session.user.id),
                aiAgentId,
            },
        });

        return NextResponse.json(config);
    } catch (error: any) {
        console.error('Error updating instance config:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update instance config' },
            { status: 500 }
        );
    }
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

        const { instanceName } = await params;

        const config = await prisma.instanceConfig.findUnique({
            where: { instanceName },
            include: { aiAgent: true },
        });

        return NextResponse.json(config || {});
    } catch (error: any) {
        console.error('Error fetching instance config:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch instance config' },
            { status: 500 }
        );
    }
}
