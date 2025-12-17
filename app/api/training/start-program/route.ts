
// This endpoint is deprecated - use /api/training/programs/enroll instead
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Redirect to the unified enrollment endpoint
  return NextResponse.json({ 
    error: "This endpoint is deprecated. Use /api/training/programs/enroll instead." 
  }, { status: 410 })
}
