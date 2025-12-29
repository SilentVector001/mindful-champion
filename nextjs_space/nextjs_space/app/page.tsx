

import SimpleLandingPage from "@/components/landing/simple-landing-page"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // No redirects here - let everyone see the landing page
  // Simple, powerful, and engaging landing page following KISS principle
  
  return <SimpleLandingPage />
}
