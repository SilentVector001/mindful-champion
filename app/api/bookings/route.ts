
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { coachId, sessionType, startTime, duration, notes, amount } = await req.json()

    // Ensure coachId is a string (convert if needed)
    const coachIdString = typeof coachId === 'string' ? coachId : String(coachId)

    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + duration)

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        coachId: coachIdString,
        sessionType,
        startTime: new Date(startTime),
        endTime,
        notes,
        amount,
      }
    })

    return NextResponse.json({ booking })

  } catch (error) {
    console.error("Booking creation error:", error)
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: { coach: true },
      orderBy: { startTime: 'desc' },
      take: 10
    })

    return NextResponse.json({ bookings })

  } catch (error) {
    console.error("Booking retrieval error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve bookings" },
      { status: 500 }
    )
  }
}
