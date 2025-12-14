
'use client';

import { useCallback, useRef, useState } from 'react';
import { useSession } from './SessionManager';

interface DrillTrackingOptions {
  drillId: string;
  drillName: string;
  drillCategory: string;
}

export function useDrillTracking({ drillId, drillName, drillCategory }: DrillTrackingOptions) {
  const { sessionId } = useSession();
  const [drillCompletionId, setDrillCompletionId] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startDrill = useCallback(async () => {
    if (!sessionId) return;

    startTimeRef.current = Date.now();

    try {
      const response = await fetch('/api/tracking/drill-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          drillId,
          drillName,
          drillCategory,
          status: 'STARTED',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDrillCompletionId(data.drillCompletionId);
      }
    } catch (error) {
      console.error('Failed to track drill start:', error);
    }
  }, [sessionId, drillId, drillName, drillCategory]);

  const updateDrill = useCallback(async (status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED', data?: {
    performanceScore?: number;
    repetitions?: number;
    notes?: string;
  }) => {
    if (!drillCompletionId || !startTimeRef.current) return;

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      await fetch('/api/tracking/drill-completion', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drillCompletionId,
          status,
          endTime: new Date().toISOString(),
          timeSpent,
          ...data,
        }),
      });

      if (status === 'COMPLETED' || status === 'ABANDONED') {
        setDrillCompletionId(null);
        startTimeRef.current = null;
      }
    } catch (error) {
      console.error('Failed to update drill:', error);
    }
  }, [drillCompletionId]);

  const completeDrill = useCallback(async (data?: {
    performanceScore?: number;
    repetitions?: number;
    notes?: string;
  }) => {
    await updateDrill('COMPLETED', data);
  }, [updateDrill]);

  const abandonDrill = useCallback(async () => {
    await updateDrill('ABANDONED');
  }, [updateDrill]);

  return {
    startDrill,
    updateDrill,
    completeDrill,
    abandonDrill,
    isTracking: !!drillCompletionId,
  };
}
