"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Gamepad2, Trophy, Sparkles, Target, Zap, Star, ArrowLeft, 
  Volume2, VolumeX, Users, Bot, Play, Crown, Flame, Medal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSession } from "next-auth/react"
import MainNavigation from "@/components/navigation/main-navigation"
import Confetti from 'react-confetti'

// Game constants
const PADDLE_HEIGHT = 100
const PADDLE_WIDTH = 15
const BALL_SIZE = 16
const WINNING_SCORE = 11
const AI_SPEED = 4.5
const PLAYER_SPEED = 8

// Sound URLs (royalty-free game sounds)
const SOUNDS = {
  hit: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  score: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
  win: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
  lose: "https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3",
  crowd: "https://assets.mixkit.co/active_storage/sfx/153/153-preview.mp3",
}

interface GameState {
  ballX: number
  ballY: number
  ballSpeedX: number
  ballSpeedY: number
  paddle1Y: number
  paddle2Y: number
  score1: number
  score2: number
  gameStarted: boolean
  gameOver: boolean
  winner: 'player' | 'opponent' | null
}

type GameMode = 'solo' | 'online' | null

export default function CourtKingsGame() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const [gameMode, setGameMode] = useState<GameMode>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({})
  
  const [gameState, setGameState] = useState<GameState>({
    ballX: 400,
    ballY: 250,
    ballSpeedX: 5,
    ballSpeedY: 3,
    paddle1Y: 200,
    paddle2Y: 200,
    score1: 0,
    score2: 0,
    gameStarted: false,
    gameOver: false,
    winner: null,
  })

  // Touch/keyboard controls
  const keysPressed = useRef<{ [key: string]: boolean }>({})
  const touchStartY = useRef<number | null>(null)
  const lastTouchY = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    
    // Preload sounds
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio(url)
      audio.preload = 'auto'
      soundsRef.current[key] = audio
    })

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const playSound = useCallback((soundName: keyof typeof SOUNDS) => {
    if (!soundEnabled) return
    const audio = soundsRef.current[soundName]
    if (audio) {
      audio.currentTime = 0
      audio.volume = soundName === 'crowd' ? 0.3 : 0.5
      audio.play().catch(() => {})
    }
  }, [soundEnabled])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true
      if (e.key === ' ' && !gameState.gameStarted && gameMode) {
        setGameState(prev => ({ ...prev, gameStarted: true }))
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState.gameStarted, gameMode])

  // Touch controls for mobile/iPad
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      touchStartY.current = touch.clientY
      lastTouchY.current = touch.clientY
      
      if (!gameState.gameStarted && gameMode) {
        setGameState(prev => ({ ...prev, gameStarted: true }))
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (lastTouchY.current === null) return
      
      const touch = e.touches[0]
      const rect = canvas.getBoundingClientRect()
      const canvasY = touch.clientY - rect.top
      const normalizedY = (canvasY / rect.height) * 500
      
      setGameState(prev => ({
        ...prev,
        paddle1Y: Math.max(0, Math.min(500 - PADDLE_HEIGHT, normalizedY - PADDLE_HEIGHT / 2))
      }))
      
      lastTouchY.current = touch.clientY
    }

    const handleTouchEnd = () => {
      touchStartY.current = null
      lastTouchY.current = null
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gameState.gameStarted, gameMode])

  // Mouse controls
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const canvasY = e.clientY - rect.top
      const normalizedY = (canvasY / rect.height) * 500
      
      setGameState(prev => ({
        ...prev,
        paddle1Y: Math.max(0, Math.min(500 - PADDLE_HEIGHT, normalizedY - PADDLE_HEIGHT / 2))
      }))
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    return () => canvas.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Game loop
  useEffect(() => {
    if (!gameMode || !gameState.gameStarted || gameState.gameOver) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateGame = () => {
      setGameState(prev => {
        let { ballX, ballY, ballSpeedX, ballSpeedY, paddle1Y, paddle2Y, score1, score2 } = prev

        // Keyboard paddle movement
        if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
          paddle1Y = Math.max(0, paddle1Y - PLAYER_SPEED)
        }
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
          paddle1Y = Math.min(500 - PADDLE_HEIGHT, paddle1Y + PLAYER_SPEED)
        }

        // AI paddle movement (with some imperfection for fairness)
        const aiTarget = ballY - PADDLE_HEIGHT / 2
        const aiDiff = aiTarget - paddle2Y
        const aiActualSpeed = AI_SPEED * (0.7 + Math.random() * 0.3)
        if (Math.abs(aiDiff) > 10) {
          paddle2Y += aiDiff > 0 ? Math.min(aiActualSpeed, aiDiff) : Math.max(-aiActualSpeed, aiDiff)
        }
        paddle2Y = Math.max(0, Math.min(500 - PADDLE_HEIGHT, paddle2Y))

        // Ball movement
        ballX += ballSpeedX
        ballY += ballSpeedY

        // Top/bottom wall collision
        if (ballY <= 0 || ballY >= 500 - BALL_SIZE) {
          ballSpeedY = -ballSpeedY
          ballY = ballY <= 0 ? 0 : 500 - BALL_SIZE
        }

        // Paddle collisions
        // Player paddle (left)
        if (ballX <= 50 + PADDLE_WIDTH && ballX >= 50 &&
            ballY + BALL_SIZE >= paddle1Y && ballY <= paddle1Y + PADDLE_HEIGHT) {
          ballSpeedX = Math.abs(ballSpeedX) * 1.05
          const hitPos = (ballY - paddle1Y) / PADDLE_HEIGHT
          ballSpeedY = (hitPos - 0.5) * 10
          playSound('hit')
        }

        // AI paddle (right)
        if (ballX >= 800 - 50 - PADDLE_WIDTH - BALL_SIZE && ballX <= 800 - 50 &&
            ballY + BALL_SIZE >= paddle2Y && ballY <= paddle2Y + PADDLE_HEIGHT) {
          ballSpeedX = -Math.abs(ballSpeedX) * 1.05
          const hitPos = (ballY - paddle2Y) / PADDLE_HEIGHT
          ballSpeedY = (hitPos - 0.5) * 10
          playSound('hit')
        }

        // Score
        let newScore1 = score1
        let newScore2 = score2
        let resetBall = false

        if (ballX <= 0) {
          newScore2 = score2 + 1
          resetBall = true
          playSound('score')
        } else if (ballX >= 800 - BALL_SIZE) {
          newScore1 = score1 + 1
          resetBall = true
          playSound('score')
          playSound('crowd')
        }

        if (resetBall) {
          ballX = 400
          ballY = 250
          ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 5
          ballSpeedY = (Math.random() - 0.5) * 6
        }

        // Check win condition
        let gameOver = false
        let winner: 'player' | 'opponent' | null = null
        if (newScore1 >= WINNING_SCORE) {
          gameOver = true
          winner = 'player'
        } else if (newScore2 >= WINNING_SCORE) {
          gameOver = true
          winner = 'opponent'
        }

        return {
          ...prev,
          ballX,
          ballY,
          ballSpeedX: Math.min(15, Math.abs(ballSpeedX)) * Math.sign(ballSpeedX),
          ballSpeedY: Math.min(10, Math.abs(ballSpeedY)) * Math.sign(ballSpeedY),
          paddle1Y,
          paddle2Y,
          score1: newScore1,
          score2: newScore2,
          gameOver,
          winner,
        }
      })
    }

    gameLoopRef.current = requestAnimationFrame(function loop() {
      updateGame()
      gameLoopRef.current = requestAnimationFrame(loop)
    })

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameMode, gameState.gameStarted, gameState.gameOver, playSound])

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, 800, 500)

    // Court lines
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 2
    ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.moveTo(400, 0)
    ctx.lineTo(400, 500)
    ctx.stroke()
    ctx.setLineDash([])

    // Court border
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, 796, 496)

    // Kitchen lines (non-volley zone)
    ctx.strokeStyle = '#06b6d4'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(150, 0)
    ctx.lineTo(150, 500)
    ctx.moveTo(650, 0)
    ctx.lineTo(650, 500)
    ctx.stroke()

    // Player paddle (gradient)
    const paddle1Gradient = ctx.createLinearGradient(50, gameState.paddle1Y, 50 + PADDLE_WIDTH, gameState.paddle1Y + PADDLE_HEIGHT)
    paddle1Gradient.addColorStop(0, '#22c55e')
    paddle1Gradient.addColorStop(1, '#06b6d4')
    ctx.fillStyle = paddle1Gradient
    ctx.fillRect(50, gameState.paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT)
    
    // Paddle glow
    ctx.shadowColor = '#22c55e'
    ctx.shadowBlur = 15
    ctx.fillRect(50, gameState.paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT)
    ctx.shadowBlur = 0

    // AI paddle
    const paddle2Gradient = ctx.createLinearGradient(800 - 50 - PADDLE_WIDTH, gameState.paddle2Y, 800 - 50, gameState.paddle2Y + PADDLE_HEIGHT)
    paddle2Gradient.addColorStop(0, '#f59e0b')
    paddle2Gradient.addColorStop(1, '#ef4444')
    ctx.fillStyle = paddle2Gradient
    ctx.fillRect(800 - 50 - PADDLE_WIDTH, gameState.paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT)
    
    ctx.shadowColor = '#f59e0b'
    ctx.shadowBlur = 15
    ctx.fillRect(800 - 50 - PADDLE_WIDTH, gameState.paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT)
    ctx.shadowBlur = 0

    // Ball (pickleball with holes pattern)
    ctx.beginPath()
    ctx.arc(gameState.ballX + BALL_SIZE / 2, gameState.ballY + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2)
    ctx.fillStyle = '#fcd34d'
    ctx.fill()
    ctx.shadowColor = '#fcd34d'
    ctx.shadowBlur = 10
    ctx.fill()
    ctx.shadowBlur = 0
    
    // Ball holes (pickleball pattern)
    ctx.fillStyle = '#0f172a'
    const holeRadius = 2
    ctx.beginPath()
    ctx.arc(gameState.ballX + BALL_SIZE / 2 - 3, gameState.ballY + BALL_SIZE / 2, holeRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(gameState.ballX + BALL_SIZE / 2 + 3, gameState.ballY + BALL_SIZE / 2, holeRadius, 0, Math.PI * 2)
    ctx.fill()

    // Scores
    ctx.font = 'bold 48px Arial'
    ctx.fillStyle = '#22c55e'
    ctx.textAlign = 'center'
    ctx.fillText(gameState.score1.toString(), 300, 70)
    ctx.fillStyle = '#f59e0b'
    ctx.fillText(gameState.score2.toString(), 500, 70)

    // Instructions if not started
    if (!gameState.gameStarted && gameMode) {
      ctx.font = '18px Arial'
      ctx.fillStyle = '#94a3b8'
      ctx.textAlign = 'center'
      ctx.fillText('Tap screen, click, or press SPACE to start', 400, 460)
      ctx.fillText('Move: Touch/Mouse or W/S/Arrow keys', 400, 485)
    }

  }, [gameState, gameMode])

  // Handle win
  useEffect(() => {
    if (gameState.gameOver && gameState.winner === 'player') {
      setShowConfetti(true)
      playSound('win')
      setTimeout(() => setShowConfetti(false), 5000)
    } else if (gameState.gameOver && gameState.winner === 'opponent') {
      playSound('lose')
    }
  }, [gameState.gameOver, gameState.winner, playSound])

  const resetGame = () => {
    setGameState({
      ballX: 400,
      ballY: 250,
      ballSpeedX: 5,
      ballSpeedY: 3,
      paddle1Y: 200,
      paddle2Y: 200,
      score1: 0,
      score2: 0,
      gameStarted: false,
      gameOver: false,
      winner: null,
    })
    setShowConfetti(false)
  }

  const startGame = (mode: GameMode) => {
    setGameMode(mode)
    resetGame()
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full animate-spin" style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)' }} />
            <div className="absolute inset-1 bg-slate-900 rounded-full" />
            <Gamepad2 className="absolute inset-0 m-auto w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-gray-400 animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={session?.user} />
      
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
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
                    Arcade
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm">Master your reflexes in this pickleball arcade game!</p>
              </div>
            </div>

            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="outline"
              size="icon"
              className="border-white/20 text-gray-400 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          </div>
        </motion.div>

        {/* Mode Selection */}
        <AnimatePresence mode="wait">
          {!gameMode && (
            <motion.div
              key="mode-select"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl bg-slate-800/80 border border-white/10 p-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Choose Your Challenge</h2>
                <p className="text-gray-400">Select a game mode to start playing</p>
              </div>

              {/* Game Description */}
              <div className="bg-slate-900/50 rounded-xl p-6 mb-8 border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg">
                    <Trophy className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">What is Court Kings?</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Court Kings is an arcade-style pickleball game designed to sharpen your reflexes and shot anticipation. 
                      Practice your timing against AI opponents or challenge players online. First to 11 points wins!
                    </p>
                  </div>
                </div>
              </div>

              {/* Mode Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startGame('solo')}
                  className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 text-left hover:border-emerald-400 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Play Solo</h3>
                      <p className="text-emerald-400 text-sm">vs AI Opponent</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Challenge our AI in a single-player match. Perfect for practicing your skills!
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Target className="w-4 h-4" /> Instant Start</span>
                    <span className="flex items-center gap-1"><Flame className="w-4 h-4" /> Skill Training</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startGame('online')}
                  className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 text-left hover:border-purple-400 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Play Online</h3>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Coming Soon</Badge>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Challenge other players in real-time matches. Climb the leaderboard!
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Medal className="w-4 h-4" /> Rankings</span>
                    <span className="flex items-center gap-1"><Crown className="w-4 h-4" /> Compete</span>
                  </div>
                </motion.button>
              </div>

              {/* How to Play */}
              <div className="mt-8 p-4 rounded-xl bg-slate-900/50 border border-white/5">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  How to Play
                </h4>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">1</span>
                    <span className="text-gray-400"><span className="text-white">Touch/Mouse:</span> Move paddle up/down</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
                    <span className="text-gray-400"><span className="text-white">Keyboard:</span> W/S or Arrow keys</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                    <span className="text-gray-400"><span className="text-white">Goal:</span> First to 11 wins!</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Game Canvas */}
          {gameMode && (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative rounded-2xl overflow-hidden bg-slate-900/50 border border-white/10 shadow-2xl">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={500}
                  className="w-full max-w-full touch-none"
                  style={{ aspectRatio: '800/500' }}
                />

                {/* Game Over Overlay */}
                <AnimatePresence>
                  {gameState.gameOver && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/80 flex items-center justify-center"
                    >
                      <div className="text-center">
                        {gameState.winner === 'player' ? (
                          <>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', bounce: 0.5 }}
                            >
                              <Crown className="w-20 h-20 text-amber-400 mx-auto mb-4" />
                            </motion.div>
                            <h2 className="text-4xl font-bold text-white mb-2">Victory!</h2>
                            <p className="text-emerald-400 text-xl mb-6">You won {gameState.score1} - {gameState.score2}</p>
                          </>
                        ) : (
                          <>
                            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Trophy className="w-10 h-10 text-gray-500" />
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-2">Game Over</h2>
                            <p className="text-red-400 text-xl mb-6">You lost {gameState.score1} - {gameState.score2}</p>
                          </>
                        )}
                        <div className="flex gap-4 justify-center">
                          <Button
                            onClick={resetGame}
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Play Again
                          </Button>
                          <Button
                            onClick={() => setGameMode(null)}
                            variant="outline"
                            className="border-white/20"
                          >
                            Change Mode
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Game Controls Footer */}
              <div className="mt-4 flex items-center justify-between">
                <Button
                  onClick={() => setGameMode(null)}
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Menu
                </Button>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="hidden sm:inline">Playing:</span>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                    {gameMode === 'solo' ? 'Solo vs AI' : 'Online Match'}
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
