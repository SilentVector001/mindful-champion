import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SponsorApplicationStatus, SponsorTier } from '@prisma/client';
import { sendSponsorApprovalEmail } from '@/lib/email/sponsor-approval-email';

// Approve/reject application
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId } = await params;
    const data = await req.json();
    const { status, reviewNotes, approvedTier } = data;

    if (!['APPROVED', 'REJECTED', 'UNDER_REVIEW', 'WAITLISTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const application = await prisma.sponsorApplication.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update application
    const updatedApplication = await prisma.sponsorApplication.update({
      where: { id: applicationId },
      data: {
        status: status as SponsorApplicationStatus,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        reviewNotes: reviewNotes
      }
    });

    // If approved, create sponsor profile
    if (status === 'APPROVED') {
      // Find or create user for this sponsor
      let user = await prisma.user.findUnique({
        where: { email: application.email }
      });

      let tempPassword: string | null = null;
      let isNewUser = false;

      if (!user) {
        // Create a new user account for the sponsor
        tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        user = await prisma.user.create({
          data: {
            email: application.email,
            password: hashedPassword,
            name: application.contactPerson,
            firstName: application.contactPerson.split(' ')[0],
            lastName: application.contactPerson.split(' ').slice(1).join(' '),
            role: 'USER',
            onboardingCompleted: true,
          }
        });
        isNewUser = true;
      }

      // Determine tier benefits
      const tier = (approvedTier as SponsorTier) || 'BRONZE';
      const tierBenefits = {
        BRONZE: { maxActiveOffers: 3, canFeatureOffers: false, priorityPlacement: false, analyticsAccess: false, customBranding: false },
        SILVER: { maxActiveOffers: 10, canFeatureOffers: true, priorityPlacement: false, analyticsAccess: true, customBranding: false },
        GOLD: { maxActiveOffers: 25, canFeatureOffers: true, priorityPlacement: true, analyticsAccess: true, customBranding: true },
        PLATINUM: { maxActiveOffers: 100, canFeatureOffers: true, priorityPlacement: true, analyticsAccess: true, customBranding: true }
      };

      // Check if sponsor profile already exists
      const existingProfile = await prisma.sponsorProfile.findUnique({
        where: { userId: user.id }
      });

      if (!existingProfile) {
        await prisma.sponsorProfile.create({
          data: {
            userId: user.id,
            companyName: application.companyName,
            website: application.website,
            description: application.description,
            industry: application.industry,
            contactPerson: application.contactPerson,
            contactEmail: application.email,
            contactPhone: application.phone,
            partnershipTier: tier,
            isApproved: true,
            approvedAt: new Date(),
            approvedBy: session.user.id,
            ...tierBenefits[tier]
          }
        });
      }

      // Send approval email with login credentials
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mindful-champion-2hzb4j.abacusai.app';
      const portalUrl = `${appUrl}/sponsors/portal`;

      if (isNewUser && tempPassword) {
        // Send email with credentials for new users
        try {
          await sendSponsorApprovalEmail({
            companyName: application.companyName,
            contactPerson: application.contactPerson,
            email: application.email,
            approvedTier: tier,
            loginEmail: user.email,
            temporaryPassword: tempPassword,
            portalUrl,
            isNewUser: true
          });
          console.log(`✅ Approval email with credentials sent to ${application.email} for ${application.companyName}`);
        } catch (emailError: any) {
          console.error(`❌ Failed to send approval email to ${application.email}:`, emailError);
          // Continue with approval even if email fails
        }
      } else {
        // User already exists, send approval notification without password
        try {
          await sendSponsorApprovalEmail({
            companyName: application.companyName,
            contactPerson: application.contactPerson,
            email: application.email,
            approvedTier: tier,
            loginEmail: user.email,
            temporaryPassword: '', // No password for existing users
            portalUrl,
            isNewUser: false
          });
          console.log(`✅ Approval notification sent to ${application.email} (existing user) for ${application.companyName}`);
        } catch (emailError: any) {
          console.error(`❌ Failed to send approval notification to ${application.email}:`, emailError);
          // Continue with approval even if email fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: `Application ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

// Delete application
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId } = await params;
    await prisma.sponsorApplication.delete({
      where: { id: applicationId }
    });

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
