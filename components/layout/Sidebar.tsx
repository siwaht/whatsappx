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
    Folder
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
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-slate-800 rounded-lg transition",
                                pathname === route.href
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-400 hover:text-white"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn(
                                    "h-5 w-5 mr-3",
                                    pathname === route.href ? route.color : ""
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
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#0B1120] text-slate-100 border-r border-slate-800">
            <div className="px-3 py-2 flex-1 overflow-y-auto">
                <Link href="/" className="flex items-center pl-3 mb-10">
                    <div className="relative w-8 h-8 mr-3">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                            <MessageCircle className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">WhatsAppX</h1>
                    </div>
                </Link>

                {renderNavSection("main", routes.filter(r => r.section === "main"))}
                {renderNavSection("PLAYGROUND", routes.filter(r => r.section === "PLAYGROUND"))}
                {renderNavSection("MESSAGES", routes.filter(r => r.section === "MESSAGES"))}
                {renderNavSection("MISCELLANEOUS", routes.filter(r => r.section === "MISCELLANEOUS"))}

            </div>
            <div className="px-3 py-2 border-t border-slate-800 bg-[#0B1120]">
                {session?.user && (
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                            {session.user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {session.user.name || 'User'}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                                {session.user.role || 'Member'}
                            </p>
                        </div>
                    </div>
                )}
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
};
