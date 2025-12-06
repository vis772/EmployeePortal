import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardBody, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatDate, formatDateTime } from '@/lib/utils';
import Link from 'next/link';

async function getPortalData(userId: string) {
  const [profile, announcements] = await Promise.all([
    prisma.employeeProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true } },
      },
    }),
    prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return { profile, announcements };
}

export default async function PortalHomePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const { profile, announcements } = await getPortalData(user.id);

  if (!profile) {
    redirect('/login');
  }

  const firstName = profile.fullName?.split(' ')[0] || 'there';
  const isOnboarded = profile.onboardingStatus === 'COMPLETED';

  return (
    <div>
      {/* Pending onboarding banner */}
      {!isOnboarded && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-amber-800">Onboarding Pending</p>
              <p className="text-sm text-amber-700">
                Your HR administrator will complete your onboarding soon. Some features may be limited until then.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome{firstName !== 'there' ? ` back, ${firstName}` : ''}! 👋</h1>
        <p className="text-slate-500 mt-1">{profile.roleTitle || 'Employee'} at Nova Creations</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/portal/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-nova-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-nova-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900">Profile</p>
                <p className="text-sm text-slate-500">View & edit your info</p>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/portal/payment">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900">Payment</p>
                <p className="text-sm text-slate-500">Manage bank details</p>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/portal/documents">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-nova-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-nova-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900">Documents</p>
                <p className="text-sm text-slate-500">View your documents</p>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {announcements.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No announcements at this time
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-slate-900">{announcement.title}</h3>
                      <p className="text-slate-600 mt-1 whitespace-pre-wrap">{announcement.body}</p>
                      <p className="text-sm text-slate-400 mt-2">
                        {formatDateTime(announcement.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick info */}
      <div className="mt-8 p-4 bg-slate-100 rounded-lg">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {profile.startDate ? `Started on ${formatDate(profile.startDate)} • ` : ''}
            {profile.user.email}
          </span>
        </div>
      </div>
    </div>
  );
}

