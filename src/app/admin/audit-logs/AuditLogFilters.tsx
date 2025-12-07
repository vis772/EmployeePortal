'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select } from '@/components/ui';

const actionOptions = [
  { value: '', label: 'All Actions' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'LOGIN_FAILED', label: 'Failed Login' },
  { value: 'PASSWORD_RESET_REQUEST', label: 'Password Reset Request' },
  { value: 'PASSWORD_RESET_COMPLETE', label: 'Password Reset' },
  { value: 'TWO_FACTOR_ENABLED', label: '2FA Enabled' },
  { value: 'TWO_FACTOR_DISABLED', label: '2FA Disabled' },
  { value: 'EMPLOYEE_CREATE', label: 'Employee Created' },
  { value: 'EMPLOYEE_UPDATE', label: 'Employee Updated' },
  { value: 'EMPLOYEE_DELETE', label: 'Employee Deleted' },
  { value: 'PTO_REQUEST_CREATE', label: 'PTO Request' },
  { value: 'PTO_REQUEST_APPROVE', label: 'PTO Approved' },
  { value: 'PTO_REQUEST_DENY', label: 'PTO Denied' },
  { value: 'PAYSTUB_UPLOAD', label: 'Pay Stub Upload' },
  { value: 'PAYSTUB_VIEW', label: 'Pay Stub View' },
];

const entityOptions = [
  { value: '', label: 'All Entities' },
  { value: 'User', label: 'User' },
  { value: 'Employee', label: 'Employee' },
  { value: 'PTORequest', label: 'PTO Request' },
  { value: 'PayStub', label: 'Pay Stub' },
  { value: 'Document', label: 'Document' },
  { value: 'Settings', label: 'Settings' },
];

export function AuditLogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentAction = searchParams.get('action') || '';
  const currentEntityType = searchParams.get('entityType') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to first page when filtering
    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/admin/audit-logs');
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border border-slate-200">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">Action:</label>
        <Select
          value={currentAction}
          onChange={(e) => updateFilter('action', e.target.value)}
          options={actionOptions}
          className="w-48"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-700">Entity:</label>
        <Select
          value={currentEntityType}
          onChange={(e) => updateFilter('entityType', e.target.value)}
          options={entityOptions}
          className="w-40"
        />
      </div>

      {(currentAction || currentEntityType) && (
        <button
          onClick={clearFilters}
          className="text-sm text-nova-500 hover:text-nova-600 font-medium"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

