import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stats = await prisma.messageStat.findMany({
            where: {
                createdAt: {
                    gte: startOfMonth(new Date()),
                    lte: endOfMonth(new Date()),
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Group by day
        const days = eachDayOfInterval({
            start: startOfMonth(new Date()),
            end: endOfMonth(new Date()),
        });

        const data = days.map(day => {
            const dayStr = format(day, 'MMM dd');
            const dayStats = stats.filter(stat =>
                format(stat.createdAt, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            );

            return {
                name: dayStr,
                total: dayStats.length,
                sent: dayStats.filter(s => s.direction === 'SEND').length,
                received: dayStats.filter(s => s.direction === 'RECEIVE').length,
            };
        });

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
