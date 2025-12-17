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

    const [requests, connections] = await Promise.all([
      prisma.partnerRequest.findMany({
        include: {
          sender: true,
          receiver: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.partnerConnection.findMany({
        include: {
          user1: true,
          user2: true,
        },
        orderBy: { connectedAt: 'desc' },
        take: 100,
      })
    ])

    return NextResponse.json({ requests, connections })
  } catch (error) {
    console.error("Admin partners fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch partners data" }, { status: 500 })
  }
}
