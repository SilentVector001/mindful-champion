export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * TTS API for Simli Avatar
 * Converts text to PCM16 audio using ElevenLabs
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
// Coach Kai voice - warm, encouraging female voice
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // "Sarah" - warm, professional

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    // Limit text length
    const cleanText = text.slice(0, 500);

    if (!ELEVENLABS_API_KEY) {
      console.warn('[TTS] ElevenLabs API key not configured, returning silent audio');
      // Return silent audio (1 second of silence at 16kHz PCM16)
      const silentAudio = new Uint8Array(32000); // 16000 samples * 2 bytes
      return new NextResponse(silentAudio, {
        headers: {
          'Content-Type': 'audio/pcm',
          'X-Sample-Rate': '16000',
        }
      });
    }

    // Call ElevenLabs TTS API with PCM output
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream?output_format=pcm_16000`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TTS] ElevenLabs error:', errorText);
      // Return silent audio on error
      const silentAudio = new Uint8Array(32000);
      return new NextResponse(silentAudio, {
        headers: { 'Content-Type': 'audio/pcm' }
      });
    }

    // Stream the audio back
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/pcm',
        'X-Sample-Rate': '16000',
      }
    });

  } catch (error: any) {
    console.error('[TTS] Error:', error.message);
    // Return silent audio on error
    const silentAudio = new Uint8Array(32000);
    return new NextResponse(silentAudio, {
      headers: { 'Content-Type': 'audio/pcm' }
    });
  }
}
