import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function EmployeePayStubsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const employee = await prisma.employeeProfile.findUnique({
    where: { userId: user.id },
  });

  if (!employee) redirect('/portal');

  const payStubs = await prisma.payStub.findMany({
    where: { employeeId: employee.id },
    orderBy: { payDate: 'desc' },
  });

  // Calculate totals for current year
  const currentYear = new Date().getFullYear();
  const yearToDateStubs = payStubs.filter(
    (stub) => new Date(stub.payDate).getFullYear() === currentYear
  );
  const ytdGross = yearToDateStubs.reduce((sum, stub) => sum + Number(stub.grossPay), 0);
  const ytdNet = yearToDateStubs.reduce((sum, stub) => sum + Number(stub.netPay), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Pay Stubs</h1>
        <p className="text-slate-500 mt-1">View and download your pay stubs</p>
      </div>

      {/* Year to Date Summary */}
      <Card className="mb-6 bg-gradient-to-br from-nova-50 to-nova-100 border-nova-200">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-nova-700 mb-4">
            {currentYear} Year-to-Date Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-nova-600">Total Pay Stubs</p>
              <p className="text-2xl font-bold text-nova-800">{yearToDateStubs.length}</p>
            </div>
            <div>
              <p className="text-sm text-nova-600">YTD Gross Pay</p>
              <p className="text-2xl font-bold text-nova-800">
                ${ytdGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-nova-600">YTD Net Pay</p>
              <p className="text-2xl font-bold text-nova-800">
                ${ytdNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Pay Stubs List */}
      <Card>
        <CardHeader>
          <CardTitle>Pay Stub History</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {payStubs.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
              <p>No pay stubs available yet.</p>
              <p className="text-sm mt-1">Pay stubs will appear here once they are uploaded by your employer.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payStubs.map((stub) => (
                <div key={stub.id} className="px-6 py-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-nova-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-nova-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          Pay Date: {formatDate(stub.payDate)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Period: {formatDate(stub.payPeriodStart)} - {formatDate(stub.payPeriodEnd)}
                        </p>
                        {stub.hoursWorked && (
                          <p className="text-sm text-slate-500">
                            {Number(stub.hoursWorked)} hours worked
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Gross</p>
                        <p className="font-medium text-slate-700">
                          ${Number(stub.grossPay).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Net</p>
                        <p className="font-semibold text-emerald-600">
                          ${Number(stub.netPay).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <a
                        href={stub.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-nova-500 text-white text-sm font-medium rounded-lg hover:bg-nova-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

