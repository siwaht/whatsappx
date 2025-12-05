import { PaymentTable } from "@/components/admin/PaymentTable";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6 animate-in-fade">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-heading flex items-center gap-2">
                    <CreditCard className="h-8 w-8" />
                    Payment Management
                </h2>
            </div>
            <div className="text-muted-foreground">
                Manage user subscriptions and view payment status.
            </div>
            <PaymentTable />
        </div>
    );
}
