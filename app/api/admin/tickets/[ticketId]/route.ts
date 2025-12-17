
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
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
    const { status, priority } = await request.json()

    const updateData: any = {}
    if (status) {
      updateData.status = status
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date()
      }
    }
    if (priority) updateData.priority = priority

    const ticket = await prisma.supportTicket.update({
      where: { id: params.ticketId },
      data: updateData
    })

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 })
  }
}
