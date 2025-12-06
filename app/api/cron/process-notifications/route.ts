/**
 * Cron Job: Process Scheduled Notifications
 * This should be called by a cron service (e.g., Vercel Cron, AWS EventBridge)
 * every 5-15 minutes to process pending notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { processScheduledNotifications } from '@/lib/notifications/notification-service';

/**
 * GET /api/cron/process-notifications
 * Process all pending notifications that are due
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify the request is from a trusted source (cron service)
    const authHeader = request.headers.get('authorization');
    const vercelCronHeader = request.headers.get('x-vercel-cron');
    const cronSecret = process.env.CRON_SECRET;

    // Allow requests from Vercel Cron (has x-vercel-cron header)
    // OR requests with valid Bearer token
    const isVercelCron = vercelCronHeader === '1';
    const hasValidAuth = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !hasValidAuth) {
      console.warn('Unauthorized cron request attempt', {
        hasVercelHeader: !!vercelCronHeader,
        hasAuthHeader: !!authHeader,
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting notification processing...', {
      source: isVercelCron ? 'Vercel Cron' : 'Manual',
      timestamp: new Date().toISOString(),
    });

    const result = await processScheduledNotifications();
    const executionTime = Date.now() - startTime;

    console.log('[CRON] Notification processing completed', {
      executionTime: `${executionTime}ms`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Notifications processed successfully',
      executionTime: `${executionTime}ms`,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('[CRON] Error processing notifications:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: `${executionTime}ms`,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process notifications',
        message: error instanceof Error ? error.message : 'Unknown error',
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
