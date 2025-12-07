
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
  deviceType: 'APPLE_WATCH',
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
  deviceType: 'FITBIT',
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
  deviceType: 'GARMIN',
  authUrl: 'https://connect.garmin.com/oauthConfirm',
  scopes: ['activities', 'wellness'],
  clientId: process.env.GARMIN_CLIENT_ID,
  redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/wearables/callback/garmin',
};

/**
 * Whoop connector
 */
export const WhoopConnector: DeviceConnector = {
  deviceType: 'WHOOP',
  authUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
  scopes: ['read:recovery', 'read:cycles', 'read:sleep', 'read:workout'],
  clientId: process.env.WHOOP_CLIENT_ID,
  redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/wearables/callback/whoop',
};

/**
 * Google Fit connector
 */
export const GoogleFitConnector: DeviceConnector = {
  deviceType: 'GOOGLE_FIT',
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
  deviceType: 'SAMSUNG_HEALTH',
  authUrl: 'https://eu.account.samsung.com/accounts/v1/STWS/signIn',
  scopes: ['com.samsung.health.heart_rate', 'com.samsung.health.steps'],
  clientId: process.env.SAMSUNG_HEALTH_CLIENT_ID,
  redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/wearables/callback/samsung',
};

/**
 * Oura Ring connector
 */
export const OuraConnector: DeviceConnector = {
  deviceType: 'OURA',
  authUrl: 'https://cloud.ouraring.com/oauth/authorize',
  scopes: ['daily', 'heartrate', 'workout', 'session'],
  clientId: process.env.OURA_CLIENT_ID,
  redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/wearables/callback/oura',
};

/**
 * Get connector configuration by device type
 */
export function getConnectorConfig(deviceType: WearableDeviceType): DeviceConnector | null {
  const connectors: Record<string, DeviceConnector> = {
    'APPLE_WATCH': AppleHealthConnector,
    'FITBIT': FitbitConnector,
    'GARMIN': GarminConnector,
    'WHOOP': WhoopConnector,
    'GOOGLE_FIT': GoogleFitConnector,
    'SAMSUNG_HEALTH': SamsungHealthConnector,
    'OURA': OuraConnector,
    'POLAR': AppleHealthConnector, // Uses HealthKit on iOS
    'SUUNTO': AppleHealthConnector, // Uses HealthKit on iOS
    'OTHER': AppleHealthConnector,
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
    'activities-heart': 'HEART_RATE',
    'activities-steps': 'STEPS',
    'activities-distance': 'DISTANCE',
    'activities-calories': 'CALORIES',
    'activities-minutesVeryActive': 'ACTIVE_MINUTES',
    'sleep-minutesAsleep': 'SLEEP',
  };

  // Garmin mappings
  const garminMappings: Record<string, HealthDataType> = {
    'heartRate': 'HEART_RATE',
    'steps': 'STEPS',
    'distance': 'DISTANCE',
    'calories': 'CALORIES',
    'sleepSeconds': 'SLEEP',
  };

  // Whoop mappings
  const whoopMappings: Record<string, HealthDataType> = {
    'recovery_score': 'RECOVERY_SCORE',
    'hrv': 'HRV',
    'resting_heart_rate': 'RESTING_HEART_RATE',
    'sleep_performance': 'SLEEP',
  };

  // Select appropriate mapping based on device type
  let mappings: Record<string, HealthDataType> = {};
  
  switch (deviceType) {
    case 'FITBIT':
      mappings = fitbitMappings;
      break;
    case 'GARMIN':
      mappings = garminMappings;
      break;
    case 'WHOOP':
      mappings = whoopMappings;
      break;
    default:
      // Generic mappings
      mappings = {
        heartRate: 'HEART_RATE',
        steps: 'STEPS',
        distance: 'DISTANCE',
        calories: 'CALORIES',
        sleep: 'SLEEP',
      };
  }

  return mappings[dataKey] || null;
}
