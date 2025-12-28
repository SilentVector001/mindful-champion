export const dynamic = "force-dynamic"


import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const messages = await prisma.chatMessage.findMany({
      include: {
        user: true,
      },
      orderBy: { timestamp: 'desc' },
      take: 200,
    })

    // Group by user to get conversation stats
    const userStats = messages.reduce((acc: any, msg: any) => {
      if (!acc[msg.userId]) {
        acc[msg.userId] = {
          user: msg.user,
          totalMessages: 0,
          lastMessage: msg.timestamp,
        }
      }
      acc[msg.userId].totalMessages++
      return acc
    }, {})

    return NextResponse.json({ messages, userStats: Object.values(userStats) })
  } catch (error) {
    console.error("Admin coach fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch coach data" }, { status: 500 })
  }
}
