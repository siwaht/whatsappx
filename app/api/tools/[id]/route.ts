import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const tool = await prisma.tool.findFirst({
            where: {
                id: parseInt(id),
                userId: parseInt(session.user.id)
            }
        });

        if (!tool) {
            return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
        }

        return NextResponse.json(tool);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, type, config, description } = body;

        const toolId = parseInt(id);
        const userId = parseInt(session.user.id);

        const existingTool = await prisma.tool.findFirst({
            where: { id: toolId, userId }
        });

        if (!existingTool) {
            return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
        }

        const tool = await prisma.tool.update({
            where: { id: toolId },
            data: {
                name,
                type,
                config,
                description
            }
        });

        return NextResponse.json(tool);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await prisma.tool.deleteMany({
            where: {
                id: parseInt(id),
                userId: parseInt(session.user.id)
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
