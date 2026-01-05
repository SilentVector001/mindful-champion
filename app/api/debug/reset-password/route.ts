import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword, secretKey } = await req.json();
    const envSecret = process.env.NEXTAUTH_SECRET || '';
    
    if (!secretKey || envSecret.substring(0, 20) !== secretKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
