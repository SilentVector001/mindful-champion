
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Admin endpoint for user warnings
 * GET: Retrieve all warnings for a user
 * POST: Send a warning to a user
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (admin?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { userId } = await params;

    const warnings = await prisma.userWarning.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      warnings
    });

  } catch (error) {
    console.error('Error fetching warnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warnings' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true, email: true }
    });

    if (admin?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { userId } = await params;
    const { 
      reason, 
      warningType, 
      severity, 
      message, 
      quotedContent, 
      conversationId,
      messageId 
    } = await req.json();

    if (!reason || !message) {
      return NextResponse.json({ 
        error: 'Reason and message are required' 
      }, { status: 400 });
    }

    // Get user details for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        email: true, 
        name: true, 
        firstName: true, 
        lastName: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create warning
    const warning = await prisma.userWarning.create({
      data: {
        userId,
        adminId: session.user.id,
        adminName: admin.name || admin.email || 'Admin',
        reason,
        warningType: warningType || 'BEHAVIOR',
        severity: severity || 'LOW',
        message,
        quotedContent,
        conversationId,
        messageId
      }
    });

    // Create admin note for reference
    await prisma.adminNote.create({
      data: {
        userId,
        adminId: session.user.id,
        adminName: admin.name || admin.email || 'Admin',
        note: `Warning issued: ${reason}\nMessage: ${message}${quotedContent ? `\nQuoted: "${quotedContent}"` : ''}`,
        category: 'BEHAVIOR',
        severity: severity || 'LOW'
      }
    });

    // Send email notification
    try {
      const { sendWarningEmail } = await import('@/lib/email');
      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.name || 'Champion';

      const emailResult = await sendWarningEmail({
        to: user.email,
        userName,
        warningType: warningType || 'BEHAVIOR',
        severity: severity || 'LOW',
        message,
        quotedContent,
        reason
      });

      // Update warning with email status
      if (emailResult.success) {
        await prisma.userWarning.update({
          where: { id: warning.id },
          data: {
            emailSent: true,
            emailSentAt: new Date()
          }
        });
      }

      console.log('📧 Email notification sent:', emailResult.success ? 'Success' : 'Failed');
    } catch (emailError) {
      console.error('Error sending warning email:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      warning
    });

  } catch (error) {
    console.error('Error creating warning:', error);
    return NextResponse.json(
      { error: 'Failed to create warning' },
      { status: 500 }
    );
  }
}
