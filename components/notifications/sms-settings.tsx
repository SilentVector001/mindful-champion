'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Check, 
  X, 
  Loader2, 
  Shield, 
  Trash2,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface SMSSettingsProps {
  onVerified?: () => void;
}

export default function SMSSettings({ onVerified }: SMSSettingsProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentPhone, setCurrentPhone] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPhoneStatus();
  }, []);

  const fetchPhoneStatus = async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/notifications/phone');
      if (response.ok) {
        const data = await response.json();
        setCurrentPhone(data.phoneNumber);
        setIsVerified(data.verified);
      }
    } catch (error) {
      console.error('Failed to fetch phone status:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  const handleSendCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      const data = await response.json();

      if (response.ok) {
        setStep('verify');
        toast.success('Verification code sent!');
      } else {
        setError(data.error || 'Failed to send code');
        toast.error(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      toast.error('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/phone', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      });

      const data = await response.json();

      if (response.ok) {
        setIsVerified(true);
        setCurrentPhone(phoneNumber);
        setStep('input');
        setPhoneNumber('');
        setVerificationCode('');
        toast.success('Phone number verified! You can now receive SMS notifications.');
        onVerified?.();
      } else {
        setError(data.error || 'Invalid code');
        toast.error(data.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      toast.error('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePhone = async () => {
    if (!confirm('Are you sure you want to remove your phone number? You will stop receiving SMS notifications.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/phone', {
        method: 'DELETE'
      });

      if (response.ok) {
        setCurrentPhone(null);
        setIsVerified(false);
        toast.success('Phone number removed');
      } else {
        toast.error('Failed to remove phone number');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600">
          <Smartphone className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">SMS Notifications</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get reminders and updates via text message
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isVerified && currentPhone ? (
          <motion.div
            key="verified"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Check className="h-5 w-5" />
                <span className="font-medium">Phone Verified</span>
              </div>
              <p className="mt-1 text-sm text-green-600 dark:text-green-500">
                {formatPhoneDisplay(currentPhone)}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <MessageSquare className="h-4 w-4" />
              <span>You'll receive goal reminders, achievements, and daily motivation texts</span>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRemovePhone}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Phone Number
            </Button>
          </motion.div>
        ) : step === 'input' ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="(555) 555-5555"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                US numbers only. Standard message rates may apply.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-start gap-2 text-xs text-gray-500">
              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                We'll never share your number or spam you. You can opt out anytime.
              </span>
            </div>

            <Button
              onClick={handleSendCode}
              disabled={!phoneNumber || isLoading}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter the 6-digit code sent to
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatPhoneDisplay(phoneNumber)}
              </p>
            </div>

            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="mt-1 text-center text-2xl tracking-widest"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('input');
                  setVerificationCode('');
                  setError(null);
                }}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6 || isLoading}
                className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </Button>
            </div>

            <button
              onClick={handleSendCode}
              disabled={isLoading}
              className="w-full text-sm text-teal-600 hover:text-teal-700 disabled:opacity-50"
            >
              Didn't receive code? Send again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
