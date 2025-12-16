
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST: Add video to playlist
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { playlistId, videoId } = body;

    if (!playlistId || !videoId) {
      return NextResponse.json(
        { error: 'Playlist ID and Video ID are required' },
        { status: 400 }
      );
    }

    // Verify playlist ownership
    const playlist = await prisma.videoPlaylist.findUnique({
      where: { id: playlistId, userId: user.id },
      include: { videos: true },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if video already in playlist
    const exists = await prisma.playlistVideo.findUnique({
      where: {
        playlistId_videoId: {
          playlistId,
          videoId,
        },
      },
    });

    if (exists) {
      return NextResponse.json(
        { error: 'Video already in playlist' },
        { status: 400 }
      );
    }

    // Add video to playlist
    const playlistVideo = await prisma.playlistVideo.create({
      data: {
        playlistId,
        videoId,
        order: playlist.videos.length,
      },
    });

    // Update video count
    await prisma.videoPlaylist.update({
      where: { id: playlistId },
      data: { videoCount: playlist.videos.length + 1 },
    });

    return NextResponse.json({ success: true, playlistVideo }, { status: 201 });
  } catch (error) {
    console.error('Error adding video to playlist:', error);
    return NextResponse.json(
      { error: 'Failed to add video to playlist' },
      { status: 500 }
    );
  }
}

// DELETE: Remove video from playlist
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('playlistId');
    const videoId = searchParams.get('videoId');

    if (!playlistId || !videoId) {
      return NextResponse.json(
        { error: 'Playlist ID and Video ID are required' },
        { status: 400 }
      );
    }

    // Verify playlist ownership
    const playlist = await prisma.videoPlaylist.findUnique({
      where: { id: playlistId, userId: user.id },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.playlistVideo.delete({
      where: {
        playlistId_videoId: {
          playlistId,
          videoId,
        },
      },
    });

    // Update video count
    await prisma.videoPlaylist.update({
      where: { id: playlistId },
      data: { videoCount: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing video from playlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove video from playlist' },
      { status: 500 }
    );
  }
}
