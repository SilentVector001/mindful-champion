export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// OpenAI TTS API Endpoint - High-quality neural voices
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, voice = "nova", speed = 1.0 } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Clean text by removing emojis for better TTS
    const cleanedText = text
      .replace(/[\u{1F000}-\u{1F9FF}]/gu, '')
      .replace(/[\u{2600}-\u{27BF}]/gu, '')
      .replace(/[\u{2300}-\u{23FF}]/gu, '')
      .replace(/[\u{2B50}]/gu, '')
      .replace(/[\u{1F300}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F700}-\u{1F9FF}]/gu, '')
      .replace(/[\u{1FA00}-\u{1FAFF}]/gu, '')
      .replace(/[\uFE00-\uFE0F]/g, '')
      .replace(/\u200D/g, '')
      .replace(/\u20E3/g, '')
      .replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanedText) {
      return NextResponse.json({ error: "Text is empty after cleaning" }, { status: 400 });
    }

    console.log(`🔊 TTS Request: voice=${voice}, speed=${speed}, textLength=${cleanedText.length}`);

    // Call OpenAI TTS API via Abacus.AI proxy
    const response = await fetch('https://apps.abacus.ai/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUS_API_KEY}`
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // High-definition audio quality
        voice: voice, // nova, alloy, echo, fable, onyx, shimmer
        input: cleanedText,
        speed: speed, // 0.25 to 4.0
        response_format: 'mp3' // mp3, opus, aac, flac
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI TTS API error:', response.status, errorText);
      throw new Error(`TTS API error: ${response.status}`);
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    
    console.log(`✅ TTS Success: Generated ${audioBuffer.byteLength} bytes`);

    // Return audio file
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });

  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
