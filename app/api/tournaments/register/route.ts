
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic";
import { prisma } from '@/lib/db'

import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

import { RegistrationStatus, TournamentStatus } from '@prisma/client'


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tournamentId, skillLevel, format, partnerName, partnerEmail, notes } = body

    // Validate required fields
    if (!tournamentId || !skillLevel || !format) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if tournament exists and is open for registration
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    if (tournament.status === TournamentStatus.REGISTRATION_CLOSED) {
      return NextResponse.json(
        { error: 'Registration is closed for this tournament' },
        { status: 400 }
      )
    }

    if (tournament.status === TournamentStatus.COMPLETED || 
        tournament.status === TournamentStatus.CANCELLED) {
      return NextResponse.json(
        { error: 'This tournament is not accepting registrations' },
        { status: 400 }
      )
    }

    // Check if spots are available
    if (tournament.maxParticipants && 
        tournament.currentRegistrations >= tournament.maxParticipants) {
      return NextResponse.json(
        { error: 'Tournament is full' },
        { status: 400 }
      )
    }

    // Check if user is already registered
    const existingRegistration = await prisma.tournamentRegistration.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId: session.user.id
        }
      }
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this tournament' },
        { status: 400 }
      )
    }

    // Create registration
    const registration = await prisma.tournamentRegistration.create({
      data: {
        tournamentId,
        userId: session.user.id,
        skillLevel,
        format,
        partnerName,
        partnerEmail,
        notes,
        status: RegistrationStatus.CONFIRMED
      },
      include: {
        tournament: true
      }
    })

    // Update tournament registration count
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        currentRegistrations: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ 
      message: 'Successfully registered for tournament',
      registration 
    })
  } catch (error) {
    console.error('Error registering for tournament:', error)
    return NextResponse.json(
      { error: 'Failed to register for tournament' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tournamentId = searchParams.get('tournamentId')

    if (!tournamentId) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      )
    }

    // Find registration
    const registration = await prisma.tournamentRegistration.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId: session.user.id
        }
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    // Cancel registration
    await prisma.tournamentRegistration.update({
      where: { id: registration.id },
      data: {
        status: RegistrationStatus.CANCELLED,
        cancelledAt: new Date()
      }
    })

    // Update tournament registration count
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        currentRegistrations: {
          decrement: 1
        }
      }
    })

    return NextResponse.json({ 
      message: 'Registration cancelled successfully' 
    })
  } catch (error) {
    console.error('Error cancelling registration:', error)
    return NextResponse.json(
      { error: 'Failed to cancel registration' },
      { status: 500 }
    )
  }
}
