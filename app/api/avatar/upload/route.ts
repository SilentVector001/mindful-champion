
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { uploadFile } from "@/lib/blob"
import { getBucketConfig } from "@/lib/aws-config"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Get bucket config
    const { folderPrefix } = getBucketConfig()
    
    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${folderPrefix}avatars/${session.user.id}/${timestamp}-${sanitizedFilename}`
    
    // Upload to S3
    const cloud_storage_path = await uploadFile(buffer, fileName)
    
    // Generate download URL
    const url = `/api/avatar/download?key=${encodeURIComponent(cloud_storage_path)}`
    
    return NextResponse.json({ 
      success: true, 
      url,
      cloud_storage_path 
    })
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 })
  }
}
