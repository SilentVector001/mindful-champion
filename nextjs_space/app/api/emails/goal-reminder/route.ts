import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const response = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        subject: subject,
        body: html,
        is_html: true,
        recipient_email: to,
        sender_email: 'noreply@mindfulchampion.com',
        sender_alias: 'Coach Kai - Mindful Champion'
      })
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.message || 'Failed to send email')
    return result
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}

function getGoalReminderHTML(userName: string, goalTitle: string, progress: number, daysRemaining?: number) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.7; color: #1e293b; margin: 0; padding: 0; background: #0f172a; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #0f172a; padding: 20px; }
    .container { background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; }
    .content { padding: 30px; color: #e2e8f0; }
    .greeting { font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }
    .goal-card { background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2); border-radius: 16px; padding: 20px; margin: 20px 0; }
    .goal-title { color: #06b6d4; font-weight: 700; font-size: 18px; margin-bottom: 12px; }
    .progress-bar-bg { background: rgba(255,255,255,0.1); border-radius: 10px; height: 12px; overflow: hidden; }
    .progress-bar { background: linear-gradient(90deg, #06b6d4, #10b981); height: 100%; border-radius: 10px; transition: width 0.3s; }
    .progress-text { color: #94a3b8; font-size: 14px; margin-top: 8px; }
    .cta-button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; }
    .tips { background: rgba(245,158,11,0.1); border-radius: 12px; padding: 16px; margin-top: 20px; border: 1px solid rgba(245,158,11,0.2); }
    .tips-title { color: #f59e0b; font-weight: 600; margin-bottom: 10px; }
    .tip-item { color: #cbd5e1; font-size: 14px; margin: 6px 0; padding-left: 16px; position: relative; }
    .tip-item::before { content: "•"; position: absolute; left: 0; color: #f59e0b; }
    .footer { text-align: center; padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); color: #64748b; font-size: 13px; }
    .footer-link { color: #06b6d4; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>🎯 Goal Check-In</h1>
      </div>
      
      <div class="content">
        <p class="greeting">Hey ${userName}! 👋</p>
        <p style="color: #cbd5e1;">Just checking in on your training progress. Let's keep that momentum going!</p>
        
        <div class="goal-card">
          <div class="goal-title">🏆 ${goalTitle}</div>
          <div class="progress-bar-bg">
            <div class="progress-bar" style="width: ${progress}%;"></div>
          </div>
          <p class="progress-text">${progress}% complete ${daysRemaining ? `• ${daysRemaining} days remaining` : ''}</p>
        </div>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://mindfulchampion.com/progress" class="cta-button">View Progress →</a>
        </p>
        
        <div class="tips">
          <div class="tips-title">💡 Quick Tips from Coach Kai</div>
          <div class="tip-item">Consistency beats intensity - 20 mins daily > 2 hours once a week</div>
          <div class="tip-item">Review your video analyses to spot improvement patterns</div>
          <div class="tip-item">Chat with Coach Kai for personalized drill suggestions</div>
        </div>
        
        <p style="color: #94a3b8; margin-top: 24px;">Keep grinding, champion! Every session counts. 💪</p>
      </div>
      
      <div class="footer">
        <p>Mindful Champion - AI-Powered Pickleball Coaching</p>
        <p><a href="https://mindfulchampion.com/settings" class="footer-link">Manage email preferences</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`
}

// Send goal reminder to a user
export async function POST(request: Request) {
  try {
    const { userId, goalId } = await request.json()
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, name: true, notificationPreferences: true }
    })
    
    if (!user || !user.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check if user wants goal reminders (from notificationPreferences JSON)
    const prefs = user.notificationPreferences as any
    if (prefs?.emailGoalReminders === false) {
      return NextResponse.json({ skipped: true, reason: 'User opted out of goal reminders' })
    }
    
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { Milestone: true }
    })
    
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }
    
    const userName = user.firstName || user.name?.split(' ')[0] || 'Champion'
    const completedMilestones = goal.Milestone?.filter((m: any) => m.completed)?.length || 0
    const totalMilestones = goal.Milestone?.length || 1
    const progress = Math.round((completedMilestones / totalMilestones) * 100)
    
    let daysRemaining: number | undefined
    if (goal.targetDate) {
      const target = new Date(goal.targetDate)
      daysRemaining = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysRemaining < 0) daysRemaining = 0
    }
    
    await sendEmail(
      user.email,
      `🎯 Goal Check-In: ${goal.title}`,
      getGoalReminderHTML(userName, goal.title, progress, daysRemaining)
    )
    
    return NextResponse.json({ success: true, message: 'Goal reminder sent' })
  } catch (error) {
    console.error('Goal reminder error:', error)
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 })
  }
}

// Batch send reminders to all users with active goals
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const testEmail = searchParams.get('test')
  
  if (testEmail) {
    // Send test email
    try {
      await sendEmail(
        testEmail,
        '🎯 Goal Check-In: Master the Third Shot Drop [TEST]',
        getGoalReminderHTML('Test User', 'Master the Third Shot Drop', 65, 14)
      )
      return NextResponse.json({ success: true, message: `Test goal reminder sent to ${testEmail}` })
    } catch (error) {
      return NextResponse.json({ error: 'Failed to send test', details: String(error) }, { status: 500 })
    }
  }
  
  return NextResponse.json({
    endpoint: 'goal-reminder',
    methods: ['POST', 'GET'],
    testUsage: 'GET ?test=email@example.com',
    postBody: '{ userId, goalId }'
  })
}
