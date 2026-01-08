// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await prisma.user.findUnique({ 
      where: { email: 'deansnow59@gmail.com' },
      select: { id: true, email: true, name: true, password: true }
    });
    return NextResponse.json({ 
      success: true, 
      userExists: !!user,
      userId: user?.id,
      hasPassword: !!user?.password,
      passwordLength: user?.password?.length
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
