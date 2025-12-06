import { UserTable } from "@/components/admin/UserTable";
import { UserDialog } from "@/components/admin/UserDialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "User Management",
    description: "Manage users, roles, and permissions.",
};

export default function UsersPage() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Users</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage users and their permissions.
                    </p>
                </div>
                <UserDialog />
            </div>
            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search users..." className="pl-8 glass-input" />
                </div>
            </div>
            <UserTable />
        </div>
    );
}
