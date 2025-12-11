/**
 * Goal-Based Notification Service
 * Handles all goal-related notifications including:
 * - Immediate confirmation emails when goals are created
 * - Daily progress check-ins and tips
 * - Milestone achievement notifications
 * - Goal completion celebrations
 */

import { prisma } from "@/lib/db"
import { generateGoalTip, generateMotivationalQuote } from "./goal-tip-generator"
import { sendEmail } from "@/lib/email"

export interface GoalNotificationPreferences {
  enableDailyReminders: boolean
  preferredTime: string // "08:00" format
  frequency: 'daily' | 'every_other_day' | 'weekly'
}

interface GoalData {
  id: string
  title: string
  description?: string | null
  category: string
  targetDate?: Date | string | null
  userId: string
  progress?: number
  createdAt: Date
}

/**
 * Send immediate goal confirmation email
 * This is sent right after a user creates a goal
 */
export async function sendGoalConfirmation(userId: string, goalData: GoalData) {
  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true }
    })

    if (!user?.email) {
      console.error("User email not found for goal confirmation")
      return { success: false, error: "User email not found" }
    }

    const userName = user.firstName || 'Champion'
    const targetDateFormatted = goalData.targetDate 
      ? new Date(goalData.targetDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'No specific deadline'

    // Generate HTML email
    const htmlContent = generateGoalConfirmationEmail({
      userName,
      goalTitle: goalData.title,
      goalDescription: goalData.description || '',
      goalCategory: goalData.category,
      targetDate: targetDateFormatted,
      goalId: goalData.id
    })

    // Send email via Resend
    await sendEmail({
      from: 'Coach Kai <coach@resend.dev>',
      to: user.email,
      subject: `🎯 Goal Set! Coach Kai is Here to Help`,
      html: htmlContent,
      replyTo: 'support@resend.dev'
    })

    console.log(`Goal confirmation email sent to ${user.email}`)
    return { success: true }
  } catch (error) {
    console.error("Error sending goal confirmation:", error)
    return { success: false, error }
  }
}

/**
 * Setup daily goal reminder notifications
 * Creates scheduled notifications in the database
 */
export async function setupDailyGoalReminders(
  userId: string, 
  goalData: GoalData,
  preferences?: GoalNotificationPreferences
) {
  try {
    const defaultPreferences: GoalNotificationPreferences = {
      enableDailyReminders: true,
      preferredTime: preferences?.preferredTime || '08:00',
      frequency: preferences?.frequency || 'daily'
    }

    // Only create reminders if enabled
    if (!preferences?.enableDailyReminders && preferences !== undefined) {
      return { success: true, message: "Daily reminders disabled by user" }
    }

    // Calculate when to send the first reminder (tomorrow at preferred time)
    const [hours, minutes] = defaultPreferences.preferredTime.split(':').map(Number)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(hours, minutes, 0, 0)

    // Determine interval based on frequency
    let intervalDays = 1
    if (defaultPreferences.frequency === 'every_other_day') intervalDays = 2
    if (defaultPreferences.frequency === 'weekly') intervalDays = 7

    // Create scheduled notification for daily check-in
    const notification = await prisma.scheduledNotification.create({
      data: {
        userId,
        category: 'GOALS',
        type: 'GOAL_DAILY_CHECKIN',
        title: `🌟 Daily Check-in: ${goalData.title}`,
        message: `Time for your daily progress check-in! Coach Kai has tips to help you reach your goal.`,
        data: JSON.stringify({
          goalId: goalData.id,
          goalTitle: goalData.title,
          intervalDays
        }),
        scheduledFor: tomorrow,
        status: 'PENDING',
        deliveryMethod: 'EMAIL',
        source: 'SYSTEM'
      }
    })

    console.log(`Daily goal reminders set up for goal ${goalData.id}`)
    return { success: true, notificationId: notification.id }
  } catch (error) {
    console.error("Error setting up daily goal reminders:", error)
    return { success: false, error }
  }
}

/**
 * Send daily goal progress email with tip
 * This is triggered by the scheduled notification system
 */
