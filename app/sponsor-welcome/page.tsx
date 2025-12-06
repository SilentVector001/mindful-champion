
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, ArrowRight, Sparkles, Upload, BarChart3, Package } from 'lucide-react';
import { Suspense } from 'react';

function SponsorWelcomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId] = useState(searchParams?.get('session_id'));

  useEffect(() => {
    // Verify session is valid
    const verifySession = async () => {
      if (!sessionId) {
        router.push('/partners/become-sponsor');
        return;
      }

      // Session is valid - account will be created via webhook
      setIsLoading(false);
    };

    verifySession();
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to Mindful Champion!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your sponsorship payment has been processed successfully!
          </p>
          <p className="text-lg text-gray-500">
            We're setting up your sponsor account right now...
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl mb-8">
            <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                What Happens Next?
              </CardTitle>
              <CardDescription className="text-cyan-50">
                You'll receive your login credentials within the next few minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <Alert className="bg-blue-50 border-blue-200 mb-6">
                <AlertDescription>
                  <strong className="text-blue-900">Check your email!</strong> We're sending your sponsor account credentials to the email address you provided. 
                  The email should arrive within 2-5 minutes.
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Check Your Email</h3>
                    <p className="text-gray-600">
                      Look for an email from Mindful Champion with your temporary login credentials and next steps.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Login to Your Dashboard</h3>
                    <p className="text-gray-600">
                      Use your credentials to access your sponsor dashboard and change your password.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Set Up Your Profile</h3>
                    <p className="text-gray-600">
                      Upload your company logo, add your brand description, and customize your sponsor profile.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Add Your Products</h3>
                    <p className="text-gray-600">
                      Start adding products to the rewards marketplace so players can redeem them with their points!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Quick Start Checklist</CardTitle>
              <CardDescription>Everything you need to launch your sponsorship</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-cyan-600" />
                  <h3 className="font-semibold mb-2">Upload Logo</h3>
                  <p className="text-sm text-gray-600">
                    Add your company logo to appear in the marketplace
                  </p>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Package className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold mb-2">Add Products</h3>
                  <p className="text-sm text-gray-600">
                    List your products with descriptions and point values
                  </p>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold mb-2">Track Analytics</h3>
                  <p className="text-sm text-gray-600">
                    Monitor impressions, clicks, and redemptions in real-time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <Button
              onClick={() => router.push('/auth/signin')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg px-8 py-6"
            >
              Go to Login Page
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="text-sm text-gray-500">
              Need help?{' '}
              <a
                href="mailto:partnerships@mindfulchampion.com"
                className="text-cyan-600 hover:text-cyan-700 underline"
              >
                Contact our partnerships team
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SponsorWelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SponsorWelcomeContent />
    </Suspense>
  );
}

// Mark this page as dynamic since it uses searchParams
export const dynamic = 'force-dynamic';
