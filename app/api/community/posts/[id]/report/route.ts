import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json({ error: "Reason required" }, { status: 400 })
    }

    await prisma.postReport.create({
      data: {
        postId: params.id,
        userId: user.id,
        reason
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reporting post:", error)
    return NextResponse.json({ error: "Failed to report post" }, { status: 500 })
  }
}
