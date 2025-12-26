
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Eye, 
  EyeOff, 
  Trophy, 
  Mail, 
  Lock, 
  User, 
  Loader2,
  Gift,
  CheckCircle,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import BetaWelcomeModal from "@/components/beta/beta-welcome-modal"

const skillLevels = [
  { value: 'BEGINNER', label: 'Beginner (New to Pickleball)', rating: '2.0-2.5' },
  { value: 'INTERMEDIATE', label: 'Intermediate (Learning Strategy)', rating: '3.0-3.5' },
  { value: 'ADVANCED', label: 'Advanced (Competitive Play)', rating: '4.0-4.5' },
  { value: 'PRO', label: 'Pro (Tournament Level)', rating: '5.0+' },
]

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    skillLevel: "",
    playerRating: "",
    promoCode: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showBetaModal, setShowBetaModal] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [betaRedemption, setBetaRedemption] = useState<{
    durationDays: number;
    rewardAmount: number;
    isBetaTester: boolean;
  } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    // Show password requirements when user starts typing
    if (field === 'password' && value.length > 0) {
      setShowPasswordRequirements(true)
    } else if (field === 'password' && value.length === 0) {
      setShowPasswordRequirements(false)
    }
    
    // Auto-set player rating based on skill level
    if (field === 'skillLevel') {
      const skill = skillLevels.find(s => s.value === value)
      if (skill) {
        const rating = skill.rating.split('-')[0] // Get the lower end of the range
        // Set both skillLevel and playerRating in a single state update
        setFormData(prev => ({ ...prev, skillLevel: value, playerRating: rating }))
        return
      }
    }
    
    // Default: just update the field
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  // Password validation helpers
  const passwordRequirements = [
    { 
      label: 'At least 6 characters', 
      met: formData.password.length >= 6 
    },
    { 
      label: 'Contains a letter', 
      met: /[a-zA-Z]/.test(formData.password) 
    },
    { 
      label: 'Contains a number', 
      met: /[0-9]/.test(formData.password) 
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        toast({
          title: "Signup Failed",
          description: data.error || "Please try again.",
          variant: "destructive",
        })
        return
      }

      // Automatically sign in after successful signup
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.error) {
        toast({
          title: "Account Created Successfully! 🎉",
          description: data.promoCodeRedemption 
            ? `Promo code redeemed! You have ${data.promoCodeRedemption.durationDays} days PRO access. Please sign in.`
            : "Please sign in with your new credentials.",
        })
        router.push("/auth/signin")
      } else {
        // Show different message based on promo code redemption
        if (data.promoCodeRedemption?.isBetaTester) {
          // Store beta redemption details and show modal
          setBetaRedemption({
            durationDays: data.promoCodeRedemption.durationDays,
            rewardAmount: data.promoCodeRedemption.rewardAmount,
            isBetaTester: true,
          });
          setShowBetaModal(true);
        } else if (data.promoCodeRedemption?.success) {
          toast({
            title: "Welcome to Mindful Champion! 🎉",
            description: `Promo code activated! You have ${data.promoCodeRedemption.durationDays} days of PRO access!`,
          })
          router.push("/onboarding")
        } else {
          toast({
            title: "Welcome to Mindful Champion! 🏆",
            description: "Your 7-day free trial has started. Let's set up your champion journey!",
          })
          router.push("/onboarding")
        }
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

  const handleGoogleSignUp = () => {
    signIn("google", { callbackUrl: "/onboarding" })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg"
    >
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
            Join Mindful Champion
          </CardTitle>
          <CardDescription className="text-slate-600">
            Start your 7-day free trial today
          </CardDescription>
          
          {/* Trial Benefits */}
          <div className="bg-gradient-to-r from-teal-50 to-orange-50 p-4 rounded-lg mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-4 w-4 text-teal-600" />
              <span className="font-medium text-teal-800">Free Trial Benefits</span>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-teal-500" />
                <span>Full access to Coach Kai</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-teal-500" />
                <span>Performance analytics & mental training</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-teal-500" />
                <span>7 days completely free</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    id="firstName"
                    placeholder=""
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder=""
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder=""
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Skill Level & Rating */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="skillLevel">Skill Level</Label>
                <Select 
                  value={formData.skillLevel} 
                  onValueChange={(value) => handleInputChange('skillLevel', value)} 
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {skillLevels.map((skill) => (
                      <SelectItem key={skill.value} value={skill.value}>
                        {skill.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="playerRating">Player Rating</Label>
                <Input
                  id="playerRating"
                  type="text"
                  placeholder="e.g., 3.0"
                  value={formData.playerRating}
                  onChange={(e) => handleInputChange('playerRating', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Requirements - Only show when user starts typing */}
              {showPasswordRequirements && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 pt-2"
                >
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${req.met ? 'bg-green-500' : 'bg-slate-300'}`} />
                      <span className={req.met ? 'text-green-600' : 'text-slate-500'}>
                        {req.label}
                      </span>
                      {req.met && <CheckCircle className="h-3 w-3 text-green-500" />}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Promo Code Field */}
            <div className="space-y-2">
              <Label htmlFor="promoCode" className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-teal-600" />
                Promo Code (Optional)
              </Label>
              <div className="relative">
                <Input
                  id="promoCode"
                  placeholder=""
                  value={formData.promoCode}
                  onChange={(e) => handleInputChange('promoCode', e.target.value.toUpperCase())}
                  className="font-mono text-base tracking-wider"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Trophy className="mr-2 h-4 w-4" />
                  Start Free Trial
                </>
              )}
            </Button>
          </form>

          {/* Google Sign-In temporarily disabled - requires OAuth credentials
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-900 font-medium">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignUp}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
          */}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-teal-600 hover:text-teal-700 font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-xs text-slate-500">
            By signing up, you agree to our terms and start a 7-day free trial
          </p>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to home
          </Link>
        </CardFooter>
      </Card>

      {/* Beta Welcome Modal */}
      {betaRedemption && (
        <BetaWelcomeModal
          isOpen={showBetaModal}
          onClose={() => {
            setShowBetaModal(false);
            router.push("/onboarding");
          }}
          promoCodeDetails={betaRedemption}
        />
      )}
    </motion.div>
  )
}
