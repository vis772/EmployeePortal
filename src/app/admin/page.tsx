import { prisma } from '@/lib/db';
import { Card, CardBody, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatDate, formatStatus } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const [employees, announcements, recentEmployees] = await Promise.all([
    prisma.employeeProfile.findMany({
      include: {
        user: { select: { email: true } },
      },
    }),
    prisma.announcement.count({ where: { isActive: true } }),
    prisma.employeeProfile.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
      },
    }),
  ]);

  const stats = {
    total: employees.length,
    completed: employees.filter((e) => e.onboardingStatus === 'COMPLETED').length,
    inProgress: employees.filter((e) => e.onboardingStatus === 'IN_PROGRESS').length,
    notStarted: employees.filter((e) => e.onboardingStatus === 'NOT_STARTED').length,
    announcements,
  };

  return { stats, recentEmployees };
}

export default async function AdminDashboard() {
  const { stats, recentEmployees } = await getDashboardData();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 mt-1">Welcome to the Nova Creations admin portal</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Total Employees</p>
                <p className="text-3xl font-bold text-stone-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Onboarding Complete</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">In Progress</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Not Started</p>
                <p className="text-3xl font-bold text-stone-600 mt-1">{stats.notStarted}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent employees */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent Employees</CardTitle>
          <Link
            href="/admin/employees"
            className="text-sm text-nova-600 hover:text-nova-700 font-medium"
          >
            View all →
          </Link>
        </CardHeader>
        <div className="divide-y divide-stone-100">
          {recentEmployees.length === 0 ? (
            <div className="p-6 text-center text-stone-500">
              No employees yet
            </div>
          ) : (
            recentEmployees.map((employee) => (
              <div key={employee.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
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
                <div className="flex items-center gap-4">
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
                  <Link
                    href={`/admin/employees/${employee.id}`}
                    className="text-sm text-nova-600 hover:text-nova-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

