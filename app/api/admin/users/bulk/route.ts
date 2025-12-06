export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, userIds } = body

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    let result
    const adminId = session.user.id

    switch (action) {
      case 'lock':
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: {
            accountLocked: true,
            accountLockedReason: 'Locked by admin',
            accountLockedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          }
        })
        
        // Log security events
        await Promise.all(userIds.map(userId => 
          prisma.securityLog.create({
            data: {
              userId,
              eventType: 'ACCOUNT_LOCKED',
              severity: 'HIGH',
              description: `Account locked by admin ${session.user.email}`,
              resolvedBy: adminId,
            }
          })
        ))
        break

      case 'unlock':
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: {
            accountLocked: false,
            accountLockedReason: null,
            accountLockedUntil: null,
            failedLoginAttempts: 0,
          }
        })
        
        // Log security events
        await Promise.all(userIds.map(userId => 
          prisma.securityLog.create({
            data: {
              userId,
              eventType: 'ACCOUNT_UNLOCKED',
              severity: 'MEDIUM',
              description: `Account unlocked by admin ${session.user.email}`,
              resolvedBy: adminId,
            }
          })
        ))
        break

      case 'export':
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            skillLevel: true,
            subscriptionTier: true,
            subscriptionStatus: true,
            createdAt: true,
            lastActiveDate: true,
          }
        })
        
        return NextResponse.json({ users })

      case 'send_email':
        // This would integrate with your email service
        // For now, just log the action
        result = { count: userIds.length }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully performed ${action} on ${userIds.length} users`,
      result 
    })
  } catch (error) {
    console.error("Error performing bulk action:", error)
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 })
  }
}
