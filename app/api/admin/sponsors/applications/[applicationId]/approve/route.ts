
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { createSponsorCheckoutSession } from '@/lib/sponsor-stripe';
import { sendSponsorApprovalEmail } from '@/lib/email/sponsor-approval-email';
import bcrypt from 'bcryptjs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId: id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const application = await prisma.sponsorApplication.findUnique({
      where: { id: id },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'Application already approved' },
        { status: 400 }
      );
    }

    // Update application status to approved (pending payment)
    await prisma.sponsorApplication.update({
      where: { id: id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: adminUser.id,
      },
    });

    // Create Stripe checkout session
    let checkoutUrl = '';
    if (application.interestedTier !== 'platinum') {
      try {
        const checkoutSession = await createSponsorCheckoutSession(
          application.email,
          application.id,
          application.interestedTier as 'bronze' | 'silver' | 'gold',
          application.companyName
        );
        checkoutUrl = checkoutSession.url || '';
      } catch (stripeError) {
        console.error('Stripe checkout creation failed:', stripeError);
        // Continue anyway - we'll send the checkout link via email
      }
    }

    // Check if user account exists for this email
    let existingUser = await prisma.user.findUnique({
      where: { email: application.email },
    });

    let isNewUser = false;
    let temporaryPassword = '';
    let loginEmail = application.email;

    // If user doesn't exist, create one with SPONSOR role
    if (!existingUser) {
      isNewUser = true;
      temporaryPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase();
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      existingUser = await prisma.user.create({
        data: {
          email: application.email,
          name: application.contactPerson,
          password: hashedPassword,
          role: 'SPONSOR',
          emailVerified: new Date(), // Auto-verify sponsor accounts
        },
      });

      console.log(`✅ Created new SPONSOR user for ${application.email}`);
    } else {
      // If user exists, update their role to SPONSOR if they aren't already
      if (existingUser.role !== 'SPONSOR' && existingUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: 'SPONSOR',
          },
        });
        console.log(`✅ Updated existing user ${application.email} to SPONSOR role`);
      }
    }

    // Send approval email with next steps using Resend
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindful-champion-2hzb4j.abacusai.app';
    const portalUrl = `${appUrl}/sponsors/portal`;

    try {
      await sendSponsorApprovalEmail({
        companyName: application.companyName,
        contactPerson: application.contactPerson,
        email: application.email,
        approvedTier: application.interestedTier.toUpperCase(),
        loginEmail,
        temporaryPassword: isNewUser ? temporaryPassword : '',
        portalUrl,
        isNewUser,
        userId: existingUser.id, // Log to database
      });

      console.log(`✅ Sponsor approval email sent successfully to ${application.email}`);
    } catch (emailError) {
      console.error('❌ Error sending sponsor approval email:', emailError);
      // Continue anyway - don't block the approval process due to email failure
    }

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      checkoutUrl: application.interestedTier !== 'platinum' ? checkoutUrl : null,
      tier: application.interestedTier,
    });
  } catch (error) {
    console.error('Failed to approve application:', error);
    return NextResponse.json(
      { error: 'Failed to approve application' },
      { status: 500 }
    );
  }
}
