import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const OWNER_EMAIL = 'deansnow59@gmail.com'

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const response = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        subject: subject,
        body: html,
        is_html: true,
        recipient_email: to,
        sender_email: 'noreply@mindfulchampion.com',
        sender_alias: 'Mindful Champion'
      })
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'Failed to send email')
    }

    return result
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}

// Brand-compliant welcome email template
function getWelcomeEmailHTML(userName: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.7; color: #1e293b; margin: 0; padding: 0; background: #0f172a; }
    .wrapper { max-width: 640px; margin: 0 auto; background: #0f172a; padding: 20px; }
    .container { background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #f59e0b 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 32px; font-weight: 800; margin: 0 0 8px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .header p { color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; }
    .content { padding: 40px 30px; color: #e2e8f0; }
    .greeting { font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 16px; }
    .text { color: #cbd5e1; font-size: 16px; margin-bottom: 20px; }
    .feature-grid { display: grid; gap: 16px; margin: 30px 0; }
    .feature-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; }
    .feature-icon { font-size: 28px; margin-bottom: 10px; }
    .feature-title { color: #ffffff; font-weight: 700; font-size: 16px; margin-bottom: 6px; }
    .feature-desc { color: #94a3b8; font-size: 14px; }
    .cta-section { text-align: center; margin: 35px 0; }
    .cta-button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 24px rgba(6,182,212,0.3); }
    .steps-section { background: rgba(6,182,212,0.1); border-radius: 16px; padding: 24px; margin: 30px 0; border: 1px solid rgba(6,182,212,0.2); }
    .steps-title { color: #06b6d4; font-weight: 700; font-size: 18px; margin-bottom: 16px; }
    .step { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .step-number { background: linear-gradient(135deg, #06b6d4, #10b981); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
    .step-text { color: #e2e8f0; font-size: 15px; padding-top: 3px; }
    .badge { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    .footer { text-align: center; padding: 30px; border-top: 1px solid rgba(255,255,255,0.1); }
    .footer-logo { font-size: 20px; font-weight: 800; background: linear-gradient(135deg, #06b6d4, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 12px; }
    .footer-text { color: #64748b; font-size: 14px; margin: 8px 0; }
    .footer-link { color: #06b6d4; text-decoration: none; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent); margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>🏆 Welcome to Mindful Champion!</h1>
        <p>Your AI-Powered Pickleball Journey Starts Now</p>
      </div>
      
      <div class="content">
        <div class="badge">✨ 7-DAY FREE TRIAL ACTIVATED</div>
        <p class="greeting">Hey ${userName}! 👋</p>
        <p class="text">You've just unlocked the most advanced pickleball coaching platform powered by AI. Whether you're just starting out or grinding for your next tournament, we've got everything you need to level up your game.</p>
        
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">🎥</div>
            <div class="feature-title">AI Video Analysis</div>
            <div class="feature-desc">Upload your game footage and get instant AI-powered feedback on your technique, positioning, and strategy.</div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎙️</div>
            <div class="feature-title">Coach Kai - Your Voice AI Coach</div>
            <div class="feature-desc">Chat or talk with Coach Kai anytime. Get personalized tips, drill suggestions, and answers to all your pickleball questions.</div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <div class="feature-title">7 Pro Training Programs</div>
            <div class="feature-desc">Structured programs from Beginner Basics to Elite Performance - each with daily drills, video tutorials, and progress tracking.</div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🏟️</div>
            <div class="feature-title">Tournament Hub</div>
            <div class="feature-desc">Discover upcoming PPA and APP tournaments across the nation. Track events in your state and plan your competitive journey.</div>
          </div>
        </div>

        <div class="cta-section">
          <a href="https://mindfulchampion.com/dashboard" class="cta-button">Start Training Now →</a>
        </div>

        <div class="divider"></div>

        <div class="steps-section">
          <div class="steps-title">🚀 Quick Start Guide</div>
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-text">Complete your player profile in Settings</div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-text">Explore the Training Hub and pick your first program</div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-text">Chat with Coach Kai about your goals</div>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-text">Upload your first video for AI analysis</div>
          </div>
        </div>

        <p class="text" style="margin-top: 30px;">Need help getting started? Just reply to this email or chat with Coach Kai anytime - he's available 24/7!</p>
        
        <p class="text"><strong style="color: #10b981;">Let's make you a champion! 🏆🥇</strong></p>
      </div>
      
      <div class="footer">
        <div class="footer-logo">MINDFUL CHAMPION</div>
        <p class="footer-text">AI-Powered Pickleball Coaching</p>
        <p class="footer-text"><a href="https://mindfulchampion.com" class="footer-link">mindfulchampion.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`
}

// Owner notification email
function getOwnerNotificationHTML(user: any) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background: #f1f5f9; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%); color: white; padding: 24px; }
    .header h2 { margin: 0; font-size: 22px; }
    .content { padding: 30px; }
    .user-card { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
    .user-info { margin: 8px 0; }
    .label { color: #64748b; font-size: 13px; }
    .value { color: #1e293b; font-weight: 600; font-size: 15px; }
    .btn { display: inline-block; padding: 12px 24px; background: #06b6d4; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🎉 New Champion Signed Up!</h2>
    </div>
    <div class="content">
      <div class="user-card">
        <div class="user-info">
          <div class="label">Name</div>
          <div class="value">${user.firstName || user.name || 'Not provided'} ${user.lastName || ''}</div>
        </div>
        <div class="user-info">
          <div class="label">Email</div>
          <div class="value">${user.email}</div>
        </div>
        <div class="user-info">
          <div class="label">User ID</div>
          <div class="value">${user.id}</div>
        </div>
        <div class="user-info">
          <div class="label">Signed Up</div>
          <div class="value">${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</div>
        </div>
      </div>
      <a href="https://mindfulchampion.com/admin/users/${user.id}" class="btn">View in Admin Panel →</a>
    </div>
  </div>
</body>
</html>
`
}

export async function POST(request: Request) {
  try {
    const { userId, userEmail } = await request.json()

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: userEmail },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        welcomeEmailSent: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userName = user.firstName || user.name?.split(' ')[0] || 'Champion'

    // Send both emails
    await Promise.all([
      sendEmail(user.email!, 'Welcome to Mindful Champion! 🏆 Your AI Coaching Journey Starts Now', getWelcomeEmailHTML(userName)),
      sendEmail(OWNER_EMAIL, `🎉 New Signup: ${user.firstName || user.name}`, getOwnerNotificationHTML(user))
    ])

    // Mark welcome email as sent and log it
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        welcomeEmailSent: true,
        welcomeEmailSentAt: new Date()
      }
    })

    // Log welcome email sent
    console.log(`[EMAIL] Welcome email sent to ${user.email} at ${new Date().toISOString()}`)

    return NextResponse.json({ 
      success: true, 
      message: `Welcome email sent to ${user.email}`,
      user: {
        email: user.email,
        name: userName
      }
    })
  } catch (error) {
    console.error('Send welcome email error:', error)
    return NextResponse.json(
      { error: 'Failed to send welcome email', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// GET to test email or check status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const testEmail = searchParams.get('test')
  
  if (testEmail) {
    // Send test email
    try {
      await sendEmail(
        testEmail, 
        'Welcome to Mindful Champion! 🏆 Your AI Coaching Journey Starts Now [TEST]', 
        getWelcomeEmailHTML('Test User')
      )
      return NextResponse.json({ success: true, message: `Test email sent to ${testEmail}` })
    } catch (error) {
      return NextResponse.json({ error: 'Failed to send test email', details: String(error) }, { status: 500 })
    }
  }
  
  return NextResponse.json({ 
    endpoint: 'send-welcome-emails',
    methods: ['POST', 'GET'],
    testUsage: 'GET ?test=email@example.com'
  })
}
