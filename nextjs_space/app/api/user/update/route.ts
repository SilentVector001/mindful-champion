// @ts-nocheck

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
      phone,
      playerRating,
      skillLevel,
      timezone,
      avatarName,
      avatarVoiceEnabled,
      emailGoalReminders,
      emailWeeklyProgress,
      emailTournamentAlerts,
      emailCoachTips
    } = await req.json()

    // Build update data, only including defined fields
    const updateData: any = { updatedAt: new Date() }
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (phone !== undefined) updateData.phone = phone
    if (playerRating !== undefined) updateData.playerRating = playerRating
    if (skillLevel !== undefined) updateData.skillLevel = skillLevel
    if (timezone !== undefined) updateData.timezone = timezone
    if (avatarName !== undefined) updateData.avatarName = avatarName
    if (avatarVoiceEnabled !== undefined) updateData.avatarVoiceEnabled = avatarVoiceEnabled
    // Store email preferences in notificationPreferences JSON field
    if (emailGoalReminders !== undefined || emailWeeklyProgress !== undefined || 
        emailTournamentAlerts !== undefined || emailCoachTips !== undefined) {
      updateData.notificationPreferences = {
        emailGoalReminders: emailGoalReminders ?? true,
        emailWeeklyProgress: emailWeeklyProgress ?? true,
        emailTournamentAlerts: emailTournamentAlerts ?? true,
        emailCoachTips: emailCoachTips ?? true
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
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
