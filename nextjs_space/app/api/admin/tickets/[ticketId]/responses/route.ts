
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const params = await context.params
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const response = await prisma.ticketResponse.create({
      data: {
        ticketId: params.ticketId,
        userId: session.user.id,
        message,
        isStaff: true
      }
    })

    // Update ticket status to IN_PROGRESS
    await prisma.supportTicket.update({
      where: { id: params.ticketId },
      data: { 
        status: 'IN_PROGRESS',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ response }, { status: 201 })
  } catch (error) {
    console.error('Error creating response:', error)
    return NextResponse.json({ error: "Failed to create response" }, { status: 500 })
  }
}
