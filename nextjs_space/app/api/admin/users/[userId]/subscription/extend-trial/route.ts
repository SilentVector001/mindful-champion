
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

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
    const { days, reason } = body

    if (!days || !reason) {
      return NextResponse.json({ 
        error: "Missing required fields: days, reason" 
      }, { status: 400 })
    }

    if (![7, 14, 30].includes(days)) {
      return NextResponse.json({ 
        error: "Invalid days value. Must be 7, 14, or 30" 
      }, { status: 400 })
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        trialEndDate: true,
        isTrialActive: true,
        email: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const now = new Date()
    const currentTrialEnd = user.trialEndDate || now
    
    // Calculate new trial end date
    const newTrialEnd = new Date(
      Math.max(currentTrialEnd.getTime(), now.getTime()) + 
      days * 24 * 60 * 60 * 1000
    )

    // Update user trial dates
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        trialEndDate: newTrialEnd,
        isTrialActive: true,
        subscriptionStatus: 'ACTIVE',
        updatedAt: now,
      }
    })

    // Log the trial extension
    await prisma.securityLog.create({
      data: {
        userId,
        eventType: 'SUSPICIOUS_ACTIVITY',
        severity: 'MEDIUM',
        description: `Trial extended by ${days} days by admin ${session.user.email}. New end date: ${newTrialEnd.toLocaleDateString()}. Reason: ${reason}`,
        metadata: {
          adminId: session.user.id,
          adminEmail: session.user.email,
          action: 'extend_trial',
          daysAdded: days,
          oldTrialEnd: user.trialEndDate?.toISOString(),
          newTrialEnd: newTrialEnd.toISOString(),
          reason,
        }
      }
    })

    // Create subscription history entry
    await prisma.subscriptionHistory.create({
      data: {
        userId,
        action: 'TRIAL_EXTENDED',
        performedBy: session.user.id,
        reason,
        oldValues: {
          trialEndDate: user.trialEndDate?.toISOString(),
          isTrialActive: user.isTrialActive,
        },
        newValues: {
          trialEndDate: newTrialEnd.toISOString(),
          isTrialActive: true,
          daysAdded: days,
        },
      }
    }).catch((err) => {
      console.warn("SubscriptionHistory table not found:", err.message)
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        oldTrialEnd: user.trialEndDate,
        newTrialEnd,
        daysAdded: days,
        message: `Successfully extended trial by ${days} days`
      } 
    })
  } catch (error: any) {
    console.error("Trial extension error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to extend trial" 
    }, { status: 500 })
  }
}
