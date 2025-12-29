'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Circle, Tv, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LiveEvent {
  id: string;
  name: string;
  shortName?: string;
  location: string;
  organizationName: string;
  streamUrl?: string;
  broadcastPlatform?: string;
}

export function LiveNowBanner() {
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user dismissed the popup (with 24-hour expiry)
    const dismissData = localStorage.getItem('liveNowPopupDismissed');
    if (dismissData) {
      const { timestamp } = JSON.parse(dismissData);
      const now = Date.now();
      const hoursSinceDismiss = (now - timestamp) / (1000 * 60 * 60);
      
      // Show again after 24 hours
      if (hoursSinceDismiss < 24) {
        setDismissed(true);
        setLoading(false);
        return;
      } else {
        // Clear expired dismiss
        localStorage.removeItem('liveNowPopupDismissed');
      }
    }

    // Show popup after a short delay for better UX
    const timer = setTimeout(() => {
      fetchLiveEvents();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const fetchLiveEvents = async () => {
    try {
      const response = await fetch('/api/media-hub/events?live=true');
      const data = await response.json();
      
      if (data.success && data.events && data.events.length > 0) {
        setLiveEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching live events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('liveNowPopupDismissed', JSON.stringify({
      timestamp: Date.now()
    }));
  };

  if (loading || dismissed || liveEvents.length === 0) {
    return null;
  }

  const mainEvent = liveEvents[0];

  return (
    <AnimatePresence>
      {/* Semi-transparent backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={handleDismiss}
      />

      {/* Popup Modal - Bottom-right on desktop, bottom-center on mobile */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="fixed bottom-4 right-4 left-4 md:left-auto md:w-[420px] z-40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-red-500 via-orange-500 to-red-600 text-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
            aria-label="Dismiss notification"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Live indicator */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Circle className="w-3 h-3 fill-current animate-pulse" />
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="font-bold text-sm uppercase tracking-wider">LIVE NOW</span>
              {liveEvents.length > 1 && (
                <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">
                  +{liveEvents.length - 1} more
                </span>
              )}
            </div>

            {/* Event details */}
            <div className="mb-5">
              <h3 className="text-xl font-bold mb-2">
                {mainEvent.shortName || mainEvent.name}
              </h3>
              <div className="text-sm text-white/90 space-y-1">
                <div className="flex items-center gap-2">
                  <span>📍 {mainEvent.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏆 {mainEvent.organizationName}</span>
                </div>
                {mainEvent.broadcastPlatform && (
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4" />
                    <span>{mainEvent.broadcastPlatform}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Link href="/media" className="flex-1">
                <Button
                  className="w-full bg-white text-red-600 hover:bg-white/90 font-semibold shadow-lg"
                >
                  <Tv className="w-4 h-4 mr-2" />
                  Watch Now
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                Later
              </Button>
            </div>
          </div>

          {/* Decorative shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
