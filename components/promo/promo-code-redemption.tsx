
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Trophy,
  Calendar,
  DollarSign,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

interface RedemptionDetails {
  subscriptionTier: string;
  trialEndDate: Date;
  durationDays: number;
  isBetaTester: boolean;
  rewardAmount?: number;
  description?: string;
}

export function PromoCodeRedemption() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState<RedemptionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setLoading(true);
    setError(null);
    setRedemptionSuccess(null);

    try {
      const response = await fetch('/api/promo-codes/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.toUpperCase().trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to redeem promo code');
        toast.error(data.error || 'Failed to redeem promo code');
        return;
      }

      setRedemptionSuccess(data.details);
      setCode('');
      toast.success('Promo code redeemed successfully!');
      
      // Reload the page after 2 seconds to reflect new subscription status
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error('Error redeeming promo code:', err);
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 opacity-50" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-200 to-transparent opacity-30 rounded-full blur-3xl" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Redeem Promo Code
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Enter your beta tester or premium access code
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        <AnimatePresence mode="wait">
          {redemptionSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Alert className="border-green-500/50 bg-green-50/50 backdrop-blur-sm">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800">
                  <span className="font-semibold">Success!</span> Your promo code has been redeemed.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 p-4 bg-white/50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Subscription Tier
                  </span>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    {redemptionSuccess.subscriptionTier}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Access Duration
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {redemptionSuccess.durationDays} days
                  </span>
                </div>

                {redemptionSuccess.isBetaTester && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Beta Tester
                      </span>
                      <Badge variant="outline" className="border-blue-500 text-blue-600">
                        Active
                      </Badge>
                    </div>

                    {redemptionSuccess.rewardAmount && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Completion Reward
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          ${redemptionSuccess.rewardAmount} Amazon Gift Card
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {redemptionSuccess.isBetaTester && (
                <Alert className="border-blue-500/50 bg-blue-50/50">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    <span className="font-semibold">Welcome to Beta!</span> Check your dashboard to see your beta testing tasks and progress.
                  </AlertDescription>
                </Alert>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label htmlFor="promo-code" className="text-sm font-medium text-gray-700">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <Input
                    id="promo-code"
                    type="text"
                    placeholder="Enter code (e.g., BETA-2024-0001)"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRedeem();
                      }
                    }}
                    disabled={loading}
                    className="flex-1 font-mono tracking-wider"
                    maxLength={20}
                  />
                  <Button
                    onClick={handleRedeem}
                    disabled={loading || !code.trim()}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redeeming...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        Redeem
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert variant="destructive" className="bg-red-50/50 backdrop-blur-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 How to use:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Enter your promo code exactly as provided</li>
                  <li>• Code format: BETA-2024-XXXX</li>
                  <li>• One-time use per account</li>
                  <li>• Codes expire after 90 days</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
