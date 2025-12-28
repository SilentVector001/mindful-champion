export const dynamic = "force-dynamic"


import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { stripe as getStripe } from "@/lib/stripe"
import Stripe from "stripe"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { action, subscriptionId, reason } = body

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true }
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ 
        error: "User has no Stripe customer ID" 
      }, { status: 400 })
    }

    let result

    switch (action) {
      case 'pause':
        // Pause subscription in Stripe
        const pausedSub = await getStripe().subscriptions.update(subscriptionId, {
          pause_collection: {
            behavior: 'mark_uncollectible',
          },
        })
        
        // Update in database
        await prisma.subscription.updateMany({
          where: { 
            userId,
            stripeSubscriptionId: subscriptionId 
          },
          data: {
            status: 'CANCELED', // Mark as canceled for paused state
          }
        })

        // Log action
        await prisma.securityLog.create({
          data: {
            userId,
            eventType: 'SUSPICIOUS_ACTIVITY',
            severity: 'MEDIUM',
            description: `Subscription paused by admin. Reason: ${reason || 'No reason provided'}`,
          }
        })

        result = pausedSub
        break

      case 'cancel':
        // Cancel subscription in Stripe
        const canceledSub = await getStripe().subscriptions.cancel(subscriptionId)
        
        // Update in database
        await prisma.subscription.updateMany({
          where: { 
            userId,
            stripeSubscriptionId: subscriptionId 
          },
          data: {
            status: 'CANCELED',
            cancelAtPeriodEnd: true,
          }
        })

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: 'CANCELED',
          }
        })

        // Log action
        await prisma.securityLog.create({
          data: {
            userId,
            eventType: 'SUSPICIOUS_ACTIVITY',
            severity: 'MEDIUM',
            description: `Subscription canceled by admin. Reason: ${reason || 'No reason provided'}`,
          }
        })

        result = canceledSub
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

        if (!recentPayment?.stripePaymentIntentId) {
          return NextResponse.json({ 
            error: "No recent payment found to refund" 
          }, { status: 400 })
        }

        // Create refund in Stripe
        const refund = await getStripe().refunds.create({
          payment_intent: recentPayment.stripePaymentIntentId,
          reason: 'requested_by_customer',
        })

        // Log refund
        await prisma.securityLog.create({
          data: {
            userId,
            eventType: 'SUSPICIOUS_ACTIVITY',
            severity: 'HIGH',
            description: `Refund issued by admin for $${(recentPayment.amount / 100).toFixed(2)}. Reason: ${reason || 'No reason provided'}`,
          }
        })

        result = refund
        break

      case 'resume':
        // Resume paused subscription
        const resumedSub = await getStripe().subscriptions.update(subscriptionId, {
          pause_collection: null,
        })
        
        await prisma.subscription.updateMany({
          where: { 
            userId,
            stripeSubscriptionId: subscriptionId 
          },
          data: {
            status: 'ACTIVE',
          }
        })

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: 'ACTIVE',
          }
        })

        await prisma.securityLog.create({
          data: {
            userId,
            eventType: 'SUSPICIOUS_ACTIVITY',
            severity: 'MEDIUM',
            description: `Subscription resumed by admin`,
          }
        })

        result = resumedSub
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Subscription management error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to manage subscription" 
    }, { status: 500 })
  }
}
