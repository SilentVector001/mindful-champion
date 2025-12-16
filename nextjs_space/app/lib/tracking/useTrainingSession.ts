
'use client';

import { useCallback, useRef, useState } from 'react';

interface TrainingSessionData {
  sessionType: string;
  activities: any[];
  totalDuration: number;
  videosWatched?: number;
  drillsCompleted?: number;
  programDayCompleted?: number;
  programId?: string;
  satisfactionRating?: number;
  notes?: string;
}

export function useTrainingSession() {
  const [isTracking, setIsTracking] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const activitiesRef = useRef<any[]>([]);

  const startSession = useCallback((sessionType: string) => {
    startTimeRef.current = Date.now();
    activitiesRef.current = [];
    setIsTracking(true);
  }, []);

  const addActivity = useCallback((activity: any) => {
    activitiesRef.current.push({
      ...activity,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const endSession = useCallback(async (data: Partial<TrainingSessionData>) => {
    if (!startTimeRef.current) return;

    const totalDuration = Math.floor((Date.now() - startTimeRef.current) / 60000); // in minutes

    try {
      await fetch('/api/tracking/training-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          activities: activitiesRef.current,
          totalDuration,
        }),
      });

      // Reset state
      startTimeRef.current = null;
      activitiesRef.current = [];
      setIsTracking(false);
    } catch (error) {
      console.error('Failed to track training session:', error);
    }
  }, []);

  return {
    isTracking,
    startSession,
    addActivity,
    endSession,
  };
}
