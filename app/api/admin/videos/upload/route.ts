
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadFile, getFileUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const adminNotes = formData.get('adminNotes') as string;
    const adminPriority = formData.get('adminPriority') as string || 'NORMAL';

    if (!file || !userId || !title) {
      return NextResponse.json(
        { error: 'File, user ID, and title are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a video file (MP4, MOV, AVI, or WebM).' },
        { status: 400 }
      );
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, firstName: true, lastName: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `admin_upload_${timestamp}_${safeFileName}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to S3 as public (to avoid signed URL 403 errors)
    const isPublic = true;
    const cloud_storage_path = await uploadFile(buffer, fileName, isPublic, file.type);
    
    console.log(`Admin video uploaded to S3: ${cloud_storage_path}`);
    
    // Generate public URL for the uploaded video
    const videoUrl = await getFileUrl(cloud_storage_path, isPublic);
    console.log(`Generated public URL: ${videoUrl}`);
    
    // Create video analysis record with admin flags
    const videoAnalysis = await prisma.videoAnalysis.create({
      data: {
        userId: userId,
        videoUrl: videoUrl,
        cloud_storage_path,
        isPublic,
        title: title,
        description: description || '',
        fileName: file.name,
        fileSize: file.size,
        duration: 0, // Would be extracted from video metadata
        analysisStatus: 'PENDING',
        // Admin-specific fields
        adminUpload: true,
        uploadedByAdminId: session.user.id,
        adminNotes: adminNotes || '',
        adminNotesUpdatedAt: new Date(),
        adminNotesUpdatedBy: session.user.id,
        adminPriority: adminPriority as any,
        reviewStatus: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        uploadedByAdmin: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Create security log entry
    await prisma.securityLog.create({
      data: {
        userId: userId,
        eventType: 'ADMIN_VIDEO_UPLOADED',
        severity: 'MEDIUM',
        description: `Admin uploaded video "${title}" for user ${targetUser.name || targetUser.email}`,
        metadata: {
          videoId: videoAnalysis.id,
          adminId: session.user.id,
          fileName: fileName,
          fileSize: file.size,
          priority: adminPriority,
          cloud_storage_path
        }
      }
    });

    return NextResponse.json({
      success: true,
      videoAnalysis,
      message: 'Video uploaded successfully'
    });

  } catch (error) {
    console.error('Admin video upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get users list for dropdown in upload form
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } }
        ],
        role: 'USER' // Only show regular users, not other admins
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        skillLevel: true,
        createdAt: true,
        _count: {
          select: {
            videoAnalyses: true
          }
        }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ],
      take: limit
    });

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
