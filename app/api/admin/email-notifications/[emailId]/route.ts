import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { emailId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emailId } = params;

    const email = await prisma.emailNotification.findUnique({
      where: { id: emailId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sponsorApplication: {
          select: {
            id: true,
            companyName: true,
            status: true,
          },
        },
        videoAnalysis: {
          select: {
            id: true,
            title: true,
            overallScore: true,
          },
        },
      },
    });

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json({ email }, { status: 200 });
  } catch (error) {
    console.error('Error fetching email details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
