export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Simli Avatar Session API
 * Creates a session token for Simli WebRTC streaming
 */

// Default face ID for Coach Kai avatar (Trinity)
const DEFAULT_FACE_ID = "5fc23ea5-8175-4a82-aaaf-cdd8c88543dc";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read env vars at request time, not module load time
    const SIMLI_API_KEY = process.env.SIMLI_API_KEY;
    const FACE_ID = process.env.SIMLI_FACE_ID || DEFAULT_FACE_ID;

    console.log('[Simli] Checking config - API Key exists:', !!SIMLI_API_KEY, 'Face ID:', FACE_ID);

    if (!SIMLI_API_KEY) {
      console.error('[Simli] API key not configured. Env vars:', Object.keys(process.env).filter(k => k.includes('SIMLI')));
      return NextResponse.json({ 
        error: "Avatar service not configured",
        fallback: true 
      }, { status: 503 });
    }

    // Get face ID from request or use default
    const { faceId } = await req.json().catch(() => ({}));
    const selectedFaceId = faceId || FACE_ID;

    // Create Simli session
    const simliResponse = await fetch('https://api.simli.ai/startE2ESession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SIMLI_API_KEY
      },
      body: JSON.stringify({
        faceId: selectedFaceId,
        voiceId: process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL",
        maxSessionLength: 1800,
        maxIdleTime: 300
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
