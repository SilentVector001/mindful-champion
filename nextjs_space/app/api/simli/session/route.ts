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

    // Create Simli session using Audio-to-Video (simpler, no ElevenLabs needed)
    const simliResponse = await fetch('https://api.simli.ai/startAudioToVideoSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: SIMLI_API_KEY,
        faceId: selectedFaceId,
        syncAudio: true,
        handleSilence: true,
        maxSessionLength: 1800, // 30 minutes max
        maxIdleTime: 300 // 5 minutes idle timeout
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
    console.log('[Simli] Session created:', sessionData);

    return NextResponse.json({
      success: true,
      sessionToken: sessionData.sessionToken || sessionData.session_token,
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
