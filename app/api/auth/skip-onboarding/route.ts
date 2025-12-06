
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * EMERGENCY BYPASS ENDPOINT
 * 
 * This endpoint forces onboarding completion for stuck users.
 * Access at: /api/auth/skip-onboarding
 * 
 * Use this if you're stuck in an onboarding redirect loop.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated. Please log in first.' },
        { status: 401 }
      );
    }

    console.log('[SKIP-ONBOARDING] Force-completing onboarding for user:', session.user.email);

    // Force update user to have onboarding completed
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('[SKIP-ONBOARDING] Successfully updated user:', updatedUser.id);

    // Aggressively clear ALL caches
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/dashboard');
      revalidatePath('/onboarding');
      revalidatePath('/auth/signin');
      revalidatePath('/auth/callback');
      console.log('[SKIP-ONBOARDING] Cache cleared');
    } catch (revalidateError) {
      console.error('[SKIP-ONBOARDING] Revalidation error (non-fatal):', revalidateError);
    }

    // Return HTML with auto-redirect
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Onboarding Bypass - Mindful Champion</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 1rem;
              box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            }
            h1 { font-size: 2rem; margin-bottom: 1rem; }
            p { font-size: 1.1rem; margin: 0.5rem 0; }
            .spinner {
              border: 4px solid rgba(255, 255, 255, 0.3);
              border-top: 4px solid white;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 2rem auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .success { color: #10b981; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Onboarding Bypass Successful</h1>
            <p>Your account has been fixed!</p>
            <p class="success">Redirecting to dashboard...</p>
            <div class="spinner"></div>
            <p style="font-size: 0.9rem; margin-top: 2rem;">
              If you're not redirected automatically, 
              <a href="/dashboard" style="color: white; text-decoration: underline;">click here</a>
            </p>
          </div>
          <script>
            // Clear all caches and do a hard redirect
            if (window.caches) {
              caches.keys().then(function(names) {
                for (let name of names) caches.delete(name);
              });
            }
            
            // Clear session storage
            sessionStorage.clear();
            
            // Wait 2 seconds then hard redirect
            setTimeout(function() {
              window.location.href = '/dashboard';
            }, 2000);
          </script>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    console.error('[SKIP-ONBOARDING] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to bypass onboarding',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
