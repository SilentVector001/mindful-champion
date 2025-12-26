/**
 * Admin Custom Streams API
 * Full CRUD operations for managing custom streams
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - List all custom streams
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admins can access this endpoint
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const streams = await prisma.customStream.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    return NextResponse.json({
      success: true,
      count: streams.length,
      streams,
    });

  } catch (error) {
    console.error('Error fetching custom streams:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch custom streams',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create a new custom stream
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admins can access this endpoint
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, streamUrl, thumbnail, platform, description, isActive, priority } = body;

    // Validation
    if (!title || !streamUrl || !platform) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, streamUrl, platform' },
        { status: 400 }
      );
    }

    // Create stream
    const stream = await prisma.customStream.create({
      data: {
        title,
        streamUrl,
        thumbnail: thumbnail || null,
        platform,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
        priority: priority || 0,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      stream,
      message: 'Custom stream created successfully'
    });

  } catch (error) {
    console.error('Error creating custom stream:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create custom stream',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update an existing custom stream
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admins can access this endpoint
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, title, streamUrl, thumbnail, platform, description, isActive, priority } = body;

    // Validation
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing stream ID' },
        { status: 400 }
      );
    }

    // Check if stream exists
    const existingStream = await prisma.customStream.findUnique({
      where: { id },
    });

    if (!existingStream) {
      return NextResponse.json(
        { success: false, error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Update stream
    const stream = await prisma.customStream.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(streamUrl && { streamUrl }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(platform && { platform }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(priority !== undefined && { priority }),
      },
    });

    return NextResponse.json({
      success: true,
      stream,
      message: 'Custom stream updated successfully'
    });

  } catch (error) {
    console.error('Error updating custom stream:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update custom stream',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a custom stream
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admins can access this endpoint
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validation
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing stream ID' },
        { status: 400 }
      );
    }

    // Check if stream exists
    const existingStream = await prisma.customStream.findUnique({
      where: { id },
    });

    if (!existingStream) {
      return NextResponse.json(
        { success: false, error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Delete stream
    await prisma.customStream.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Custom stream deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting custom stream:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete custom stream',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
