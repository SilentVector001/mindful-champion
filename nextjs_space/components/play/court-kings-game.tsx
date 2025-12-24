"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Gamepad2, Maximize2, Trophy, Sparkles, Target, Zap, Star, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import MainNavigation from "@/components/navigation/main-navigation"
import { useSession } from "next-auth/react"

export default function CourtKingsGame() {
  const { data: session } = useSession() || {}
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleFullscreen = () => {
    const iframe = document.getElementById("court-kings-iframe") as HTMLIFrameElement
    if (iframe) {
      if (!document.fullscreenElement) {
        iframe.requestFullscreen?.().catch(() => {})
        setIsFullscreen(true)
      } else {
        document.exitFullscreen?.().catch(() => {})
        setIsFullscreen(false)
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={session?.user} />
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          {/* Back Link */}
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>

          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-6 md:p-8">
            {/* Glow Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl blur-lg opacity-50 animate-pulse" />
                  <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Court Kings</h1>
                    <Badge className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Play Now
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm md:text-base">
                    Practice your pickleball skills in this fun arcade-style game!
                  </p>
                </div>
              </div>

              <Button
                onClick={toggleFullscreen}
                variant="outline"
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="relative z-10 flex flex-wrap gap-2 mt-4">
              {[
                { icon: Target, label: "Aim Training", color: "text-emerald-400" },
                { icon: Zap, label: "Quick Reflexes", color: "text-cyan-400" },
                { icon: Trophy, label: "Earn Points", color: "text-amber-400" },
                { icon: Star, label: "Beat High Scores", color: "text-purple-400" },
              ].map((feature, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300"
                >
                  <feature.icon className={`w-3.5 h-3.5 ${feature.color}`} />
                  {feature.label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Game Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden bg-slate-900/50 border border-white/10 shadow-2xl shadow-black/50">
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full animate-spin" style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)' }} />
                    <div className="absolute inset-1 bg-slate-900 rounded-full" />
                    <Gamepad2 className="absolute inset-0 m-auto w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-gray-400 animate-pulse">Loading Court Kings...</p>
                </div>
              </div>
            )}

            {/* Game iframe */}
            <iframe
              id="court-kings-iframe"
              src="https://courtkings.abacusai.app/game"
              className="w-full border-0"
              style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}
              allow="fullscreen; autoplay; clipboard-write"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              title="Court Kings Pickleball Game"
            />
          </div>

          {/* Tip Banner */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
            <p className="text-sm text-gray-300 text-center">
              <span className="text-emerald-400 font-medium">Pro Tip:</span> Practice your shot timing and accuracy to improve your real-world pickleball game!
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
