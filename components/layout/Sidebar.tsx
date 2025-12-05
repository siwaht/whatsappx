"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Settings,
    LogOut,
    Smartphone,
    Webhook,
    Shield,
    MessageCircle,
    UsersRound,
    Coffee,
    FileText,
    Share2,
    Radio,
    Folder,
    Database,
    CreditCard
} from "lucide-react";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
        color: "text-sky-500",
        section: "main"
    },
    {
        label: "Channels",
        icon: Folder,
        href: "/instances", // Mapping "Channels" to instances
        color: "text-violet-500",
        section: "PLAYGROUND"
    },
    {
        label: "Warmer",
        icon: Coffee,
        href: "/warmer",
        color: "text-orange-500",
        section: "PLAYGROUND"
    },
    {
        label: "Stripe",
        icon: CreditCard,
        href: "/stripe",
        color: "text-blue-600",
        section: "PLAYGROUND"
    },
    {
        label: "Knowledge Base",
        icon: Database,
        href: "/knowledge-base",
        color: "text-indigo-500",
        section: "PLAYGROUND"
    },
    {
        label: "CrunchChat",
        icon: MessageSquare,
        href: "/conversations",
        color: "text-pink-700",
        section: "MESSAGES"
    },
    {
        label: "Contacts",
        icon: Users,
        href: "/contacts",
        color: "text-orange-700",
        section: "MESSAGES"
    },
    {
        label: "Groups",
        icon: UsersRound,
        href: "/groups",
        color: "text-teal-600",
        section: "MESSAGES"
    },
    {
        label: "Broadcast",
        icon: Radio,
        href: "/broadcast",
        color: "text-emerald-500",
        section: "MESSAGES"
    },
    {
        label: "Invoices",
        icon: FileText,
        href: "/billing", // Mapping "Invoices" to billing
        color: "text-blue-500",
        section: "MISCELLANEOUS"
    },
    {
        label: "Affiliate",
        icon: Share2,
        href: "/affiliate",
        color: "text-purple-500",
        section: "MISCELLANEOUS"
    },
    {
        label: "Users",
        icon: Shield,
        href: "/admin/users",
        color: "text-red-500",
        section: "ADMIN"
    },
    {
        label: "Roles",
        icon: Shield,
        href: "/admin/roles",
        color: "text-indigo-500",
        section: "ADMIN"
    },
    {
        label: "Payments",
        icon: CreditCard,
        href: "/admin/payments",
        color: "text-green-500",
        section: "ADMIN"
    },
];

export const Sidebar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    const renderNavSection = (sectionName: string, items: typeof routes) => {
        if (items.length === 0) return null;

        return (
            <div className="mb-4">
                {sectionName !== "main" && (
                    <div className="px-3 mb-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {sectionName}
                        </h3>
                    </div>
                )}
                <div className="space-y-1">
                    {items.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200",
                                pathname === route.href
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border"
                                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-1"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn(
                                    "h-5 w-5 mr-3 transition-colors",
                                    pathname === route.href ? route.color : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                                )} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-sidebar/95 backdrop-blur-xl text-sidebar-foreground border-r border-sidebar-border shadow-2xl">
            <div className="px-3 py-2 flex-1 overflow-y-auto custom-scrollbar">
                <Link href="/" className="flex items-center pl-3 mb-10 group">
                    <div className="relative w-10 h-10 mr-3 transition-transform duration-300 group-hover:scale-110">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                        <div className="relative w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-xl border border-white/10">
                            <MessageCircle className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            WhatsAppX
                        </h1>
                    </div>
                </Link>

                {renderNavSection("main", routes.filter(r => r.section === "main"))}
                {renderNavSection("PLAYGROUND", routes.filter(r => r.section === "PLAYGROUND"))}
                {renderNavSection("MESSAGES", routes.filter(r => r.section === "MESSAGES"))}
                {renderNavSection("MISCELLANEOUS", routes.filter(r => r.section === "MISCELLANEOUS"))}
                {renderNavSection("ADMIN", routes.filter(r => r.section === "ADMIN"))}

            </div>
            <div className="px-3 py-2 border-t border-sidebar-border bg-sidebar/50 backdrop-blur-md">
                {session?.user && (
                    <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer group">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-medium shadow-lg ring-2 ring-transparent group-hover:ring-emerald-500/30 transition-all">
                            {session.user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-sidebar-foreground truncate">
                                {session.user.name || 'User'}
                            </p>
                            <p className="text-xs text-sidebar-foreground/60 truncate">
                                {session.user.role || 'Member'}
                            </p>
                        </div>
                    </div>
                )}
                <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
};
