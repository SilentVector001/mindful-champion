
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

    const { userId, userLevel, currentPrograms, skillAreas } = await request.json()

    // Generate AI program recommendations using the LLM API
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
            content: `You are Coach Kai, an elite AI pickleball coach providing personalized program recommendations.

Based on the user's skill level, current programs, and goals, recommend the most suitable training programs.

Provide recommendations in this JSON format:
{
  "recommendations": [
    {
      "programId": "recommended_program_id",
      "reason": "Specific reason why this program fits the user",
      "priority": 1,
      "expectedBenefit": "What the user will gain from this program"
    }
  ],
  "personalizedMessage": "Motivational message explaining the recommendations"
}

Focus on:
- Skill level progression
- Complementary skills to current programs
- Areas for improvement
- Personal goals alignment`
          },
          {
            role: 'user',
            content: `Generate program recommendations for:
- User Skill Level: ${userLevel}
- Current Programs: ${JSON.stringify(currentPrograms || [])}
- Skill Areas/Goals: ${JSON.stringify(skillAreas || [])}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    })

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    let recommendations = []
    let personalizedMessage = ""

    try {
      const parsedData = JSON.parse(aiData.choices[0].message.content)
      recommendations = parsedData.recommendations || []
      personalizedMessage = parsedData.personalizedMessage || ""
    } catch (parseError) {
      console.error('Error parsing AI recommendations:', parseError)
      // Fallback to empty recommendations - will use default program list
    }

    return NextResponse.json({ 
      recommendations,
      personalizedMessage
    })

  } catch (error) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    )
  }
}
