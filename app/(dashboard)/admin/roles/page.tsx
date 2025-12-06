import { RoleManager } from "@/components/admin/RoleManager";
import { Shield } from "lucide-react";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Role Management",
    description: "Create and assign roles and permissions.",
};

export default function RolesPage() {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-medium">Roles</h3>
                <p className="text-sm text-muted-foreground">
                    Define roles and assign permissions.
                </p>
            </div>
            <RoleManager />
        </div>
    );
}
