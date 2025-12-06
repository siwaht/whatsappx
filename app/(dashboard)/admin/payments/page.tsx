"use client";

import { PaymentTable } from "@/components/admin/PaymentTable";
import { StripeManager } from "@/components/stripe/StripeManager";
import { Separator } from "@/components/ui/separator";

export default function PaymentsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Stripe Actions</h3>
                <p className="text-sm text-muted-foreground">
                    Execute Stripe operations via PicaOS.
                </p>
            </div>
            <StripeManager />

            <Separator className="my-6" />

            <div>
                <h3 className="text-lg font-medium">Payment History</h3>
                <p className="text-sm text-muted-foreground">
                    Recent transactions and subscriptions.
                </p>
            </div>
            <PaymentTable />
        </div>
    );
}
