import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success (security best practice - don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, you will receive a password reset link.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    // Send email with reset link
    const resetUrl = `${process.env.NEXTAUTH_URL || 'https://mindful-champion-mwai4b.abacusai.app'}/auth/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER || 'welcomefrommc@mindfulchampion.com',
      to: email,
      subject: 'Reset Your Mindful Champion Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #06B6D4, #0891B2); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #06B6D4; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎯 Password Reset</h1>
            </div>
            <div class="content">
              <p>Hi ${user.name || 'there'},</p>
              <p>We received a request to reset your password for your Mindful Champion account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="color: #6b7280; font-size: 12px; word-break: break-all;">${resetUrl}</p>
              <p style="margin-top: 30px;"><strong>This link will expire in 1 hour.</strong></p>
              <p style="color: #6b7280;">If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>Mindful Champion - Your AI-Powered Pickleball Coach</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
