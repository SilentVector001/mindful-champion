

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./ios-fixes.css"
import "./mobile-fixes.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster as SonnerToaster } from "sonner"
import { Toaster as ShadcnToaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/providers/session-provider"
import { PageTracker } from "@/components/tracking/PageTracker"
// CoachKaiWrapper is now used in specific pages that have user context
import WarningNotificationPopup from "@/components/notifications/warning-notification-popup"
import { LiveNowBanner } from "@/components/media/live-now-banner"

const inter = Inter({ subsets: ["latin"] })

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00D084" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1D29" },
  ],
}

export const metadata: Metadata = {
  title: "Mindful Champion - AI-Powered Pickleball Coaching",
  description: "Transform your pickleball game with AI coaching, performance analytics, mental training, and community features. Start your 7-day free trial today!",
  keywords: "pickleball, coaching, AI, training, performance, analytics, mindfulness, champion, mental game, drills, video analysis",
  authors: [{ name: "Mindful Champion Team" }],
  creator: "Mindful Champion",
  publisher: "Mindful Champion",
  applicationName: "Mindful Champion",
  category: "Sports & Recreation",
  
  // Comprehensive favicon and app icons
  icons: {
    icon: [
      { url: "https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png", sizes: "any" },
      { url: "https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png", sizes: "32x32" },
      { url: "https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png", sizes: "16x16" }
    ],
    shortcut: "https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png",
    apple: "https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png",
  },
  
  // Open Graph for Facebook, LinkedIn, etc.
  openGraph: {
    title: "Mindful Champion - AI-Powered Pickleball Coaching",
    description: "Transform your pickleball game with AI coaching, performance analytics, mental training, and community features. Start your 7-day free trial today!",
    url: "https://mindful-champion-fyid8m.abacusai.app",
    siteName: "Mindful Champion",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png",
        width: 2048,
        height: 2048,
        alt: "Mindful Champion - AI-Powered Pickleball Coaching Platform",
      }
    ],
  },
  
  // Twitter/X Cards
  twitter: {
    card: "summary_large_image",
    site: "@MindfulChampion",
    creator: "@MindfulChampion", 
    title: "Mindful Champion - AI-Powered Pickleball Coaching",
    description: "Transform your pickleball game with AI coaching, performance analytics, mental training, and community features. Start your 7-day free trial today!",
    images: ["https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png"]
  },
  
  // Additional SEO and app metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Apple-specific meta tags
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mindful Champion",
  },
  
  // Additional verification and tags
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification code when available
  },
}

// Cache-busting deployment - Nov 5, 2025 1:45 PM - Zello-style PTT & UI fixes
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* FIX: Prevent scroll restoration issues */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <PageTracker />
            <WarningNotificationPopup />
            <LiveNowBanner />
            {children}
            {/* Sonner toaster for forms and simple notifications */}
            <SonnerToaster 
              position="top-center"
              expand={true}
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: 'white',
                  color: '#1f2937',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                },
                className: 'toast-custom',
              }}
            />
            {/* Shadcn toaster for existing dashboard components */}
            <ShadcnToaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
