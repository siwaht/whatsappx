"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Shield, Users, CreditCard, Variable, Settings } from "lucide-react";

const adminRoutes = [
    {
        label: "Payments",
        icon: CreditCard,
        href: "/admin/payments",
    },
    {
        label: "Users",
        icon: Users,
        href: "/admin/users",
    },
    {
        label: "Roles",
        icon: Shield,
        href: "/admin/roles",
    },
    {
        label: "API Management",
        icon: Variable,
        href: "/admin/apis",
    },
];

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full space-y-6 p-8">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Admin Settings</h2>
                <p className="text-muted-foreground">
                    Manage your application settings, users, and integrations.
                </p>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {adminRoutes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                            pathname === route.href || pathname?.startsWith(route.href + '/')
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        )}
                    >
                        <route.icon className="w-4 h-4" />
                        <span>{route.label}</span>
                    </Link>
                ))}
            </div>

            <div className="flex-1 border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
                {children}
            </div>
        </div>
    );
}
