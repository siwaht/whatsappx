import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { getEvolutionAPI, EvolutionAPIClient } from "@/lib/evolution-api";
import {
    Folder,
    Activity,
    AlertCircle,
    Users,
    FolderPlus,
    Coffee,
    Settings,
    User,
    FileText,
    FileCode
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getClient(userId: string): Promise<EvolutionAPIClient | null> {
    const { data: user } = await supabase
        .from('users')
        .select('evolution_api_url, evolution_api_key')
        .eq('id', parseInt(userId))
        .maybeSingle();

    if (user?.evolution_api_url && user?.evolution_api_key) {
        return new EvolutionAPIClient(user.evolution_api_url, user.evolution_api_key);
    }

    const envUrl = process.env.EVOLUTION_API_URL;
    const envKey = process.env.EVOLUTION_API_KEY;

    if (envUrl && envKey) {
        return getEvolutionAPI();
    }

    return null;
}

async function getContactCount() {
    const { count } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

    return count || 0;
}

export default async function DashboardPage() {
    let session;
    try {
        session = await auth();
    } catch (e) {
        console.error("Auth error:", e);
        return null; // Or redirect to login
    }

    if (!session?.user) return null;

    const userName = session.user.name || "User";
    const firstName = userName.split(" ")[0];

    let totalContacts = 0;
    let instances: any[] = [];
    let apiConfigured = false;

    try {
        const api = await getClient(session.user.id);
        apiConfigured = api !== null;

        const contactCountPromise = getContactCount();
        const instancesPromise = api ? api.fetchInstances() : Promise.resolve([]);

        const results = await Promise.allSettled([
            contactCountPromise,
            instancesPromise
        ]);

        if (results[0].status === 'fulfilled') {
            totalContacts = results[0].value;
        }

        if (results[1].status === 'fulfilled') {
            const response: any = results[1].value;
            if (Array.isArray(response)) {
                instances = response;
            } else if (response && Array.isArray(response.data)) {
                instances = response.data;
            }
        }

    } catch (error) {
        console.error("Dashboard data fetch error:", error);
    }

    const activeInstances = Array.isArray(instances) ? instances.filter((i: any) => i.status === 'open').length : 0;
    const totalInstances = Array.isArray(instances) ? instances.length : 0;
    const inactiveInstances = totalInstances - activeInstances;

    const stats = [
        {
            label: "Total Channels",
            value: totalInstances,
            subtext: "Your WhatsApp channels",
            icon: Folder,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            label: "Active Channels",
            value: activeInstances,
            subtext: "Working properly",
            icon: Activity,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            badge: "100%"
        },
        {
            label: "Inactive Channels",
            value: inactiveInstances,
            subtext: "Needs attention",
            icon: AlertCircle,
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/20"
        },
        {
            label: "Total Contacts",
            value: totalContacts,
            subtext: "Contacts collected",
            icon: Users,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
            border: "border-violet-500/20"
        }
    ];

    const quickActions = [
        {
            label: "Create Channel",
            icon: FolderPlus,
            href: "/instances",
            color: "text-blue-400"
        },
        {
            label: "Create Warmer",
            icon: Coffee,
            href: "/warmer",
            color: "text-orange-400"
        },
        {
            label: "User Settings",
            icon: Settings,
            href: "/settings",
            color: "text-slate-400"
        },
        {
            label: "My Contact",
            icon: User,
            href: "/contacts",
            color: "text-sky-400"
        },
        {
            label: "My Invoices",
            icon: FileText,
            href: "/billing",
            color: "text-indigo-400"
        },
        {
            label: "API Documentation",
            icon: FileCode,
            href: "/docs", // Assuming docs route or external link
            color: "text-pink-400"
        }
    ];

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-background min-h-screen text-foreground animate-in-fade">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-heading">Good morning, {firstName}</h2>
                    <p className="text-muted-foreground">
                        Welcome to your dashboard. Here's what's happening with your account today.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button>
                        New Broadcast
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`p-6 rounded-2xl border glass-card relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200 animate-enter-delay-1`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-foreground mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className={`h-5 w-5`} />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                        {stat.badge && (
                            <div className="absolute bottom-4 right-4 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
                                {stat.badge}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="space-y-4 animate-enter-delay-2">
                <h3 className="text-xl font-semibold text-foreground font-heading">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">Shortcuts to frequently used features</p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {quickActions.map((action, index) => (
                        <Link
                            key={index}
                            href={action.href}
                            className="flex items-center p-4 rounded-xl border bg-card/50 hover:bg-card hover:shadow-md transition-all duration-200 group"
                        >
                            <div className={`p-3 rounded-lg bg-background group-hover:bg-primary/5 mr-4 border transition-colors`}>
                                <action.icon className={`h-6 w-6 ${action.color}`} />
                            </div>
                            <span className="font-medium text-foreground">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
