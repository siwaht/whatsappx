import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        if (!session?.metadata?.userId) {
            return new NextResponse('User id is required', { status: 400 });
        }

        await prisma.subscription.create({
            data: {
                userId: parseInt(session.metadata.userId),
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                status: subscription.status,
                planName: subscription.items.data[0].price.nickname || 'Pro', // Fallback name
            },
        });
    }

    if (event.type === 'invoice.payment_succeeded') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        await prisma.subscription.update({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                status: subscription.status,
            },
        });
    }

    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.subscription.update({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                status: subscription.status,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            }
        })
    }

    return new NextResponse(null, { status: 200 });
}
