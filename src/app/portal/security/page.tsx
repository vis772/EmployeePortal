import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui';
import { TwoFactorSetup } from './TwoFactorSetup';
import { DisableTwoFactor } from './DisableTwoFactor';
import { ChangePassword } from './ChangePassword';

export const dynamic = 'force-dynamic';

export default async function SecurityPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { totpEnabled: true },
  });

  const is2FAEnabled = dbUser?.totpEnabled || false;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Security Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account security</p>
      </div>

      {/* Change Password */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-nova-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Change Password
          </CardTitle>
        </CardHeader>
        <CardBody>
          <ChangePassword />
        </CardBody>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-nova-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Two-Factor Authentication (2FA)
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              is2FAEnabled ? 'bg-emerald-100' : 'bg-amber-100'
            }`}>
              {is2FAEnabled ? (
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900">
                {is2FAEnabled ? '2FA is Enabled' : '2FA is Not Enabled'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {is2FAEnabled
                  ? 'Your account is protected with two-factor authentication. You will need your authenticator app to log in.'
                  : 'Add an extra layer of security to your account by enabling two-factor authentication.'}
              </p>
            </div>
          </div>

          <div className="mt-6">
            {is2FAEnabled ? (
              <DisableTwoFactor />
            ) : (
              <TwoFactorSetup />
            )}
          </div>
        </CardBody>
      </Card>

      {/* Security Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Security Tips</CardTitle>
        </CardHeader>
        <CardBody>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-nova-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-slate-600">Use a unique password that you don&apos;t use for other accounts</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-nova-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-slate-600">Enable two-factor authentication for extra protection</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-nova-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-slate-600">Keep your backup codes in a safe place</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-nova-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-slate-600">Never share your password or 2FA codes with anyone</span>
            </li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

