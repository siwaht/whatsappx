import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getEvolutionAPI } from '@/lib/evolution-api';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { instanceName, name, message, recipients } = body;

        if (!instanceName || !name || !message || !recipients) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create Broadcast record
        const broadcast = await prisma.broadcast.create({
            data: {
                userId: parseInt(session.user.id),
                instanceName,
                name,
                message,
                status: 'processing',
                totalRecipients: recipients.split(',').length,
            },
        });

        // Process recipients (simple loop for now, should be a queue in production)
        const recipientList = recipients.split(',').map((r: string) => r.trim());
        const api = getEvolutionAPI();

        // Run in background (fire and forget for this simple implementation)
        (async () => {
            let successCount = 0;
            let failedCount = 0;

            for (const recipient of recipientList) {
                try {
                    await api.sendText(instanceName, {
                        number: recipient,
                        text: message,
                    });

                    await prisma.broadcastLog.create({
                        data: {
                            broadcastId: broadcast.id,
                            recipient,
                            status: 'sent',
                            sentAt: new Date(),
                        },
                    });
                    successCount++;
                } catch (error: any) {
                    console.error(`Failed to send to ${recipient}:`, error);
                    await prisma.broadcastLog.create({
                        data: {
                            broadcastId: broadcast.id,
                            recipient,
                            status: 'failed',
                            error: error.message,
                        },
                    });
                    failedCount++;
                }
            }

            await prisma.broadcast.update({
                where: { id: broadcast.id },
                data: {
                    status: 'completed',
                    successCount,
                    failedCount,
                    completedAt: new Date(),
                },
            });
        })();

        return NextResponse.json(broadcast, { status: 201 });
    } catch (error: any) {
        console.error('Error creating broadcast:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create broadcast' },
            { status: 500 }
        );
    }
}
