
import { NextResponse } from "next/server"
import { getFileUrl } from "@/lib/s3"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')
    
    if (!key) {
      return NextResponse.json({ error: "No key provided" }, { status: 400 })
    }

    // Get signed URL from S3 (assuming private file)
    const signedUrl = await getFileUrl(key, false)
    
    // Redirect to signed URL
    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error("Avatar download error:", error)
    return NextResponse.json({ error: "Failed to download avatar" }, { status: 500 })
  }
}
