import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEvolutionAPI } from "@/lib/evolution-api";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) return null;

    const userId = parseInt(session.user.id);

    // Fetch real stats
    const [
        totalMessages,
        totalContacts,
        instances,
        recentBroadcasts
    ] = await Promise.all([
        prisma.messageStat.count(), // In a real app, filter by user's instances
        prisma.contactCache.count(),
        getEvolutionAPI().fetchInstances().catch(() => ({ length: 0 })), // Fallback if API fails
        prisma.broadcast.findMany({
            where: { userId },
            take: 5,
            orderBy: { createdAt: 'desc' }
        })
    ]);

    // Calculate active instances (mock logic for now as fetchInstances returns array)
    const activeInstances = Array.isArray(instances) ? instances.length : 0;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="space-y-4">
                <DashboardStats
                    totalMessages={totalMessages}
                    activeConversations={activeInstances} // Using instances count as proxy for now
                    totalContacts={totalContacts}
                    instanceStatus={activeInstances > 0 ? "connected" : "disconnected"}
                />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <OverviewChart />
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Broadcasts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {recentBroadcasts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No recent broadcasts
                                    </p>
                                ) : (
                                    recentBroadcasts.map((broadcast) => (
                                        <div key={broadcast.id} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {broadcast.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {broadcast.status} • {broadcast.successCount}/{broadcast.totalRecipients} sent
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium">
                                                {new Date(broadcast.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
