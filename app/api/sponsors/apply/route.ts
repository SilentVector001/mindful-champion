import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendSponsorApplicationEmail } from '@/lib/email/sponsor-application-email';
import { sendSponsorAdminNotificationEmail } from '@/lib/email/sponsor-admin-notification-email';

export const dynamic = 'force-dynamic';

// POST - Submit sponsor application (PUBLIC - no auth required)
export async function POST(req: NextRequest) {
  try {
    console.log('📝 Sponsor application API called');
    
    // Parse request body with error handling
    let data;
    try {
      data = await req.json();
      console.log('📋 Received data:', { 
        companyName: data?.companyName, 
        email: data?.email,
        contactPerson: data?.contactPerson,
        interestedTier: data?.interestedTier
      });
    } catch (parseError) {
      console.error('❌ Failed to parse request JSON:', parseError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request format. Please ensure all form data is valid.' 
        },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!data?.companyName?.trim()) {
      console.error('❌ Validation failed: Missing companyName');
      return NextResponse.json(
        { 
          success: false,
          error: 'Company name is required' 
        },
        { status: 400 }
      );
    }

    if (!data?.email?.trim()) {
      console.error('❌ Validation failed: Missing email');
      return NextResponse.json(
        { 
          success: false,
          error: 'Email address is required' 
        },
        { status: 400 }
      );
    }

    if (!data?.contactPerson?.trim()) {
      console.error('❌ Validation failed: Missing contactPerson');
      return NextResponse.json(
        { 
          success: false,
          error: 'Contact person name is required' 
        },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      console.error('❌ Validation failed: Invalid email format');
      return NextResponse.json(
        { 
          success: false,
          error: 'Please enter a valid email address' 
        },
        { status: 400 }
      );
    }

    console.log('🔍 Checking for existing applications...');
    
    // Check if company already has a pending or approved application
    const existingApplication = await prisma.sponsorApplication.findFirst({
      where: {
        email: data.email,
        status: { in: ['PENDING', 'UNDER_REVIEW', 'APPROVED'] }
      }
    });

    if (existingApplication) {
      console.log('⚠️ Existing application found for email:', data.email);
      return NextResponse.json(
        { 
          success: false,
          error: 'An active application already exists for this email address. Please check your inbox or contact our partnerships team.' 
        },
        { status: 400 }
      );
    }

    console.log('💾 Creating new application in database...');

    // Create the application
    const application = await prisma.sponsorApplication.create({
      data: {
        companyName: data.companyName.trim(),
        website: data.website?.trim() || null,
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        contactPerson: data.contactPerson.trim(),
        industry: data.industry?.trim() || 'Not specified',
        description: data.description?.trim() || '',
        yearsInBusiness: data.yearsInBusiness ? parseInt(data.yearsInBusiness, 10) : null,
        socialMedia: data.socialMedia || {},
        interestedTier: data.interestedTier || 'BRONZE',
        proposedProducts: data.proposedProducts || [],
        marketingGoals: data.marketingGoals?.trim() || null,
        targetAudience: data.targetAudience?.trim() || null,
      },
    });

    console.log('✅ Application created with ID:', application.id);

    // Send confirmation email to applicant
    let emailSent = false;
    try {
      console.log('📧 Sending confirmation email to applicant...');
      await sendSponsorApplicationEmail({
        companyName: application.companyName,
        contactPerson: application.contactPerson,
        email: application.email,
        interestedTier: application.interestedTier,
        applicationId: application.id,
      });
      emailSent = true;
      console.log(`✅ Confirmation email sent to ${application.email}`);
    } catch (emailError: any) {
      // Log but don't fail the application if email fails
      console.error('⚠️ Failed to send confirmation email:', emailError);
      console.error('Email error details:', emailError?.message);
      // Still return success since the application was saved
    }

    // Send admin notification email
    let adminEmailSent = false;
    try {
      console.log('📧 Sending admin notification email...');
      await sendSponsorAdminNotificationEmail({
        companyName: application.companyName,
        contactPerson: application.contactPerson,
        email: application.email,
        phone: application.phone,
        website: application.website,
        industry: application.industry,
        interestedTier: application.interestedTier,
        applicationId: application.id,
        description: application.description || undefined,
        yearsInBusiness: application.yearsInBusiness,
        proposedProducts: application.proposedProducts as string[] || undefined,
        marketingGoals: application.marketingGoals,
        targetAudience: application.targetAudience,
      });
      adminEmailSent = true;
      console.log(`✅ Admin notification email sent`);
    } catch (emailError: any) {
      // Log but don't fail the application if email fails
      console.error('⚠️ Failed to send admin notification email:', emailError);
      console.error('Email error details:', emailError?.message);
      // Still return success since the application was saved
    }

    const response = {
      success: true,
      application: {
        id: application.id,
        companyName: application.companyName,
        email: application.email,
        status: application.status,
        createdAt: application.createdAt.toISOString(),
      },
      emailSent,
      message: emailSent 
        ? 'Application submitted successfully! Check your email for confirmation and next steps.'
        : 'Application submitted successfully! We\'ll contact you at the email provided within 3-5 business days.'
    };
    
    console.log('✅ Application created successfully, returning response');
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('❌ Sponsor application error:', error);
    console.error('Error stack:', error?.stack);
    
    // Return a proper JSON error response
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || 'An unexpected error occurred. Please try again or contact support if the problem persists.',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Check application status (REQUIRES AUTH - user can only see their own application)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const application = await prisma.sponsorApplication.findFirst({
      where: { email: session.user.email },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('❌ Get application error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}
