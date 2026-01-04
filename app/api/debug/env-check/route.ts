import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admins to see this
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get environment info (mask sensitive parts)
    const databaseUrl = process.env.DATABASE_URL || 'NOT_SET';
    const nextauthSecret = process.env.NEXTAUTH_SECRET || 'NOT_SET';
    const nextauthUrl = process.env.NEXTAUTH_URL || 'NOT_SET';
    
    // Mask sensitive data but show enough to identify which DB
    const maskedDbUrl = databaseUrl !== 'NOT_SET'
      ? databaseUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://USER:***@').substring(0, 100) + '...'
      : 'NOT_SET';
    
    const maskedSecret = nextauthSecret !== 'NOT_SET'
      ? nextauthSecret.substring(0, 8) + '...' + nextauthSecret.substring(nextauthSecret.length - 4)
      : 'NOT_SET';
    
    return NextResponse.json({
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'local',
      vercelUrl: process.env.VERCEL_URL || 'N/A',
      database: {
        url: maskedDbUrl,
        host: databaseUrl.includes('neon.tech') ? 'Neon' : 'Unknown'
      },
      auth: {
        secret: maskedSecret,
        url: nextauthUrl
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check environment',
      message: (error as Error).message 
    }, { status: 500 });
  }
}
