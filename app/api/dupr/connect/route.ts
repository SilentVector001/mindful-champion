
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { duprId } = await request.json()

    if (!duprId) {
      return NextResponse.json({ error: 'DUPR ID is required' }, { status: 400 })
    }

    // Update user with DUPR connection
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        duprId,
        duprConnected: true,
        duprLastSynced: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to connect DUPR:', error)
    return NextResponse.json({ error: 'Failed to connect DUPR' }, { status: 500 })
  }
}
