import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Admin endpoint to manually trigger cron jobs
 * Requires admin authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { job } = await req.json();

    if (!job || !['notifications', 'goals', 'all'].includes(job)) {
      return NextResponse.json(
        { error: 'Invalid job type. Must be: notifications, goals, or all' },
        { status: 400 }
      );
    }

    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const results: any[] = [];

    // Determine which jobs to run
    const jobsToRun = job === 'all' 
      ? ['process-notifications', 'process-goal-notifications']
      : job === 'notifications'
        ? ['process-notifications']
        : ['process-goal-notifications'];

    console.log(`[ADMIN] Manually triggering cron jobs: ${jobsToRun.join(', ')}`);
    console.log(`[ADMIN] Triggered by: ${session.user.email}`);

    // Execute each job
    for (const cronJob of jobsToRun) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(`${baseUrl}/api/cron/${cronJob}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${cronSecret}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        const executionTime = Date.now() - startTime;

        results.push({
          job: cronJob,
          success: response.ok,
          status: response.status,
          executionTime: `${executionTime}ms`,
          response: data,
        });

        console.log(`[ADMIN] ${cronJob}: ${response.ok ? 'SUCCESS' : 'FAILED'} (${executionTime}ms)`);
      } catch (error) {
        const executionTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        results.push({
          job: cronJob,
          success: false,
          status: 0,
          executionTime: `${executionTime}ms`,
          error: errorMessage,
        });

        console.error(`[ADMIN] ${cronJob}: ERROR - ${errorMessage}`);
      }
    }

    const allSuccessful = results.every(r => r.success);

    return NextResponse.json({
      success: allSuccessful,
      message: `Triggered ${jobsToRun.length} cron job(s)`,
      triggeredBy: session.user.email,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('[ADMIN] Error triggering cron jobs:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger cron jobs',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve cron job status/history
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      cronJobs: [
        {
          name: 'process-notifications',
          schedule: '*/10 * * * *',
          description: 'Process scheduled notifications',
          endpoint: '/api/cron/process-notifications',
        },
        {
          name: 'process-goal-notifications',
          schedule: '*/10 * * * *',
          description: 'Process goal notifications and check-ins',
          endpoint: '/api/cron/process-goal-notifications',
        },
      ],
      cronSecretConfigured: !!process.env.CRON_SECRET,
      vercelCronEnabled: !!process.env.VERCEL,
    });
  } catch (error) {
    console.error('[ADMIN] Error retrieving cron status:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve cron status',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
