import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PortalLayout } from '@/components/layouts/PortalLayout';

async function getEmployeeName(userId: string) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId },
    select: { fullName: true, onboardingStatus: true },
  });
  return profile;
}

export default async function PortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'EMPLOYEE') {
    redirect('/login');
  }

  const profile = await getEmployeeName(user.id);
  const firstName = profile?.fullName?.split(' ')[0] || 'Employee';

  return <PortalLayout userName={firstName}>{children}</PortalLayout>;
}

