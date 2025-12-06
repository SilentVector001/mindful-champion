
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client"
import { sendSubscriptionUpgradeEmail } from "@/lib/email/subscription-upgrade-email"
import { logActivity } from "@/lib/activity-tracker"
import { checkAndAwardSimpleAchievements } from "@/lib/achievements/check-simple-achievements"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { 
      tier, 
      status, 
      billingCycle, 
      expirationDate,
      reason 
    } = body

    if (!tier || !status || !reason) {
      return NextResponse.json({ 
        error: "Missing required fields: tier, status, reason" 
      }, { status: 400 })
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        email: true,
        firstName: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const oldTier = user.subscriptionTier
    const oldStatus = user.subscriptionStatus

    // Calculate period dates
    const now = new Date()
    const periodEnd = expirationDate 
      ? new Date(expirationDate)
      : billingCycle === 'LIFETIME'
        ? new Date('2099-12-31') // Far future date for lifetime
        : billingCycle === 'YEARLY'
          ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // Monthly

    // Update user subscription tier and status
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier as SubscriptionTier,
        subscriptionStatus: status as SubscriptionStatus,
        updatedAt: now,
      }
    })

    // Create or update manual subscription record
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        tier: tier as SubscriptionTier,
        status: status as SubscriptionStatus,
        billingCycle: billingCycle || 'MANUAL',
        amount: 0, // Manual subscriptions don't have payment
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      }
    })

    // Log activity
    await logActivity({
      userId,
      type: 'SUBSCRIPTION_UPGRADED',
      title: 'Subscription Upgraded',
      description: `Subscription upgraded from ${oldTier} to ${tier} by admin`,
      category: 'subscription',
      metadata: {
        subscriptionId: subscription.id,
        oldTier,
        newTier: tier,
        billingCycle: billingCycle || 'MANUAL',
        adminId: session.user.id,
        reason
      }
    });

    // Check for achievements (don't wait - run async)
    checkAndAwardSimpleAchievements(userId, 'subscription').catch(console.error);

    // Log the subscription change in security log
    await prisma.securityLog.create({
      data: {
        userId,
        eventType: 'SUSPICIOUS_ACTIVITY',
        severity: 'HIGH',
        description: `Manual subscription change by admin ${session.user.email}: ${oldTier} (${oldStatus}) → ${tier} (${status}). Reason: ${reason}`,
        metadata: {
          adminId: session.user.id,
          adminEmail: session.user.email,
          action: 'manual_upgrade',
          oldTier,
          oldStatus,
          newTier: tier,
          newStatus: status,
          billingCycle,
          expirationDate: periodEnd.toISOString(),
          reason,
        }
      }
    })

    // Create subscription history entry
    await prisma.subscriptionHistory.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        action: 'MANUAL_UPGRADE',
        performedBy: session.user.id,
        reason,
        oldValues: {
          tier: oldTier,
          status: oldStatus,
        },
        newValues: {
          tier,
          status,
          billingCycle,
          expirationDate: periodEnd.toISOString(),
        },
      }
    }).catch((err) => {
      // If table doesn't exist, we'll skip history for now
      console.warn("SubscriptionHistory table not found:", err.message)
    })

    // Send email notification to user about their upgrade
    try {
      await sendSubscriptionUpgradeEmail({
        email: user.email,
        firstName: user.firstName || 'Champion',
        oldTier: oldTier as string,
        newTier: tier,
        upgradeDate: now,
        features: [], // Will be populated by the email service based on tier
        expirationDate: periodEnd,
        billingCycle: billingCycle || 'MANUAL',
      })
      console.log(`✅ Upgrade notification email sent to ${user.email}`)
    } catch (emailError: any) {
      // Log error but don't fail the upgrade
      console.error('⚠️ Failed to send upgrade notification email:', emailError.message)
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        subscription,
        oldTier,
        newTier: tier,
        message: `Successfully upgraded user to ${tier}`,
        emailSent: true, // Indicate that email notification was attempted
      } 
    })
  } catch (error: any) {
    console.error("Manual subscription upgrade error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to upgrade subscription" 
    }, { status: 500 })
  }
}
