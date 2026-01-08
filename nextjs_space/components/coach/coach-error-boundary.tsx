// @ts-nocheck
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMode?: 'text-only' | 'full';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  fallbackMode: 'text-only' | 'full';
}

export class CoachErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      fallbackMode: props.fallbackMode || 'full'
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details - COMPREHENSIVE LOGGING FOR DEBUGGING
    console.error('🚨 Coach Kai Error Boundary caught an error:');
    console.error('   Error name:', error?.name);
    console.error('   Error message:', error?.message);
    console.error('   Error stack:', error?.stack?.slice(0, 500));
    console.error('   Component stack:', errorInfo?.componentStack?.slice(0, 500));
    
    // Check if it's a microphone-related error
    const isMicrophoneError = 
      error.message?.includes('microphone') ||
      error.message?.includes('getUserMedia') ||
      error.message?.includes('NotFoundError') ||
      error.message?.includes('NotAllowedError') ||
      error.name === 'NotFoundError' ||
      error.name === 'NotAllowedError';

    // Check for Safari-specific errors
    const isSafariError = 
      error.message?.includes('AbortError') ||
      error.message?.includes('The operation was aborted') ||
      error.message?.includes('User denied access');

    this.setState({
      error,
      errorInfo,
      fallbackMode: (isMicrophoneError || isSafariError) ? 'text-only' : 'full'
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, fallbackMode } = this.state;
      
      // Check if it's specifically a microphone error
      const isMicrophoneError = 
        error?.message?.includes('microphone') ||
        error?.message?.includes('getUserMedia') ||
        error?.message?.includes('NotFoundError') ||
        error?.message?.includes('NotAllowedError') ||
        error?.name === 'NotFoundError' ||
        error?.name === 'NotAllowedError';

      if (isMicrophoneError || fallbackMode === 'text-only') {
        return (
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                    Voice Input Unavailable
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {error?.name === 'NotFoundError' 
                      ? 'No microphone detected on your device.'
                      : error?.name === 'NotAllowedError'
                      ? 'Microphone access was denied. Please check your browser settings.'
                      : 'Unable to access microphone for voice input.'}
                  </p>
                </div>
                
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                    ✅ Text Chat is Available
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    You can still chat with Coach Kai using the text input below. 
                    Voice functionality will remain disabled for this session.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={this.handleReset}
                    variant="outline"
                    size="sm"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/40"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                  <details className="text-xs text-amber-600 dark:text-amber-400 mt-4">
                    <summary className="cursor-pointer hover:underline">
                      Technical Details (Dev Mode)
                    </summary>
                    <pre className="mt-2 p-2 bg-white/50 dark:bg-black/30 rounded text-[10px] overflow-auto max-h-32">
                      {error?.message || 'Unknown error'}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </Card>
        );
      }

      // For non-microphone errors, show a generic error with more options
      return (
        <Card className="p-6 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                  Something Went Wrong
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Coach Kai encountered an unexpected error.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/40"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/40"
                >
                  Reload Page
                </Button>
              </div>

              {/* Show error details in production too for debugging Safari issues */}
              {error && (
                <details className="text-xs text-red-600 dark:text-red-400 mt-4">
                  <summary className="cursor-pointer hover:underline">
                    Technical Details
                  </summary>
                  <pre className="mt-2 p-2 bg-white/50 dark:bg-black/30 rounded text-[10px] overflow-auto max-h-32">
                    {error.name}: {error.message}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
