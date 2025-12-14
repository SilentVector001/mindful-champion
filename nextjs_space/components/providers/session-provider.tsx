
"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { SessionProvider as TrackingSessionProvider } from "@/app/lib/tracking"
import { ReactNode } from "react"

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      <TrackingSessionProvider>
        {children}
      </TrackingSessionProvider>
    </NextAuthSessionProvider>
  )
}
