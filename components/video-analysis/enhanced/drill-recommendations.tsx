
'use client';

/**
 * Drill Recommendations Component
 * Displays personalized drill recommendations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Clock, 
  TrendingUp, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Video
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DrillRecommendation {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: number;
  description: string;
  instructions: string[];
  focusAreas: string[];
  expectedImprovement: string;
  priority: number;
}

interface DrillRecommendationsProps {
  recommendations: {
    topRecommendations: DrillRecommendation[];
    weeklyPlan: Array<{
      day: string;
      drills: DrillRecommendation[];
    }>;
    focusAreas: string[];
  };
}

export function DrillRecommendations({ recommendations }: DrillRecommendationsProps) {
  const [expandedDrill, setExpandedDrill] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    // Return appropriate icon based on category
    return <Target className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          Personalized Drill Recommendations
        </CardTitle>
        <CardDescription>
          Based on your video analysis, here are the drills that will help you improve
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="top" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="top">Top Drills</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
          </TabsList>

          {/* Top Recommendations */}
          <TabsContent value="top" className="space-y-4">
            {/* Focus Areas */}
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                Focus Areas for Improvement
              </h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.focusAreas.map((area, index) => (
                  <Badge key={index} variant="secondary">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Drill List */}
            <div className="space-y-3">
              {recommendations.topRecommendations.map((drill, index) => (
                <Collapsible
                  key={drill.id}
                  open={expandedDrill === drill.id}
                  onOpenChange={() => setExpandedDrill(
                    expandedDrill === drill.id ? null : drill.id
                  )}
                >
                  <Card className="border-2 hover:border-purple-500 transition-colors">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
                                {index + 1}
                              </span>
                              <CardTitle className="text-base">
                                {drill.title}
                              </CardTitle>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {getCategoryIcon(drill.category)}
                                <span className="ml-1">{drill.category}</span>
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getDifficultyColor(drill.difficulty)} text-white`}
                              >
                                {drill.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {drill.duration} min
                              </Badge>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            {expandedDrill === drill.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <CardDescription className="mt-2">
                          {drill.description}
                        </CardDescription>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {/* Instructions */}
                        <div className="mb-4">
                          <h5 className="font-semibold mb-2 text-sm">Instructions:</h5>
                          <ol className="space-y-2">
                            {drill.instructions.map((instruction, idx) => (
                              <li key={idx} className="flex gap-2 text-sm">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs flex items-center justify-center font-semibold">
                                  {idx + 1}
                                </span>
                                <span className="text-muted-foreground">{instruction}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Focus Areas */}
                        <div className="mb-4">
                          <h5 className="font-semibold mb-2 text-sm">Focus Areas:</h5>
                          <div className="flex flex-wrap gap-1">
                            {drill.focusAreas.map((area, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Expected Improvement */}
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h5 className="font-semibold text-sm text-green-700 dark:text-green-300 mb-1">
                                Expected Improvement
                              </h5>
                              <p className="text-sm text-green-600 dark:text-green-400">
                                {drill.expectedImprovement}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </TabsContent>

          {/* Weekly Plan */}
          <TabsContent value="weekly" className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="font-semibold">Your Training Schedule</h4>
                  <p className="text-sm text-muted-foreground">
                    Distribute your training across the week for optimal results
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {recommendations.weeklyPlan.map((dayPlan) => (
                <Card key={dayPlan.day}>
                  <CardHeader>
                    <CardTitle className="text-base">{dayPlan.day}</CardTitle>
                    <CardDescription>
                      {dayPlan.drills.length} drill{dayPlan.drills.length !== 1 ? 's' : ''} • {' '}
                      {dayPlan.drills.reduce((sum, drill) => sum + drill.duration, 0)} minutes total
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {dayPlan.drills.map((drill) => (
                        <div
                          key={drill.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{drill.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {drill.category} • {drill.duration} min
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {drill.difficulty}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
