import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const videos = await prisma.videoAnalysis.findMany({
      select: {
        id: true,
        title: true,
        videoUrl: true,
        fileName: true,
        analysisStatus: true,
        uploadedAt: true
      },
      orderBy: {
        uploadedAt: 'desc'
      },
      take: 10
    })
    
    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ error: 'Failed to fetch videos', details: String(error) }, { status: 500 })
  }
}
