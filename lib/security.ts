import { prisma } from './db';
// import { SecurityEventType, SecurityEventSeverity } from '@prisma/client';

// Temporary type definitions
const SecurityEventType = {
  IP_BLOCKED: 'IP_BLOCKED',
  IP_UNBLOCKED: 'IP_UNBLOCKED',
  FAILED_LOGIN: 'FAILED_LOGIN',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  SUCCESSFUL_LOGIN: 'SUCCESSFUL_LOGIN',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE: 'PASSWORD_RESET_COMPLETE',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
} as const;

const SecurityEventSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

// Security constants
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 15;
export const IP_BLOCK_DURATION_MINUTES = 60;

/**
 * Get the client IP address from the request
 */
export function getClientIP(request: Request): string {
  // Try x-forwarded-for header first (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  // Try x-real-ip header
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback to connection info (may not be accurate behind proxies)
  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'Unknown';
}

/**
 * Check if an IP address is currently blocked
 */
export async function isIPBlocked(ipAddress: string): Promise<boolean> {
  const blockedIP = await prisma.blockedIP.findFirst({
    where: {
      ipAddress,
      unblocked: false,
      OR: [
        { expiresAt: null }, // Never expires
        { expiresAt: { gt: new Date() } } // Not yet expired
      ]
    }
  });
  
  return !!blockedIP;
}

/**
 * Block an IP address
 */
export async function blockIP(
  ipAddress: string,
  reason: string,
  failedAttempts: number,
  durationMinutes: number = IP_BLOCK_DURATION_MINUTES,
  blockedBy?: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
  
  // Check if already blocked
  const existing = await prisma.blockedIP.findFirst({
    where: { ipAddress, unblocked: false }
  });
  
  if (existing) {
    // Update existing block
    await prisma.blockedIP.update({
      where: { id: existing.id },
      data: {
        failedAttempts,
        expiresAt,
        reason,
        blockedAt: new Date()
      }
    });
  } else {
    // Create new block
    await prisma.blockedIP.create({
      data: {
        ipAddress,
        reason,
        failedAttempts,
        expiresAt,
        blockedBy
      }
    });
  }
  
  // Log the IP block event
  await logSecurityEvent({
    eventType: SecurityEventType.IP_BLOCKED,
    severity: SecurityEventSeverity.HIGH,
    description: `IP ${ipAddress} blocked: ${reason}`,
    ipAddress,
    metadata: { failedAttempts, durationMinutes }
  });
}

/**
 * Unblock an IP address
 */
export async function unblockIP(ipAddress: string, unblockedBy: string): Promise<void> {
  const blocked = await prisma.blockedIP.findFirst({
    where: { ipAddress, unblocked: false }
  });
  
  if (blocked) {
    await prisma.blockedIP.update({
      where: { id: blocked.id },
      data: {
        unblocked: true,
        unblockedAt: new Date(),
        unblockedBy
      }
    });
    
    // Log the unblock event
    await logSecurityEvent({
      eventType: SecurityEventType.IP_UNBLOCKED,
      severity: SecurityEventSeverity.MEDIUM,
      description: `IP ${ipAddress} unblocked by admin`,
      ipAddress,
      metadata: { unblockedBy }
    });
  }
}

/**
 * Track a failed login attempt
 */
export async function trackFailedLogin(
  email: string,
  ipAddress: string,
  userAgent: string
): Promise<{ shouldBlock: boolean; attemptsRemaining: number }> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, failedLoginAttempts: true }
  });
  
  if (!user) {
    // Log suspicious activity for non-existent user
    await logSecurityEvent({
      eventType: SecurityEventType.FAILED_LOGIN,
      severity: SecurityEventSeverity.LOW,
      description: `Failed login attempt for non-existent user: ${email}`,
      ipAddress,
      userAgent
    });
    return { shouldBlock: false, attemptsRemaining: MAX_FAILED_ATTEMPTS };
  }
  
  // Increment failed attempts
  const newAttempts = user.failedLoginAttempts + 1;
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: newAttempts }
  });
  
  // Log the failed attempt
  await logSecurityEvent({
    userId: user.id,
    eventType: SecurityEventType.FAILED_LOGIN,
    severity: newAttempts >= MAX_FAILED_ATTEMPTS ? SecurityEventSeverity.HIGH : SecurityEventSeverity.MEDIUM,
    description: `Failed login attempt #${newAttempts} for ${email}`,
    ipAddress,
    userAgent
  });
  
  // Check if we should block
  const shouldBlock = newAttempts >= MAX_FAILED_ATTEMPTS;
  
  if (shouldBlock) {
    // Block the IP
    await blockIP(
      ipAddress,
      `Too many failed login attempts (${newAttempts})`,
      newAttempts
    );
    
    // Lock the user account temporarily
    const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        accountLockedUntil: lockUntil
      }
    });
    
    // Log account lock
    await logSecurityEvent({
      userId: user.id,
      eventType: SecurityEventType.ACCOUNT_LOCKED,
      severity: SecurityEventSeverity.HIGH,
      description: `Account locked due to ${newAttempts} failed login attempts`,
      ipAddress,
      userAgent,
      metadata: { lockUntil }
    });
  }
  
  return {
    shouldBlock,
    attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - newAttempts)
  };
}

