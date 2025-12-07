'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Modal } from '@/components/ui';
import toast from 'react-hot-toast';

export function DisableTwoFactor() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDisable = async () => {
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to disable 2FA');
        return;
      }

      toast.success('2FA has been disabled');
      setShowModal(false);
      setPassword('');
      router.refresh();
    } catch (error) {
      console.error('Disable error:', error);
      toast.error('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setShowModal(true)} className="text-red-600 border-red-200 hover:bg-red-50">
        Disable Two-Factor Authentication
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setPassword('');
        }}
        title="Disable Two-Factor Authentication"
      >
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium text-red-800">Warning</p>
                <p className="text-sm text-red-700 mt-1">
                  Disabling 2FA will make your account less secure. You will only need your password to log in.
                </p>
              </div>
            </div>
          </div>

          <p className="text-slate-600">
            Enter your password to confirm you want to disable two-factor authentication:
          </p>
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoFocus
          />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDisable} disabled={loading}>
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

