import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/sponsors/[sponsorId]/emails
 * Fetch all emails sent for a sponsor application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sponsorId: string } }
) {
  try {
    // Authenticate admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { sponsorId } = params;

    if (!sponsorId) {
      return NextResponse.json(
        { error: 'Sponsor ID is required' },
        { status: 400 }
      );
    }

    // Fetch sponsor application details
    const sponsorApplication = await prisma.sponsorApplication.findUnique({
      where: { id: sponsorId },
      select: {
        id: true,
        companyName: true,
        email: true,
        contactPerson: true,
        status: true,
        interestedTier: true,
        createdAt: true,
      },
    });

    if (!sponsorApplication) {
      return NextResponse.json(
        { error: 'Sponsor application not found' },
        { status: 404 }
      );
    }

    // Fetch all emails for this sponsor application
    const emails = await prisma.emailNotification.findMany({
      where: {
        sponsorApplicationId: sponsorId,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Also fetch emails sent to this sponsor's email address
    // (in case there were emails before sponsorApplicationId was linked)
    const emailsByRecipient = await prisma.emailNotification.findMany({
      where: {
        recipientEmail: sponsorApplication.email,
        type: {
          in: [
            'SPONSOR_APPLICATION',
            'SPONSOR_APPROVAL',
            'SPONSOR_REJECTION',
            'SPONSOR_ADMIN_NOTIFICATION',
            'SPONSOR_OFFER_CREATED',
            'SPONSOR_OFFER_APPROVED',
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Merge and deduplicate emails
    const allEmails = [...emails];
    const emailIds = new Set(emails.map((e) => e.id));
    
    for (const email of emailsByRecipient) {
      if (!emailIds.has(email.id)) {
        allEmails.push(email);
        emailIds.add(email.id);
      }
    }

    // Sort by creation date (newest first)
    allEmails.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Calculate statistics
    const stats = {
      total: allEmails.length,
      sent: allEmails.filter((e) => e.status === 'SENT').length,
      failed: allEmails.filter((e) => e.status === 'FAILED').length,
      delivered: allEmails.filter((e) => e.status === 'DELIVERED').length,
      opened: allEmails.filter((e) => e.status === 'OPENED').length,
      clicked: allEmails.filter((e) => e.status === 'CLICKED').length,
    };

    return NextResponse.json({
      sponsor: sponsorApplication,
      emails: allEmails,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching sponsor emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sponsor emails', details: error.message },
      { status: 500 }
    );
  }
}
