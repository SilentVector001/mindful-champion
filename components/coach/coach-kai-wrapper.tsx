
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Heart, Battery } from 'lucide-react';
import PTTAICoach from './ptt-ai-coach';

interface WearableStatus {
  connected: boolean;
  deviceName?: string;
  batteryLevel?: number;
  lastSync?: string;
}

interface CoachKaiWrapperProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export default function CoachKaiWrapper({ userId, userName, userEmail }: CoachKaiWrapperProps) {
  const [wearableStatus, setWearableStatus] = useState<WearableStatus>({ connected: false });
  const [healthInsights, setHealthInsights] = useState<any>(null);

  useEffect(() => {
    fetchWearableStatus();
    fetchHealthInsights();
  }, []);

  const fetchWearableStatus = async () => {
    try {
      const response = await fetch('/api/wearables/connect');
      if (response.ok) {
        const data = await response.json();
        if (data.devices && data.devices.length > 0) {
          const device = data.devices[0];
          setWearableStatus({
            connected: device.isConnected,
            deviceName: device.deviceType,
            batteryLevel: device.batteryLevel,
            lastSync: device.lastSyncedAt
          });
        }
      }
    } catch (error) {
      console.error('Error fetching wearable status:', error);
    }
  };

  const fetchHealthInsights = async () => {
    try {
      const response = await fetch('/api/wearables/insights');
      if (response.ok) {
        const data = await response.json();
        setHealthInsights(data.insights);
      }
    } catch (error) {
      console.error('Error fetching health insights:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Wearable Status Banner */}
      {wearableStatus.connected && (
        <Card className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Wearable Connected</p>
                <p className="text-sm text-muted-foreground">
                  {wearableStatus.deviceName} • Last sync: {wearableStatus.lastSync ? new Date(wearableStatus.lastSync).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {wearableStatus.batteryLevel && (
                <Badge variant="secondary" className="gap-1">
                  <Battery className="h-3 w-3" />
                  {wearableStatus.batteryLevel}%
                </Badge>
              )}
              <Badge variant="secondary" className="gap-1">
                <Heart className="h-3 w-3" />
                Active
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Health Insights Summary */}
      {healthInsights && healthInsights.recentData && healthInsights.recentData.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            Today's Health Snapshot
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {healthInsights.recentData.slice(0, 4).map((data: any, index: number) => (
              <div key={index} className="text-center">
                <p className="text-2xl font-bold">{data.value}</p>
                <p className="text-xs text-muted-foreground capitalize">{data.dataType.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Coach Kai Chat Interface */}
      <PTTAICoach 
        userContext={{
          name: userName,
          firstName: userName.split(' ')[0],
        }}
      />
    </div>
  );
}
