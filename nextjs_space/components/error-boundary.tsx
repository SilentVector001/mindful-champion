// @ts-nocheck
'use client'

import React, { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-slate-800/50 border border-red-500/30 rounded-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Something went wrong</h2>
                <p className="text-slate-400">An error occurred while rendering this page</p>
              </div>
            </div>

            {this.state.error && (
              <div className="space-y-4">
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-400 mb-2">Error Message:</h3>
                  <p className="text-sm text-slate-300 font-mono">
                    {this.state.error.toString()}
                  </p>
                </div>

                {this.state.errorInfo && (
                  <details className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <summary className="text-sm font-semibold text-amber-400 cursor-pointer mb-2">
                      Component Stack Trace (click to expand)
                    </summary>
                    <pre className="text-xs text-slate-400 overflow-auto mt-3 max-h-64">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}

                {this.state.error.stack && (
                  <details className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <summary className="text-sm font-semibold text-amber-400 cursor-pointer mb-2">
                      Full Stack Trace (click to expand)
                    </summary>
                    <pre className="text-xs text-slate-400 overflow-auto mt-3 max-h-64">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Go Back
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 Debugging Tips:</h4>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                <li>Check the browser console (F12) for more detailed errors</li>
                <li>Try clearing your browser cache and cookies</li>
                <li>Ensure you're using a modern, up-to-date browser</li>
                <li>If the problem persists, please contact support</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
