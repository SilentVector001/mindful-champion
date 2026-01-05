import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: 'deansnow59@gmail.com', mode: 'insensitive' } },
      select: { id: true, email: true, password: true }
    })
    
    const testResult = user?.password 
      ? await bcrypt.compare('MindfulChampion2025!', user.password)
      : false
    
    return NextResponse.json({
      dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 40),
      userFound: !!user,
      userId: user?.id,
      passLen: user?.password?.length,
      passValid: testResult
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
