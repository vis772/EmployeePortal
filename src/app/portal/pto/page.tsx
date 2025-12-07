import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatDate, formatDateTime } from '@/lib/utils';
import { PTORequestForm } from './PTORequestForm';
import { CancelPTOButton } from './CancelPTOButton';

export const dynamic = 'force-dynamic';

export default async function PTOPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const employee = await prisma.employeeProfile.findUnique({
    where: { userId: user.id },
  });

  if (!employee) redirect('/portal');

  const [requests, balance] = await Promise.all([
    prisma.pTORequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.pTOBalance.findUnique({
      where: { employeeId: employee.id },
    }),
  ]);

  // Default balance if none exists
  const ptoBalance = balance || {
    vacationDays: 10,
    sickDays: 5,
    personalDays: 3,
    vacationUsed: 0,
    sickUsed: 0,
    personalUsed: 0,
  };

  const vacationRemaining = Number(ptoBalance.vacationDays) - Number(ptoBalance.vacationUsed);
  const sickRemaining = Number(ptoBalance.sickDays) - Number(ptoBalance.sickUsed);
  const personalRemaining = Number(ptoBalance.personalDays) - Number(ptoBalance.personalUsed);

  const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    PENDING: 'warning',
    APPROVED: 'success',
    DENIED: 'danger',
    CANCELLED: 'default',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Time Off</h1>
        <p className="text-slate-500 mt-1">Request and manage your time off</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Vacation</p>
                <p className="text-2xl font-bold text-blue-700">{vacationRemaining} days</p>
                <p className="text-xs text-blue-500">of {Number(ptoBalance.vacationDays)} total</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Sick Leave</p>
                <p className="text-2xl font-bold text-red-700">{sickRemaining} days</p>
                <p className="text-xs text-red-500">of {Number(ptoBalance.sickDays)} total</p>
              </div>
              <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Personal</p>
                <p className="text-2xl font-bold text-purple-700">{personalRemaining} days</p>
                <p className="text-xs text-purple-500">of {Number(ptoBalance.personalDays)} total</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Request Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Request Time Off</CardTitle>
        </CardHeader>
        <CardBody>
          <PTORequestForm 
            vacationRemaining={vacationRemaining}
            sickRemaining={sickRemaining}
            personalRemaining={personalRemaining}
          />
        </CardBody>
      </Card>

      {/* Request History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {requests.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No time off requests yet</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((request) => (
                <div key={request.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {request.type === 'VACATION' ? 'Vacation' : 
                           request.type === 'SICK' ? 'Sick Leave' : 'Personal'}
                        </span>
                        <Badge variant={statusColors[request.status]}>
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        {' • '}
                        {Number(request.totalDays)} day{Number(request.totalDays) !== 1 ? 's' : ''}
                      </p>
                      {request.reason && (
                        <p className="text-sm text-slate-500 mt-1">{request.reason}</p>
                      )}
                      {request.reviewNotes && (
                        <p className="text-sm text-slate-500 mt-1 italic">
                          Admin note: {request.reviewNotes}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        Submitted {formatDateTime(request.createdAt)}
                      </p>
                    </div>
                    
                    {request.status === 'PENDING' && (
                      <CancelPTOButton requestId={request.id} />
                    )}
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

