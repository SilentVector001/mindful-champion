
'use client';

interface TrackingEvent {
  type: 'page_view' | 'video_interaction' | 'activity_event';
  data: any;
}

class TrackingBatcher {
  private events: TrackingEvent[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.startBatching();
    }
  }

  private startBatching() {
    this.intervalId = setInterval(() => {
      this.flush();
    }, this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  addEvent(event: TrackingEvent) {
    this.events.push(event);

    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await fetch('/api/tracking/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend }),
      });
    } catch (error) {
      console.error('Failed to send batch events:', error);
      // Re-add events to queue on failure
      this.events.unshift(...eventsToSend);
    }
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.flush();
  }
}

// Singleton instance
let batcherInstance: TrackingBatcher | null = null;

export function getTrackingBatcher(): TrackingBatcher {
  if (!batcherInstance) {
    batcherInstance = new TrackingBatcher();
  }
  return batcherInstance;
}
