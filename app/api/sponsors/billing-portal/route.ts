
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createSponsorBillingPortalSession } from '@/lib/sponsor-stripe';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { sponsorProfile: true },
    });

    if (!user || user.role !== 'SPONSOR') {
      return NextResponse.json({ error: 'Not a sponsor' }, { status: 403 });
    }

    if (!user.sponsorProfile?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 400 }
      );
    }

    const { returnUrl } = await request.json();

    const portalSession = await createSponsorBillingPortalSession(
      user.sponsorProfile.stripeCustomerId,
      returnUrl
    );

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
