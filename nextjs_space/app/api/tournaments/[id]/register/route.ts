// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { TournamentFormat, SkillLevel } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { format, skillLevel, partnerName, partnerEmail, notes } = body

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, skillLevel: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get tournament and check if registration is open
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        registrations: true
      }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Check if registration period is valid
    const now = new Date()
    if (now < tournament.registrationStart) {
      return NextResponse.json(
        { error: 'Registration has not started yet' },
        { status: 400 }
      )
    }

    if (now > tournament.registrationEnd) {
      return NextResponse.json(
        { error: 'Registration has closed' },
        { status: 400 }
      )
    }

    // Check if already registered
    const existingRegistration = tournament.registrations?.find(
      (reg) => reg.userId === user.id
    )

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this tournament' },
        { status: 400 }
      )
    }

    // Check if tournament is full
    if (tournament.maxParticipants && tournament.currentRegistrations >= tournament.maxParticipants) {
      return NextResponse.json(
        { error: 'Tournament is full' },
        { status: 400 }
      )
    }

    // Create registration
    const registration = await prisma.tournamentRegistration.create({
      data: {
        tournamentId: id,
        userId: user.id,
        format: format ?? TournamentFormat.SINGLES,
        skillLevel: skillLevel ?? user.skillLevel,
        partnerName: partnerName ?? null,
        partnerEmail: partnerEmail ?? null,
        notes: notes ?? null,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    })

    // Update tournament registration count
    await prisma.tournament.update({
      where: { id },
      data: {
        currentRegistrations: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      registration,
    })
  } catch (error) {
    console.error('Error registering for tournament:', error)
    return NextResponse.json(
      { error: 'Failed to register', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// Get registration status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const registration = await prisma.tournamentRegistration.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId: id,
          userId: user.id
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            skillLevel: true
          }
        }
      }
    })

    return NextResponse.json({
      registered: !!registration,
      registration: registration ?? null,
    })
  } catch (error) {
    console.error('Error checking registration:', error)
    return NextResponse.json(
      { error: 'Failed to check registration', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// Cancel registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete registration
    await prisma.tournamentRegistration.delete({
      where: {
        tournamentId_userId: {
          tournamentId: id,
          userId: user.id
        }
      }
    })

    // Update tournament registration count
    await prisma.tournament.update({
      where: { id },
      data: {
        currentRegistrations: {
          decrement: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error canceling registration:', error)
    return NextResponse.json(
      { error: 'Failed to cancel registration', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
