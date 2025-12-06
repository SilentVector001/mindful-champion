
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      partnerId,
      serviceId,
      serviceType,
      serviceName,
      sessionDate,
      sessionTime,
      duration,
      amount,
      userNotes,
    } = await req.json();

    // Validate inputs
    if (!partnerId || !serviceType || !serviceName || !sessionDate || !sessionTime || !duration || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate fees
    const platformFeeRate = 0.15; // 15%
    const platformFee = Math.round(amount * platformFeeRate);
    const partnerPayout = amount - platformFee;

    // Create booking
    const booking = await prisma.partnerBooking.create({
      data: {
        userId: session.user.id,
        partnerId,
        serviceId,
        serviceType,
        serviceName,
        sessionDate: new Date(sessionDate),
        sessionTime,
        duration,
        status: 'PENDING',
        amount,
        platformFee,
        partnerPayout,
        userNotes,
        paymentStatus: 'pending',
      },
      include: {
        partner: true,
      },
    });

    // TODO: Send notification email to partner
    // TODO: Send confirmation email to user

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        partner: booking.partner.name,
        service: booking.serviceName,
        date: booking.sessionDate,
        time: booking.sessionTime,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
