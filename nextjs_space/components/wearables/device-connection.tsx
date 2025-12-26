'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Watch,
  Activity,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Wifi,
  WifiOff,
  Plus,
  Trash2,
} from 'lucide-react';

interface WearableDevice {
  id: string;
  deviceType: string;
  deviceName: string;
  manufacturer?: string;
  isConnected: boolean;
  lastSyncedAt?: Date;
  connectedAt: Date;
}

const DEVICE_ICONS: Record<string, string> = {
  APPLE_WATCH: '⌚',
  FITBIT: '🏃',
  GARMIN: '🎯',
  WHOOP: '💪',
  SAMSUNG_HEALTH: '📱',
  GOOGLE_FIT: '🔵',
  OURA_RING: '💍',
  POLAR: '❄️',
  SUUNTO: '🏔️',
  OTHER: '📊',
};

const AVAILABLE_DEVICES = [
  { type: 'APPLE_WATCH', name: 'Apple Watch', description: 'Sync health data from Apple Health' },
  { type: 'FITBIT', name: 'Fitbit', description: 'Track activity, heart rate, and sleep' },
  { type: 'GARMIN', name: 'Garmin', description: 'Connect your Garmin fitness device' },
  { type: 'WHOOP', name: 'Whoop', description: 'Advanced recovery and strain tracking' },
  { type: 'GOOGLE_FIT', name: 'Google Fit', description: 'Sync data from Google Fit' },
  { type: 'SAMSUNG_HEALTH', name: 'Samsung Health', description: 'Connect Samsung Health data' },
  { type: 'OURA_RING', name: 'Oura Ring', description: 'Track sleep and readiness' },
];

export default function DeviceConnection() {
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/wearables/connect');
      if (!response.ok) throw new Error('Failed to fetch devices');
      const data = await response.json();
      setDevices(data.devices || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const connectDevice = async (deviceType: string, deviceName: string) => {
    console.log('Connecting device:', deviceType, deviceName);
    setConnecting(deviceType);
    
    try {
      toast.loading(`Connecting ${deviceName}...`, { id: 'device-connect' });
      
      // Use demo connection for now
      const response = await fetch('/api/wearables/demo-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceType, deviceName }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to connect device (${response.status})`);
      }

      const data = await response.json();
      console.log('Device connected successfully:', data);
      toast.success(`✅ ${deviceName} connected successfully with sample data!`, { id: 'device-connect', duration: 3000 });
      await fetchDevices();
    } catch (error: any) {
      console.error('Error connecting device:', error);
      toast.error(`❌ Failed to connect device: ${error.message}`, { id: 'device-connect', duration: 5000 });
    } finally {
      setConnecting(null);
    }
  };

  const disconnectDevice = async (deviceId: string, deviceName: string) => {
    try {
      const response = await fetch('/api/wearables/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });

      if (!response.ok) throw new Error('Failed to disconnect device');

      toast.success(`${deviceName} disconnected`);
      await fetchDevices();
    } catch (error) {
      console.error('Error disconnecting device:', error);
      toast.error('Failed to disconnect device');
    }
  };

  const syncDevice = async (deviceId: string, deviceName: string) => {
    setSyncing(deviceId);
    try {
      const response = await fetch('/api/wearables/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });

      if (!response.ok) throw new Error('Failed to sync device');

      const data = await response.json();
      toast.success(`${deviceName} synced successfully! ${data.dataPoints} data points updated.`);
      await fetchDevices();
    } catch (error) {
      console.error('Error syncing device:', error);
      toast.error('Failed to sync device');
    } finally {
      setSyncing(null);
    }
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never synced';
    const now = new Date();
    const syncDate = new Date(date);
    const diffMs = now.getTime() - syncDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connected Devices */}
      {devices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Connected Devices
            </CardTitle>
            <CardDescription>
              Manage your connected wearable devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{DEVICE_ICONS[device.deviceType] || '📊'}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{device.deviceName}</h4>
                        {device.isConnected ? (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Wifi className="h-3 w-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <WifiOff className="h-3 w-3" />
                            Disconnected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {device.manufacturer && `${device.manufacturer} • `}
                        Last synced: {formatLastSync(device.lastSyncedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncDevice(device.id, device.deviceName)}
                      disabled={!device.isConnected || syncing === device.id}
                    >
                      {syncing === device.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      <span className="ml-2">Sync</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => disconnectDevice(device.id, device.deviceName)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Connect New Device
          </CardTitle>
          <CardDescription>
            Choose a device to connect and start tracking your health data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_DEVICES.map((device) => {
              const isConnected = devices.some((d) => d.deviceType === device.type);
              return (
                <div
                  key={device.type}
                  className={`p-4 border rounded-lg ${
                    isConnected
                      ? 'bg-accent/20 border-primary/50'
                      : 'bg-card hover:bg-accent/50'
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="text-4xl">{DEVICE_ICONS[device.type]}</div>
                    <h4 className="font-semibold">{device.name}</h4>
                    <p className="text-sm text-muted-foreground">{device.description}</p>
                    <Button
                      size="sm"
                      onClick={() => connectDevice(device.type, device.name)}
                      disabled={isConnected || connecting === device.type}
                      className="w-full"
                    >
                      {connecting === device.type ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Connecting...
                        </>
                      ) : isConnected ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Connected
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Coach Kai Integration Info */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Coach Kai Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Your wearable data is now available to Coach Kai!</strong>
            </p>
            <p className="text-muted-foreground">
              Coach Kai can now access your health metrics including heart rate, sleep quality, 
              recovery scores, and activity levels to provide personalized coaching advice and 
              training recommendations tailored to your current physical state.
            </p>
            <div className="flex items-center gap-2 mt-4 p-3 bg-background rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">
                Real-time health insights enabled for Coach Kai
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
