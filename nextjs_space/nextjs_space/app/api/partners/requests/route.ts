
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get sent requests
    const sent = await prisma.partnerRequest.findMany({
      where: {
        senderId: session.user.id,
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            firstName: true,
            skillLevel: true,
            playerRating: true,
            location: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get received requests
    const received = await prisma.partnerRequest.findMany({
      where: {
        receiverId: session.user.id,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            firstName: true,
            skillLevel: true,
            playerRating: true,
            location: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data
    const sentRequests = sent.map(req => ({
      id: req.id,
      partnerId: req.receiver.id,
      partnerName: req.receiver.name || req.receiver.firstName || 'Anonymous',
      skillLevel: req.receiver.skillLevel,
      rating: req.receiver.playerRating,
      location: req.receiver.location,
      message: req.message,
      status: req.status,
      createdAt: req.createdAt,
    }))

    const receivedRequests = received.map(req => ({
      id: req.id,
      senderId: req.sender.id,
      senderName: req.sender.name || req.sender.firstName || 'Anonymous',
      skillLevel: req.sender.skillLevel,
      rating: req.sender.playerRating,
      location: req.sender.location,
      message: req.message,
      status: req.status,
      createdAt: req.createdAt,
    }))

    return NextResponse.json({
      sent: sentRequests,
      received: receivedRequests,
      message: "Requests loaded successfully"
    })

  } catch (error) {
    console.error("[PARTNER_REQUESTS_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to load partner requests" },
      { status: 500 }
    )
  }
}