/**
 * Reset failed login attempts on successful login
 */
export async function resetFailedAttempts(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      loginCount: { increment: 1 }
    }
  });
}

/**
 * Check if a user account is locked
 */
export async function isAccountLocked(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      accountLocked: true,
      accountLockedUntil: true
    }
  });
  
  if (!user) return false;
  
  // Check permanent lock
  if (user.accountLocked) return true;
  
  // Check temporary lock
  if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
    return true;
  }
  
  // If temporary lock expired, clear it
  if (user.accountLockedUntil && user.accountLockedUntil <= new Date()) {
    await prisma.user.update({
      where: { id: userId },
      data: { accountLockedUntil: null }
    });
    return false;
  }
  
  return false;
}

/**
 * Log a security event
 */
export async function logSecurityEvent(data: {
  userId?: string;
  eventType: typeof SecurityEventType[keyof typeof SecurityEventType];
  severity: typeof SecurityEventSeverity[keyof typeof SecurityEventSeverity];
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}): Promise<void> {
  await prisma.securityLog.create({
    data: {
      userId: data.userId,
      eventType: data.eventType,
      severity: data.severity,
      description: data.description,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: data.metadata || {}
    }
  });
}

/**
 * Lock a user account (admin action)
 */
export async function lockUserAccount(
  userId: string,
  reason: string,
  lockedBy: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      accountLocked: true,
      accountLockedReason: reason
    }
  });
  
  await logSecurityEvent({
    userId,
    eventType: SecurityEventType.ACCOUNT_LOCKED,
    severity: SecurityEventSeverity.HIGH,
    description: `Account manually locked by admin: ${reason}`,
    metadata: { lockedBy, reason }
  });
}

/**
 * Unlock a user account (admin action)
 */
export async function unlockUserAccount(
  userId: string,
  unlockedBy: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      accountLocked: false,
      accountLockedReason: null,
      accountLockedUntil: null,
      failedLoginAttempts: 0
    }
  });
  
  await logSecurityEvent({
    userId,
    eventType: SecurityEventType.ACCOUNT_UNLOCKED,
    severity: SecurityEventSeverity.MEDIUM,
    description: `Account unlocked by admin`,
    metadata: { unlockedBy }
  });
}

/**
 * Create a password reset token
 */
export async function createPasswordResetToken(
  userId: string,
  ipAddress: string
): Promise<string> {
  // Generate a secure random token
  const token = Array.from({ length: 32 }, () =>
    Math.random().toString(36).charAt(2)
  ).join('');
  
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  // Store the reset token
  await prisma.passwordResetLog.create({
    data: {
      userId,
      ipAddress,
      token,
      expiresAt
    }
  });
  
  // Also use VerificationToken for compatibility
  await prisma.verificationToken.create({
    data: {
      identifier: userId,
      token,
      expires: expiresAt
    }
  });
  
  await logSecurityEvent({
    userId,
    eventType: SecurityEventType.PASSWORD_RESET_REQUEST,
    severity: SecurityEventSeverity.MEDIUM,
    description: 'Password reset requested',
    ipAddress
  });
  
  return token;
}

/**
 * Verify and consume a password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const resetLog = await prisma.passwordResetLog.findFirst({
    where: {
      token,
      successful: null, // Not yet used
      expiresAt: { gt: new Date() }
    }
  });
  
  if (!resetLog) return null;
  
  return resetLog.userId;
}

/**
 * Complete password reset
 */
export async function completePasswordReset(
  token: string,
  newPasswordHash: string
): Promise<boolean> {
  const userId = await verifyPasswordResetToken(token);
  
  if (!userId) return false;
  
  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: newPasswordHash,
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0, // Reset failed attempts
      accountLockedUntil: null // Unlock if locked
    }
  });
  
  // Mark reset as successful
  await prisma.passwordResetLog.updateMany({
    where: { token },
    data: {
      successful: true,
      completedAt: new Date()
    }
  });
  
  // Delete the verification token
  await prisma.verificationToken.deleteMany({
    where: { token }
  });
  
  await logSecurityEvent({
    userId,
    eventType: SecurityEventType.PASSWORD_RESET_COMPLETE,
    severity: SecurityEventSeverity.MEDIUM,
    description: 'Password reset completed successfully'
  });
  
  return true;
}
