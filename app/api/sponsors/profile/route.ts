import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Get sponsor profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use raw query to avoid Prisma schema/database mismatch
    const sponsorProfile = await prisma.$queryRaw`
      SELECT * FROM "SponsorProfile" WHERE "userId" = ${session.user.id}
    `;
    
    const profile = Array.isArray(sponsorProfile) && sponsorProfile.length > 0 ? sponsorProfile[0] : null;

    return NextResponse.json({ sponsorProfile: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// Update sponsor profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const updatedProfile = await prisma.sponsorProfile.update({
      where: { userId: session.user.id },
      data: {
        companyName: data.companyName,
        website: data.website,
        logo: data.logo,
        description: data.description,
        industry: data.industry,
        contactPerson: data.contactPerson,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        lastLoginAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
