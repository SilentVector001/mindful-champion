import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import {
  getClientIP,
  getUserAgent,
  isIPBlocked,
  trackFailedLogin,
  isAccountLocked,
  resetFailedAttempts,
  logSecurityEvent
} from '@/lib/security';
import { SecurityEventType, SecurityEventSeverity } from '@/lib/prisma-types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Get client info
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);
    
    // Check if IP is blocked
    const ipBlocked = await isIPBlocked(ipAddress);
    if (ipBlocked) {
      return NextResponse.json(
        {
          error: 'Too many failed login attempts. Your IP has been temporarily blocked. Please contact security@mindfulchampion.com or info@mindfulchampion.com to unblock.',
          blocked: true
        },
        { status: 429 }
      );
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!user || !user.password) {
      // Track failed attempt for non-existent user
      await logSecurityEvent({
        eventType: 'LOGIN_FAILURE',
        severity: SecurityEventSeverity.LOW,
        description: `Failed login attempt for non-existent user: ${email}`,
        ipAddress,
        userAgent
      });
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check if account is locked
    const locked = await isAccountLocked(user.id);
    if (locked) {
      return NextResponse.json(
        {
          error: 'Your account is locked. Please contact support at security@mindfulchampion.com or info@mindfulchampion.com',
          locked: true
        },
        { status: 403 }
      );
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // Track failed login
      const { shouldBlock, attemptsRemaining } = await trackFailedLogin(
        email,
        ipAddress,
        userAgent
      );
      
      if (shouldBlock) {
        return NextResponse.json(
          {
            error: `Too many failed login attempts. Your account has been temporarily locked and IP blocked. Please contact security@mindfulchampion.com or info@mindfulchampion.com`,
            blocked: true,
            locked: true
          },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        {
          error: `Invalid email or password. ${attemptsRemaining} attempts remaining before lockout.`,
          attemptsRemaining
        },
        { status: 401 }
      );
    }
    
    // Successful login
    await resetFailedAttempts(user.id);
    
    await logSecurityEvent({
      userId: user.id,
      eventType: 'LOGIN_SUCCESS',
      severity: SecurityEventSeverity.LOW,
      description: 'User logged in successfully',
      ipAddress,
      userAgent
    });
    
    // Return success - the actual session will be created by NextAuth
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || `${user.firstName} ${user.lastName}`,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
