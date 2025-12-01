"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function BillingPage() {
    const plans = [
        {
            name: "Starter",
            price: "$29",
            description: "Perfect for small businesses",
            features: [
                "1 WhatsApp Instance",
                "1,000 Messages/month",
                "Basic Analytics",
                "Email Support",
            ],
        },
        {
            name: "Pro",
            price: "$79",
            description: "For growing teams",
            features: [
                "5 WhatsApp Instances",
                "Unlimited Messages",
                "Advanced Analytics",
                "Priority Support",
                "Broadcasting (Coming Soon)",
            ],
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "For large organizations",
            features: [
                "Unlimited Instances",
                "Dedicated Server",
                "Custom Integration",
                "24/7 Phone Support",
            ],
        },
    ];

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Billing & Subscription</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {plans.map((plan) => (
                    <Card key={plan.name} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="text-3xl font-bold mb-6">{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                            <ul className="space-y-2">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center">
                                        <Check className="mr-2 h-4 w-4 text-primary" />
                                        <span className="text-sm text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Subscribe</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
