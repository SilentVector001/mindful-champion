

import AIFirstLandingPage from "@/components/landing/ai-first-landing-page"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Landing page accessible to all users
  // The landing page component handles showing appropriate content
  // for authenticated vs unauthenticated users via useSession()
  
  return <AIFirstLandingPage />
}
