import { prisma } from '@/lib/db';
import { Card, Badge } from '@/components/ui';
import { formatStatus, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { InviteEmployeeButton } from './InviteEmployeeButton';

async function getEmployees() {
  return prisma.employeeProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true } },
      onboardingSteps: {
        include: { stepTemplate: true },
        orderBy: { stepTemplate: { order: 'asc' } },
      },
    },
  });
}

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Employees</h1>
          <p className="text-stone-500 mt-1">Manage employee accounts and onboarding</p>
        </div>
        <InviteEmployeeButton />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    No employees yet. Click &quot;Invite Employee&quot; to add one.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => {
                  const completedSteps = employee.onboardingSteps.filter(
                    (s) => s.status === 'COMPLETED'
                  ).length;
                  const totalSteps = employee.onboardingSteps.length;
                  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

                  return (
                    <tr key={employee.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-stone-600">
                              {employee.fullName
                                ? employee.fullName.split(' ').map((n) => n[0]).join('')
                                : '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">
                              {employee.fullName || 'Not provided'}
                            </p>
                            <p className="text-sm text-stone-500">{employee.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-stone-700">
                          {employee.roleTitle || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            employee.onboardingStatus === 'COMPLETED'
                              ? 'success'
                              : employee.onboardingStatus === 'IN_PROGRESS'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {formatStatus(employee.onboardingStatus)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-nova-500 rounded-full"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-stone-500">
                            {completedSteps}/{totalSteps}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-stone-700">
                          {formatDate(employee.startDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/employees/${employee.id}`}
                          className="text-sm font-medium text-nova-600 hover:text-nova-700"
                        >
                          View details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

