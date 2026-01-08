// @ts-nocheck

"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Trophy, Mail, Lock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Fix auto-scroll issue: Ensure page stays at top on mount
  useEffect(() => {
    // Scroll to top immediately on component mount
    window.scrollTo(0, 0)
    
    // Also set scroll restoration to manual to prevent browser from restoring scroll position
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    
    // Cleanup: restore automatic scroll restoration when component unmounts
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto'
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        toast({
          title: "Sign In Failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Welcome back, Champion! 🏆",
          description: "Successfully signed in to your account.",
        })
        // Redirect to dashboard - server will handle onboarding redirect if needed
        window.location.href = "/dashboard"
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-2xl border border-slate-700/50 bg-slate-800/80 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-4">
          <CardTitle className="text-xl font-bold text-white">
            Sign In to Your Account
          </CardTitle>
          <CardDescription className="text-slate-400">
            Enter your email and password below
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 placeholder:text-slate-500 text-white bg-slate-900/50 border-slate-600 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <Link 
                  href="/auth/request-reset" 
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit(e)
                    }
                  }}
                  required
                  className="pl-10 pr-10 placeholder:text-slate-500 text-white bg-slate-900/50 border-slate-600 focus:border-cyan-500 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold py-5 shadow-lg shadow-cyan-500/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

        </CardContent>

        <CardFooter className="flex flex-col space-y-4 text-center pt-4">
          {/* Sign Up CTA */}
          <div className="space-y-3 w-full">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-3 text-slate-400 font-medium">New here?</span>
              </div>
            </div>
            
            <Link href="/auth/signup" className="block">
              <Button 
                type="button"
                variant="outline"
                className="w-full border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 font-bold text-base py-5 transition-all"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Start Your Free 7-Day Trial
              </Button>
            </Link>
            
            <p className="text-[11px] text-slate-500 px-4 leading-tight">
              No credit card required • Cancel anytime
            </p>
          </div>

          <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 pt-1 transition-colors">
            ← Back to home
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
