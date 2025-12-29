import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createPasswordResetToken, getClientIP } from '@/lib/security';
import { sendEmail } from '@/lib/email';

// Rate limiting: track requests per email
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_15_MIN = 3;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(email: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now();
  const record = rateLimitMap.get(email);
  
  if (!record || now > record.resetTime) {
    // Create new record
    rateLimitMap.set(email, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remainingAttempts: MAX_REQUESTS_PER_15_MIN - 1 };
  }
  
  if (record.count >= MAX_REQUESTS_PER_15_MIN) {
    return { allowed: false, remainingAttempts: 0 };
  }
  
  record.count++;
  return { allowed: true, remainingAttempts: MAX_REQUESTS_PER_15_MIN - record.count };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Check rate limit
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many password reset requests. Please try again in 15 minutes.',
          remainingAttempts: 0
        },
        { status: 429 }
      );
    }
    
    // Get client IP
    const ipAddress = getClientIP(request);
    
    // Find user - always return success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (user) {
      // Generate reset token
      const token = await createPasswordResetToken(user.id, ipAddress);
      
      // Create reset URL
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
      
      // Send email
      const emailSent = await sendEmail({
        to: email,
        subject: 'Reset Your Mindful Champion Password',
        text: `Reset your Mindful Champion password by visiting: ${resetUrl}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 10px;
                padding: 40px;
                text-align: center;
              }
              .content {
                background: white;
                border-radius: 8px;
                padding: 30px;
                margin-top: 20px;
              }
              h1 {
                color: white;
                margin: 0;
                font-size: 28px;
              }
              .button {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
              }
              .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                text-align: left;
              }
              .footer {
                color: white;
                margin-top: 20px;
                font-size: 14px;
              }
              .security-note {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 5px;
                padding: 15px;
                margin-top: 20px;
                font-size: 14px;
                text-align: left;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔐 Password Reset Request</h1>
              
              <div class="content">
                <p style="font-size: 16px;">Hello,</p>
                
                <p>We received a request to reset your password for your Mindful Champion account.</p>
                
                <p>Click the button below to reset your password:</p>
                
                <a href="${resetUrl}" class="button">Reset My Password</a>
                
                <div class="warning">
                  <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
                </div>
                
                <div class="security-note">
                  <p style="margin: 0 0 10px 0;"><strong>Security Information:</strong></p>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li>Request received from IP: ${ipAddress}</li>
                    <li>Link expires: ${new Date(Date.now() + 60 * 60 * 1000).toLocaleString()}</li>
                    <li>If you didn't request this, please ignore this email</li>
                  </ul>
                </div>
                
                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                  If the button doesn't work, copy and paste this link into your browser:<br/>
                  <span style="word-break: break-all; color: #667eea;">${resetUrl}</span>
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
                
                <p style="font-size: 14px; color: #666;">
                  <strong>Didn't request this?</strong><br/>
                  If you didn't request a password reset, you can safely ignore this email. 
                  Your password will remain unchanged.
                </p>
                
                <p style="font-size: 14px; color: #666;">
                  <strong>Need help?</strong><br/>
                  Contact us at <a href="mailto:info@mindfulchampion.com">info@mindfulchampion.com</a>
                </p>
              </div>
              
              <div class="footer">
                <p>Mindful Champion - Your AI-Powered Pickleball Coach</p>
                <p style="font-size: 12px;">© 2025 Mindful Champion. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      });
      
      if (!emailSent) {
        return NextResponse.json(
          { error: 'Failed to send reset email. Please try again later.' },
          { status: 500 }
        );
      }
    }
    
    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, you will receive password reset instructions.',
      remainingAttempts: rateLimit.remainingAttempts
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
