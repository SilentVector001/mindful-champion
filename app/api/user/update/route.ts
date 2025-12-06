
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      firstName,
      lastName,
      playerRating,
      skillLevel,
      timezone,
      avatarName,
      avatarVoiceEnabled
    } = await req.json()

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        playerRating: playerRating || undefined,
        skillLevel: skillLevel || undefined,
        timezone: timezone || undefined,
        avatarName: avatarName || undefined,
        avatarVoiceEnabled: avatarVoiceEnabled !== undefined ? avatarVoiceEnabled : undefined,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        playerRating: updatedUser.playerRating,
        skillLevel: updatedUser.skillLevel,
        avatarName: updatedUser.avatarName
      }
    })

  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    )
  }
}
