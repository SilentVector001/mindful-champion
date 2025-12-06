"use client"

import HeroSection from "./premium/hero-section"
import FeaturesCarousel from "./premium/features-carousel"
import VideoLearningSection from "./premium/video-learning-section"
import StatsSection from "./premium/stats-section"
import PricingCTASection from "./premium/pricing-cta-section"
import PartnerBenefitsSection from "./premium/partner-benefits-section"
import { Button } from "@/components/ui/button"
import { Menu, X, Trophy, ArrowRight, Sparkles } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Premium Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-lg bg-slate-900/95 border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 z-[101]">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="text-white font-bold text-base md:text-xl">Mindful Champion</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-slate-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#video-learning" className="text-slate-300 hover:text-white transition-colors">
                Training
              </Link>
              <Link href="#pricing" className="text-slate-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-white hover:bg-slate-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button - SUPER PROMINENT with pulse animation */}
            <button
              className="md:hidden text-white z-[101] p-3 -mr-1 bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg transition-all animate-pulse min-h-[48px] min-w-[48px]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Full Screen Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-slate-900/98 backdrop-blur-lg z-[99]">
            <div className="px-6 py-8 space-y-4 overflow-y-auto h-full">
              <div className="mb-8">
                <h2 className="text-white text-2xl font-bold mb-2">Welcome to Mindful Champion</h2>
                <p className="text-slate-400 text-sm">Your AI-powered pickleball coaching platform</p>
              </div>
              
              <Link 
                href="#features" 
                className="block text-slate-300 hover:text-white py-3 text-lg font-medium hover:bg-slate-800/50 px-4 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="#video-learning" 
                className="block text-slate-300 hover:text-white py-3 text-lg font-medium hover:bg-slate-800/50 px-4 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Training
              </Link>
              <Link 
                href="#pricing" 
                className="block text-slate-300 hover:text-white py-3 text-lg font-medium hover:bg-slate-800/50 px-4 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="pt-4 space-y-3">
                <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-white border-slate-700 hover:bg-slate-800 min-h-[48px] text-base">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white min-h-[48px] text-base shadow-lg">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Sticky Bottom Mobile Navigation - ONLY on landing page */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-2xl">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/auth/signup" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white min-h-[48px] text-base font-semibold shadow-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline" className="min-h-[48px] px-6 text-base font-medium border-slate-300">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Page Sections */}
      <HeroSection />
      <div id="features">
        <FeaturesCarousel />
      </div>
      <div id="video-learning">
        <VideoLearningSection />
      </div>
      <StatsSection />
      <PartnerBenefitsSection />
      <div id="pricing">
        <PricingCTASection />
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl">Mindful Champion</span>
              </div>
              <p className="text-slate-400 text-sm">
                Transform your pickleball game with AI-powered coaching and insights.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/train/coach" className="hover:text-white">AI Coach</Link></li>
                <li><Link href="/train/video" className="hover:text-white">Video Analysis</Link></li>
                <li><Link href="/avatar-studio" className="hover:text-white">Pro Avatar</Link></li>
                <li><Link href="/train/drills" className="hover:text-white">Drill Library</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/connect/community" className="hover:text-white">Community</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} Mindful Champion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
