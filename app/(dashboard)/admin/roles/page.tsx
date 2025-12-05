import { RoleManager } from "@/components/admin/RoleManager";
import { Shield } from "lucide-react";

export default function RolesPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6 animate-in-fade">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-heading flex items-center gap-2">
                    <Shield className="h-8 w-8" />
                    Role Management
                </h2>
            </div>
            <div className="text-muted-foreground">
                Manage user roles and assign permissions.
            </div>
            <RoleManager />
        </div>
    );
}
