
/**
 * Comparison Metrics System
 * Compares user performance against benchmarks and tracks progress
 */

import { TechniqueMetrics } from '../pose-detection/pickleball-technique-analyzer';
import { prisma } from '@/lib/db';

export interface BenchmarkMetrics {
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  metrics: TechniqueMetrics;
}

export interface ComparisonResult {
  userScore: number;
  benchmarkScore: number;
  difference: number; // positive means user is above benchmark
  percentile: number; // 0-100
  category: string;
}

export interface ProgressData {
  date: Date;
  overallScore: number;
  techniqueMetrics: TechniqueMetrics;
}

export interface ProgressComparison {
  improvement: number; // percentage improvement
  trend: 'improving' | 'stable' | 'declining';
  bestScore: number;
  worstScore: number;
  averageScore: number;
  dataPoints: ProgressData[];
  insights: string[];
}

export class MetricsComparisonEngine {
  private benchmarks: BenchmarkMetrics[] = [
    {
      level: 'beginner',
      metrics: {
        serveArmAngle: 65,
        serveFollowThrough: 60,
        serveBodyRotation: 55,
        stanceWidth: 60,
        stanceBalance: 65,
        splitStepTiming: 60,
        footworkAgility: 58,
        paddleHeight: 62,
        paddleAngle: 60,
        paddleReadyPosition: 65,
        bodyAlignment: 60,
        readyPosition: 62,
        centerOfGravity: 60,
        overallTechnique: 61,
      },
    },
    {
      level: 'intermediate',
      metrics: {
        serveArmAngle: 75,
        serveFollowThrough: 73,
        serveBodyRotation: 72,
        stanceWidth: 75,
        stanceBalance: 77,
        splitStepTiming: 74,
        footworkAgility: 73,
        paddleHeight: 75,
        paddleAngle: 76,
        paddleReadyPosition: 77,
        bodyAlignment: 75,
        readyPosition: 74,
        centerOfGravity: 75,
        overallTechnique: 75,
      },
    },
    {
      level: 'advanced',
      metrics: {
        serveArmAngle: 85,
        serveFollowThrough: 84,
        serveBodyRotation: 83,
        stanceWidth: 85,
        stanceBalance: 87,
        splitStepTiming: 86,
        footworkAgility: 85,
        paddleHeight: 85,
        paddleAngle: 86,
        paddleReadyPosition: 87,
        bodyAlignment: 86,
        readyPosition: 85,
        centerOfGravity: 85,
        overallTechnique: 85,
      },
    },
    {
      level: 'professional',
      metrics: {
        serveArmAngle: 93,
        serveFollowThrough: 92,
        serveBodyRotation: 91,
        stanceWidth: 93,
        stanceBalance: 94,
        splitStepTiming: 93,
        footworkAgility: 92,
        paddleHeight: 93,
        paddleAngle: 94,
        paddleReadyPosition: 94,
        bodyAlignment: 93,
        readyPosition: 92,
        centerOfGravity: 93,
        overallTechnique: 93,
      },
    },
  ];

  /**
   * Compare user metrics against benchmark for their level
   */
  compareAgainstBenchmark(
    userMetrics: TechniqueMetrics,
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional' = 'intermediate'
  ): {
    comparisons: ComparisonResult[];
    overallComparison: ComparisonResult;
    strengths: string[];
    weaknesses: string[];
  } {
    const benchmark = this.benchmarks.find(b => b.level === skillLevel);
    if (!benchmark) {
      throw new Error(`Benchmark not found for skill level: ${skillLevel}`);
    }

    const comparisons: ComparisonResult[] = [];
    const metricNames: Array<keyof TechniqueMetrics> = [
      'serveArmAngle',
      'serveFollowThrough',
      'serveBodyRotation',
      'stanceWidth',
      'stanceBalance',
      'splitStepTiming',
      'footworkAgility',
      'paddleHeight',
      'paddleAngle',
      'paddleReadyPosition',
      'bodyAlignment',
      'readyPosition',
      'centerOfGravity',
    ];

    // Compare each metric
    for (const metricName of metricNames) {
      const userScore = userMetrics[metricName];
      const benchmarkScore = benchmark.metrics[metricName];
      const difference = userScore - benchmarkScore;
      const percentile = this.calculatePercentile(userScore, benchmarkScore, skillLevel);

      comparisons.push({
        userScore,
        benchmarkScore,
        difference,
        percentile,
        category: this.formatMetricName(metricName),
      });
    }

    // Overall comparison
    const overallComparison = comparisons.reduce(
      (acc, comp) => ({
        userScore: acc.userScore + comp.userScore,
        benchmarkScore: acc.benchmarkScore + comp.benchmarkScore,
        difference: acc.difference + comp.difference,
        percentile: acc.percentile + comp.percentile,
        category: 'Overall',
      }),
      { userScore: 0, benchmarkScore: 0, difference: 0, percentile: 0, category: 'Overall' }
    );

    overallComparison.userScore /= comparisons.length;
    overallComparison.benchmarkScore /= comparisons.length;
    overallComparison.difference /= comparisons.length;
    overallComparison.percentile /= comparisons.length;

    // Identify strengths and weaknesses
    const strengths = comparisons
      .filter(c => c.difference > 5)
      .map(c => c.category)
      .slice(0, 3);

    const weaknesses = comparisons
      .filter(c => c.difference < -5)
      .map(c => c.category)
      .slice(0, 3);

    return {
      comparisons,
      overallComparison,
      strengths,
      weaknesses,
    };
  }

