
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WearableService } from '@/lib/wearables/wearable-service';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    const dataTypeParam = searchParams.get('dataType');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get aggregated data for specific data types or all
    let aggregatedData: any = {};
    
    if (dataTypeParam) {
      // Get data for specific type
      const dataType = dataTypeParam as any; // HealthDataType enum value
      aggregatedData = await WearableService.getAggregatedHealthData(
        session.user.id,
        dataType,
        startDate,
        endDate
      );
    } else {
      // Get insights which includes multiple data types
      aggregatedData = await WearableService.getHealthInsightsForCoach(session.user.id);
    }

    // Get insights for Coach Kai
    const insights = await WearableService.getHealthInsightsForCoach(session.user.id);

    return NextResponse.json({ 
      aggregatedData,
      insights,
      period: { days, dataType: dataTypeParam }
    });
  } catch (error) {
    console.error('Error fetching wearable data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch wearable data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
