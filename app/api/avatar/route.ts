
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { avatarEnabled, avatarType, avatarPhotoUrl, avatarName, avatarVoiceEnabled } = await req.json()

    // Check if user has Pro tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true }
    })

    if (user?.subscriptionTier !== 'PRO') {
      return NextResponse.json({ error: "Pro tier required" }, { status: 403 })
    }

    // Update user avatar settings
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        avatarEnabled,
        avatarType,
        avatarPhotoUrl,
        avatarName: avatarName || "Coach",
        avatarVoiceEnabled: avatarVoiceEnabled ?? true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Avatar update error:", error)
    return NextResponse.json({ error: "Failed to update avatar" }, { status: 500 })
  }
}
