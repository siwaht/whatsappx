import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tools = await prisma.tool.findMany({
            where: { userId: parseInt(session.user.id) },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(tools);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, type, config, description } = body;

        if (!name || !type || !config) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const tool = await prisma.tool.create({
            data: {
                name,
                type,
                config,
                description,
                userId: parseInt(session.user.id)
            }
        });

        return NextResponse.json(tool);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
