import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isTrialActive: true,
        trialEndDate: true,
        trialStartDate: true,
        subscriptionTier: true,
        subscriptionStatus: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const now = new Date()
    const trialEndDate = user.trialEndDate ? new Date(user.trialEndDate) : null
    const isExpired = trialEndDate ? now > trialEndDate : false
    const daysRemaining = trialEndDate 
      ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0

    // Check if user needs to be redirected to upgrade
    const needsUpgrade = user.subscriptionTier === 'FREE' && isExpired

    return NextResponse.json({
      isTrialActive: user.isTrialActive,
      trialEndDate: trialEndDate?.toISOString(),
      trialStartDate: user.trialStartDate?.toISOString(),
      isExpired,
      daysRemaining,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      needsUpgrade
    })
  } catch (error) {
    console.error("[TRIAL_STATUS_ERROR]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
