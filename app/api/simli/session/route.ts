export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Simli Avatar Session API
 * Creates a session token for Simli WebRTC streaming
 */

// HARDCODED for Vercel deployment (env vars not loading properly)
const SIMLI_API_KEY = "wr2n23svu8fq87uezd5qb8";
const DEFAULT_FACE_ID = "5fc23ea5-8175-4a82-aaaf-cdd8c88543dc";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!SIMLI_API_KEY) {
      console.error('[Simli] API key not configured');
      return NextResponse.json({ 
        error: "Avatar service not configured",
        fallback: true 
      }, { status: 503 });
    }

    // Get face ID from request or use default
    const { faceId } = await req.json().catch(() => ({}));
    const selectedFaceId = faceId || DEFAULT_FACE_ID;

    // Create Simli session
    const simliResponse = await fetch('https://api.simli.ai/startE2ESession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: SIMLI_API_KEY,
        faceId: selectedFaceId,
        ttsProvider: "ElevenLabs",
        language: "en",
        voiceId: process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL", // Default to Rachel
        maxSessionLength: 1800, // 30 minutes max
        maxIdleTime: 300, // 5 minutes idle timeout
        createTranscript: false
      })
    });

    if (!simliResponse.ok) {
      const errorText = await simliResponse.text();
      console.error('[Simli] Session creation failed:', errorText);
      return NextResponse.json({ 
        error: "Failed to create avatar session",
        fallback: true 
      }, { status: simliResponse.status });
    }

    const sessionData = await simliResponse.json();

    return NextResponse.json({
      success: true,
      sessionId: sessionData.sessionId,
      iceServers: sessionData.iceServers,
      faceId: selectedFaceId,
      apiKey: SIMLI_API_KEY
    });

  } catch (error: any) {
    console.error('[Simli] Error:', error.message);
    return NextResponse.json({ 
      error: "Avatar service error",
      fallback: true 
    }, { status: 500 });
  }
}
