'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PushToTalk from '@/components/voice/push-to-talk';
import { CheckCircle, XCircle, AlertCircle, Mic } from 'lucide-react';

export default function TestPTTPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [browserSupport, setBrowserSupport] = useState<{
    speechRecognition: boolean;
    mediaDevices: boolean;
    getUserMedia: boolean;
  }>({
    speechRecognition: false,
    mediaDevices: false,
    getUserMedia: false
  });
  const [transcripts, setTranscripts] = useState<string[]>([]);

  // Add log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setLogs(prev => [...prev, logEntry]);
  };

  // Check browser support
  useEffect(() => {
    addLog('🔍 Checking browser support...');
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const hasSpeechRecognition = !!SpeechRecognition;
    addLog(`Speech Recognition: ${hasSpeechRecognition ? '✅ SUPPORTED' : '❌ NOT SUPPORTED'}`);
    
    const hasMediaDevices = !!navigator.mediaDevices;
    addLog(`MediaDevices API: ${hasMediaDevices ? '✅ SUPPORTED' : '❌ NOT SUPPORTED'}`);
    
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    addLog(`getUserMedia: ${hasGetUserMedia ? '✅ SUPPORTED' : '❌ NOT SUPPORTED'}`);
    
    addLog(`User Agent: ${navigator.userAgent}`);
    addLog(`Platform: ${navigator.platform}`);
    
    setBrowserSupport({
      speechRecognition: hasSpeechRecognition,
      mediaDevices: hasMediaDevices,
      getUserMedia: hasGetUserMedia
    });
    
    // Override console.log temporarily to capture PTT logs
    const originalLog = console.log;
    console.log = function(...args) {
      originalLog.apply(console, args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      if (message.includes('PTT') || message.includes('🎤') || message.includes('Recognition')) {
        setLogs(prev => [...prev, message]);
      }
    };
    
    return () => {
      console.log = originalLog;
    };
  }, []);

  const handleTranscript = (text: string) => {
    addLog(`📝 TRANSCRIPT RECEIVED: "${text}"`);
    setTranscripts(prev => [...prev, text]);
  };

  const testMicrophone = async () => {
    addLog('🎤 Testing microphone access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      addLog('✅ Microphone access GRANTED');
      addLog(`📊 Audio tracks: ${stream.getAudioTracks().length}`);
      stream.getAudioTracks().forEach(track => {
        addLog(`  - Track: ${track.label}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
        track.stop();
      });
    } catch (error: any) {
      addLog(`❌ Microphone access DENIED: ${error.name} - ${error.message}`);
    }
  };

  const testSpeechRecognition = () => {
    addLog('🗣️ Testing Speech Recognition directly...');
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        addLog('❌ Speech Recognition not available');
        return;
      }
      
      const recognition = new SpeechRecognition();
      addLog('✅ Speech Recognition instance created');
      
      recognition.onstart = () => addLog('✅ Recognition STARTED');
      recognition.onend = () => addLog('🛑 Recognition ENDED');
      recognition.onerror = (event: any) => addLog(`❌ Recognition ERROR: ${event.error}`);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        addLog(`📝 Recognition RESULT: "${transcript}"`);
      };
      
      recognition.start();
      addLog('🎙️ Recognition start() called');
      
      setTimeout(() => {
        try {
          recognition.stop();
          addLog('⏹️ Recognition stop() called after 3s');
        } catch (e) {
          addLog(`⚠️ Error stopping recognition: ${e}`);
        }
      }, 3000);
    } catch (error: any) {
      addLog(`❌ Speech Recognition test FAILED: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">🔧 PTT Debug & Test Page</h1>
          <p className="text-slate-600">
            Test Push-to-Talk functionality and diagnose issues
          </p>
        </Card>

        {/* Browser Support Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Browser Support Check</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {browserSupport.speechRecognition ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <span className="text-sm">Speech Recognition API</span>
            </div>
            <div className="flex items-center gap-3">
              {browserSupport.mediaDevices ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <span className="text-sm">MediaDevices API</span>
            </div>
            <div className="flex items-center gap-3">
              {browserSupport.getUserMedia ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <span className="text-sm">getUserMedia (Microphone Access)</span>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button onClick={testMicrophone} variant="outline">
              <Mic className="h-4 w-4 mr-2" />
              Test Microphone
            </Button>
            <Button onClick={testSpeechRecognition} variant="outline">
              Test Speech Recognition
            </Button>
          </div>
        </Card>

        {/* PTT Component Test */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">PTT Component Test</h2>
          <div className="flex flex-col items-center">
            <PushToTalk
              onTranscript={handleTranscript}
              language="en-US"
            />
          </div>
        </Card>

        {/* Transcripts */}
        {transcripts.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Transcripts Received</h2>
            <div className="space-y-2">
              {transcripts.map((transcript, index) => (
                <div key={index} className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-medium text-green-900">{transcript}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Debug Logs */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-slate-500">No logs yet. Interact with PTT to see logs.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
          <Button 
            onClick={() => setLogs([])} 
            variant="outline" 
            size="sm" 
            className="mt-3"
          >
            Clear Logs
          </Button>
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Test Instructions
          </h2>
          <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
            <li>Check that all browser support checks are green ✅</li>
            <li>Click "Test Microphone" to verify microphone permissions</li>
            <li>Click "Test Speech Recognition" to verify the API works</li>
            <li>Press & hold the PTT button and speak clearly</li>
            <li>Release the button when done speaking</li>
            <li>Check the debug logs for any error messages</li>
            <li>If transcripts appear, PTT is working! 🎉</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
