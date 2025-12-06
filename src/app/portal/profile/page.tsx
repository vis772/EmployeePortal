import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { ProfileEditForm } from './ProfileEditForm';

async function getProfile(userId: string) {
  return prisma.employeeProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { email: true } },
    },
  });
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const profile = await getProfile(user.id);

  if (!profile) {
    redirect('/login');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">My Profile</h1>
        <p className="text-stone-500 mt-1">View and update your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile info (read-only) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-nova-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-medium text-nova-600">
                  {profile.fullName
                    ? profile.fullName.split(' ').map((n) => n[0]).join('')
                    : '?'}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-stone-900">{profile.fullName}</h2>
              <p className="text-stone-500">{profile.roleTitle}</p>
            </div>
            
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">Email</dt>
                <dd className="text-stone-900">{profile.user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Date of Birth</dt>
                <dd className="text-stone-900">{formatDate(profile.dateOfBirth)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Start Date</dt>
                <dd className="text-stone-900">{formatDate(profile.startDate)}</dd>
              </div>
            </dl>

            <p className="text-xs text-stone-400 mt-6 pt-4 border-t border-stone-100">
              To update your name or date of birth, please contact HR.
            </p>
          </CardBody>
        </Card>

        {/* Editable fields */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardBody>
            <ProfileEditForm profile={profile} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

