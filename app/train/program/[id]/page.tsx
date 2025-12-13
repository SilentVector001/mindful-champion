
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma as db } from '@/lib/db'
import MainNavigation from '@/components/navigation/main-navigation'
import InteractiveProgramViewer from '@/components/train/interactive-program-viewer'
import AvatarCoach from '@/components/avatar/avatar-coach'

export const dynamic = 'force-dynamic'

interface TrainingProgramPageProps {
  params: { id: string }
}

async function getProgram(programId: string) {
  try {
    const program = await db.trainingProgram.findFirst({
      where: { 
        OR: [
          { id: programId },
          { programId: programId }
        ]
      }
    })
    
    if (!program) return null
    
    // Transform to match expected type
    // Handle multiple possible formats for dailyStructure with ROBUST error handling
    let dailyStructure: any[] = []
    
    try {
      const structure = program.dailyStructure
      
      if (!structure) {
        console.warn(`Program ${program.name} (${program.id}): No dailyStructure data`)
        dailyStructure = []
      }
      // Strategy 1: Already an array - use directly
      else if (Array.isArray(structure)) {
        dailyStructure = structure
        console.log(`✅ Program ${program.name}: Loaded ${dailyStructure.length} days (array format)`)
      }
      // Strategy 2: Object with 'days' property
      else if (structure && typeof structure === 'object' && 'days' in structure) {
        const daysData = (structure as any).days
        if (Array.isArray(daysData)) {
          dailyStructure = daysData
          console.log(`✅ Program ${program.name}: Loaded ${dailyStructure.length} days (object.days format)`)
        } else {
          console.error(`❌ Program ${program.name}: 'days' property exists but is not an array`)
        }
      }
      // Strategy 3: Object with numeric keys (e.g., {"1": {day: 1, ...}, "2": {day: 2, ...}})
      else if (structure && typeof structure === 'object') {
        const keys = Object.keys(structure)
        // Check if keys look like day numbers (1, 2, 3, etc)
        const dayNumbers = keys.map(k => parseInt(k)).filter(n => !isNaN(n) && n > 0)
        
        if (dayNumbers.length > 0) {
          // Sort and extract
          const sorted = dayNumbers.sort((a, b) => a - b)
          dailyStructure = sorted.map(day => (structure as any)[day.toString()])
          console.log(`✅ Program ${program.name}: Loaded ${dailyStructure.length} days (numeric keys format)`)
        } else {
          console.error(`❌ Program ${program.name}: Object structure but no numeric keys found`)
          console.error(`Available keys:`, keys.slice(0, 5))
        }
      }
      // Strategy 4: String (JSON) - parse it
      else if (typeof structure === 'string') {
        try {
          const parsed = JSON.parse(structure)
          if (Array.isArray(parsed)) {
            dailyStructure = parsed
            console.log(`✅ Program ${program.name}: Loaded ${dailyStructure.length} days (JSON string array)`)
          } else if (parsed.days && Array.isArray(parsed.days)) {
            dailyStructure = parsed.days
            console.log(`✅ Program ${program.name}: Loaded ${dailyStructure.length} days (JSON string object.days)`)
          } else {
            console.error(`❌ Program ${program.name}: JSON string parsed but unexpected format`)
          }
        } catch (jsonError) {
          console.error(`❌ Program ${program.name}: Failed to parse JSON string:`, jsonError)
        }
      }
      else {
        console.error(`❌ Program ${program.name}: Unknown dailyStructure format - type: ${typeof structure}`)
      }
      
      // Final validation - ensure each day has required fields
      if (dailyStructure.length > 0) {
        const validDays = dailyStructure.filter((day: any) => 
          day && typeof day === 'object' && 'day' in day && 'title' in day
        )
        if (validDays.length !== dailyStructure.length) {
          console.warn(`⚠️ Program ${program.name}: ${dailyStructure.length - validDays.length} invalid day entries removed`)
          dailyStructure = validDays
        }
      }
      
    } catch (parseError) {
      console.error(`❌ CRITICAL: Error parsing dailyStructure for program ${program.id}:`, parseError)
      console.error('Program data:', {
        id: program.id,
        name: program.name,
        structureType: typeof program.dailyStructure,
        structureSample: JSON.stringify(program.dailyStructure).substring(0, 200)
      })
      dailyStructure = []
    }
    
    // If we still have no data, log a final warning
    if (dailyStructure.length === 0) {
      console.error(`🚨 FINAL WARNING: Program ${program.name} (${program.id}) has NO valid dailyStructure data`)
    }
    
    return {
      ...program,
      dailyStructure,
      // Add metadata for debugging
      _parsedDaysCount: dailyStructure.length,
      _originalStructureType: typeof program.dailyStructure
    }
  } catch (error) {
    console.error('Error fetching program:', error)
    return null
  }
}

async function getUserProgram(userId: string, programId: string) {
  try {
    const userProgram = await db.userProgram.findFirst({
      where: {
        userId,
        programId
      },
      include: {
        program: true
      }
    })
    
    return userProgram || undefined
  } catch (error) {
    console.error('Error fetching user program:', error)
    return undefined
  }
}

async function getProgramVideos(programId: string) {
  try {
    const programVideos = await db.programVideo.findMany({
      where: { programId },
      include: {
        video: true
      },
      orderBy: [
        { day: 'asc' },
        { order: 'asc' }
      ]
    })

    return programVideos.map((pv: any) => ({
      id: pv.video.id,
      title: pv.video.title,
      description: pv.video.description,
      youtubeUrl: pv.video.url,
      duration: parseInt(pv.video.duration) || 600,
      dayNumber: pv.day,
      order: pv.order,
      skillLevel: pv.video.skillLevel,
      primaryTopic: pv.video.primaryTopic
    }))
  } catch (error) {
    console.error('Error fetching program videos:', error)
    return []
  }
}

export default async function TrainingProgramPage({ params }: TrainingProgramPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  // Get program data
  const program = await getProgram(params.id)
  if (!program) {
    notFound()
  }

  // Get user's enrollment status
  const userProgram = await getUserProgram(session.user.id, program.id)

  // Get program videos
  const programVideos = await getProgramVideos(program.id)

  // Transform videos to match expected format
  const videos = programVideos.map((video: any) => ({
    id: video.id,
    videoId: video.youtubeUrl?.split('v=')[1]?.split('&')[0] || video.id,
    title: video.title,
    duration: `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`,
    thumbnailUrl: null,
    watched: false, // TODO: Get actual watch status
    difficulty: Math.min(Math.max(Math.floor(Math.random() * 3) + 1, 1), 3)
  }))

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Champion'

  return (
    <div className="min-h-screen">
      <MainNavigation user={user} />
      
      <main>
        <InteractiveProgramViewer
          program={program}
          userProgram={userProgram}
          videos={videos}
          user={user}
        />
      </main>

      <AvatarCoach userName={firstName} context="training_program" />
    </div>
  )
}
