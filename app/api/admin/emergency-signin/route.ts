import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, emergencyKey } = await request.json();
    
    // Emergency key for temporary access
    if (emergencyKey !== 'MINDFUL_EMERGENCY_2025') {
      return NextResponse.json({ error: 'Invalid emergency key' }, { status: 403 });
    }
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return NextResponse.json({ 
        error: 'Password invalid',
        debug: {
          passwordLength: password.length,
          hashLength: user.password.length,
          hashPrefix: user.password.substring(0, 10)
        }
      }, { status: 401 });
    }
    
    // Return success with user info
    return NextResponse.json({
      success: true,
      message: 'Password is correct! The issue is with NextAuth configuration.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      recommendation: 'The password is correct in the database. The issue is likely with NextAuth session handling or bcrypt configuration in production.'
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
