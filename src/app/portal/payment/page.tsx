import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardBody, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatStatus, formatDateTime } from '@/lib/utils';
import { PaymentEditForm } from './PaymentEditForm';

export const dynamic = 'force-dynamic';

async function getBankDetails(userId: string) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId },
    include: { bankDetails: true },
  });
  return profile?.bankDetails;
}

export default async function PaymentPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const bankDetails = await getBankDetails(user.id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Payment Information</h1>
        <p className="text-slate-500 mt-1">Manage your bank details for payroll</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current bank info */}
        <Card>
          <CardHeader>
            <CardTitle>Current Bank Details</CardTitle>
          </CardHeader>
          <CardBody>
            {bankDetails ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{bankDetails.bankName}</p>
                      <p className="text-sm text-slate-500">{formatStatus(bankDetails.accountType)} Account</p>
                    </div>
                  </div>
                  
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Account Number</dt>
                      <dd className="text-slate-900 font-mono">****{bankDetails.last4Account}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Routing Number</dt>
                      <dd className="text-slate-900 font-mono">{bankDetails.routingNumber}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Last updated</span>
                  <span className="text-slate-700">{formatDateTime(bankDetails.updatedAt)}</span>
                </div>

                {bankDetails.confirmed && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Confirmed for direct deposit</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-slate-500">No bank details on file</p>
                <p className="text-sm text-slate-400 mt-1">Add your bank information to receive payments</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Update form */}
        <Card>
          <CardHeader>
            <CardTitle>Update Bank Details</CardTitle>
          </CardHeader>
          <CardBody>
            <PaymentEditForm bankDetails={bankDetails ?? null} />
          </CardBody>
        </Card>
      </div>

      {/* Info note */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-amber-800">Important</p>
            <p className="text-sm text-amber-700 mt-1">
              Changes to your bank details may take 1-2 pay cycles to take effect. 
              Please ensure your information is correct before submitting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

