import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure Prisma with optimized settings for serverless/edge environments
// and proper connection pooling to prevent "too many connections" errors
// Add connection limit to DATABASE_URL: ?connection_limit=5&pool_timeout=10
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL || ''
  if (baseUrl && !baseUrl.includes('connection_limit')) {
    const separator = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${separator}connection_limit=3&pool_timeout=10`
  }
  return baseUrl
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
})

// Ensure singleton in all environments
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

// Handle graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
  
  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}
