import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui';
import Link from 'next/link';
import { OnboardingForm } from './OnboardingForm';

async function getEmployeeData(id: string) {
  const employee = await prisma.employeeProfile.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      bankDetails: true,
      agreements: {
        include: { agreementTemplate: true },
      },
      documents: true,
    },
  });

  if (!employee) return null;

  const agreementTemplates = await prisma.agreementTemplate.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  return { employee, agreementTemplates };
}

export default async function OnboardEmployeePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const data = await getEmployeeData(id);

  if (!data) {
    notFound();
  }

  const { employee, agreementTemplates } = data;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/admin/employees/${id}`}
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to employee
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">
          {employee.onboardingStatus === 'COMPLETED' ? 'Edit Employee' : 'Onboard Employee'}
        </h1>
        <p className="text-slate-500 mt-1">
          {employee.onboardingStatus === 'COMPLETED' 
            ? `Update information for ${employee.fullName || employee.user.email}`
            : `Complete onboarding for ${employee.fullName || employee.user.email}`
          }
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardBody>
          <OnboardingForm 
            employee={employee} 
            agreementTemplates={agreementTemplates} 
          />
        </CardBody>
      </Card>
    </div>
  );
}

