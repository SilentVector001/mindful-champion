import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify admin authentication here
    // TODO: Add admin authentication check

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        loginCount: true,
        lastActiveDate: true,
        createdAt: true,
        accountLocked: true,
        accountLockedReason: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get security logs related to login activities
    const loginLogs = await prisma.securityLog.findMany({
      where: {
        userId,
        eventType: {
          in: ['SUCCESSFUL_LOGIN', 'FAILED_LOGIN', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED'],
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100, // Last 100 login attempts
    });

    // Get user sessions
    const userSessions = await prisma.userSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: 50, // Last 50 sessions
      select: {
        id: true,
        sessionId: true,
        startTime: true,
        endTime: true,
        duration: true,
        ipAddress: true,
        userAgent: true,
        deviceType: true,
        browser: true,
        os: true,
        isActive: true,
      },
    });

    // Calculate login statistics
    const failedLoginCount = loginLogs.filter(
      (log) => log.eventType === 'FAILED_LOGIN'
    ).length;

    const successfulLoginCount = loginLogs.filter(
      (log) => log.eventType === 'SUCCESSFUL_LOGIN'
    ).length;

    const accountLockCount = loginLogs.filter(
      (log) => log.eventType === 'ACCOUNT_LOCKED'
    ).length;

    // Get unique IP addresses
    const uniqueIPs = new Set(
      userSessions
        .filter((session) => session.ipAddress)
        .map((session) => session.ipAddress)
    );

    // Get unique devices
    const uniqueDevices = new Set(
      userSessions
        .filter((session) => session.deviceType)
        .map((session) => `${session.deviceType}-${session.os}`)
    );

    return NextResponse.json({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        lastActiveDate: user.lastActiveDate?.toISOString() || null,
      },
      statistics: {
        totalLogins: user.loginCount,
        failedLogins: failedLoginCount,
        successfulLogins: successfulLoginCount,
        accountLocks: accountLockCount,
        uniqueIPs: uniqueIPs.size,
        uniqueDevices: uniqueDevices.size,
      },
      loginLogs: loginLogs.map((log) => ({
        ...log,
        timestamp: log.timestamp.toISOString(),
        resolvedAt: log.resolvedAt?.toISOString() || null,
      })),
      sessions: userSessions.map((session) => ({
        ...session,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime?.toISOString() || null,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch login history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch login history' },
      { status: 500 }
    );
  }
}
