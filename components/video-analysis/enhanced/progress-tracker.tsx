
'use client';

/**
 * Progress Tracker Component
 * Visualizes progress over time
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar,
  BarChart3,
  Trophy,
  Info
} from 'lucide-react';

interface ProgressData {
  date: Date;
  overallScore: number;
  techniqueMetrics: any;
}

interface ProgressTrackerProps {
  progress: {
    improvement: number;
    trend: 'improving' | 'stable' | 'declining';
    bestScore: number;
    worstScore: number;
    averageScore: number;
    dataPoints: ProgressData[];
    insights: string[];
  };
}

export function ProgressTracker({ progress }: ProgressTrackerProps) {
  const getTrendIcon = () => {
    switch (progress.trend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getTrendColor = () => {
    switch (progress.trend) {
      case 'improving':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      case 'declining':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
    }
  };

  const getTrendBadgeVariant = () => {
    switch (progress.trend) {
      case 'improving':
        return 'default';
      case 'declining':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate simple progress visualization
  const maxScore = Math.max(...progress.dataPoints.map(d => d.overallScore));
  const minScore = Math.min(...progress.dataPoints.map(d => d.overallScore));
  const scoreRange = maxScore - minScore || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          Progress Tracking
        </CardTitle>
        <CardDescription>
          Your performance over {progress.dataPoints.length} video{progress.dataPoints.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Trend */}
        <div className={`p-4 rounded-lg border ${getTrendColor()}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {getTrendIcon()}
              <div>
                <h3 className="font-semibold capitalize">{progress.trend} Trend</h3>
                <p className="text-sm text-muted-foreground">
                  {progress.improvement > 0 ? '+' : ''}{progress.improvement.toFixed(1)}% change
                </p>
              </div>
            </div>
            <Badge variant={getTrendBadgeVariant()} className="text-sm px-3 py-1">
              {progress.improvement > 0 ? '+' : ''}{progress.improvement.toFixed(1)}%
            </Badge>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg border bg-card">
            <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{Math.round(progress.bestScore)}</div>
            <div className="text-xs text-muted-foreground">Best Score</div>
          </div>
          <div className="text-center p-4 rounded-lg border bg-card">
            <BarChart3 className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{Math.round(progress.averageScore)}</div>
            <div className="text-xs text-muted-foreground">Average</div>
          </div>
          <div className="text-center p-4 rounded-lg border bg-card">
            <Calendar className="h-5 w-5 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{progress.dataPoints.length}</div>
            <div className="text-xs text-muted-foreground">Videos</div>
          </div>
        </div>

        {/* Progress Visualization */}
        <div>
          <h4 className="font-semibold mb-3 text-sm">Score History</h4>
          <div className="space-y-2">
            {progress.dataPoints.slice().reverse().map((point, index) => {
              const heightPercent = ((point.overallScore - minScore) / scoreRange) * 100;
              const isLatest = index === 0;
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-muted-foreground text-right">
                    {formatDate(point.date)}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isLatest 
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                        style={{ width: `${heightPercent}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm font-semibold">
                      {Math.round(point.overallScore)}
                    </div>
                    {isLatest && (
                      <Badge variant="secondary" className="text-xs">Latest</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        {progress.insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm mb-3">Progress Insights</h4>
            {progress.insights.map((insight, index) => (
              <Alert key={index}>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {insight}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Insufficient Data Message */}
        {progress.dataPoints.length < 2 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Upload more videos to see detailed progress tracking and trends!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
