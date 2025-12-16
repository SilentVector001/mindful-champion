'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  Activity,
  Moon,
  TrendingUp,
  TrendingDown,
  Zap,
  Brain,
  Droplet,
  Thermometer,
  Loader2,
} from 'lucide-react';

interface HealthMetric {
  type: string;
  value: number;
  unit: string;
  recordedAt: Date;
}

interface TrendData {
  dataType: string;
  average: number;
  min: number;
  max: number;
  count: number;
  unit: string;
}

interface HealthInsights {
  connectedDevices: number;
  deviceTypes: string[];
  latestMetrics: HealthMetric[];
  trends: {
    sleep?: TrendData;
    activity?: TrendData;
    stress?: TrendData;
  };
  todayActivity: { type: string; value: number; unit: string }[];
  lastSyncedAt?: Date;
}

export default function WearableAnalytics() {
  const [insights, setInsights] = useState<HealthInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/wearables/insights');
      if (!response.ok) {
        if (response.status === 404) {
          setInsights(null);
          return;
        }
        throw new Error('Failed to fetch insights');
      }
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (type: string) => {
    const iconMap: Record<string, JSX.Element> = {
      HEART_RATE: <Heart className="h-5 w-5" />,
      RESTING_HEART_RATE: <Heart className="h-5 w-5" />,
      HEART_RATE_VARIABILITY: <Activity className="h-5 w-5" />,
      STEPS: <Activity className="h-5 w-5" />,
      SLEEP_DURATION: <Moon className="h-5 w-5" />,
      SLEEP_QUALITY: <Moon className="h-5 w-5" />,
      STRESS_LEVEL: <Brain className="h-5 w-5" />,
      RECOVERY_SCORE: <Zap className="h-5 w-5" />,
      READINESS_SCORE: <TrendingUp className="h-5 w-5" />,
      BLOOD_OXYGEN: <Droplet className="h-5 w-5" />,
      BODY_TEMPERATURE: <Thermometer className="h-5 w-5" />,
    };
    return iconMap[type] || <Activity className="h-5 w-5" />;
  };

  const getMetricStatus = (type: string, value: number): 'good' | 'warning' | 'poor' => {
    // Simple heuristics for metric status
    const thresholds: Record<string, { good: number; warning: number }> = {
      RECOVERY_SCORE: { good: 70, warning: 50 },
      READINESS_SCORE: { good: 70, warning: 50 },
      SLEEP_QUALITY: { good: 75, warning: 60 },
      STRESS_LEVEL: { good: 40, warning: 60 }, // Lower is better
      HEART_RATE_VARIABILITY: { good: 50, warning: 30 },
    };

    const threshold = thresholds[type];
    if (!threshold) return 'good';

    if (type === 'STRESS_LEVEL') {
      // For stress, lower is better
      if (value <= threshold.good) return 'good';
      if (value <= threshold.warning) return 'warning';
      return 'poor';
    } else {
      // For others, higher is better
      if (value >= threshold.good) return 'good';
      if (value >= threshold.warning) return 'warning';
      return 'poor';
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'poor') => {
    const colors = {
      good: 'text-green-500',
      warning: 'text-yellow-500',
      poor: 'text-red-500',
    };
    return colors[status];
  };

  const formatMetricName = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">No Health Data Yet</h3>
            <p className="text-muted-foreground">
              Connect a wearable device to start tracking your health metrics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connected Devices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connected Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.connectedDevices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {insights.deviceTypes.join(', ')}
            </p>
          </CardContent>
        </Card>

        {/* Today's Steps */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Steps Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const steps = insights.todayActivity.find((a) => a.type === 'STEPS');
              return steps ? (
                <>
                  <div className="text-2xl font-bold">{Math.round(steps.value).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Daily activity</p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No data</div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Active Minutes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Active Minutes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const active = insights.todayActivity.find((a) => a.type === 'ACTIVE_MINUTES');
              return active ? (
                <>
                  <div className="text-2xl font-bold">{Math.round(active.value)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Today</p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No data</div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Calories Burned */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Calories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const calories = insights.todayActivity.find((a) => a.type === 'CALORIES_BURNED');
              return calories ? (
                <>
                  <div className="text-2xl font-bold">{Math.round(calories.value)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Burned today</p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No data</div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Latest Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Health Metrics</CardTitle>
          <CardDescription>Your most recent health measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.latestMetrics.map((metric, index) => {
              const status = getMetricStatus(metric.type, metric.value);
              return (
                <div key={index} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getMetricIcon(metric.type)}
                      <span className="text-sm font-medium">
                        {formatMetricName(metric.type)}
                      </span>
                    </div>
                    <Badge variant={status === 'good' ? 'default' : 'secondary'}>
                      {status === 'good' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${getStatusColor(status)}`}>
                      {Math.round(metric.value)}
                    </span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(metric.recordedAt).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 7-Day Trends */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Trends</CardTitle>
          <CardDescription>Average, min, and max values over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sleep Trend */}
            {insights.trends.sleep && (
              <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="h-5 w-5" />
                  <span className="font-semibold">Sleep Duration</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average:</span>
                    <span className="font-medium">
                      {insights.trends.sleep.average.toFixed(1)} {insights.trends.sleep.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min:</span>
                    <span>{insights.trends.sleep.min.toFixed(1)} {insights.trends.sleep.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max:</span>
                    <span>{insights.trends.sleep.max.toFixed(1)} {insights.trends.sleep.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data points:</span>
                    <span>{insights.trends.sleep.count}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Trend */}
            {insights.trends.activity && (
              <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-5 w-5" />
                  <span className="font-semibold">Daily Steps</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average:</span>
                    <span className="font-medium">
                      {Math.round(insights.trends.activity.average).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min:</span>
                    <span>{Math.round(insights.trends.activity.min).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max:</span>
                    <span>{Math.round(insights.trends.activity.max).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data points:</span>
                    <span>{insights.trends.activity.count}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stress Trend */}
            {insights.trends.stress && (
              <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5" />
                  <span className="font-semibold">Stress Level</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average:</span>
                    <span className="font-medium">
                      {insights.trends.stress.average.toFixed(1)} {insights.trends.stress.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min:</span>
                    <span>{insights.trends.stress.min.toFixed(1)} {insights.trends.stress.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max:</span>
                    <span>{insights.trends.stress.max.toFixed(1)} {insights.trends.stress.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data points:</span>
                    <span>{insights.trends.stress.count}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
