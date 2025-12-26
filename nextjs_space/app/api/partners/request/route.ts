
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendPartnerRequestEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { partnerId, message } = await req.json()

    if (!partnerId) {
      return NextResponse.json(
        { error: "Partner ID is required" },
        { status: 400 }
      )
    }

    // Check if request already exists
    const existingRequest = await prisma.partnerRequest.findFirst({
      where: {
        senderId: session.user.id,
        receiverId: partnerId,
        status: { in: ['PENDING', 'ACCEPTED'] }
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending or active connection with this user" },
        { status: 400 }
      )
    }

    // Get sender info
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        firstName: true,
        skillLevel: true,
        playerRating: true,
      }
    })

    // Get receiver info
    const receiver = await prisma.user.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        name: true,
        firstName: true,
        email: true,
      }
    })

    if (!receiver) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      )
    }

    // Create the request
    const request = await prisma.partnerRequest.create({
      data: {
        senderId: session.user.id,
        receiverId: partnerId,
        message: message || null,
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
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    // Send email notification to receiver
    if (receiver.email && sender) {
      try {
        await sendPartnerRequestEmail({
          to: receiver.email,
          receiverName: receiver.firstName || receiver.name || 'Champion',
          senderName: sender.firstName || sender.name || 'A player',
          senderSkillLevel: sender.skillLevel || undefined,
          senderRating: sender.playerRating ? parseFloat(sender.playerRating) : undefined,
          message: message || null,
        });
        console.log('✅ Partner request email sent to:', receiver.email);
      } catch (emailError) {
        console.error('❌ Failed to send partner request email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      request,
      message: "Partner request sent successfully! They will be notified via email and when they log in."
    })

  } catch (error) {
    console.error("[PARTNER_REQUEST_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to send partner request" },
      { status: 500 }
    )
  }
}
