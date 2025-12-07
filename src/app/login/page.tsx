'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card, CardBody } from '@/components/ui';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totpCode: requires2FA ? totpCode : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Check if 2FA is required
        if (data.requires2FA) {
          setRequires2FA(true);
          if (data.error !== '2FA code required') {
            toast.error(data.error || 'Invalid 2FA code');
          }
          setIsLoading(false);
          return;
        }
        
        setErrors({ form: data.error || 'Login failed' });
        toast.error(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      toast.success('Login successful!');

      // Determine redirect URL
      let redirectUrl = '/admin';
      if (data.data.role !== 'ADMIN') {
        redirectUrl = '/portal';
      }
      
      // Force redirect after a short delay to ensure cookie is set
      setTimeout(() => {
        window.location.replace(redirectUrl);
      }, 300);
      
    } catch (error) {
      setErrors({ form: 'An error occurred. Please try again.' });
      toast.error('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-nova-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-nova-400 to-nova-600 shadow-lg shadow-nova-500/25 mb-3 sm:mb-4">
            <span className="text-white font-bold text-xl sm:text-2xl">N</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Nova Creations</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Employee Portal</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardBody className="p-5 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900 text-center mb-6">
              Sign in to your account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!requires2FA ? (
                <>
                  <Input
                    label="Email address"
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    required
                  />

                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                    required
                  />

                  <div className="flex items-center justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-nova-600 hover:text-nova-700 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-nova-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-nova-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-slate-500 mt-1">Enter the code from your authenticator app</p>
                  </div>
                  
                  <Input
                    label="Authentication Code"
                    type="text"
                    name="totpCode"
                    placeholder="Enter 6-digit code"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    maxLength={8}
                    autoFocus
                    required
                  />
                  
                  <p className="text-xs text-slate-500 text-center">
                    You can also use a backup code
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setRequires2FA(false);
                      setTotpCode('');
                    }}
                    className="w-full text-sm text-nova-600 hover:text-nova-700"
                  >
                    ← Back to login
                  </button>
                </div>
              )}

              {errors.form && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{errors.form}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                {requires2FA ? 'Verify' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Contact your administrator if you need access.
            </p>
          </CardBody>
        </Card>

        <p className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Nova Creations. All rights reserved.
        </p>
      </div>
    </div>
  );
}
