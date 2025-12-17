
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TrialManagement } from '@/lib/media-center/trial-management';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const trialStatus = await TrialManagement.getTrialStatus(session.user.id);

    return NextResponse.json({
      success: true,
      trialStatus
    });

  } catch (error) {
    console.error('Error getting trial status:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get trial status'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { action } = await request.json();

    switch (action) {
      case 'initialize':
        if (!session?.user?.id) {
          return NextResponse.json({
            success: false,
            message: 'Authentication required'
          }, { status: 401 });
        }

        const initialized = await TrialManagement.initializeUserTrial(session.user.id);
        return NextResponse.json({
          success: initialized,
          message: initialized ? 'Trial initialized' : 'Trial could not be initialized'
        });

      case 'check-expired':
        // Admin only
        if (!session?.user || session.user.role !== 'ADMIN') {
          return NextResponse.json({
            success: false,
            message: 'Admin access required'
          }, { status: 403 });
        }

        const expiredCount = await TrialManagement.checkAndExpireTrials();
        return NextResponse.json({
          success: true,
          message: `Processed ${expiredCount} expired trials`,
          expiredCount
        });

      case 'send-reminders':
        // Admin only
        if (!session?.user || session.user.role !== 'ADMIN') {
          return NextResponse.json({
            success: false,
            message: 'Admin access required'
          }, { status: 403 });
        }

        const reminderCount = await TrialManagement.sendTrialReminderEmails();
        return NextResponse.json({
          success: true,
          message: `Sent ${reminderCount} trial reminder emails`,
          reminderCount
        });

      case 'list-trial-users':
        // Admin only
        if (!session?.user || session.user.role !== 'ADMIN') {
          return NextResponse.json({
            success: false,
            message: 'Admin access required'
          }, { status: 403 });
        }

        const trialUsers = await TrialManagement.getTrialUsers();
        return NextResponse.json({
          success: true,
          trialUsers
        });

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in trial management:', error);
    return NextResponse.json({
      success: false,
      message: 'Trial management failed'
    }, { status: 500 });
  }
}
