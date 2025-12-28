
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendEmail } from "@/lib/email"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { action, message } = await req.json()
    const requestId = id

    // Get the request
    const request = await prisma.partnerRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            firstName: true,
            email: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            firstName: true,
          }
        }
      }
    })

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      )
    }

    // Check if user is the receiver
    if (request.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to respond to this request" },
        { status: 403 }
      )
    }

    let updatedRequest

    if (action === 'ACCEPT') {
      updatedRequest = await prisma.partnerRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' }
      })

      // Send email to sender
      if (request.sender.email) {
        try {
          await sendEmail({
            to: request.sender.email,
            subject: `✅ ${request.receiver.firstName || request.receiver.name} accepted your partner request!`,
            text: `Great news! ${request.receiver.firstName || request.receiver.name} has accepted your partner request on Mindful Champion. You can now connect with them and schedule matches!\n\nView your connections: https://mindful-champion-t6g8z3.abacusai.app/connect/partners`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0d9488;">✅ Partner Request Accepted!</h2>
                <p>Great news! <strong>${request.receiver.firstName || request.receiver.name}</strong> has accepted your partner request on Mindful Champion.</p>
                <p>You can now connect with them and schedule matches!</p>
                <a href="https://mindful-champion-t6g8z3.abacusai.app/connect/partners" style="display: inline-block; padding: 12px 24px; background: #0d9488; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">View Your Connections</a>
              </div>
            `
          })
        } catch (error) {
          console.error('Failed to send acceptance email:', error)
        }
      }
    } else if (action === 'DECLINE') {
      updatedRequest = await prisma.partnerRequest.update({
        where: { id: requestId },
        data: { status: 'DECLINED' }
      })
    } else if (action === 'COUNTER_OFFER') {
      // Update request with counter offer message
      updatedRequest = await prisma.partnerRequest.update({
        where: { id: requestId },
        data: { 
          status: 'PENDING',
          responseMessage: message 
        }
      })

      // Send email to sender
      if (request.sender.email && message) {
        try {
          await sendEmail({
            to: request.sender.email,
            subject: `💬 ${request.receiver.firstName || request.receiver.name} sent you a counter offer`,
            text: `${request.receiver.firstName || request.receiver.name} responded to your partner request:\n\n"${message}"\n\nView and respond: https://mindful-champion-t6g8z3.abacusai.app/connect/partners?tab=requests`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0d9488;">💬 Counter Offer Received</h2>
                <p><strong>${request.receiver.firstName || request.receiver.name}</strong> responded to your partner request:</p>
                <div style="padding: 16px; background: #f0fdfa; border-left: 4px solid #0d9488; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-style: italic;">"${message}"</p>
                </div>
                <a href="https://mindful-champion-t6g8z3.abacusai.app/connect/partners?tab=requests" style="display: inline-block; padding: 12px 24px; background: #0d9488; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">View & Respond</a>
              </div>
            `
          })
        } catch (error) {
          console.error('Failed to send counter offer email:', error)
        }
      }
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      request: updatedRequest,
      message: "Request updated successfully"
    })

  } catch (error) {
    console.error("[PARTNER_REQUEST_RESPONSE_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to respond to request" },
      { status: 500 }
    )
  }
}
