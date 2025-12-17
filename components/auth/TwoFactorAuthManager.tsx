
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, ShieldCheck, ShieldOff, Copy, CheckCircle2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface User {
  twoFactorEnabled?: boolean;
  phoneNumberVerified?: boolean;
  phoneNumber?: string;
}

interface TwoFactorAuthManagerProps {
  user: User;
  onUpdate?: () => void;
}

export default function TwoFactorAuthManager({ user, onUpdate }: TwoFactorAuthManagerProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [step, setStep] = useState<'main' | 'verify' | 'disable'>('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedCodes, setCopiedCodes] = useState(false);

  const handleEnable2FA = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enable 2FA');
      }

      setSuccess('Verification code sent to your phone!');
      setStep('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/2fa/verify-and-enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify code');
      }

      setBackupCodes(data.backupCodes);
      setSuccess('2FA enabled successfully! Please save your backup codes.');
      setVerificationCode('');
      
      // Call onUpdate after a delay to let user see the success message
      setTimeout(() => {
        onUpdate?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA');
      }

      setSuccess('2FA has been disabled.');
      setPassword('');
      setStep('main');
      
      setTimeout(() => {
        onUpdate?.();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindful-champion-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Show backup codes after enabling 2FA
  if (backupCodes.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            2FA Enabled Successfully!
          </CardTitle>
          <CardDescription>
            Save these backup codes in a safe place. You'll need them if you lose access to your phone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-yellow-800">
              <strong>Important:</strong> Each backup code can only be used once. Store them securely!
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-500">{index + 1}.</span>
                  <span className="font-bold">{code}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={copyBackupCodes} variant="outline" className="flex-1">
              {copiedCodes ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Codes
                </>
              )}
            </Button>
            <Button onClick={downloadBackupCodes} variant="outline" className="flex-1">
              Download Codes
            </Button>
          </div>

          <Button onClick={() => {
            setBackupCodes([]);
            setStep('main');
          }} className="w-full">
            I've Saved My Codes
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with SMS verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {!user.phoneNumberVerified && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              You must verify your phone number before enabling 2FA.
            </AlertDescription>
          </Alert>
        )}

        {step === 'main' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-gray-600">
                  {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              {user.twoFactorEnabled ? (
                <ShieldCheck className="h-8 w-8 text-green-600" />
              ) : (
                <ShieldOff className="h-8 w-8 text-gray-400" />
              )}
            </div>

            {user.phoneNumber && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Phone Number</p>
                <p className="text-sm text-gray-600">{user.phoneNumber}</p>
                {user.phoneNumberVerified && (
                  <p className="text-xs text-green-600 mt-1">✓ Verified</p>
                )}
              </div>
            )}

            {!user.twoFactorEnabled ? (
              <Button
                onClick={handleEnable2FA}
                disabled={!user.phoneNumberVerified || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enabling...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Enable 2FA
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setStep('disable')}
                variant="destructive"
                className="w-full"
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                Disable 2FA
              </Button>
            )}
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyAndEnable} className="space-y-4">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                required
                className="mt-1 text-center text-2xl tracking-widest"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the code sent to your phone
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep('main');
                  setVerificationCode('');
                  setError('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Enable'
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 'disable' && (
          <form onSubmit={handleDisable2FA} className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Warning:</strong> Disabling 2FA will make your account less secure.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="password">Confirm Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter your password to confirm
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep('main');
                  setPassword('');
                  setError('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  'Disable 2FA'
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
