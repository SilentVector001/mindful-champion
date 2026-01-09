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

    const userName = user.firstName || user.name || 'Champion'

    // Welcome email to user
    const userWelcomeEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Welcome to Mindful Champion!</h1>
          </div>
          <div class="content">
            <h2>Hey ${userName}! 👋</h2>
            <p>Welcome to your personal pickleball coaching platform! We're excited to have you join our community of passionate players.</p>
            
            <h3>✨ Your Free 7-Day Trial Includes:</h3>
            <ul>
              <li>🎯 <strong>AI Video Analysis</strong> - Upload your games and get instant feedback</li>
              <li>🗣️ <strong>Coach Kai</strong> - Your 24/7 AI voice coach ready to answer questions</li>
              <li>📚 <strong>7 Pro Training Programs</strong> - From beginner to tournament-ready</li>
              <li>📊 <strong>Progress Tracking</strong> - Watch your skills improve day by day</li>
            </ul>

            <p style="text-align: center;">
              <a href="https://mindfulchampion.com/dashboard" class="button">Start Training Now →</a>
            </p>

            <h3>🎾 Quick Start Guide:</h3>
            <ol>
              <li>Complete your player profile in Settings</li>
              <li>Choose your first training program</li>
              <li>Chat with Coach Kai about your goals</li>
              <li>Upload your first video for analysis</li>
            </ol>

            <p>Need help? Just reply to this email or chat with Coach Kai anytime!</p>

            <p><strong>Let's make you a champion! 🏆</strong></p>
          </div>
          <div class="footer">
            <p>Mindful Champion - AI-Powered Pickleball Coaching</p>
            <p><a href="https://mindfulchampion.com">mindfulchampion.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    // Notification email to owner
    const ownerNotification = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎉 New User Signup!</h2>
          </div>
          <div class="content">
            <p><strong>User Details:</strong></p>
            <ul>
              <li><strong>Name:</strong> ${user.firstName || user.name} ${user.lastName || ''}</li>
              <li><strong>Email:</strong> ${user.email}</li>
              <li><strong>User ID:</strong> ${user.id}</li>
            </ul>
            <p><a href="https://mindfulchampion.com/admin/users/${user.id}">View in Admin Panel →</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send both emails
    await Promise.all([
      sendEmail(user.email!, 'Welcome to Mindful Champion! 🏆', userWelcomeEmail),
      sendEmail(OWNER_EMAIL, `New Signup: ${user.firstName || user.name}`, ownerNotification)
    ])

    // Mark welcome email as sent
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        welcomeEmailSent: true,
        welcomeEmailSentAt: new Date()
      }
    })

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
