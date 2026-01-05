import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'DEFINED (length: ' + process.env.DATABASE_URL.length + ')' : 'UNDEFINED',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'DEFINED' : 'UNDEFINED',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'UNDEFINED',
    }
  });
}
