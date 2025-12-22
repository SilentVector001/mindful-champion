export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ElevenLabs voices - using a warm, friendly female voice for Coach Kai
const VOICE_IDS = {
  rachel: '21m00Tcm4TlvDq8ikWAM', // Rachel - warm, conversational
  sarah: 'EXAVITQu4vr4xnSDxMaL',   // Sarah - friendly, warm
  charlotte: 'XB0fDUnXU5powFXDhCwa', // Charlotte - energetic
  emily: 'LcfcDJNUP1GQjkzn1xUU',   // Emily - calm, soothing
};

const DEFAULT_VOICE = 'rachel';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, voice = DEFAULT_VOICE } = await req.json();

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

    const voiceId = VOICE_IDS[voice as keyof typeof VOICE_IDS] || VOICE_IDS.rachel;
    
    console.log(`🔊 ElevenLabs TTS: voice=${voice}, voiceId=${voiceId}, textLength=${cleanedText.length}`);

    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
      },
      body: JSON.stringify({
        text: cleanedText,
        model_id: 'eleven_flash_v2_5', // Flash v2.5 for lowest latency (~75ms)
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs TTS API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    
    console.log(`✅ ElevenLabs TTS Success: Generated ${audioBuffer.byteLength} bytes`);

    // Return audio file (ElevenLabs returns mp3 by default)
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
