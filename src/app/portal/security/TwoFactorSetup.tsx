'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Modal } from '@/components/ui';
import toast from 'react-hot-toast';

export function TwoFactorSetup() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const startSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/setup');
      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to start 2FA setup');
        return;
      }

      setSetupData(data.data);
      setShowModal(true);
      setStep('qr');
    } catch (error) {
      console.error('Setup error:', error);
      toast.error('Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Verification failed');
        return;
      }

      setBackupCodes(data.data.backupCodes);
      setStep('backup');
      toast.success('2FA enabled successfully!');
    } catch (error) {
      console.error('Verify error:', error);
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const finishSetup = () => {
    setShowModal(false);
    setStep('qr');
    setSetupData(null);
    setVerificationCode('');
    setBackupCodes([]);
    router.refresh();
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('Backup codes copied to clipboard');
  };

  return (
    <>
      <Button onClick={startSetup} disabled={loading}>
        {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
      </Button>

      <Modal
        isOpen={showModal}
        onClose={step === 'backup' ? finishSetup : () => setShowModal(false)}
        title={
          step === 'qr' ? 'Set Up Two-Factor Authentication' :
          step === 'verify' ? 'Verify Setup' : 'Save Your Backup Codes'
        }
        size="lg"
      >
        {step === 'qr' && setupData && (
          <div className="space-y-6">
            <p className="text-slate-600">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
            </p>
            
            <div className="flex justify-center">
              <img src={setupData.qrCode} alt="2FA QR Code" className="border rounded-lg" />
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Can&apos;t scan? Enter this code manually:</p>
              <p className="font-mono text-sm bg-white px-3 py-2 rounded border select-all">{setupData.secret}</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStep('verify')}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <p className="text-slate-600">
              Enter the 6-digit code from your authenticator app to verify the setup:
            </p>
            
            <Input
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep('qr')}>
                Back
              </Button>
              <Button onClick={verifyCode} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-amber-800">Save these backup codes!</p>
                  <p className="text-sm text-amber-700 mt-1">
                    If you lose access to your authenticator app, you can use these codes to log in. Each code can only be used once.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <p key={index} className="font-mono text-sm bg-white px-3 py-2 rounded border text-center">
                    {code}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={copyBackupCodes}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Codes
              </Button>
              <Button onClick={finishSetup}>
                I&apos;ve Saved My Codes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

