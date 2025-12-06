/**
 * Goal Notification Processor
 * This worker processes scheduled goal notifications and sends daily check-ins
 * It should be run periodically (e.g., every hour) to check for pending notifications
 */

import { prisma } from "@/lib/db"
import { sendDailyGoalProgressEmail, setupDailyGoalReminders } from "@/lib/notifications/goal-notifications"

/**
 * Process all pending goal daily check-in notifications
 * This function is called by the scheduled notification system
 */
export async function processGoalDailyCheckIns() {
  try {
    console.log("Processing goal daily check-ins...")

    const now = new Date()

    // Find all pending goal check-in notifications that are due
    const dueNotifications = await prisma.scheduledNotification.findMany({
      where: {
        type: 'GOAL_DAILY_CHECKIN',
        status: 'PENDING',
        scheduledFor: {
          lte: now
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true
          }
        }
      }
    })

    console.log(`Found ${dueNotifications.length} due goal check-ins`)

    for (const notification of dueNotifications) {
      try {
        const data = notification.data as any || {}
        const { goalId, intervalDays } = data

        if (!goalId) {
          console.error(`No goalId in notification ${notification.id}`)
          await markNotificationFailed(notification.id, 'Missing goalId')
          continue
        }

        // Verify goal still exists and is active
        const goal = await prisma.goal.findUnique({
          where: { id: goalId }
        })

        if (!goal) {
          console.log(`Goal ${goalId} not found, cancelling notification`)
          await markNotificationCancelled(notification.id)
          continue
        }

        if (goal.status === 'COMPLETED' || goal.status === 'ARCHIVED') {
          console.log(`Goal ${goalId} is ${goal.status}, cancelling notification`)
          await markNotificationCancelled(notification.id)
          continue
        }

        // Calculate day number
        const daysIntoGoal = Math.floor(
          (Date.now() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        )

        // Send daily progress email
        const result = await sendDailyGoalProgressEmail(
          notification.userId,
          goalId,
          daysIntoGoal
        )

        if (result.success) {
          // Mark this notification as completed
          await prisma.scheduledNotification.update({
            where: { id: notification.id },
            data: {
              status: 'SENT',
              sentAt: new Date()
            }
          })

          // Schedule next notification
          const nextDate = new Date(notification.scheduledFor)
          nextDate.setDate(nextDate.getDate() + (intervalDays || 1))

          // Only schedule if goal is not completed and target date not passed
          const shouldContinue = !goal.targetDate || new Date(goal.targetDate) > new Date()

          if (shouldContinue) {
            await prisma.scheduledNotification.create({
              data: {
                userId: notification.userId,
                category: 'GOALS',
                type: 'GOAL_DAILY_CHECKIN',
                title: notification.title,
                message: notification.message,
                data: notification.data,
                scheduledFor: nextDate,
                status: 'PENDING',
                deliveryMethod: 'EMAIL',
                source: 'SYSTEM'
              }
            })

            console.log(`Scheduled next check-in for ${nextDate.toISOString()}`)
          }
        } else {
          await markNotificationFailed(notification.id, 'Failed to send email')
        }
      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error)
        await markNotificationFailed(notification.id, String(error))
      }
    }

    console.log("Goal daily check-ins processing complete")
    return { success: true, processed: dueNotifications.length }
  } catch (error) {
    console.error("Error in processGoalDailyCheckIns:", error)
    return { success: false, error }
  }
}

/**
 * Helper: Mark notification as failed
 */
async function markNotificationFailed(notificationId: string, error: string) {
  await prisma.scheduledNotification.update({
    where: { id: notificationId },
    data: {
      status: 'FAILED',
      sentAt: new Date(),
      data: { error }
    }
  })
}

/**
 * Helper: Mark notification as cancelled
 */
async function markNotificationCancelled(notificationId: string) {
  await prisma.scheduledNotification.update({
    where: { id: notificationId },
    data: {
      status: 'CANCELLED'
    }
  })
}

/**
 * Check and send overdue goal reminders
 * For goals that have passed their target date but aren't completed
 */
export async function checkOverdueGoals() {
  try {
    console.log("Checking for overdue goals...")

    const now = new Date()

    const overdueGoals = await prisma.goal.findMany({
      where: {
        status: 'ACTIVE',
        targetDate: {
          lt: now
        },
        progress: {
          lt: 100
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true
          }
        }
      }
    })

    console.log(`Found ${overdueGoals.length} overdue goals`)

    // You can implement custom logic here to send overdue reminders
    // For now, we'll just log them

    for (const goal of overdueGoals) {
      console.log(`Overdue goal: ${goal.title} (${goal.id}) for user ${goal.user.email}`)
      // TODO: Implement overdue notification logic if needed
    }

    return { success: true, overdueCount: overdueGoals.length }
  } catch (error) {
    console.error("Error checking overdue goals:", error)
    return { success: false, error }
  }
}
