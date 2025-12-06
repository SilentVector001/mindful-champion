export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover'
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, userId, subscriptionId, reason } = body

    if (!action || !userId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has Stripe customer ID
    if (!user.stripeCustomerId) {
      return NextResponse.json({ 
        error: "No Stripe subscription",
        details: "This user has not subscribed to a paid plan yet. Subscription management is only available for users with active Stripe subscriptions." 
      }, { status: 400 })
    }

    let result

    switch (action) {
      case 'pause':
        // Get Stripe subscriptions
        const stripeSubscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: 'active',
          limit: 1
        })

        if (stripeSubscriptions.data.length === 0) {
          return NextResponse.json({ 
            error: "No active Stripe subscription",
            details: "This user does not have an active Stripe subscription to pause. They may be on a free plan or their subscription may have already been canceled." 
          }, { status: 400 })
        }

        // Pause subscription
        const pausedSubscription = await stripe.subscriptions.update(
          stripeSubscriptions.data[0].id,
          {
            pause_collection: {
              behavior: 'mark_uncollectible',
            },
          }
        )

        // Update in database
        await prisma.subscription.updateMany({
          where: { 
            userId,
            stripeSubscriptionId: pausedSubscription.id
          },
          data: { status: 'UNPAID' }
        })

        result = { message: 'Subscription paused successfully', subscription: pausedSubscription }
        break

      case 'resume':
        // Get paused subscriptions
        const pausedStripeSubscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: 'paused',
          limit: 1
        })

        if (pausedStripeSubscriptions.data.length === 0) {
          return NextResponse.json({ 
            error: "No paused subscription",
            details: "This user does not have a paused subscription to resume." 
          }, { status: 400 })
        }

        // Resume subscription
        const resumedSubscription = await stripe.subscriptions.update(
          pausedStripeSubscriptions.data[0].id,
          {
            pause_collection: null,
          }
        )

        // Update in database
        await prisma.subscription.updateMany({
          where: { 
            userId,
            stripeSubscriptionId: resumedSubscription.id
          },
          data: { status: 'ACTIVE' }
        })

        result = { message: 'Subscription resumed successfully', subscription: resumedSubscription }
        break

      case 'cancel':
        // Get active subscriptions
        const activeSubscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: 'active',
          limit: 1
        })

        if (activeSubscriptions.data.length === 0) {
          return NextResponse.json({ 
            error: "No active subscription",
            details: "This user does not have an active subscription to cancel." 
          }, { status: 400 })
        }

        // Cancel subscription
        const canceledSubscription = await stripe.subscriptions.cancel(
          activeSubscriptions.data[0].id
        )

        // Update in database
        await prisma.subscription.updateMany({
          where: { 
            userId,
            stripeSubscriptionId: canceledSubscription.id
          },
          data: { status: 'CANCELED' }
        })

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: 'CANCELED',
            subscriptionTier: 'FREE'
          }
        })

        // Log the cancellation
        await prisma.securityLog.create({
          data: {
            userId,
            eventType: 'SUSPICIOUS_ACTIVITY',
            severity: 'MEDIUM',
            description: `Subscription canceled by admin: ${reason || 'No reason provided'}`,
            metadata: { canceledBy: session.user.email, reason },
            resolvedBy: session.user.id,
          }
        })

        result = { message: 'Subscription canceled successfully', subscription: canceledSubscription }
        break

      case 'refund':
        // Get recent payment for this subscription
        const recentPayment = await prisma.payment.findFirst({
          where: {
            userId,
            stripePaymentIntentId: { not: null }
          },
          orderBy: { createdAt: 'desc' }
        })

        if (!recentPayment || !recentPayment.stripePaymentIntentId) {
          return NextResponse.json({ 
            error: "No payment to refund",
            details: "This user has no recent payments that can be refunded." 
          }, { status: 400 })
        }

        // Create refund in Stripe
        const refund = await stripe.refunds.create({
          payment_intent: recentPayment.stripePaymentIntentId,
          reason: 'requested_by_customer',
        })

        // Update payment status
        await prisma.payment.update({
          where: { id: recentPayment.id },
          data: { status: 'refunded' }
        })

        // Log the refund
        await prisma.securityLog.create({
          data: {
            userId,
            eventType: 'SUSPICIOUS_ACTIVITY',
            severity: 'MEDIUM',
            description: `Refund issued by admin: $${(recentPayment.amount / 100).toFixed(2)}`,
            metadata: { 
              refundId: refund.id, 
              amount: recentPayment.amount,
              issuedBy: session.user.email,
              reason 
            },
            resolvedBy: session.user.id,
          }
        })

        result = { message: 'Refund processed successfully', refund }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    console.error("Error managing subscription:", error)
    return NextResponse.json({ 
      error: "Failed to manage subscription",
      details: error.message 
    }, { status: 500 })
  }
}
