
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

// GET - Fetch user's tickets
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      include: {
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
  }
}

// POST - Create a new ticket
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { category, subject, description } = await request.json()

    if (!category || !subject || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        category,
        subject,
        description,
        status: 'OPEN',
        priority: 'MEDIUM'
      }
    })

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 })
  }
}
