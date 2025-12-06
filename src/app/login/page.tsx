'use client';

import { useState } from 'react';
import { Button, Input, Card, CardBody } from '@/components/ui';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-nova-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-nova-400 to-nova-600 shadow-lg shadow-nova-500/25 mb-4">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Nova Creations</h1>
          <p className="text-slate-500 mt-1">Employee Portal</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardBody className="p-8">
            <h2 className="text-xl font-semibold text-slate-900 text-center mb-6">
              Sign in to your account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                Sign in
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
