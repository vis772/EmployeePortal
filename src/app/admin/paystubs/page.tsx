import { prisma } from '@/lib/db';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui';
import { formatDate, formatDateTime } from '@/lib/utils';
import { UploadPayStubButton } from './UploadPayStubButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PayStubsPage() {
  const [payStubs, employees] = await Promise.all([
    prisma.payStub.findMany({
      include: {
        employee: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { payDate: 'desc' },
    }),
    prisma.employeeProfile.findMany({
      where: { onboardingStatus: 'COMPLETED' },
      include: {
        user: { select: { email: true } },
      },
    }),
  ]);

  // Group pay stubs by employee
  const payStubsByEmployee = payStubs.reduce((acc, stub) => {
    const employeeId = stub.employeeId;
    if (!acc[employeeId]) {
      acc[employeeId] = [];
    }
    acc[employeeId].push(stub);
    return acc;
  }, {} as Record<string, typeof payStubs>);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pay Stubs</h1>
          <p className="text-slate-500 mt-1">Upload and manage employee pay stubs</p>
        </div>
        <UploadPayStubButton employees={employees.map(e => ({ 
          id: e.id, 
          name: e.fullName || e.user.email 
        }))} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody className="p-4">
            <p className="text-sm font-medium text-slate-500">Total Pay Stubs</p>
            <p className="text-2xl font-bold text-slate-900">{payStubs.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <p className="text-sm font-medium text-slate-500">Employees with Stubs</p>
            <p className="text-2xl font-bold text-slate-900">{Object.keys(payStubsByEmployee).length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <p className="text-sm font-medium text-slate-500">Latest Pay Date</p>
            <p className="text-2xl font-bold text-slate-900">
              {payStubs.length > 0 ? formatDate(payStubs[0].payDate) : 'N/A'}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pay Stubs</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {payStubs.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No pay stubs uploaded yet. Click &quot;Upload Pay Stub&quot; to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Employee</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Pay Period</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Pay Date</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-slate-700">Gross Pay</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-slate-700">Net Pay</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payStubs.map((stub) => (
                    <tr key={stub.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <Link 
                          href={`/admin/employees/${stub.employeeId}`}
                          className="font-medium text-slate-900 hover:text-nova-600"
                        >
                          {stub.employee.fullName || stub.employee.user.email}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(stub.payPeriodStart)} - {formatDate(stub.payPeriodEnd)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(stub.payDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 text-right font-medium">
                        ${Number(stub.grossPay).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 text-right font-medium">
                        ${Number(stub.netPay).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={stub.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-nova-500 hover:text-nova-600 text-sm font-medium"
                        >
                          View PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

