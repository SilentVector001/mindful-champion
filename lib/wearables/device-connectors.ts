
/**
 * Device-specific connectors for various wearable platforms
 * Each connector handles OAuth flows and data synchronization
 */

import { WearableDeviceType, HealthDataType } from '@/lib/prisma-types';

export interface DeviceConnector {
  deviceType: WearableDeviceType;
  authUrl: string;
  scopes: string[];
  clientId?: string;
  redirectUri: string;
}

export interface SyncResult {
  success: boolean;
  dataPoints: number;
  error?: string;
}

/**
 * Apple Health / HealthKit connector
 * Note: Requires native iOS app integration
 */
export const AppleHealthConnector: DeviceConnector = {
  deviceType: WearableDeviceType.APPLE_WATCH,
  authUrl: 'https://developer.apple.com/documentation/healthkit',
  scopes: [
    'HKQuantityTypeIdentifierHeartRate',
    'HKQuantityTypeIdentifierStepCount',
    'HKQuantityTypeIdentifierDistanceWalkingRunning',
    'HKQuantityTypeIdentifierActiveEnergyBurned',
    'HKCategoryTypeIdentifierSleepAnalysis',
  ],
  redirectUri: '/api/wearables/callback/apple',
};

/**
 * Fitbit connector
 */
export const FitbitConnector: DeviceConnector = {
  deviceType: WearableDeviceType.FITBIT,
  authUrl: 'https://www.fitbit.com/oauth2/authorize',
  scopes: [
    'activity',
    'heartrate',
    'sleep',
    'weight',
    'nutrition',
    'profile',
  ],
  clientId: process.env.FITBIT_CLIENT_ID,
  redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/wearables/callback/fitbit',
};

/**
 * Garmin connector
 */
export const GarminConnector: DeviceConnector = {
  deviceType: WearableDeviceType.GARMIN,
  authUrl: 'https://connect.garmin.com/oauthConfirm',
  scopes: ['activities', 'wellness'],
  clientId: process.env.GARMIN_CLIENT_ID,
  redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/wearables/callback/garmin',
};

/**
 * Whoop connector
 */
export const WhoopConnector: DeviceConnector = {
  deviceType: WearableDeviceType.WHOOP,
  authUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
  scopes: ['read:recovery', 'read:cycles', 'read:sleep', 'read:workout'],
  clientId: process.env.WHOOP_CLIENT_ID,
  redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/wearables/callback/whoop',
};

/**
 * Google Fit connector
 */
export const GoogleFitConnector: DeviceConnector = {
  deviceType: WearableDeviceType.GOOGLE_FIT,
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  scopes: [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
  ],
  clientId: process.env.GOOGLE_FIT_CLIENT_ID,
  redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/wearables/callback/google-fit',
};

/**
 * Samsung Health connector
 */
export const SamsungHealthConnector: DeviceConnector = {
  deviceType: WearableDeviceType.SAMSUNG_HEALTH,
  authUrl: 'https://eu.account.samsung.com/accounts/v1/STWS/signIn',
  scopes: ['com.samsung.health.heart_rate', 'com.samsung.health.steps'],
  clientId: process.env.SAMSUNG_HEALTH_CLIENT_ID,
  redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/wearables/callback/samsung',
};

/**
 * Oura Ring connector
 */
export const OuraConnector: DeviceConnector = {
  deviceType: WearableDeviceType.OURA_RING,
  authUrl: 'https://cloud.ouraring.com/oauth/authorize',
  scopes: ['daily', 'heartrate', 'workout', 'session'],
  clientId: process.env.OURA_CLIENT_ID,
  redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/wearables/callback/oura',
};

/**
 * Get connector configuration by device type
 */
export function getConnectorConfig(deviceType: WearableDeviceType): DeviceConnector | null {
  const connectors: Record<WearableDeviceType, DeviceConnector> = {
    [WearableDeviceType.APPLE_WATCH]: AppleHealthConnector,
    [WearableDeviceType.FITBIT]: FitbitConnector,
    [WearableDeviceType.GARMIN]: GarminConnector,
    [WearableDeviceType.WHOOP]: WhoopConnector,
    [WearableDeviceType.GOOGLE_FIT]: GoogleFitConnector,
    [WearableDeviceType.SAMSUNG_HEALTH]: SamsungHealthConnector,
    [WearableDeviceType.OURA_RING]: OuraConnector,
    [WearableDeviceType.POLAR]: AppleHealthConnector, // Uses HealthKit on iOS
    [WearableDeviceType.SUUNTO]: AppleHealthConnector, // Uses HealthKit on iOS
    [WearableDeviceType.OTHER]: AppleHealthConnector,
  };

  return connectors[deviceType] || null;
}

/**
 * Build OAuth authorization URL
 */
export function buildAuthUrl(deviceType: WearableDeviceType, state: string): string {
  const connector = getConnectorConfig(deviceType);
  if (!connector) {
    throw new Error(`Unsupported device type: ${deviceType}`);
  }

  const params = new URLSearchParams({
    client_id: connector.clientId || '',
    redirect_uri: connector.redirectUri,
    response_type: 'code',
    scope: connector.scopes.join(' '),
    state,
  });

  return `${connector.authUrl}?${params.toString()}`;
}

/**
 * Map device-specific data to our HealthDataType enum
 */
export function mapToHealthDataType(deviceType: WearableDeviceType, dataKey: string): HealthDataType | null {
  // Fitbit mappings
  const fitbitMappings: Record<string, HealthDataType> = {
    'activities-heart': HealthDataType.HEART_RATE,
    'activities-steps': HealthDataType.STEPS,
    'activities-distance': HealthDataType.DISTANCE,
    'activities-calories': HealthDataType.CALORIES_BURNED,
    'activities-minutesVeryActive': HealthDataType.ACTIVE_MINUTES,
    'sleep-minutesAsleep': HealthDataType.SLEEP_DURATION,
  };

  // Garmin mappings
  const garminMappings: Record<string, HealthDataType> = {
    'heartRate': HealthDataType.HEART_RATE,
    'steps': HealthDataType.STEPS,
    'distance': HealthDataType.DISTANCE,
    'calories': HealthDataType.CALORIES_BURNED,
    'sleepSeconds': HealthDataType.SLEEP_DURATION,
  };

  // Whoop mappings
  const whoopMappings: Record<string, HealthDataType> = {
    'recovery_score': HealthDataType.RECOVERY_SCORE,
    'hrv': HealthDataType.HEART_RATE_VARIABILITY,
    'resting_heart_rate': HealthDataType.RESTING_HEART_RATE,
    'sleep_performance': HealthDataType.SLEEP_QUALITY,
  };

  // Select appropriate mapping based on device type
  let mappings: Record<string, HealthDataType> = {};
  
  switch (deviceType) {
    case WearableDeviceType.FITBIT:
      mappings = fitbitMappings;
      break;
    case WearableDeviceType.GARMIN:
      mappings = garminMappings;
      break;
    case WearableDeviceType.WHOOP:
      mappings = whoopMappings;
      break;
    default:
      // Generic mappings
      mappings = {
        heartRate: HealthDataType.HEART_RATE,
        steps: HealthDataType.STEPS,
        distance: HealthDataType.DISTANCE,
        calories: HealthDataType.CALORIES_BURNED,
        sleep: HealthDataType.SLEEP_DURATION,
      };
  }

  return mappings[dataKey] || null;
}
