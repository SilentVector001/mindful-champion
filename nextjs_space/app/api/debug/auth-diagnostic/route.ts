// @ts-nocheck
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  const testEmail = 'deansnow59@gmail.com'
  const testPassword = 'MindfulChampion2025!'
  
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL 
      ? `${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'PARSE_ERROR'}` 
      : 'NOT_SET',
    nextauthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
  }

  try {
    // Test DB connection
    const userCount = await prisma.user.count()
    results.dbConnected = true
    results.totalUsers = userCount

    // Find the test user
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        createdAt: true,
      }
    })

    if (user) {
      results.userFound = true
      results.userId = user.id
      results.userName = user.name
      results.userCreatedAt = user.createdAt
      results.passwordHashExists = !!user.password
      results.passwordHashLength = user.password?.length || 0
      results.passwordHashPrefix = user.password?.substring(0, 20) || 'N/A'
      
      // Test bcrypt compare
      if (user.password) {
        const isValid = await bcrypt.compare(testPassword, user.password)
        results.bcryptCompareResult = isValid
        
        // Also test with a fresh hash to verify bcrypt works
        const freshHash = await bcrypt.hash(testPassword, 10)
        const freshCompare = await bcrypt.compare(testPassword, freshHash)
        results.freshHashTest = freshCompare
      }
    } else {
      results.userFound = false
    }
  } catch (error: any) {
    results.error = error.message
    results.dbConnected = false
  }

  return NextResponse.json(results, { status: 200 })
}
