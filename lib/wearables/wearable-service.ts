
import { prisma } from '@/lib/db';
import { WearableDeviceType, HealthDataType } from '@prisma/client';

export interface WearableDeviceInfo {
  deviceType: WearableDeviceType;
  deviceName: string;
  manufacturer?: string;
  model?: string;
  deviceId: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  permissions?: any;
  metadata?: any;
}

export interface HealthDataEntry {
  dataType: HealthDataType;
  value: number;
  unit: string;
  deviceType?: WearableDeviceType;
  sourceDevice?: string;
  recordedAt: Date;
  metadata?: any;
}

export class WearableService {
  /**
   * Connect a new wearable device for a user
   */
  static async connectDevice(userId: string, deviceInfo: WearableDeviceInfo) {
    try {
      // Check if device already exists
      const existingDevice = await prisma.wearableDevice.findUnique({
        where: { deviceId: deviceInfo.deviceId },
      });

      if (existingDevice) {
        // Update existing device
        return await prisma.wearableDevice.update({
          where: { deviceId: deviceInfo.deviceId },
          data: {
            ...deviceInfo,
            isConnected: true,
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Create new device
      return await prisma.wearableDevice.create({
        data: {
          userId,
          ...deviceInfo,
          isConnected: true,
          connectedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error connecting wearable device:', error);
      throw new Error('Failed to connect device');
    }
  }

  /**
   * Disconnect a wearable device
   */
  static async disconnectDevice(deviceId: string) {
    try {
      return await prisma.wearableDevice.update({
        where: { deviceId },
        data: {
          isConnected: false,
          disconnectedAt: new Date(),
          accessToken: null,
          refreshToken: null,
        },
      });
    } catch (error) {
      console.error('Error disconnecting device:', error);
      throw new Error('Failed to disconnect device');
    }
  }

  /**
   * Get all connected devices for a user
   */
  static async getUserDevices(userId: string) {
    try {
      return await prisma.wearableDevice.findMany({
        where: { userId },
        orderBy: { connectedAt: 'desc' },
      });
    } catch (error) {
      console.error('Error fetching user devices:', error);
      return [];
    }
  }

  /**
   * Get a specific device by ID
   */
  static async getDevice(deviceId: string) {
    try {
      return await prisma.wearableDevice.findUnique({
        where: { deviceId },
      });
    } catch (error) {
      console.error('Error fetching device:', error);
      return null;
    }
  }

  /**
   * Update device sync timestamp
   */
  static async updateSyncTimestamp(deviceId: string) {
    try {
      return await prisma.wearableDevice.update({
        where: { deviceId },
        data: { lastSyncedAt: new Date() },
      });
    } catch (error) {
      console.error('Error updating sync timestamp:', error);
      throw new Error('Failed to update sync timestamp');
    }
  }

  /**
   * Store health data from a wearable device
   */
  static async storeHealthData(userId: string, data: HealthDataEntry[]) {
    try {
      const entries = data.map((entry) => ({
        userId,
        ...entry,
      }));

      return await prisma.healthData.createMany({
        data: entries,
        skipDuplicates: true,
      });
    } catch (error) {
      console.error('Error storing health data:', error);
      throw new Error('Failed to store health data');
    }
  }

  /**
   * Get health data for a user within a date range
   */
  static async getHealthData(
    userId: string,
    dataTypes: HealthDataType[],
    startDate: Date,
    endDate: Date
  ) {
    try {
      return await prisma.healthData.findMany({
        where: {
          userId,
          dataType: { in: dataTypes },
          recordedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { recordedAt: 'asc' },
      });
    } catch (error) {
      console.error('Error fetching health data:', error);
      return [];
    }
  }

  /**
   * Get latest health data for specific data types
   */
  static async getLatestHealthData(userId: string, dataTypes: HealthDataType[]) {
    try {
      const data = await Promise.all(
        dataTypes.map(async (dataType) => {
          const latest = await prisma.healthData.findFirst({
            where: {
              userId,
              dataType,
            },
            orderBy: { recordedAt: 'desc' },
          });
          return latest;
        })
      );

      return data.filter((item) => item !== null);
    } catch (error) {
      console.error('Error fetching latest health data:', error);
      return [];
    }
  }

  /**
   * Get aggregated health data (average, min, max) for a time period
   */
  static async getAggregatedHealthData(
    userId: string,
    dataType: HealthDataType,
    startDate: Date,
    endDate: Date
  ) {
    try {
      const data = await prisma.healthData.findMany({
        where: {
          userId,
          dataType,
          recordedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      if (data.length === 0) {
        return null;
      }

      const values = data.map((d: any) => d.value);
      const average = values.reduce((a: any, b: any) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      return {
        dataType,
        average: Math.round(average * 100) / 100,
        min,
        max,
        count: data.length,
        unit: data[0]?.unit || '',
        startDate,
        endDate,
      };
    } catch (error) {
      console.error('Error fetching aggregated health data:', error);
      return null;
    }
  }

  /**
   * Delete old health data (for data retention policies)
   */
  static async deleteOldHealthData(userId: string, beforeDate: Date) {
    try {
      return await prisma.healthData.deleteMany({
        where: {
          userId,
          recordedAt: {
            lt: beforeDate,
          },
        },
      });
    } catch (error) {
      console.error('Error deleting old health data:', error);
      throw new Error('Failed to delete old health data');
    }
  }

  /**
   * Get health insights for Coach Kai
   */
  static async getHealthInsightsForCoach(userId: string) {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get latest vital metrics
      const latestMetrics = await this.getLatestHealthData(userId, [
        HealthDataType.RESTING_HEART_RATE,
        HealthDataType.HEART_RATE_VARIABILITY,
        HealthDataType.SLEEP_DURATION,
        HealthDataType.SLEEP_QUALITY,
        HealthDataType.STRESS_LEVEL,
        HealthDataType.RECOVERY_SCORE,
        HealthDataType.READINESS_SCORE,
      ]);

      // Get aggregated data for trends
      const sleepTrend = await this.getAggregatedHealthData(
        userId,
        HealthDataType.SLEEP_DURATION,
        last7Days,
        now
      );

      const activityTrend = await this.getAggregatedHealthData(
        userId,
        HealthDataType.STEPS,
        last7Days,
        now
      );

      const stressTrend = await this.getAggregatedHealthData(
        userId,
        HealthDataType.STRESS_LEVEL,
        last7Days,
        now
      );

      // Get today's activity
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayActivity = await this.getHealthData(
        userId,
        [HealthDataType.STEPS, HealthDataType.ACTIVE_MINUTES, HealthDataType.CALORIES_BURNED],
        todayStart,
        now
      );

      // Get connected devices
      const devices = await this.getUserDevices(userId);
      const connectedDevices = devices.filter((d: any) => d.isConnected);

      return {
        connectedDevices: connectedDevices.length,
        deviceTypes: connectedDevices.map((d: any) => d.deviceType),
        latestMetrics: latestMetrics
          .filter((m): m is NonNullable<typeof m> => m !== null)
          .map((m) => ({
            type: m.dataType,
            value: m.value,
            unit: m.unit,
            recordedAt: m.recordedAt,
          })),
        trends: {
          sleep: sleepTrend,
          activity: activityTrend,
          stress: stressTrend,
        },
        todayActivity: todayActivity.map((a: any) => ({
          type: a.dataType,
          value: a.value,
          unit: a.unit,
        })),
        lastSyncedAt: connectedDevices[0]?.lastSyncedAt || null,
      };
    } catch (error) {
      console.error('Error fetching health insights:', error);
      return null;
    }
  }
}
