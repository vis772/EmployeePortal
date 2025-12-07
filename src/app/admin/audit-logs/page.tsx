import { prisma } from '@/lib/db';
import { Card, CardBody, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { AuditLogFilters } from './AuditLogFilters';

export const dynamic = 'force-dynamic';

const actionColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  LOGIN: 'success',
  LOGOUT: 'default',
  LOGIN_FAILED: 'danger',
  PASSWORD_RESET_REQUEST: 'warning',
  PASSWORD_RESET_COMPLETE: 'success',
  TWO_FACTOR_ENABLED: 'success',
  TWO_FACTOR_DISABLED: 'warning',
  PROFILE_UPDATE: 'default',
  EMPLOYEE_CREATE: 'success',
  EMPLOYEE_UPDATE: 'default',
  EMPLOYEE_DELETE: 'danger',
  PTO_REQUEST_CREATE: 'default',
  PTO_REQUEST_APPROVE: 'success',
  PTO_REQUEST_DENY: 'danger',
  PTO_REQUEST_CANCEL: 'warning',
  PAYSTUB_UPLOAD: 'success',
  PAYSTUB_VIEW: 'default',
  DOCUMENT_UPLOAD: 'success',
  DOCUMENT_VIEW: 'default',
  SETTINGS_UPDATE: 'warning',
};

const actionLabels: Record<string, string> = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  LOGIN_FAILED: 'Failed Login',
  PASSWORD_RESET_REQUEST: 'Password Reset Request',
  PASSWORD_RESET_COMPLETE: 'Password Reset',
  TWO_FACTOR_ENABLED: '2FA Enabled',
  TWO_FACTOR_DISABLED: '2FA Disabled',
  PROFILE_UPDATE: 'Profile Update',
  EMPLOYEE_CREATE: 'Employee Created',
  EMPLOYEE_UPDATE: 'Employee Updated',
  EMPLOYEE_DELETE: 'Employee Deleted',
  PTO_REQUEST_CREATE: 'PTO Request',
  PTO_REQUEST_APPROVE: 'PTO Approved',
  PTO_REQUEST_DENY: 'PTO Denied',
  PTO_REQUEST_CANCEL: 'PTO Cancelled',
  PAYSTUB_UPLOAD: 'Pay Stub Upload',
  PAYSTUB_VIEW: 'Pay Stub View',
  DOCUMENT_UPLOAD: 'Document Upload',
  DOCUMENT_VIEW: 'Document View',
  SETTINGS_UPDATE: 'Settings Update',
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
  const page = parseInt((searchParams.page as string) || '1');
  const action = searchParams.action as string | undefined;
  const entityType = searchParams.entityType as string | undefined;

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            role: true,
            employeeProfile: {
              select: { fullName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * 50,
      take: 50,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / 50);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-slate-500 mt-1">Track all system activities and security events</p>
      </div>

      <div className="mb-6">
        <AuditLogFilters />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Activity Log</span>
            <span className="text-sm font-normal text-slate-500">{total} total entries</span>
          </CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No audit logs found</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="px-6 py-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        actionColors[log.action] === 'success' ? 'bg-emerald-100' :
                        actionColors[log.action] === 'danger' ? 'bg-red-100' :
                        actionColors[log.action] === 'warning' ? 'bg-amber-100' :
                        'bg-slate-100'
                      }`}>
                        {log.action.includes('LOGIN') ? (
                          <svg className={`w-5 h-5 ${
                            actionColors[log.action] === 'success' ? 'text-emerald-600' :
                            actionColors[log.action] === 'danger' ? 'text-red-600' :
                            'text-slate-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                        ) : log.action.includes('PTO') ? (
                          <svg className={`w-5 h-5 ${
                            actionColors[log.action] === 'success' ? 'text-emerald-600' :
                            actionColors[log.action] === 'danger' ? 'text-red-600' :
                            actionColors[log.action] === 'warning' ? 'text-amber-600' :
                            'text-slate-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className={`w-5 h-5 ${
                            actionColors[log.action] === 'success' ? 'text-emerald-600' :
                            actionColors[log.action] === 'danger' ? 'text-red-600' :
                            actionColors[log.action] === 'warning' ? 'text-amber-600' :
                            'text-slate-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={actionColors[log.action] || 'default'}>
                            {actionLabels[log.action] || log.action}
                          </Badge>
                          <span className="text-sm text-slate-500">{log.entityType}</span>
                        </div>
                        <p className="text-sm text-slate-700 mt-1">
                          {log.user ? (
                            <>
                              <span className="font-medium">
                                {log.user.employeeProfile?.fullName || log.user.email}
                              </span>
                              <span className="text-slate-400"> ({log.user.role})</span>
                            </>
                          ) : (
                            <span className="text-slate-400">System</span>
                          )}
                        </p>
                        {log.details && (
                          <p className="text-xs text-slate-500 mt-1 font-mono bg-slate-50 px-2 py-1 rounded max-w-xl truncate">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">{formatDateTime(log.createdAt)}</p>
                      {log.ipAddress && (
                        <p className="text-xs text-slate-400 mt-1">{log.ipAddress}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/audit-logs?page=${page - 1}${action ? `&action=${action}` : ''}${entityType ? `&entityType=${entityType}` : ''}`}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/audit-logs?page=${page + 1}${action ? `&action=${action}` : ''}${entityType ? `&entityType=${entityType}` : ''}`}
                className="px-4 py-2 text-sm font-medium text-white bg-nova-500 rounded-lg hover:bg-nova-600"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

