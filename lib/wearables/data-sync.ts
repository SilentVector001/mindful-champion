
/**
 * Data synchronization utilities for wearable devices
 */

import { WearableDeviceType, HealthDataType } from '@/lib/prisma-types';
import { WearableService, HealthDataEntry } from './wearable-service';

export interface SyncOptions {
  startDate?: Date;
  endDate?: Date;
  dataTypes?: HealthDataType[];
}

/**
 * Simulate data sync from a device (for demo purposes)
 * In production, this would make actual API calls to device platforms
 */
export async function syncDeviceData(
  userId: string,
  deviceId: string,
  deviceType: WearableDeviceType,
  options: SyncOptions = {}
): Promise<{ success: boolean; dataPoints: number; error?: string }> {
  try {
    // In a real implementation, this would:
    // 1. Fetch access token from database
    // 2. Make API calls to the device platform
    // 3. Transform the data to our format
    // 4. Store in database

    // For demo, we'll generate sample data
    const sampleData = generateSampleHealthData(deviceType, options);

    // Store the data
    await WearableService.storeHealthData(userId, sampleData);

    // Update last synced timestamp
    await WearableService.updateSyncTimestamp(deviceId);

    return {
      success: true,
      dataPoints: sampleData.length,
    };
  } catch (error) {
    console.error('Error syncing device data:', error);
    return {
      success: false,
      dataPoints: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate sample health data for demo purposes
 */
function generateSampleHealthData(
  deviceType: WearableDeviceType,
  options: SyncOptions
): HealthDataEntry[] {
  const now = new Date();
  const startDate = options.startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const endDate = options.endDate || now;

  const data: HealthDataEntry[] = [];

  // Generate heart rate data (every hour)
  for (let time = startDate.getTime(); time <= endDate.getTime(); time += 60 * 60 * 1000) {
    data.push({
      dataType: HealthDataType.HEART_RATE,
      value: 65 + Math.random() * 30, // 65-95 bpm
      unit: 'bpm',
      deviceType,
      recordedAt: new Date(time),
    });
  }

  // Generate daily metrics
  data.push(
    {
      dataType: HealthDataType.STEPS,
      value: 8000 + Math.random() * 4000, // 8000-12000 steps
      unit: 'steps',
      deviceType,
      recordedAt: now,
    },
    {
      dataType: HealthDataType.CALORIES_BURNED,
      value: 2200 + Math.random() * 800, // 2200-3000 calories
      unit: 'kcal',
      deviceType,
      recordedAt: now,
    },
    {
      dataType: HealthDataType.ACTIVE_MINUTES,
      value: 30 + Math.random() * 60, // 30-90 minutes
      unit: 'minutes',
      deviceType,
      recordedAt: now,
    },
    {
      dataType: HealthDataType.DISTANCE,
      value: 5 + Math.random() * 5, // 5-10 km
      unit: 'km',
      deviceType,
      recordedAt: now,
    }
  );

  // Generate sleep data
  const sleepStart = new Date(now);
  sleepStart.setDate(sleepStart.getDate() - 1);
  sleepStart.setHours(22, 0, 0, 0);

  data.push(
    {
      dataType: HealthDataType.SLEEP_DURATION,
      value: 6.5 + Math.random() * 2, // 6.5-8.5 hours
      unit: 'hours',
      deviceType,
      recordedAt: sleepStart,
    },
    {
      dataType: HealthDataType.SLEEP_QUALITY,
      value: 70 + Math.random() * 25, // 70-95%
      unit: '%',
      deviceType,
      recordedAt: sleepStart,
    },
    {
      dataType: HealthDataType.SLEEP_DEEP,
      value: 1.5 + Math.random() * 1, // 1.5-2.5 hours
      unit: 'hours',
      deviceType,
      recordedAt: sleepStart,
    },
    {
      dataType: HealthDataType.SLEEP_REM,
      value: 1 + Math.random() * 1, // 1-2 hours
      unit: 'hours',
      deviceType,
      recordedAt: sleepStart,
    }
  );

  // Generate vitals (if supported by device)
  if (
    deviceType === WearableDeviceType.WHOOP ||
    deviceType === WearableDeviceType.OURA_RING ||
    deviceType === WearableDeviceType.APPLE_WATCH
  ) {
    data.push(
      {
        dataType: HealthDataType.HEART_RATE_VARIABILITY,
        value: 40 + Math.random() * 60, // 40-100 ms
        unit: 'ms',
        deviceType,
        recordedAt: now,
      },
      {
        dataType: HealthDataType.RESTING_HEART_RATE,
        value: 50 + Math.random() * 20, // 50-70 bpm
        unit: 'bpm',
        deviceType,
        recordedAt: now,
      },
      {
        dataType: HealthDataType.RECOVERY_SCORE,
        value: 60 + Math.random() * 35, // 60-95
        unit: 'score',
        deviceType,
        recordedAt: now,
      },
      {
        dataType: HealthDataType.STRESS_LEVEL,
        value: 20 + Math.random() * 50, // 20-70
        unit: 'score',
        deviceType,
        recordedAt: now,
      }
    );
  }

  return data;
}

/**
 * Schedule automatic sync for a device
 */
export async function scheduleAutoSync(deviceId: string, intervalSeconds: number = 3600) {
  // In production, this would use a job queue or cron service
  // For now, we'll just return a success indicator
  console.log(`Auto-sync scheduled for device ${deviceId} every ${intervalSeconds} seconds`);
  return true;
}

/**
 * Get device sync status
 */
export async function getDeviceSyncStatus(deviceId: string) {
  const device = await WearableService.getDevice(deviceId);
  if (!device) {
    return null;
  }

  const now = new Date();
  const lastSync = device.lastSyncedAt;
  const syncIntervalMs = device.syncFrequency * 1000;
  
  let status: 'synced' | 'pending' | 'overdue' = 'synced';
  let nextSyncAt: Date | null = null;

  if (lastSync) {
    const timeSinceSync = now.getTime() - lastSync.getTime();
    nextSyncAt = new Date(lastSync.getTime() + syncIntervalMs);

    if (timeSinceSync > syncIntervalMs * 2) {
      status = 'overdue';
    } else if (timeSinceSync > syncIntervalMs) {
      status = 'pending';
    }
  } else {
    status = 'pending';
    nextSyncAt = now;
  }

  return {
    deviceId,
    deviceType: device.deviceType,
    isConnected: device.isConnected,
    lastSyncedAt: lastSync,
    nextSyncAt,
    status,
  };
}
