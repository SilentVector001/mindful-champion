
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get subscription history (if table exists)
    let subscriptionHistory: any[] = []
    try {
      subscriptionHistory = await prisma.subscriptionHistory.findMany({
        where: { userId },
        include: {
          performedByUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 50,
      })
    } catch (err: any) {
      console.warn("SubscriptionHistory table not found, using security logs:", err.message)
      
      // Fallback to security logs for subscription changes
      const securityLogs = await prisma.securityLog.findMany({
        where: {
          userId,
          description: {
            contains: 'subscription'
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 50,
      })

      // Transform security logs to match history format
      subscriptionHistory = securityLogs.map(log => {
        const metadata = log.metadata as any
        return {
          id: log.id,
          userId: log.userId,
          action: log.eventType,
          reason: log.description,
          timestamp: log.timestamp,
          oldValues: metadata?.oldTier ? {
            tier: metadata.oldTier,
            status: metadata.oldStatus,
          } : {},
          newValues: metadata?.newTier ? {
            tier: metadata.newTier,
            status: metadata.newStatus,
          } : {},
          performedByUser: metadata?.adminEmail ? {
            email: metadata.adminEmail,
            firstName: 'Admin',
          } : null,
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      data: subscriptionHistory,
      total: subscriptionHistory.length 
    })
  } catch (error: any) {
    console.error("Subscription history error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to fetch subscription history" 
    }, { status: 500 })
  }
}
