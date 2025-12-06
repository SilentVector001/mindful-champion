
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, Radio, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PushToTalkProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  language?: string;
  className?: string;
}

type PTTState = 'idle' | 'recording' | 'processing' | 'error';

export default function PushToTalk({
  onTranscript,
  disabled = false,
  language = 'en-US',
  className = ''
}: PushToTalkProps) {
  const [pttState, setPttStateInternal] = useState<PTTState>('idle');
  
  // Wrapper to keep ref in sync with state
  const setPttState = useCallback((newState: PTTState) => {
    stateRef.current = newState;
    setPttStateInternal(newState);
  }, []);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [microphoneStream, setMicrophoneStream] = useState<MediaStream | null>(null);

  // Refs for managing speech recognition and user interaction
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isHoldingRef = useRef<boolean>(false);
  const transcriptBufferRef = useRef<string>('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const stateRef = useRef<PTTState>('idle'); // Track state in ref for reliable access
  const permissionRequestedRef = useRef<boolean>(false); // Track if we've requested permission
  const lastPTTStartTimeRef = useRef<number>(0); // CRITICAL FIX: Prevent duplicate touch+mouse start events
  const lastPTTEndTimeRef = useRef<number>(0); // CRITICAL FIX: Prevent duplicate touch+mouse end events
  const networkRetryCountRef = useRef<number>(0); // Track network error retries
  const isRetryingConnectionRef = useRef<boolean>(false); // Track if we're retrying after network error
  const touchIdentifierRef = useRef<number | null>(null); // Track touch ID for multi-touch handling
  const isTouchOutsideRef = useRef<boolean>(false); // Track if touch moved outside button

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('🔧 PTT Component Initializing...');
    console.log('🌐 User Agent:', navigator.userAgent);
    console.log('💻 Platform:', navigator.platform);

    // Detect iOS/Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    console.log('📱 Device detection:', { isIOS, isSafari });

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    console.log('🎤 Speech Recognition API available:', !!SpeechRecognition);
    
    if (!SpeechRecognition) {
      console.error('❌ Speech Recognition API NOT FOUND');
      setError('Voice input requires Chrome browser for optimal performance.');
      setPttState('error');
      return;
    }
    
    console.log('✅ Speech Recognition API found successfully');
    
    // iOS Safari specific warning - Speech Recognition has limited support
    if (isIOS) {
      console.log('⚠️ iOS device detected - Speech Recognition support may be limited');
      // Note: iOS Safari added Speech Recognition support in iOS 14.5+
      // But it requires HTTPS and has some quirks
    }

    // IMPROVED: Request microphone permission on mount - ONCE
    // BUT: On iOS, we need to wait for user gesture, so we'll be more lenient
    const requestMicrophonePermission = async () => {
      if (permissionRequestedRef.current) {
        console.log('⏭️ Permission already requested, skipping');
        return;
      }

      permissionRequestedRef.current = true;
      console.log('🎤 Requesting microphone permission...');

      try {
        // Request microphone access immediately on component mount
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        console.log('✅ Microphone permission granted!');
        setPermissionStatus('granted');
        setMicrophoneStream(stream);
        setError(null);
        
        // Keep the stream active for the session (better UX)
        // Don't stop it immediately
        
      } catch (err: any) {
        console.error('❌ Microphone permission error:', err);
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          // On iOS, this might be because we need user gesture first
          if (isIOS) {
            console.log('📱 iOS: Will request permission on button press');
            setPermissionStatus('prompt');
            setError('Tap the button to enable microphone');
          } else {
            setError('Microphone access denied. Please check your browser settings.');
            setPermissionStatus('denied');
          }
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone.');
          setPermissionStatus('denied');
        } else {
          // For prompt state, we'll try again when user clicks the button
          setPermissionStatus('prompt');
          setError(isIOS ? 'Tap to enable microphone' : 'Click the button to enable microphone access');
        }
      }
    };

    // Request permission immediately when component mounts (except on iOS where user gesture is needed)
    if (!isIOS) {
      requestMicrophonePermission();
    } else {
      console.log('📱 iOS: Waiting for user gesture to request microphone permission');
      setPermissionStatus('prompt');
    }

    // Initialize recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 PTT Recording started');
      setPttState('recording');
      setError(null);
      // Reset retry counter on successful start
      networkRetryCountRef.current = 0;
      isRetryingConnectionRef.current = false;
    };

    recognition.onend = () => {
      console.log('🛑 PTT Recognition ended - isHolding:', isHoldingRef.current, 'state:', stateRef.current);
      
      // CRITICAL FIX: Check if user is ACTUALLY still holding the button
      // Recognition can end due to silence timeout even if button is held
      if (isHoldingRef.current && stateRef.current === 'recording') {
        console.log('🔄 User still holding button - auto-restarting recognition');
        // Restart recognition immediately to keep recording while button is held
        setTimeout(() => {
          // Double-check user is still holding and we're not processing
          if (isHoldingRef.current && recognitionRef.current && stateRef.current === 'recording') {
            try {
              recognitionRef.current.start();
              console.log('✅ Recognition restarted successfully');
            } catch (err: any) {
              // If already started, ignore
              if (err.name !== 'InvalidStateError') {
                console.error('Failed to restart recognition:', err);
                // If we can't restart, we should send what we have
                if (transcriptBufferRef.current.trim()) {
                  sendTranscript();
                } else {
                  setPttState('idle');
                }
              }
            }
          }
        }, 50); // Minimal delay for clean restart
      }
      // REMOVED: Don't send transcript here when user releases button
      // handlePTTEnd will handle sending the transcript to avoid duplication
      // The onend event fires when recognition.stop() is called, which happens
      // in handlePTTEnd, so we'd be sending the transcript twice otherwise
    };

    recognition.onerror = (event: any) => {
      console.error('🚨 PTT Recognition error:', event.error);
      
      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          setError('🎤 Microphone access required');
          setPermissionStatus('denied');
          setPttState('error');
          break;
        case 'no-speech':
          // Normal in PTT - user might just be holding without talking
          // Don't set error state for this
          console.log('⚠️ No speech detected (normal for PTT)');
          break;
        case 'network':
          console.error('❌ Speech Recognition network error');
          
          // IMPROVED: Auto-retry logic for network errors
          const MAX_NETWORK_RETRIES = 2;
          
          // If user is still holding and we have transcript, send it
          if (isHoldingRef.current && transcriptBufferRef.current.trim()) {
            console.log('📤 Network error but have transcript - sending what we have');
            setError(null);
            // Will be sent when user releases button
          } else if (networkRetryCountRef.current < MAX_NETWORK_RETRIES && isHoldingRef.current) {
            // Attempt auto-retry if user is still holding the button
            networkRetryCountRef.current++;
            isRetryingConnectionRef.current = true;
            
            console.log(`🔄 Network error - attempting retry ${networkRetryCountRef.current}/${MAX_NETWORK_RETRIES}`);
            setError(`🔄 Connecting... (attempt ${networkRetryCountRef.current}/${MAX_NETWORK_RETRIES})`);
            setPttState('error'); // Use error state but with connecting message
            
            // Wait a moment, then retry if user is still holding
            setTimeout(() => {
              if (isHoldingRef.current && recognitionRef.current && stateRef.current === 'error') {
                try {
                  console.log('🔄 Restarting recognition after network error...');
                  recognitionRef.current.start();
                  // Reset error state once we successfully restart
                  setError(null);
                  isRetryingConnectionRef.current = false;
                } catch (err: any) {
                  console.error('Failed to restart after network error:', err);
                  // If restart fails, show final error
                  if (err.name !== 'InvalidStateError') {
                    setError('📡 Connection issue. Please release and try again.');
                    isHoldingRef.current = false;
                    isRetryingConnectionRef.current = false;
                    
                    // Auto-clear error after 3 seconds
                    setTimeout(() => {
                      if (stateRef.current === 'error') {
                        setError(null);
                        setPttState('idle');
                        networkRetryCountRef.current = 0;
                      }
                    }, 3000);
                  }
                }
              } else {
                // User released button during retry attempt
                isRetryingConnectionRef.current = false;
                networkRetryCountRef.current = 0;
              }
            }, 800 * networkRetryCountRef.current); // Progressive delay: 800ms, 1600ms
          } else {
            // Max retries exceeded or user not holding - show final error
            console.error('❌ Network error - max retries exceeded or user released');
            setError('📡 Connection issue. Please release and try again.');
            setPttState('error');
            isHoldingRef.current = false;
            isRetryingConnectionRef.current = false;
            
            // Stop recognition
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (e) {
                // Ignore
              }
            }
            
            // Auto-clear error after 3 seconds
            setTimeout(() => {
              if (stateRef.current === 'error') {
                setError(null);
                setPttState('idle');
                networkRetryCountRef.current = 0;
              }
            }, 3000);
          }
          break;
        case 'aborted':
          // Normal when stopping
          console.log('ℹ️ Recognition aborted (normal)');
          break;
        case 'audio-capture':
          setError('🎤 Microphone error. Check your device.');
          setPttState('error');
          // Auto-clear after 3 seconds
          setTimeout(() => {
            if (stateRef.current === 'error') {
              setError(null);
              setPttState('idle');
            }
          }, 3000);
          break;
        default:
          if (event.error !== 'no-speech') {
            console.error(`Unknown speech recognition error: ${event.error}`);
            setError(`🎤 ${event.error}. Tap to retry.`);
            setPttState('error');
            // Auto-clear after 3 seconds
            setTimeout(() => {
              if (stateRef.current === 'error') {
                setError(null);
                setPttState('idle');
              }
            }, 3000);
          }
      }
    };

    recognition.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalText += transcript + ' ';
        } else {
          interimText += transcript;
        }
      }

      // Update transcript buffer
      if (finalText.trim()) {
        transcriptBufferRef.current += finalText;
        setTranscript(transcriptBufferRef.current);
        console.log('📝 PTT Final text:', finalText.trim());
      }

      setInterimTranscript(interimText);
    };

    recognitionRef.current = recognition;

    // Cleanup function
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      // Stop microphone stream on unmount
      if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [language, microphoneStream]);

  // Send transcript function
  const sendTranscript = useCallback(() => {
    const fullTranscript = transcriptBufferRef.current.trim();
    
    if (fullTranscript) {
      console.log('📤 PTT Sending:', fullTranscript);
      setPttState('processing');
      
      // Clear transcript
      transcriptBufferRef.current = '';
      setTranscript('');
      setInterimTranscript('');
      
      // Send to parent component
      onTranscript(fullTranscript);
      
      // Return to idle after processing
      setTimeout(() => {
        setPttState('idle');
      }, 1000);
    } else {
      setPttState('idle');
    }
  }, [onTranscript]);

  // Haptic feedback for mobile devices
  const triggerHapticFeedback = useCallback((style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      // Vibration API for Android
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[style]);
    }
    
    // iOS Haptic Feedback (requires user gesture context)
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        // Create a silent audio context to enable audio on iOS
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
      } catch (e) {
        // Ignore errors
      }
    }
  }, []);

  // Handle mouse/touch events for PTT
  const handlePTTStart = useCallback(async (event: any) => {
    console.log('🎯 handlePTTStart CALLED - Event type:', event?.type);
    event.preventDefault();
    event.stopPropagation();
    
    if (disabled || pttState === 'processing' || !recognitionRef.current) {
      console.log('🚫 PTT Start blocked:', { disabled, pttState, hasRecognition: !!recognitionRef.current });
      return;
    }
    
    console.log('✅ PTT Start proceeding...');

    // CRITICAL FIX: Prevent duplicate calls from touch+mouse events firing together
    const now = Date.now();
    const timeSinceLastStart = now - lastPTTStartTimeRef.current;
    
    if (timeSinceLastStart < 300) {
      console.log('🚫 Duplicate PTT start event blocked (touch+mouse duplicate detected)');
      return;
    }
    
    lastPTTStartTimeRef.current = now;
    
    // Track touch identifier for multi-touch handling
    if (event.type.startsWith('touch') && event.changedTouches && event.changedTouches.length > 0) {
      touchIdentifierRef.current = event.changedTouches[0].identifier;
      console.log('📱 Touch started with ID:', touchIdentifierRef.current);
    }
    
    // Reset touch outside flag
    isTouchOutsideRef.current = false;
    
    // Trigger haptic feedback for mobile
    triggerHapticFeedback('medium');

    console.log('🟢 PTT Start - User pressed button');
    console.log('📊 Permission status:', permissionStatus);
    
    // If permission not granted yet, try to request it now
    if (permissionStatus !== 'granted' && !microphoneStream) {
      console.log('🎤 Requesting microphone permission on first use...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        console.log('✅ Microphone permission granted on button press!');
        setPermissionStatus('granted');
        setMicrophoneStream(stream);
        setError(null);
      } catch (err: any) {
        console.error('❌ Microphone access error on button press:', err);
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Please allow microphone access in your browser settings and refresh the page');
          setPermissionStatus('denied');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone.');
          setPermissionStatus('denied');
        } else {
          setError('Unable to access microphone. Try again.');
        }
        
        setPttState('error');
        return; // Don't set isHolding if we failed
      }
    }
    
    // Now start recording
    isHoldingRef.current = true;
    
    // Clear any previous data and reset retry counter
    transcriptBufferRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    networkRetryCountRef.current = 0;
    isRetryingConnectionRef.current = false;

    try {
      // Start speech recognition
      console.log('🎙️ Starting speech recognition...');
      recognitionRef.current.start();
      console.log('✅ Speech recognition started successfully');
    } catch (err: any) {
      console.error('❌ Speech recognition start error:', err);
      
      // Only log the error if it's not "already started"
      if (err.name === 'InvalidStateError') {
        console.log('⚠️ Recognition already running, stopping and restarting...');
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            if (recognitionRef.current && isHoldingRef.current) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (e) {
          setError('Unable to start voice input. Please try again.');
          setPttState('error');
          isHoldingRef.current = false;
        }
      } else {
        setError('Unable to start voice input. Please try again.');
        setPttState('error');
        isHoldingRef.current = false;
      }
    }
  }, [disabled, pttState, permissionStatus, microphoneStream]);

  const handlePTTEnd = useCallback((event: any) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // IMPROVED: Validate touch event matches the original touch
    // This prevents interference from other touches on the screen
    if (event?.type.startsWith('touch') && event.changedTouches && event.changedTouches.length > 0) {
      const touchId = event.changedTouches[0].identifier;
      if (touchIdentifierRef.current !== null && touchId !== touchIdentifierRef.current) {
        console.log('🚫 Touch ID mismatch, ignoring touchend (different touch point)');
        console.log(`   Expected touch ID: ${touchIdentifierRef.current}, Got: ${touchId}`);
        return;
      }
      console.log('📱 Touch ended with ID:', touchId);
      touchIdentifierRef.current = null; // Reset touch ID
    }
    
    // CRITICAL FIX: Prevent duplicate calls from touch+mouse events firing together
    // Mobile browsers often fire BOTH touch and mouse events for the same action
    const now = Date.now();
    const timeSinceLastEnd = now - lastPTTEndTimeRef.current;
    
    if (timeSinceLastEnd < 300) {
      console.log('🚫 Duplicate PTT end event blocked (touch+mouse duplicate detected)');
      console.log(`   Time since last: ${timeSinceLastEnd}ms`);
      return;
    }
    
    lastPTTEndTimeRef.current = now;
    
    // Check if we're actually in a holding state
    if (!isHoldingRef.current) {
      console.log('⚠️ PTT End called but not holding - ignoring');
      return;
    }

    console.log('🔴 PTT End - User released button');
    console.log(`   Event type: ${event?.type || 'programmatic'}`);
    console.log(`   Current state: ${stateRef.current}`);
    console.log(`   Transcript buffer length: ${transcriptBufferRef.current.length}`);
    
    // Trigger haptic feedback for mobile
    triggerHapticFeedback('light');
    
    // CRITICAL: Set holding to false FIRST to prevent auto-restart
    isHoldingRef.current = false;
    
    // Reset touch tracking flags
    isTouchOutsideRef.current = false;
    
    // Update visual state immediately (especially important for mobile)
    if (transcriptBufferRef.current.trim()) {
      setPttState('processing');
    } else {
      setPttState('idle');
    }
    
    // Stop recognition if it's running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('✋ Recognition stopped by user release');
      } catch (err: any) {
        // Ignore if already stopped
        console.log('Recognition stop error (may already be stopped):', err.name);
      }
    }
    
    // IMPROVED: Wait a moment for any final transcript, then send
    // Increased delay slightly for mobile to ensure all transcription is captured
    setTimeout(() => {
      const finalTranscript = transcriptBufferRef.current.trim();
      if (finalTranscript) {
        console.log('✅ Sending final transcript:', finalTranscript.substring(0, 50) + '...');
        sendTranscript();
      } else {
        console.log('📭 No transcript captured, returning to idle');
        setPttState('idle');
        setError(null);
      }
    }, 250); // Slightly longer delay for mobile (was 200ms)
  }, [sendTranscript, triggerHapticFeedback]);

  // Handle touch move - detect when finger slides SIGNIFICANTLY outside button
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isHoldingRef.current || !buttonRef.current) {
      return;
    }
    
    // Get the touch point that matches our tracked touch ID
    const touch = Array.from(event.changedTouches).find(
      (t: Touch) => t.identifier === touchIdentifierRef.current
    );
    
    if (!touch) return;
    
    // Get button boundaries
    const rect = buttonRef.current.getBoundingClientRect();
    
    // IMPROVED: Add a tolerance buffer (40px) to prevent accidental releases
    // Users naturally shift their finger slightly while holding on mobile
    const TOLERANCE_PX = 40;
    const tolerantRect = {
      left: rect.left - TOLERANCE_PX,
      right: rect.right + TOLERANCE_PX,
      top: rect.top - TOLERANCE_PX,
      bottom: rect.bottom + TOLERANCE_PX
    };
    
    const isInsideWithTolerance = (
      touch.clientX >= tolerantRect.left &&
      touch.clientX <= tolerantRect.right &&
      touch.clientY >= tolerantRect.top &&
      touch.clientY <= tolerantRect.bottom
    );
    
    // Only stop if touch moved SIGNIFICANTLY outside the button area
    if (!isInsideWithTolerance && !isTouchOutsideRef.current) {
      console.log('📱 Touch moved significantly outside button - stopping recording');
      console.log(`   Touch position: (${touch.clientX}, ${touch.clientY})`);
      console.log(`   Button bounds: left=${rect.left}, right=${rect.right}, top=${rect.top}, bottom=${rect.bottom}`);
      
      isTouchOutsideRef.current = true;
      
      // Trigger haptic feedback
      triggerHapticFeedback('light');
      
      // Stop recording
      handlePTTEnd(null);
    }
  }, [handlePTTEnd, triggerHapticFeedback]);
  
  // Handle touch cancel (critical for mobile - when finger slides off button)
  const handleTouchCancel = useCallback((event: any) => {
    console.log('📱 Touch cancelled - treating as release');
    console.log(`   Reason: ${event?.type || 'unknown'} - Common causes: browser UI, system gesture, or app switch`);
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Reset touch tracking
    touchIdentifierRef.current = null;
    isTouchOutsideRef.current = false;
    
    // Treat touch cancel same as touch end (user released the button)
    if (isHoldingRef.current) {
      console.log('   Holding state was true, calling handlePTTEnd');
      // Call the same logic as handlePTTEnd
      handlePTTEnd(null);
    } else {
      console.log('   Holding state was false, no action needed');
    }
  }, [handlePTTEnd]);

  // Prevent context menu on long press (mobile)
  const handleContextMenu = useCallback((event: any) => {
    event.preventDefault();
  }, []);

  // Reset error state
  const resetError = useCallback(() => {
    setError(null);
    setPttState('idle');
  }, []);

  // Add global touchmove listener for better mobile support
  // IMPROVED: Only track touch movement when actually recording
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleGlobalTouchMove = (event: TouchEvent) => {
      // Only process if we're actively recording
      if (!isHoldingRef.current) return;
      
      // Check if this touch event is related to our PTT button
      const relevantTouch = Array.from(event.changedTouches).find(
        (t: Touch) => t.identifier === touchIdentifierRef.current
      );
      
      if (!relevantTouch) return;
      
      // Prevent scrolling/default behavior only during active recording
      if (isHoldingRef.current) {
        event.preventDefault();
      }
      
      handleTouchMove(event);
    };
    
    // IMPROVED: Use passive: false only when necessary, and add capture phase
    // This ensures we can preventDefault when recording
    document.addEventListener('touchmove', handleGlobalTouchMove, { 
      passive: false,
      capture: true // Capture phase to get event before it bubbles
    });
    
    return () => {
      document.removeEventListener('touchmove', handleGlobalTouchMove, { capture: true });
    };
  }, [handleTouchMove]);

  // MOBILE FIX: Handle visibility change - stop recording if app goes to background
  // This prevents stuck recording state when user switches apps
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const handleVisibilityChange = () => {
      if (document.hidden && isHoldingRef.current) {
        console.log('📱 App went to background while recording - auto-releasing');
        handlePTTEnd(null);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handlePTTEnd]);

  // Get button appearance based on state - FIXED: Removed dynamic scale transforms
  const getButtonStyle = () => {
    // Check if we're in a "connecting/retrying" state
    const isConnecting = error?.includes('Connecting') || error?.includes('🔄');
    
    switch (pttState) {
      case 'recording':
        return {
          bg: 'bg-red-500 hover:bg-red-600',
          text: 'text-white',
          shadow: 'shadow-lg shadow-red-500/30'
        };
      case 'processing':
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          shadow: 'shadow-lg shadow-blue-500/30'
        };
      case 'error':
        // Show yellow/amber for "connecting" state instead of orange error
        if (isConnecting) {
          return {
            bg: 'bg-amber-500 hover:bg-amber-600',
            text: 'text-white',
            shadow: 'shadow-lg shadow-amber-500/30'
          };
        }
        return {
          bg: 'bg-orange-500 hover:bg-orange-600',
          text: 'text-white',
          shadow: 'shadow-lg shadow-orange-500/30'
        };
      default:
        return {
          bg: 'bg-teal-500 hover:bg-teal-600',
          text: 'text-white',
          shadow: 'shadow-lg shadow-teal-500/30'
        };
    }
  };

  const buttonStyle = getButtonStyle();

  // Get status text based on state
  const getStatusText = () => {
    switch (pttState) {
      case 'recording':
        return '🔴 Recording... Keep Holding & Speak Clearly';
      case 'processing':
        return '🔄 Sending to Coach Kai...';
      case 'error':
        // Show the specific error message, or a generic retry message
        if (error?.includes('Connecting') || error?.includes('🔄')) {
          return error; // Show connection retry message
        }
        return error || 'Tap to Retry';
      default:
        return '🎤 Press & Hold to Talk to Coach Kai';
    }
  };

  // Get icon based on state
  const getIcon = () => {
    const isConnecting = error?.includes('Connecting') || error?.includes('🔄');
    
    switch (pttState) {
      case 'recording':
        return <Radio className="h-10 w-10 sm:h-12 sm:w-12" />;
      case 'processing':
        return <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin" />;
      case 'error':
        // Show loading icon if connecting/retrying
        if (isConnecting) {
          return <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin" />;
        }
        return <MicOff className="h-10 w-10 sm:h-12 sm:w-12" />;
      default:
        return <Mic className="h-10 w-10 sm:h-12 sm:w-12" />;
    }
  };

  if (permissionStatus === 'denied') {
    return (
      <Card className="p-6 text-center bg-orange-50 border-orange-200 max-w-md mx-auto">
        <MicOff className="h-12 w-12 mx-auto mb-4 text-orange-500" />
        <h3 className="text-lg font-semibold text-orange-800 mb-2">
          Microphone Access Required
        </h3>
        <p className="text-orange-600 mb-4 text-sm">
          {error || 'Please enable microphone access in your browser settings and refresh the page.'}
        </p>
        <div className="space-y-2">
          <p className="text-xs text-orange-500">
            💡 <strong>How to fix:</strong>
          </p>
          <ol className="text-xs text-left text-orange-600 space-y-1 list-decimal list-inside">
            <li>Click the 🔒 or 🛡️ icon in your browser's address bar</li>
            <li>Find "Microphone" permissions and set to "Allow"</li>
            <li>Refresh this page</li>
          </ol>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="border-orange-300 text-orange-700 hover:bg-orange-100 mt-4"
        >
          Refresh Page
        </Button>
      </Card>
    );
  }

  // Debug: Log when component renders
  useEffect(() => {
    console.log('🔄 PTT Component rendered/updated - State:', pttState, 'Disabled:', disabled);
  });

  return (
    <div className={`flex flex-col items-center space-y-4 w-full ${className}`}>
      {/* Main PTT Button - FIXED: Stable positioning container */}
      <div className="relative flex items-center justify-center h-32 w-32 sm:h-36 sm:w-36">
        <Button
          ref={buttonRef}
          disabled={disabled}
          className={`
            h-28 w-28 sm:h-32 sm:w-32 rounded-full transition-colors duration-200 select-none
            ${buttonStyle.bg} ${buttonStyle.text} ${buttonStyle.shadow}
            disabled:opacity-50 disabled:cursor-not-allowed
            touch-manipulation cursor-pointer
            text-lg font-bold
            focus:outline-none focus:ring-4 focus:ring-offset-2
            ${pttState === 'recording' ? 'ring-4 ring-red-300 ring-offset-2' : ''}
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          `}
          style={{ 
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'none', // Prevent default touch actions like scrolling
          }}
          onMouseDown={pttState === 'error' ? resetError : handlePTTStart}
          onMouseUp={handlePTTEnd}
          onMouseLeave={handlePTTEnd}
          onTouchStart={pttState === 'error' ? resetError : handlePTTStart}
          onTouchEnd={handlePTTEnd}
          onTouchCancel={handleTouchCancel}
          onContextMenu={handleContextMenu}
        >
          {getIcon()}
        </Button>

        {/* Recording Pulse Effect - FIXED: Position behind button, not affecting button position */}
        <AnimatePresence>
          {pttState === 'recording' && (
            <motion.div
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ 
                scale: [1, 1.4, 1.8],
                opacity: [0.8, 0.4, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut'
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-red-500 pointer-events-none -z-10"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Status Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center w-full px-4"
      >
        <p className={`
          text-base sm:text-lg font-semibold transition-colors duration-200
          ${pttState === 'recording' ? 'text-red-600' : 
            pttState === 'processing' ? 'text-blue-600' :
            pttState === 'error' ? (
              (error?.includes('Connecting') || error?.includes('🔄')) 
                ? 'text-amber-600' 
                : 'text-orange-600'
            ) :
            'text-gray-700'}
        `}>
          {getStatusText()}
        </p>
        
        {/* Live Transcript Display */}
        <AnimatePresence>
          {(transcript || interimTranscript) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-4 bg-gray-50 rounded-lg border max-w-md mx-auto"
            >
              <p className="text-xs sm:text-sm text-gray-500 mb-2 font-medium">Live Transcript:</p>
              <p className="text-sm sm:text-base leading-relaxed">
                <span className="text-gray-800 font-medium">{transcript}</span>
                <span className="text-gray-400 italic">{interimTranscript}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Instructions for walkie-talkie experience */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: pttState === 'idle' ? 0.8 : 0 }}
        className="text-center max-w-sm px-4"
      >
        <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">
          🎙️ <strong>Walkie-Talkie Mode Active</strong>
        </p>
        <p className="text-xs text-gray-500">
          Press & hold to talk, release to send • Coach Kai will respond with voice
        </p>
      </motion.div>
    </div>
  );
}
