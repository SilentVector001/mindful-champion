import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SkillLevel, TournamentFormat, RegistrationStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tournamentId, skillLevel, format, partnerName, partnerEmail, notes } = body;

    // Validate required fields
    if (!tournamentId || !skillLevel || !format) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if tournament exists and has capacity
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // Check capacity
    if (tournament?.maxParticipants && tournament?._count?.registrations >= tournament.maxParticipants) {
      return NextResponse.json(
        { error: 'Tournament is full' },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const existingRegistration = await prisma.tournamentRegistration.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId: session?.user?.id ?? ''
        }
      }
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this tournament' },
        { status: 400 }
      );
    }

    // Create registration
    const registration = await prisma.tournamentRegistration.create({
      data: {
        tournamentId,
        userId: session?.user?.id ?? '',
        skillLevel: skillLevel as SkillLevel,
        format: format as TournamentFormat,
        partnerName: partnerName ?? null,
        partnerEmail: partnerEmail ?? null,
        notes: notes ?? null,
        status: RegistrationStatus.PENDING,
      }
    });

    // Update tournament registration count
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        currentRegistrations: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      registration 
    });

  } catch (error) {
    console.error('Tournament registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register for tournament' },
      { status: 500 }
    );
  }
}
