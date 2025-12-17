export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user to be deleted
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, stripeCustomerId: true }
    })

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent deleting admin accounts
    if (userToDelete.role === 'ADMIN') {
      return NextResponse.json({ error: "Cannot delete admin accounts" }, { status: 403 })
    }

    // Prevent deleting your own account
    if (userToDelete.id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 403 })
    }

    // Get deletion reason from request body
    const body = await req.json().catch(() => ({}))
    const { reason, confirmEmail } = body

    // Require email confirmation
    if (confirmEmail !== userToDelete.email) {
      return NextResponse.json({ 
        error: "Email confirmation does not match", 
        requiredEmail: userToDelete.email 
      }, { status: 400 })
    }

    // Log the deletion event before deleting the user
    // Using SUSPICIOUS_ACTIVITY as a generic event type for admin actions
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        eventType: 'SUSPICIOUS_ACTIVITY',
        severity: 'HIGH',
        description: `ADMIN ACTION: User account ${userToDelete.email} (ID: ${userId}) was deleted by admin ${session.user.email}. Reason: ${reason || 'No reason provided'}`,
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'admin',
        metadata: {
          action: 'USER_DELETED_BY_ADMIN',
          deletedUserId: userId,
          deletedUserEmail: userToDelete.email,
          deletionReason: reason,
          performedBy: session.user.email,
        }
      }
    })

    // Delete related data in order (respecting foreign key constraints)
    // Using a transaction to ensure all data is deleted atomically
    await prisma.$transaction(async (tx) => {
      // Delete session-related data
      await tx.pageView.deleteMany({ where: { session: { userId } } })
      await tx.videoInteraction.deleteMany({ where: { session: { userId } } })
      await tx.drillCompletion.deleteMany({ where: { session: { userId } } })
      await tx.userSession.deleteMany({ where: { userId } })
      
      // Delete user content and progress
      await tx.userVideoProgress.deleteMany({ where: { userId } })
      await tx.userVideoRating.deleteMany({ where: { userId } })
      await tx.userWatchHistory.deleteMany({ where: { userId } })
      await tx.userPodcastProgress.deleteMany({ where: { userId } })
      await tx.videoBookmark.deleteMany({ where: { userId } })
      await tx.podcastBookmark.deleteMany({ where: { userId } })
      await tx.contentBookmark.deleteMany({ where: { userId } })
      await tx.postBookmark.deleteMany({ where: { userId } })
      await tx.videoClip.deleteMany({ where: { userId } })
      await tx.videoPlaylist.deleteMany({ where: { userId } })
      await tx.videoSuggestion.deleteMany({ where: { userId } })
      await tx.savedContent.deleteMany({ where: { userId } })
      
      // Delete social features
      await tx.postComment.deleteMany({ where: { userId } })
      await tx.postLike.deleteMany({ where: { userId } })
      await tx.postReport.deleteMany({ where: { userId } })
      await tx.commentLike.deleteMany({ where: { userId } })
      await tx.communityPost.deleteMany({ where: { userId } })
      await tx.communityStats.deleteMany({ where: { userId } })
      
      // Delete training and progress data
      await tx.skillProgress.deleteMany({ where: { userId } })
      await tx.trainingPlan.deleteMany({ where: { userId } })
      await tx.customProgram.deleteMany({ where: { userId } })
      await tx.userProgram.deleteMany({ where: { userId } })
      await tx.practiceLog.deleteMany({ where: { userId } })
      await tx.mentalSession.deleteMany({ where: { userId } })
      
      // Delete goals and achievements
      await tx.goal.deleteMany({ where: { userId } })
      await tx.userGoal.deleteMany({ where: { userId } })
      await tx.userAchievement.deleteMany({ where: { userId } })
      await tx.achievementProgress.deleteMany({ where: { userId } })
      await tx.userAchievementStats.deleteMany({ where: { userId } })
      await tx.userChallenge.deleteMany({ where: { userId } })
      await tx.tierUnlock.deleteMany({ where: { userId } })
      await tx.rewardRedemption.deleteMany({ where: { userId } })
      
      // Delete matches and performance data
      await tx.match.deleteMany({ where: { userId } })
      await tx.healthData.deleteMany({ where: { userId } })
      await tx.wearableDevice.deleteMany({ where: { userId } })
      
      // Delete video analysis data
      await tx.videoAnalysis.deleteMany({ where: { userId } })
      
      // Delete AI conversations and chat messages
      await tx.chatMessage.deleteMany({ where: { userId } })
      await tx.aIConversation.deleteMany({ where: { userId } })
      
      // Delete coach reminders
      await tx.coachKaiReminder.deleteMany({ where: { userId } })
      
      // Delete partner connections and requests
      await tx.partnerConnection.deleteMany({ 
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] } 
      })
      await tx.partnerRequest.deleteMany({ 
        where: { OR: [{ senderId: userId }, { receiverId: userId }] } 
      })
      
      // Delete notifications
      await tx.notificationHistory.deleteMany({ where: { userId } })
      await tx.scheduledNotification.deleteMany({ where: { userId } })
      await tx.emailNotification.deleteMany({ where: { userId } })
      await tx.notificationPreferences.deleteMany({ where: { userId } })
      
      // Delete media preferences
      await tx.userMediaPreferences.deleteMany({ where: { userId } })
      await tx.userFavoriteStreamingPlatform.deleteMany({ where: { userId } })
      await tx.userFollowedOrganization.deleteMany({ where: { userId } })
      await tx.userContentRecommendation.deleteMany({ where: { userId } })
      
      // Delete subscription and payment data
      await tx.payment.deleteMany({ where: { userId } })
      await tx.subscription.deleteMany({ where: { userId } })
      await tx.subscriptionHistory.deleteMany({ where: { userId } })
      await tx.offerRedemption.deleteMany({ where: { userId } })
      await tx.trialExpirationReminder.deleteMany({ where: { userId } })
      
      // Delete security and auth data
      await tx.securityLog.deleteMany({ where: { userId } })
      await tx.passwordResetLog.deleteMany({ where: { userId } })
      await tx.passwordResetToken.deleteMany({ where: { userId } })
      await tx.biometricCredential.deleteMany({ where: { userId } })
      
      // Delete bookings and tournaments
      await tx.booking.deleteMany({ where: { userId } })
      await tx.tournamentRegistration.deleteMany({ where: { userId } })
      
      // Delete support and beta tester data
      await tx.supportTicket.deleteMany({ where: { userId } })
      await tx.betaTester.deleteMany({ where: { userId } })
      await tx.sponsorProfile.deleteMany({ where: { userId } })
      
      // Delete NextAuth related data
      await tx.account.deleteMany({ where: { userId } })
      await tx.session.deleteMany({ where: { userId } })
      
      // Finally, delete the user
      await tx.user.delete({ where: { id: userId } })
    })

    return NextResponse.json({ 
      success: true, 
      message: `User ${userToDelete.email} has been permanently deleted`,
      deletedUserId: userId,
      deletedUserEmail: userToDelete.email,
    })
  } catch (error: any) {
    console.error("Admin delete user error:", error)
    return NextResponse.json({ 
      error: "Failed to delete user", 
      details: error.message 
    }, { status: 500 })
  }
}