  /**
   * Track progress over time by fetching user's previous analyses
   */
  async trackProgress(userId: string): Promise<ProgressComparison> {
    // Fetch user's video analyses from database
    const analyses = await prisma.videoAnalysis.findMany({
      where: {
        userId,
        analysisStatus: 'COMPLETED',
      },
      orderBy: {
        analyzedAt: 'desc',
      },
      take: 10, // Last 10 analyses
    });

    if (analyses.length < 2) {
      return {
        improvement: 0,
        trend: 'stable',
        bestScore: 0,
        worstScore: 0,
        averageScore: 0,
        dataPoints: [],
        insights: ['Upload more videos to track your progress over time!'],
      };
    }

    // Extract progress data
    const dataPoints: ProgressData[] = analyses.map(analysis => ({
      date: analysis.analyzedAt || analysis.uploadedAt,
      overallScore: analysis.overallScore || 75,
      techniqueMetrics: (analysis.technicalScores as any) || this.getDefaultMetrics(),
    }));

    // Calculate statistics
    const scores = dataPoints.map(d => d.overallScore);
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Calculate improvement (compare latest to oldest)
    const latestScore = scores[0];
    const oldestScore = scores[scores.length - 1];
    const improvement = ((latestScore - oldestScore) / oldestScore) * 100;

    // Determine trend
    const recentScores = scores.slice(0, 3);
    const olderScores = scores.slice(3);
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.length > 0 
      ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length 
      : recentAvg;

    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentAvg > olderAvg + 2) trend = 'improving';
    else if (recentAvg < olderAvg - 2) trend = 'declining';

    // Generate insights
    const insights = this.generateProgressInsights(
      dataPoints,
      improvement,
      trend,
      bestScore,
      averageScore
    );

    return {
      improvement,
      trend,
      bestScore,
      worstScore,
      averageScore,
      dataPoints,
      insights,
    };
  }

  /**
   * Calculate percentile based on user score vs benchmark
   */
  private calculatePercentile(
    userScore: number,
    benchmarkScore: number,
    skillLevel: string
  ): number {
    // Simple percentile calculation
    // User scoring above benchmark is in top 50-100 percentile
    // User scoring below is in 0-50 percentile
    const difference = userScore - benchmarkScore;
    const maxDifference = 20; // assume max difference is 20 points

    if (difference >= 0) {
      // Above benchmark: 50-100 percentile
      return 50 + (Math.min(difference, maxDifference) / maxDifference) * 50;
    } else {
      // Below benchmark: 0-50 percentile
      return 50 + (difference / maxDifference) * 50;
    }
  }

  /**
   * Format metric name for display
   */
  private formatMetricName(metricName: string): string {
    return metricName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Generate progress insights
   */
  private generateProgressInsights(
    dataPoints: ProgressData[],
    improvement: number,
    trend: 'improving' | 'stable' | 'declining',
    bestScore: number,
    averageScore: number
  ): string[] {
    const insights: string[] = [];

    if (improvement > 10) {
      insights.push(`🎉 Excellent progress! You've improved by ${improvement.toFixed(1)}% overall.`);
    } else if (improvement > 5) {
      insights.push(`👍 Good progress! You've improved by ${improvement.toFixed(1)}%.`);
    } else if (improvement < -5) {
      insights.push(`⚠️ Your scores have declined by ${Math.abs(improvement).toFixed(1)}%. Let's refocus on fundamentals.`);
    }

    if (trend === 'improving') {
      insights.push('📈 Your recent performance shows consistent improvement!');
    } else if (trend === 'declining') {
      insights.push('📉 Recent performance shows a decline. Review your training routine.');
    } else {
      insights.push('➡️ Your performance has been stable. Time to push for the next level!');
    }

    if (bestScore > averageScore + 5) {
      insights.push(`🏆 Your best score (${bestScore}) shows you can perform at a higher level consistently.`);
    }

    if (dataPoints.length >= 5) {
      insights.push('📊 You have enough data for meaningful progress tracking!');
    }

    return insights;
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): TechniqueMetrics {
    return {
      serveArmAngle: 75,
      serveFollowThrough: 75,
      serveBodyRotation: 75,
      stanceWidth: 75,
      stanceBalance: 75,
      splitStepTiming: 75,
      footworkAgility: 75,
      paddleHeight: 75,
      paddleAngle: 75,
      paddleReadyPosition: 75,
      bodyAlignment: 75,
      readyPosition: 75,
      centerOfGravity: 75,
      overallTechnique: 75,
    };
  }
}
