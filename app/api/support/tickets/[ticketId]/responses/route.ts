
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  context: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Verify user owns this ticket
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: params.ticketId,
        userId: session.user.id
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const response = await prisma.ticketResponse.create({
      data: {
        ticketId: params.ticketId,
        userId: session.user.id,
        message,
        isStaff: false
      }
    })

    // Update ticket status to WAITING_USER if it was RESOLVED
    if (ticket.status === 'RESOLVED') {
      await prisma.supportTicket.update({
        where: { id: params.ticketId },
        data: { status: 'OPEN' }
      })
    }

    return NextResponse.json({ response }, { status: 201 })
  } catch (error) {
    console.error('Error creating response:', error)
    return NextResponse.json({ error: "Failed to create response" }, { status: 500 })
  }
}
