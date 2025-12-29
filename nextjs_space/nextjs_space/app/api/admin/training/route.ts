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

    const [videos, programs, userPrograms] = await Promise.all([
      prisma.trainingVideo.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          userVideoProgress: true,
          programVideos: true,
        }
      }),
      prisma.trainingProgram.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          userPrograms: true,
          programVideos: { include: { video: true } }
        }
      }),
      prisma.userProgram.findMany({
        include: {
          user: true,
          program: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    ])

    return NextResponse.json({ videos, programs, userPrograms })
  } catch (error) {
    console.error("Admin training fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch training data" }, { status: 500 })
  }
}