export async function sendDailyGoalProgressEmail(
  userId: string,
  goalId: string,
  dayNumber: number
) {
  try {
    // Get goal and user data
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { milestones: true }
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true }
    })

    if (!goal || !user?.email) {
      return { success: false, error: "Goal or user not found" }
    }

    const userName = user.firstName || 'Champion'
    
    // Calculate days since goal set and days until target
    const daysIntoGoal = Math.floor(
      (Date.now() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    let daysUntilTarget = null
    if (goal.targetDate) {
      daysUntilTarget = Math.ceil(
        (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    }

    // Generate today's tip
    const tip = generateGoalTip({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetDate: goal.targetDate,
      progress: goal.progress,
      daysIntoGoal
    }, dayNumber)

    // Get motivational quote
    const motivationalQuote = generateMotivationalQuote(dayNumber)

    // Generate email content
    const htmlContent = generateDailyProgressEmail({
      userName,
      goalTitle: goal.title,
      daysIntoGoal,
      daysUntilTarget,
      progress: goal.progress,
      tip,
      motivationalQuote,
      goalId: goal.id
    })

    // Send email
    await sendEmail({
      from: 'Coach Kai <coach@resend.dev>',
      to: user.email,
      subject: `🌟 Daily Check-in: ${goal.title}`,
      html: htmlContent,
      replyTo: 'support@resend.dev'
    })

    console.log(`Daily progress email sent for goal ${goalId}`)
    return { success: true }
  } catch (error) {
    console.error("Error sending daily progress email:", error)
    return { success: false, error }
  }
}

/**
 * Send milestone achievement notification
 */
export async function sendMilestoneAchievedEmail(
  userId: string,
  goalId: string,
  milestoneTitle: string
) {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true }
    })

    if (!goal || !user?.email) {
      return { success: false, error: "Goal or user not found" }
    }

    const userName = user.firstName || 'Champion'

    const htmlContent = generateMilestoneEmail({
      userName,
      goalTitle: goal.title,
      milestoneTitle,
      goalId: goal.id
    })

    await sendEmail({
      from: 'Coach Kai <coach@resend.dev>',
      to: user.email,
      subject: `🏆 Milestone Reached: ${milestoneTitle}`,
      html: htmlContent,
      replyTo: 'support.reai.io'
    })

    console.log(`Milestone achievement email sent for ${milestoneTitle}`)
    return { success: true }
  } catch (error) {
    console.error("Error sending milestone email:", error)
    return { success: false, error }
  }
}

/**
 * Cancel all goal reminders when a goal is completed or deleted
 */
export async function cancelGoalReminders(goalId: string) {
  try {
    // Find all pending scheduled notifications for this goal
    const notifications = await prisma.scheduledNotification.findMany({
      where: {
        status: 'PENDING',
        category: 'GOALS',
        data: {
          path: ['goalId'],
          equals: goalId
        }
      }
    })

    // Cancel them all
    await prisma.scheduledNotification.updateMany({
      where: {
        id: { in: notifications.map(n => n.id) }
      },
      data: {
        status: 'CANCELLED'
      }
    })

    console.log(`Cancelled ${notifications.length} reminders for goal ${goalId}`)
    return { success: true, cancelledCount: notifications.length }
  } catch (error) {
    console.error("Error cancelling goal reminders:", error)
    return { success: false, error }
  }
}

/**
 * EMAIL TEMPLATES
 */

