import { prisma } from '@/lib/db';
import { Card, CardBody, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatDate, formatDateTime } from '@/lib/utils';
import { PTOActionButtons } from './PTOActionButtons';

export const dynamic = 'force-dynamic';

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  DENIED: 'danger',
  CANCELLED: 'default',
};

const typeLabels: Record<string, string> = {
  VACATION: 'Vacation',
  SICK: 'Sick Leave',
  PERSONAL: 'Personal',
};

export default async function PTORequestsPage() {
  const requests = await prisma.pTORequest.findMany({
    include: {
      employee: {
        include: {
          user: { select: { email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">PTO Requests</h1>
        <p className="text-slate-500 mt-1">Manage employee time off requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-amber-50 border-amber-200">
          <CardBody className="p-4">
            <p className="text-sm font-medium text-amber-600">Pending Review</p>
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          </CardBody>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardBody className="p-4">
            <p className="text-sm font-medium text-emerald-600">Approved</p>
            <p className="text-2xl font-bold text-emerald-700">
              {requests.filter((r) => r.status === 'APPROVED').length}
            </p>
          </CardBody>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardBody className="p-4">
            <p className="text-sm font-medium text-red-600">Denied</p>
            <p className="text-2xl font-bold text-red-700">
              {requests.filter((r) => r.status === 'DENIED').length}
            </p>
          </CardBody>
        </Card>
        <Card className="bg-slate-50 border-slate-200">
          <CardBody className="p-4">
            <p className="text-sm font-medium text-slate-600">Total Requests</p>
            <p className="text-2xl font-bold text-slate-700">{requests.length}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {requests.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No PTO requests yet</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((request) => (
                <div key={request.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        request.type === 'VACATION' ? 'bg-blue-100' :
                        request.type === 'SICK' ? 'bg-red-100' : 'bg-purple-100'
                      }`}>
                        {request.type === 'VACATION' ? (
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                        ) : request.type === 'SICK' ? (
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {request.employee.fullName || request.employee.user.email}
                          </span>
                          <Badge variant={statusColors[request.status]}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          <span className="font-medium">{typeLabels[request.type]}</span>
                          {' • '}
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          {' • '}
                          <span className="font-medium">{Number(request.totalDays)} day{Number(request.totalDays) !== 1 ? 's' : ''}</span>
                        </p>
                        {request.reason && (
                          <p className="text-sm text-slate-500 mt-1">
                            Reason: {request.reason}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          Submitted {formatDateTime(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    {request.status === 'PENDING' && (
                      <PTOActionButtons requestId={request.id} />
                    )}

                    {request.status !== 'PENDING' && request.reviewNotes && (
                      <div className="text-right">
                        <p className="text-sm text-slate-500">{request.reviewNotes}</p>
                        {request.reviewedAt && (
                          <p className="text-xs text-slate-400 mt-1">
                            Reviewed {formatDateTime(request.reviewedAt)}
                          </p>
                        )}
                      </div>
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

