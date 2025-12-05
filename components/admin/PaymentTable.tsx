"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, CreditCard } from "lucide-react";

export function PaymentTable() {
    const { data: subscriptions, isLoading } = useQuery({
        queryKey: ['admin-payments'],
        queryFn: async () => {
            const res = await axios.get('/api/admin/payments');
            return res.data;
        }
    });

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="rounded-md border glass-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Period End</TableHead>
                        <TableHead>Created At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {subscriptions?.map((sub: any) => (
                        <TableRow key={sub.id}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{sub.user.firstName} {sub.user.lastName}</span>
                                    <span className="text-xs text-muted-foreground">{sub.user.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{sub.planName || 'N/A'}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                                    {sub.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {/* Placeholder for amount, as it's not directly in Subscription model usually */}
                                {sub.planName === 'Pro' ? '$79.00' : sub.planName === 'Starter' ? '$29.00' : '-'}
                            </TableCell>
                            <TableCell>
                                {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'MMM d, yyyy') : '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {format(new Date(sub.createdAt), 'MMM d, yyyy')}
                            </TableCell>
                        </TableRow>
                    ))}
                    {subscriptions?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No subscriptions found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
