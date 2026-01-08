// @ts-nocheck
console.log('[NEXTAUTH-ROUTE] File loaded at:', new Date().toISOString());
// Force Node.js runtime for bcryptjs compatibility (not Edge)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
