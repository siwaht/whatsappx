"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    Shield
} from "lucide-react";
import { useAuth } from "@/lib/store/auth";
import { useEffect } from "react";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
        color: "text-sky-500",
    },
    {
        label: "Instances",
        icon: Smartphone,
        href: "/instances",
        color: "text-violet-500",
    },
    {
        label: "Conversations",
        icon: MessageSquare,
        href: "/conversations",
        color: "text-pink-700",
    },
    {
        label: "Contacts",
        icon: Users,
        href: "/contacts",
        color: "text-orange-700",
    },
    {
        label: "Webhooks",
        icon: Webhook,
        href: "/webhooks",
        color: "text-green-700",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/settings",
    },
];

const adminRoutes = [
    {
        label: "Users",
        icon: Shield,
        href: "/users",
        color: "text-blue-500",
    },
    {
        label: "Roles",
        icon: Shield,
        href: "/roles",
        color: "text-indigo-500",
    },
];

export const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, fetchUser, logout: handleLogout } = useAuth();

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const isAdmin = user?.roles.includes("admin") || user?.roles.includes("superadmin");

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-secondary text-secondary-foreground">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        {/* Logo placeholder */}
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold text-primary-foreground">W</div>
                    </div>
                    <h1 className="text-2xl font-bold">
                        WhatsApp
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                                pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                    {isAdmin && (
                        <>
                            <div className="pt-4 pb-2 px-3">
                                <div className="text-xs font-semibold text-muted-foreground uppercase">
                                    Administration
                                </div>
                            </div>
                            {adminRoutes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                                        pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground"
                                    )}
                                >
                                    <div className="flex items-center flex-1">
                                        <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                        {route.label}
                                    </div>
                                </Link>
                            ))}
                        </>
                    )}
                </div>
            </div>
            <div className="px-3 py-2">
                <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
};
