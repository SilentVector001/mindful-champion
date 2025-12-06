
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SessionContextType {
  sessionId: string | null;
  isReady: boolean;
}

const SessionContext = createContext<SessionContextType>({
  sessionId: null,
  isReady: false,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check for existing session in localStorage
    let currentSessionId = localStorage.getItem('trackingSessionId');
    
    if (!currentSessionId) {
      currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('trackingSessionId', currentSessionId);
    }

    // Start session with server
    const startSession = async () => {
      try {
        const referrer = document.referrer || 'direct';
        const response = await fetch('/api/tracking/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            action: 'start',
            referrer,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSessionId(data.sessionId);
          setIsReady(true);
        }
      } catch (error) {
        console.error('Failed to start session:', error);
        // Still set the session ID so tracking can continue
        setSessionId(currentSessionId);
        setIsReady(true);
      }
    };

    startSession();

    // Send heartbeat every 30 seconds to keep session alive
    const heartbeatInterval = setInterval(async () => {
      try {
        await fetch('/api/tracking/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            action: 'heartbeat',
          }),
        });
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, 30000);

    // End session when user leaves
    const endSession = async () => {
      try {
        await fetch('/api/tracking/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            action: 'end',
          }),
        });
        localStorage.removeItem('trackingSessionId');
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    };

    // Listen for page unload
    window.addEventListener('beforeunload', endSession);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', endSession);
    };
  }, []);

  return (
    <SessionContext.Provider value={{ sessionId, isReady }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
