
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSponsorCheckoutSession } from '@/lib/sponsor-stripe';

export async function POST(request: Request) {
  try {
    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
    }

    // Get the sponsor application
    const application = await prisma.sponsorApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Application must be approved before checkout' },
        { status: 400 }
      );
    }

    // Check if a sponsor profile already exists
    const existingProfile = await prisma.sponsorProfile.findFirst({
      where: {
        contactEmail: application.email,
      },
    });

    if (existingProfile?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Sponsor already has an active subscription' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await createSponsorCheckoutSession(
      application.email,
      application.id,
      application.interestedTier as 'bronze' | 'silver' | 'gold' | 'platinum',
      application.companyName
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Sponsor checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
