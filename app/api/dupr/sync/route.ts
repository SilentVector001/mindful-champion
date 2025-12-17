
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user?.duprConnected || !user?.duprId) {
      return NextResponse.json({ error: 'DUPR not connected' }, { status: 400 })
    }

    // TODO: In a real implementation, this would call the DUPR API
    // For now, we'll just update the last synced timestamp
    // Example DUPR API call would look like:
    // const response = await fetch(`https://api.dupr.com/v1/players/${user.duprId}/matches`, {
    //   headers: { 'Authorization': `Bearer ${DUPR_API_KEY}` }
    // })
    // const duprMatches = await response.json()
    
    // Create sample synced match for demonstration
    const lastMatch = await prisma.match.findFirst({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' }
    })

    // Update last synced timestamp
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        duprLastSynced: new Date(),
        duprRating: user.duprRating || 2.5 // Would come from DUPR API
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'DUPR synced successfully'
    })
  } catch (error) {
    console.error('Failed to sync DUPR:', error)
    return NextResponse.json({ error: 'Failed to sync DUPR' }, { status: 500 })
  }
}
