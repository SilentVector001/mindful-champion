
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Get video details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = await params;

    const video = await prisma.videoAnalysis.findUnique({
      where: { id: videoId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
            skillLevel: true,
            createdAt: true
          }
        },
        uploadedByAdmin: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ video });

  } catch (error) {
    console.error('Failed to fetch video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}

// Update video (notes, flags, review status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { videoId } = await params;
    const body = await request.json();
    
    const {
      adminNotes,
      flaggedForReview,
      flaggedReason,
      reviewStatus,
      reviewComments,
      adminPriority
    } = body;

    // Build update data
    const updateData: any = {
      adminNotesUpdatedBy: session.user.id,
      adminNotesUpdatedAt: new Date()
    };

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    if (flaggedForReview !== undefined) {
      updateData.flaggedForReview = flaggedForReview;
      if (flaggedForReview) {
        updateData.flaggedAt = new Date();
        updateData.flaggedByAdminId = session.user.id;
        if (flaggedReason) {
          updateData.flaggedReason = flaggedReason;
        }
      } else {
        updateData.flaggedAt = null;
        updateData.flaggedByAdminId = null;
        updateData.flaggedReason = null;
      }
    }

    if (reviewStatus !== undefined) {
      updateData.reviewStatus = reviewStatus;
      updateData.reviewedAt = new Date();
      updateData.reviewedByAdminId = session.user.id;
    }

    if (reviewComments !== undefined) {
      updateData.reviewComments = reviewComments;
    }

    if (adminPriority !== undefined) {
      updateData.adminPriority = adminPriority;
    }

    const updatedVideo = await prisma.videoAnalysis.update({
      where: { id: videoId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
            skillLevel: true
          }
        },
        uploadedByAdmin: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true
          }
        }
      }
    });

    // Create security log for significant changes
    let logDescription = `Admin updated video "${updatedVideo.title}"`;
    const logMetadata: any = {
      videoId,
      adminId: session.user.id,
      changes: {}
    };

    if (adminNotes !== undefined) {
      logDescription += ' (notes updated)';
      logMetadata.changes.adminNotes = true;
    }

    if (flaggedForReview !== undefined) {
      const action = flaggedForReview ? 'flagged' : 'unflagged';
      logDescription += ` (${action})`;
      logMetadata.changes.flaggedForReview = flaggedForReview;
      if (flaggedReason) {
        logMetadata.changes.flaggedReason = flaggedReason;
      }

      // Create separate security log for flagging
      await prisma.securityLog.create({
        data: {
          userId: updatedVideo.userId,
          eventType: 'ADMIN_VIDEO_FLAGGED',
          severity: 'HIGH',
          description: `Admin ${action} video "${updatedVideo.title}" for review${flaggedReason ? `: ${flaggedReason}` : ''}`,
          metadata: logMetadata
        }
      });
    }

    if (reviewStatus !== undefined) {
      logDescription += ` (review: ${reviewStatus})`;
      logMetadata.changes.reviewStatus = reviewStatus;

      // Create separate security log for review
      await prisma.securityLog.create({
        data: {
          userId: updatedVideo.userId,
          eventType: 'ADMIN_VIDEO_REVIEWED',
          severity: 'MEDIUM',
          description: `Admin reviewed video "${updatedVideo.title}" - Status: ${reviewStatus}`,
          metadata: logMetadata
        }
      });
    }

    // General notes update log
    if (adminNotes !== undefined) {
      await prisma.securityLog.create({
        data: {
          userId: updatedVideo.userId,
          eventType: 'ADMIN_VIDEO_NOTES_UPDATED',
          severity: 'LOW',
          description: logDescription,
          metadata: logMetadata
        }
      });
    }

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      message: 'Video updated successfully'
    });

  } catch (error) {
    console.error('Failed to update video:', error);
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    );
  }
}

// Delete video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = await params;

    // Get video details before deletion for logging
    const video = await prisma.videoAnalysis.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        userId: true,
        title: true,
        fileName: true,
        adminUpload: true
      }
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Delete the video record
    await prisma.videoAnalysis.delete({
      where: { id: videoId }
    });

    // Create security log
    await prisma.securityLog.create({
      data: {
        userId: video.userId,
        eventType: 'ADMIN_VIDEO_DELETED',
        severity: 'HIGH',
        description: `Admin deleted video "${video.title}"`,
        metadata: {
          videoId: video.id,
          adminId: session.user.id,
          fileName: video.fileName,
          wasAdminUpload: video.adminUpload
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete video:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
