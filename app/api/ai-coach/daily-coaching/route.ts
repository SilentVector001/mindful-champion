
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { programId, currentDay, userProgress, skillLevel, focusArea } = await request.json()

    // Generate personalized daily coaching using the LLM API
    const aiResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are Coach Kai, an elite AI pickleball coach providing personalized daily coaching. 

Generate motivational and specific coaching guidance for today's training session.

Provide coaching in this JSON format:
{
  "coaching": {
    "message": "Personalized motivational message for today's session",
    "tips": [
      "Specific technical tip 1",
      "Specific technical tip 2", 
      "Specific technical tip 3"
    ],
    "mindset": "Mental game advice for today",
    "focus_reminder": "Key reminder about today's focus area"
  }
}

Keep the tone encouraging, professional, and specific to pickleball training.`
          },
          {
            role: 'user',
            content: `Generate daily coaching for:
- Program: ${programId}
- Day ${currentDay} 
- Skill Level: ${skillLevel}
- Today's Focus: ${focusArea}
- User Progress: ${JSON.stringify(userProgress || {})}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.8,
        response_format: { type: "json_object" }
      })
    })

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    let coaching = null

    try {
      const parsedCoaching = JSON.parse(aiData.choices[0].message.content)
      coaching = parsedCoaching.coaching
    } catch (parseError) {
      console.error('Error parsing AI coaching:', parseError)
      // Fallback coaching
      coaching = {
        message: `Welcome to Day ${currentDay}! Today's focus on ${focusArea} is crucial for your development. Let's build on your progress and take your skills to the next level.`,
        tips: [
          "Start with a proper warm-up to prepare your body and mind",
          "Focus on consistent form rather than power in your shots",
          "Take breaks between drills to maintain quality practice"
        ],
        mindset: "Stay patient with yourself. Every champion was once a beginner who refused to give up.",
        focus_reminder: `Remember: today we're working on ${focusArea}. Keep this as your primary goal throughout the session.`
      }
    }

    return NextResponse.json({ coaching })

  } catch (error) {
    console.error("Error generating daily coaching:", error)
    return NextResponse.json(
      { error: "Failed to generate coaching" },
      { status: 500 }
    )
  }
}
