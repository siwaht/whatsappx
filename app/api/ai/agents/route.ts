import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(session.user.id);
        const agents = await prisma.aIAgent.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json(agents);
    } catch (error: any) {
        console.error('Error fetching AI agents:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch AI agents' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, systemPrompt, model, temperature, isActive, toolIds } = body;

        if (!name || !systemPrompt) {
            return NextResponse.json(
                { error: 'Name and System Prompt are required' },
                { status: 400 }
            );
        }

        const agent = await prisma.aIAgent.create({
            data: {
                name,
                systemPrompt,
                model: model || 'gpt-4o',
                temperature: temperature || 0.7,
                isActive: isActive !== undefined ? isActive : true,
                userId: parseInt(session.user.id),
            },
        });

        // Connect tools to agent if toolIds provided (many-to-many relation)
        if (toolIds && toolIds.length > 0) {
            await prisma.aIAgent.update({
                where: { id: agent.id },
                data: {
                    tools: {
                        connect: toolIds.map((id: number) => ({ id }))
                    }
                }
            });
        }

        return NextResponse.json(agent, { status: 201 });
    } catch (error: any) {
        console.error('Error creating AI agent:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create AI agent' },
            { status: 500 }
        );
    }
}
