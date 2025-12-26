
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function getUserTier(session: any): 'FREE' | 'TRIAL' | 'PREMIUM' | 'PRO' {
  // Mock tier determination - in real app this would come from user's subscription
  return session ? 'TRIAL' : 'FREE'; 
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type'); // 'free', 'subscription', etc.
    const search = searchParams.get('search');
    
    const userTier = getUserTier(session);
    
    // Get streaming platforms from database
    let whereClause: any = { isActive: true };
    
    // Apply type filter
    if (type && type !== 'all') {
      switch (type) {
        case 'free':
          whereClause.OR = [
            { type: 'FREE' },
            { hasFreeAccess: true }
          ];
          break;
        case 'subscription':
          whereClause.type = 'SUBSCRIPTION';
          break;
        case 'cable':
          whereClause.type = 'CABLE';
          break;
        case 'freemium':
          whereClause.type = 'FREEMIUM';
          break;
      }
    }
    
    // Apply search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const streamingPlatforms = await prisma.streamingPlatform.findMany({
      where: whereClause,
      orderBy: [
        { type: 'asc' }, // Free platforms first
        { name: 'asc' }
      ]
    });
    
    // Filter based on user tier
    const accessiblePlatforms = streamingPlatforms.filter((platform: any) => {
      if (userTier === 'FREE' && platform.tierAccess === 'PREMIUM') {
        return false;
      }
      return true;
    });
    
    // Group platforms by type for better organization
    const groupedPlatforms = {
      free: accessiblePlatforms.filter((p: any) => p.type === 'FREE' || p.hasFreeAccess),
      subscription: accessiblePlatforms.filter((p: any) => p.type === 'SUBSCRIPTION'),
      freemium: accessiblePlatforms.filter((p: any) => p.type === 'FREEMIUM'),
      cable: accessiblePlatforms.filter((p: any) => p.type === 'CABLE'),
      payPerView: accessiblePlatforms.filter((p: any) => p.type === 'PAY_PER_VIEW')
    };
    
    return NextResponse.json({
      success: true,
      platforms: accessiblePlatforms,
      groupedPlatforms,
      totalCount: accessiblePlatforms.length,
      userTier,
      availableTypes: ['free', 'subscription', 'freemium', 'cable', 'pay_per_view'],
      stats: {
        total: streamingPlatforms.length,
        free: groupedPlatforms.free.length,
        subscription: groupedPlatforms.subscription.length,
        freemium: groupedPlatforms.freemium.length,
        cable: groupedPlatforms.cable.length,
        payPerView: groupedPlatforms.payPerView.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching streaming platforms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch streaming platforms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { action, platformId } = await request.json();
    
    switch (action) {
      case 'favorite':
        // Add to user's favorites
        await prisma.userFavoriteStreamingPlatform.create({
          data: {
            userId: session.user.id,
            platformId
          }
        });
        
        // Increment platform view count
        await prisma.streamingPlatform.update({
          where: { id: platformId },
          data: {
            viewCount: { increment: 1 }
          }
        });
        
        return NextResponse.json({ success: true });
        
      case 'unfavorite':
        await prisma.userFavoriteStreamingPlatform.deleteMany({
          where: {
            userId: session.user.id,
            platformId
          }
        });
        
        return NextResponse.json({ success: true });
        
      case 'visit':
        // Track platform visit
        await prisma.streamingPlatform.update({
          where: { id: platformId },
          data: {
            clickCount: { increment: 1 }
          }
        });
        
        return NextResponse.json({ success: true });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Error handling streaming platform action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
