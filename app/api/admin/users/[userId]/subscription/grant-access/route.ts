
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client"

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
    const { tier, reason } = body

    if (!tier || !reason) {
      return NextResponse.json({ 
        error: "Missing required fields: tier, reason" 
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
    const now = new Date()
    const lifetimeEnd = new Date('2099-12-31') // Far future date

    // Grant lifetime access
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier as SubscriptionTier,
        subscriptionStatus: 'ACTIVE' as SubscriptionStatus,
        updatedAt: now,
      }
    })

    // Create lifetime subscription record
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        tier: tier as SubscriptionTier,
        status: 'ACTIVE' as SubscriptionStatus,
        billingCycle: 'LIFETIME',
        amount: 0, // Complimentary access
        currentPeriodStart: now,
        currentPeriodEnd: lifetimeEnd,
        cancelAtPeriodEnd: false,
      }
    })

    // Log the lifetime access grant
    await prisma.securityLog.create({
      data: {
        userId,
        eventType: 'SUSPICIOUS_ACTIVITY',
        severity: 'HIGH',
        description: `Lifetime ${tier} access granted by admin ${session.user.email}. Reason: ${reason}`,
        metadata: {
          adminId: session.user.id,
          adminEmail: session.user.email,
          action: 'grant_lifetime_access',
          oldTier,
          newTier: tier,
          expirationDate: lifetimeEnd.toISOString(),
          reason,
        }
      }
    })

    // Create subscription history entry
    await prisma.subscriptionHistory.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        action: 'LIFETIME_ACCESS_GRANTED',
        performedBy: session.user.id,
        reason,
        oldValues: {
          tier: oldTier,
        },
        newValues: {
          tier,
          status: 'ACTIVE',
          billingCycle: 'LIFETIME',
          expirationDate: lifetimeEnd.toISOString(),
        },
      }
    }).catch((err) => {
      console.warn("SubscriptionHistory table not found:", err.message)
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        subscription,
        oldTier,
        newTier: tier,
        message: `Successfully granted lifetime ${tier} access`
      } 
    })
  } catch (error: any) {
    console.error("Grant lifetime access error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to grant access" 
    }, { status: 500 })
  }
}
