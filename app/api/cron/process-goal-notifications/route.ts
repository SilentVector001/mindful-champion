import { NextRequest, NextResponse } from "next/server"
import { processGoalDailyCheckIns, checkOverdueGoals } from "@/lib/workers/process-goal-notifications"

/**
 * Cron endpoint to process goal notifications
 * This should be called periodically (e.g., every 10 minutes) by a cron job
 * 
 * Security: Verifies the request using a secret token or Vercel Cron header
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify cron secret or Vercel Cron header
    const authHeader = req.headers.get('authorization')
    const vercelCronHeader = req.headers.get('x-vercel-cron')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-key'

    // Allow requests from Vercel Cron (has x-vercel-cron header)
    // OR requests with valid Bearer token
    const isVercelCron = vercelCronHeader === '1';
    const hasValidAuth = authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !hasValidAuth) {
      console.warn('[CRON] Unauthorized goal notifications request attempt', {
        hasVercelHeader: !!vercelCronHeader,
        hasAuthHeader: !!authHeader,
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[CRON] Starting goal notifications cron job...", {
      source: isVercelCron ? 'Vercel Cron' : 'Manual',
      timestamp: new Date().toISOString(),
    });

    // Process daily check-ins
    const checkInResult = await processGoalDailyCheckIns()

    // Check overdue goals
    const overdueResult = await checkOverdueGoals()

    const executionTime = Date.now() - startTime;

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      executionTime: `${executionTime}ms`,
      checkIns: checkInResult,
      overdueGoals: overdueResult
    }

    console.log("[CRON] Goal notifications cron job completed:", {
      ...response,
      executionTime: `${executionTime}ms`,
    });

    return NextResponse.json(response)
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error("[CRON] Error in goal notifications cron:", {
      error: error instanceof Error ? error.message : String(error),
      executionTime: `${executionTime}ms`,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: String(error),
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(req: NextRequest) {
  return GET(req)
}
