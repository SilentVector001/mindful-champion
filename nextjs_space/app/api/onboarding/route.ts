
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface OnboardingData {
  ageRange?: string;
  gender?: string;
  location?: string;
  skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO';
  playingFrequency?: string;
  primaryGoals?: string[];
  biggestChallenges?: string[];
  coachingStylePreference?: string;
  preferredDays?: string[];
  preferredTime?: string;
  notificationPreferences?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Onboarding POST - Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      console.error('Onboarding POST - No session or email found');
      return NextResponse.json(
        { error: 'Authentication required. Please log in again.' },
        { status: 401 }
      );
    }

    const body: OnboardingData = await request.json();
    console.log('Onboarding POST - Received data:', {
      hasAgeRange: !!body.ageRange,
      hasGender: !!body.gender,
      hasSkillLevel: !!body.skillLevel,
      primaryGoalsCount: body.primaryGoals?.length || 0,
      challengesCount: body.biggestChallenges?.length || 0,
    });

    // Validate required fields
    if (!body.ageRange || !body.gender || !body.skillLevel) {
      const missing = [];
      if (!body.ageRange) missing.push('age range');
      if (!body.gender) missing.push('gender');
      if (!body.skillLevel) missing.push('skill level');
      
      console.error('Onboarding POST - Missing fields:', missing);
      return NextResponse.json(
        { error: `Please complete all required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ageRange: body.ageRange,
        gender: body.gender,
        location: body.location || null,
        skillLevel: body.skillLevel,
        playingFrequency: body.playingFrequency || null,
        primaryGoals: body.primaryGoals || [],
        biggestChallenges: body.biggestChallenges || [],
        coachingStylePreference: body.coachingStylePreference || null,
        preferredDays: body.preferredDays || [],
        preferredTime: body.preferredTime || null,
        notificationPreferences: body.notificationPreferences || [],
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('Onboarding POST - Success for user:', updatedUser.id);

    // Aggressively clear cache after onboarding completion
    try {
      const { revalidatePath } = await import('next/cache')
      revalidatePath('/', 'layout')
      revalidatePath('/dashboard')
      revalidatePath('/onboarding')
      revalidatePath('/auth/signin')
      revalidatePath('/auth/callback')
    } catch (revalidateError) {
      console.error('Revalidation error (non-fatal):', revalidateError)
    }

    return NextResponse.json(
      {
        message: 'Onboarding completed successfully',
        user: {
          id: updatedUser.id,
          onboardingCompleted: updatedUser.onboardingCompleted,
          skillLevel: updatedUser.skillLevel,
          primaryGoals: updatedUser.primaryGoals,
        },
        // Instruct client to do hard refresh
        shouldHardRedirect: true
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error saving onboarding data:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      { error: `Failed to save onboarding data: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        ageRange: true,
        gender: true,
        location: true,
        skillLevel: true,
        playingFrequency: true,
        primaryGoals: true,
        biggestChallenges: true,
        coachingStylePreference: true,
        preferredDays: true,
        preferredTime: true,
        notificationPreferences: true,
        onboardingCompleted: true,
        onboardingCompletedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding data' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: Partial<OnboardingData> = await request.json();

    // Update user with provided onboarding data
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...body.ageRange && { ageRange: body.ageRange },
        ...body.gender && { gender: body.gender },
        ...body.location && { location: body.location },
        ...body.skillLevel && { skillLevel: body.skillLevel },
        ...body.playingFrequency && { playingFrequency: body.playingFrequency },
        ...body.primaryGoals && { primaryGoals: body.primaryGoals },
        ...body.biggestChallenges && { biggestChallenges: body.biggestChallenges },
        ...body.coachingStylePreference && { coachingStylePreference: body.coachingStylePreference },
        ...body.preferredDays && { preferredDays: body.preferredDays },
        ...body.preferredTime && { preferredTime: body.preferredTime },
        ...body.notificationPreferences && { notificationPreferences: body.notificationPreferences },
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: 'Onboarding data updated successfully',
        user: {
          id: updatedUser.id,
          onboardingCompleted: updatedUser.onboardingCompleted,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating onboarding data:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding data' },
      { status: 500 }
    );
  }
}