function generateGoalConfirmationEmail(data: {
  userName: string
  goalTitle: string
  goalDescription: string
  goalCategory: string
  targetDate: string
  goalId: string
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindful-champion-2hzb4j.abacusai.app'
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Goal Set Successfully!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
        <div style="font-size: 60px; margin-bottom: 10px;">🎯</div>
        <h1 style="color: #0f172a; margin: 0 0 10px 0; font-size: 32px; font-weight: 700;">Goal Set!</h1>
        <p style="color: #64748b; margin: 0; font-size: 18px;">Coach Kai is Here to Help</p>
      </div>
    </div>

    <!-- Main Content -->
    <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); margin-bottom: 30px;">
      <p style="color: #0f172a; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
        Hey <strong>${data.userName}</strong>! 🏓
      </p>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Congratulations on setting your goal! This is an exciting first step toward improvement. I'm Coach Kai, and I'll be checking in with you daily to help you stay on track.
      </p>

      <!-- Goal Details -->
      <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0d9488 100%); border-radius: 15px; padding: 25px; margin-bottom: 30px;">
        <h2 style="color: white; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">Your Goal</h2>
        <p style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">
          ${data.goalTitle}
        </p>
        ${data.goalDescription ? `
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.5; margin: 0 0 15px 0;">
          ${data.goalDescription}
        </p>
        ` : ''}
        <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-top: 15px;">
          <div style="background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 20px;">
            <span style="color: white; font-size: 13px;">📁 ${data.goalCategory.replace('_', ' ')}</span>
          </div>
          <div style="background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 20px;">
            <span style="color: white; font-size: 13px;">📅 Target: ${data.targetDate}</span>
          </div>
        </div>
      </div>

      <!-- What's Next -->
      <h3 style="color: #0f172a; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What's Next?</h3>
      
      <div style="margin-bottom: 20px;">
        <div style="display: flex; gap: 15px; margin-bottom: 15px;">
          <div style="flex-shrink: 0; width: 40px; height: 40px; background: linear-gradient(135deg, #0ea5e9, #06b6d4); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">1</div>
          <div style="flex: 1;">
            <p style="color: #0f172a; font-weight: 600; margin: 0 0 5px 0;">Daily Check-ins</p>
            <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">I'll send you personalized tips and motivation every morning to keep you on track.</p>
          </div>
        </div>

        <div style="display: flex; gap: 15px; margin-bottom: 15px;">
          <div style="flex-shrink: 0; width: 40px; height: 40px; background: linear-gradient(135deg, #0d9488, #14b8a6); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">2</div>
          <div style="flex: 1;">
            <p style="color: #0f172a; font-weight: 600; margin: 0 0 5px 0;">Track Your Progress</p>
            <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">Log your practice sessions and watch your progress grow in the app dashboard.</p>
          </div>
        </div>

        <div style="display: flex; gap: 15px;">
          <div style="flex-shrink: 0; width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b, #f97316); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">3</div>
          <div style="flex: 1;">
            <p style="color: #0f172a; font-weight: 600; margin: 0 0 5px 0;">Celebrate Milestones</p>
            <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">I'll celebrate every milestone with you. Small wins lead to big achievements!</p>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #0d9488); color: white; text-decoration: none; padding: 15px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);">
          View Your Goal
        </a>
      </div>

      <!-- Coach Kai Quote -->
      <div style="background: #f1f5f9; border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p style="color: #475569; font-size: 15px; font-style: italic; margin: 0; line-height: 1.6;">
          "Remember: Every champion started exactly where you are now. The only difference is they took action and stayed consistent. You've got this!" 💪
        </p>
        <p style="color: #64748b; font-size: 13px; margin: 10px 0 0 0; font-weight: 600;">
          — Coach Kai 🤖
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px;">
      <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 0 0 10px 0;">
        Want to adjust your notification preferences?
      </p>
      <a href="${appUrl}/dashboard/reminders" style="color: white; text-decoration: underline; font-size: 13px;">
        Manage Notification Settings
      </a>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function generateDailyProgressEmail(data: {
  userName: string
  goalTitle: string
  daysIntoGoal: number
  daysUntilTarget: number | null
  progress: number
  tip: { category: string; title: string; content: string; actionable: string; icon: string }
  motivationalQuote: string
  goalId: string
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindful-champion-2hzb4j.abacusai.app'
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Check-in</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center; margin-bottom: 30px;">
      <div style="font-size: 50px; margin-bottom: 10px;">🌟</div>
      <h1 style="color: #0f172a; margin: 0 0 5px 0; font-size: 28px; font-weight: 700;">Daily Check-in</h1>
      <p style="color: #0ea5e9; margin: 0; font-size: 16px; font-weight: 600;">${data.goalTitle}</p>
    </div>

    <!-- Main Content -->
    <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); margin-bottom: 30px;">
      <p style="color: #0f172a; font-size: 18px; margin: 0 0 20px 0;">
        Good morning, <strong>${data.userName}</strong>! ☀️
      </p>

      <!-- Progress Stats -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); border-radius: 15px; padding: 20px; text-align: center;">
          <div style="color: white; font-size: 32px; font-weight: 700; margin-bottom: 5px;">${data.daysIntoGoal}</div>
          <div style="color: rgba(255,255,255,0.9); font-size: 13px;">Days Into Goal</div>
        </div>
        ${data.daysUntilTarget !== null ? `
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); border-radius: 15px; padding: 20px; text-align: center;">
          <div style="color: white; font-size: 32px; font-weight: 700; margin-bottom: 5px;">${data.daysUntilTarget}</div>
          <div style="color: rgba(255,255,255,0.9); font-size: 13px;">Days Until Target</div>
        </div>
        ` : `
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); border-radius: 15px; padding: 20px; text-align: center;">
          <div style="color: white; font-size: 32px; font-weight: 700; margin-bottom: 5px;">${Math.round(data.progress)}%</div>
          <div style="color: rgba(255,255,255,0.9); font-size: 13px;">Progress</div>
        </div>
        `}
      </div>

      <!-- Today's Tip -->
      <div style="background: #f8fafc; border-radius: 15px; padding: 25px; margin-bottom: 25px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
          <span style="font-size: 30px;">${data.tip.icon}</span>
          <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 600;">Today's ${data.tip.category.charAt(0).toUpperCase() + data.tip.category.slice(1)} Tip</h2>
        </div>
        
        <h3 style="color: #0ea5e9; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">
          ${data.tip.title}
        </h3>
        
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
          ${data.tip.content}
        </p>
        
        <div style="background: white; border-left: 4px solid #0ea5e9; padding: 15px; border-radius: 8px;">
          <p style="color: #0f172a; font-weight: 600; font-size: 14px; margin: 0 0 8px 0;">✅ Action Item:</p>
          <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
            ${data.tip.actionable}
          </p>
        </div>
      </div>

      <!-- Motivational Quote -->
      <div style="background: linear-gradient(135deg, #0d9488, #06b6d4); border-radius: 15px; padding: 25px; text-align: center; margin-bottom: 25px;">
        <p style="color: white; font-size: 16px; font-style: italic; line-height: 1.6; margin: 0;">
          ${data.motivationalQuote}
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align: center;">
        <a href="${appUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #0d9488); color: white; text-decoration: none; padding: 15px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3); margin-bottom: 15px;">
          Log Your Progress
        </a>
        <p style="color: #64748b; font-size: 13px; margin: 0;">
          Track your practice and watch your improvement!
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px;">
      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 5px 0;">
        <strong>Cheering you on,</strong>
      </p>
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 15px 0;">
        Coach Kai 🤖
      </p>
      <a href="${appUrl}/dashboard/reminders" style="color: rgba(255,255,255,0.7); text-decoration: underline; font-size: 12px;">
        Manage notification preferences
      </a>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function generateMilestoneEmail(data: {
  userName: string
  goalTitle: string
  milestoneTitle: string
  goalId: string
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindful-champion-2hzb4j.abacusai.app'
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Milestone Reached!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center; margin-bottom: 30px;">
      <div style="font-size: 80px; margin-bottom: 20px; animation: bounce 1s infinite;">🏆</div>
      <h1 style="color: #0f172a; margin: 0 0 10px 0; font-size: 32px; font-weight: 700;">Milestone Reached!</h1>
      <p style="color: #f97316; margin: 0; font-size: 18px; font-weight: 600;">${data.milestoneTitle}</p>
    </div>

    <!-- Main Content -->
    <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); margin-bottom: 30px;">
      <p style="color: #0f172a; font-size: 20px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">
        🎉 Congratulations, ${data.userName}! 🎉
      </p>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0; text-align: center;">
        You've just achieved a major milestone in your goal: <strong>${data.goalTitle}</strong>
      </p>

      <!-- Achievement Card -->
      <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 15px; padding: 30px; text-align: center; margin-bottom: 30px;">
        <div style="font-size: 50px; margin-bottom: 15px;">✨</div>
        <p style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">
          ${data.milestoneTitle}
        </p>
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">
          This is a significant step toward your ultimate goal!
        </p>
      </div>

      <!-- Coach Kai Message -->
      <div style="background: #f1f5f9; border-left: 4px solid #f59e0b; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
          I'm so proud of you! This milestone shows your dedication and hard work are paying off. 
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
          Remember: Every small victory brings you closer to your ultimate goal. Keep this momentum going!
        </p>
        <p style="color: #64748b; font-size: 14px; margin: 0; font-weight: 600;">
          — Coach Kai 🤖
        </p>
      </div>

      <!-- What's Next -->
      <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
        <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">🎯 What's Next?</h3>
        <ul style="color: #78350f; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Take a moment to celebrate this win!</li>
          <li>Review your next milestone</li>
          <li>Keep showing up with that same dedication</li>
          <li>Remember: You're building something amazing</li>
        </ul>
      </div>

      <!-- CTA -->
      <div style="text-align: center;">
        <a href="${appUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #f97316); color: white; text-decoration: none; padding: 15px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);">
          View Your Progress
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px;">
      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">
        Keep going, Champion! You're doing amazing! 🌟
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
