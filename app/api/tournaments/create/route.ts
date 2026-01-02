import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { BracketFormat, TournamentFormat, SkillLevel } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      venueName,
      address,
      city,
      state,
      zipCode,
      startDate,
      endDate,
      registrationStart,
      registrationEnd,
      format,
      skillLevels,
      bracketFormat,
      maxParticipants,
      entryFee,
      prizePool,
      websiteUrl,
    } = body

    // Validation
    if (!name || !venueName || !address || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get organizer info from user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create tournament
    const tournament = await prisma.tournament.create({
      data: {
        name,
        description: description ?? '',
        organizerName: user.name ?? 'Anonymous',
        organizerEmail: user.email,
        venueName,
        address,
        city,
        state,
        zipCode,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationStart: new Date(registrationStart),
        registrationEnd: new Date(registrationEnd),
        format: format ?? [TournamentFormat.SINGLES],
        skillLevels: skillLevels ?? [SkillLevel.INTERMEDIATE],
        bracketFormat: bracketFormat ?? BracketFormat.SINGLE_ELIMINATION,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : 32,
        entryFee: entryFee ? parseFloat(entryFee) : 0,
        prizePool: prizePool ? parseFloat(prizePool) : 0,
        websiteUrl: websiteUrl ?? null,
        status: 'REGISTRATION_OPEN',
      },
    })

    return NextResponse.json({
      success: true,
      tournament,
    })
  } catch (error) {
    console.error('Error creating tournament:', error)
    return NextResponse.json(
      { error: 'Failed to create tournament', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
