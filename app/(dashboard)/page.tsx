import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEvolutionAPI } from "@/lib/evolution-api";
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

    // Fetch real stats with error handling
    let totalContacts = 0;
    let instances: any[] = [];

    try {
        // Run independently to prevent one failure from blocking the other
        const results = await Promise.allSettled([
            prisma.contactCache.count(),
            getEvolutionAPI().fetchInstances()
        ]);

        if (results[0].status === 'fulfilled') {
            totalContacts = results[0].value;
        } else {
            console.error("Failed to fetch contacts count:", results[0].reason);
        }

        if (results[1].status === 'fulfilled') {
            instances = results[1].value;
        } else {
            console.error("Failed to fetch instances:", results[1].reason);
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
        <div className="flex-1 space-y-8 p-8 pt-6 bg-[#0B1120] min-h-screen text-slate-100">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Good morning, {firstName}</h2>
                    <p className="text-slate-400">
                        Welcome to your dashboard. Here's what's happening with your account today.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        New Broadcast
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`p-6 rounded-xl border bg-[#0F172A] ${stat.border} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-white mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">{stat.subtext}</p>
                        {stat.badge && (
                            <div className="absolute bottom-4 right-4 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
                                {stat.badge}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
                <p className="text-sm text-slate-400">Shortcuts to frequently used features</p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {quickActions.map((action, index) => (
                        <Link
                            key={index}
                            href={action.href}
                            className="flex items-center p-4 rounded-xl border border-slate-800 bg-[#0F172A] hover:bg-slate-800/50 transition-colors group"
                        >
                            <div className={`p-3 rounded-lg bg-slate-900 group-hover:bg-slate-800 mr-4 border border-slate-800`}>
                                <action.icon className={`h-6 w-6 ${action.color}`} />
                            </div>
                            <span className="font-medium text-slate-200">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
