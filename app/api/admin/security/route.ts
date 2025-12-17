export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'blocked-ips';
    
    if (type === 'blocked-ips') {
      // Get all blocked IPs
      const blockedIPs = await prisma.blockedIP.findMany({
        where: { unblocked: false },
        orderBy: { blockedAt: 'desc' },
        take: 100
      });
      
      return NextResponse.json({ blockedIPs });
    }
    
    if (type === 'security-logs') {
      const limit = parseInt(searchParams.get('limit') || '50');
      const eventType = searchParams.get('eventType');
      const severity = searchParams.get('severity');
      
      const where: any = {};
      if (eventType) where.eventType = eventType;
      if (severity) where.severity = severity;
      
      const logs = await prisma.securityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: limit
      });
      
      return NextResponse.json({ logs });
    }
    
    if (type === 'stats') {
      // Get security statistics
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const [
        totalBlockedIPs,
        activeBlockedIPs,
        totalSecurityEvents,
        recentFailedLogins,
        lockedAccounts,
        recentPasswordResets
      ] = await Promise.all([
        prisma.blockedIP.count(),
        prisma.blockedIP.count({ where: { unblocked: false } }),
        prisma.securityLog.count(),
        prisma.securityLog.count({
          where: {
            eventType: 'FAILED_LOGIN',
            timestamp: { gte: last24Hours }
          }
        }),
        prisma.user.count({
          where: {
            OR: [
              { accountLocked: true },
              { accountLockedUntil: { gt: now } }
            ]
          }
        }),
        prisma.passwordResetLog.count({
          where: {
            requestedAt: { gte: last7Days }
          }
        })
      ]);
      
      return NextResponse.json({
        stats: {
          totalBlockedIPs,
          activeBlockedIPs,
          totalSecurityEvents,
          recentFailedLogins,
          lockedAccounts,
          recentPasswordResets
        }
      });
    }
    
    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    
  } catch (error) {
    console.error('Admin security GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security data' },
      { status: 500 }
    );
  }
}
