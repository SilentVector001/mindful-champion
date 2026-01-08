// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get the DATABASE_URL being used
    const dbUrl = process.env.DATABASE_URL || "NOT SET";
    
    // Hide password for security
    const sanitizedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    
    // Check if user exists in THIS database
    const user = await prisma.user.findFirst({
      where: { email: 'deansnow59@gmail.com' },
      select: {
        id: true,
        email: true,
        createdAt: true,
        emailVerified: true,
        password: true
      }
    });
    
    return NextResponse.json({
      success: true,
      database: {
        url: sanitizedUrl,
        type: dbUrl.includes('neon.tech') ? 'NEON' : 
              dbUrl.includes('reai.io') ? 'ABACUS' : 'UNKNOWN'
      },
      user: user ? {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
        hasPassword: !!user.password,
        passwordPrefix: user.password?.substring(0, 10)
      } : null,
      userFound: !!user
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
