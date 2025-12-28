
'use client';

/**
 * Benchmark Comparison Component
 * Shows how user compares to skill level benchmarks
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Target, Award } from 'lucide-react';

interface ComparisonResult {
  userScore: number;
  benchmarkScore: number;
  difference: number;
  percentile: number;
  category: string;
}

interface BenchmarkComparisonProps {
  comparison: {
    comparisons: ComparisonResult[];
    overallComparison: ComparisonResult;
    strengths: string[];
    weaknesses: string[];
  };
  skillLevel: string;
}

export function BenchmarkComparison({ comparison, skillLevel }: BenchmarkComparisonProps) {
  const renderDifferenceIndicator = (difference: number) => {
    if (difference > 5) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (difference < -5) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  const getDifferenceColor = (difference: number) => {
    if (difference > 5) return 'text-green-600 dark:text-green-400';
    if (difference < -5) return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 75) return 'bg-green-500';
    if (percentile >= 50) return 'bg-blue-500';
    if (percentile >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Benchmark Comparison
            </CardTitle>
            <CardDescription>
              How you compare to {skillLevel} level players
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {Math.round(comparison.overallComparison.percentile)}th Percentile
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="font-semibold">Overall Performance</h3>
                <p className="text-sm text-muted-foreground">
                  Across all metrics
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {Math.round(comparison.overallComparison.userScore)}
              </div>
              <div className="text-sm text-muted-foreground">
                vs {Math.round(comparison.overallComparison.benchmarkScore)} avg
              </div>
            </div>
          </div>
          <Progress 
            value={comparison.overallComparison.percentile} 
            className="h-3"
          />
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-muted-foreground">Percentile:</span>
            <span className="font-semibold">
              {Math.round(comparison.overallComparison.percentile)}%
            </span>
          </div>
        </div>

        {/* Strengths */}
        {comparison.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
              <TrendingUp className="h-4 w-4" />
              Your Strengths
            </h4>
            <div className="grid gap-2">
              {comparison.strengths.map((strength, index) => (
                <div
                  key={index}
                  className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    {strength}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {comparison.weaknesses.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <TrendingDown className="h-4 w-4" />
              Areas for Improvement
            </h4>
            <div className="grid gap-2">
              {comparison.weaknesses.map((weakness, index) => (
                <div
                  key={index}
                  className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800"
                >
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    {weakness}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Metrics */}
        <div className="space-y-2">
          <h4 className="font-semibold mb-3">Detailed Breakdown</h4>
          <div className="space-y-3">
            {comparison.comparisons.map((comp, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {renderDifferenceIndicator(comp.difference)}
                    <span className="font-medium text-sm">{comp.category}</span>
                  </div>
                  <span className={`text-sm font-semibold ${getDifferenceColor(comp.difference)}`}>
                    {comp.difference > 0 ? '+' : ''}{comp.difference.toFixed(1)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Your Score:</span>
                    <span className="font-semibold">{Math.round(comp.userScore)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Benchmark:</span>
                    <span className="font-semibold">{Math.round(comp.benchmarkScore)}</span>
                  </div>
                  <Progress 
                    value={comp.percentile} 
                    className={`h-2 ${getPercentileColor(comp.percentile)}`}
                  />
                  <div className="text-xs text-right text-muted-foreground">
                    {Math.round(comp.percentile)}th percentile
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
