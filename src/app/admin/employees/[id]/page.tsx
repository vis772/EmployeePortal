import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Card, CardBody, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatDate, formatDateTime, formatStatus } from '@/lib/utils';
import Link from 'next/link';
import { DeleteEmployeeButton } from './DeleteEmployeeButton';

async function getEmployee(id: string) {
  const employee = await prisma.employeeProfile.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, createdAt: true } },
      bankDetails: true,
      onboardingSteps: {
        include: { stepTemplate: true },
        orderBy: { stepTemplate: { order: 'asc' } },
      },
      agreements: {
        include: { agreementTemplate: true },
        orderBy: { agreementTemplate: { order: 'asc' } },
      },
      documents: {
        orderBy: { uploadedAt: 'desc' },
      },
    },
  });

  return employee;
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = await getEmployee(id);

  if (!employee) {
    notFound();
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/employees"
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
          Back to employees
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-nova-100 flex items-center justify-center">
              <span className="text-xl font-medium text-nova-600">
                {employee.fullName
                  ? employee.fullName.split(' ').map((n) => n[0]).join('')
                  : '?'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {employee.fullName || 'Not provided'}
              </h1>
              <p className="text-slate-500">{employee.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={
                employee.onboardingStatus === 'COMPLETED'
                  ? 'success'
                  : employee.onboardingStatus === 'IN_PROGRESS'
                  ? 'warning'
                  : 'default'
              }
              className="text-sm px-3 py-1"
            >
              {formatStatus(employee.onboardingStatus)}
            </Badge>
            <Link
              href={`/admin/employees/${employee.id}/onboard`}
              className="inline-flex items-center px-4 py-2 bg-nova-500 text-white text-sm font-medium rounded-lg hover:bg-nova-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {employee.onboardingStatus === 'COMPLETED' ? 'Edit' : 'Complete Onboarding'}
            </Link>
            <DeleteEmployeeButton employeeId={employee.id} employeeName={employee.fullName || employee.user.email} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-stone-500">Full Name</dt>
                  <dd className="text-stone-900">{employee.fullName || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-stone-500">Date of Birth</dt>
                  <dd className="text-stone-900">{formatDate(employee.dateOfBirth)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-stone-500">Phone</dt>
                  <dd className="text-stone-900">{employee.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-stone-500">Address</dt>
                  <dd className="text-stone-900">{employee.address || '-'}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm text-stone-500">Name</dt>
                  <dd className="text-stone-900">{employee.emergencyContactName || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-stone-500">Relationship</dt>
                  <dd className="text-stone-900">{employee.emergencyContactRelationship || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-stone-500">Phone</dt>
                  <dd className="text-stone-900">{employee.emergencyContactPhone || '-'}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-stone-500">Role/Position</dt>
                  <dd className="text-stone-900">{employee.roleTitle || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-stone-500">Start Date</dt>
                  <dd className="text-stone-900">{formatDate(employee.startDate)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-stone-500">Employment Type</dt>
                  <dd className="text-stone-900">
                    {employee.employmentType ? formatStatus(employee.employmentType) : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-stone-500">Compensation</dt>
                  <dd className="text-stone-900">
                    {employee.wage
                      ? `$${Number(employee.wage).toLocaleString()}${employee.employmentType === 'HOURLY' ? '/hr' : '/yr'}`
                      : '-'}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Information</CardTitle>
            </CardHeader>
            <CardBody>
              {employee.bankDetails ? (
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-stone-500">Bank Name</dt>
                    <dd className="text-stone-900">{employee.bankDetails.bankName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-stone-500">Account Type</dt>
                    <dd className="text-stone-900">{formatStatus(employee.bankDetails.accountType)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-stone-500">Routing Number</dt>
                    <dd className="text-stone-900 font-mono">{employee.bankDetails.routingNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-stone-500">Account Number</dt>
                    <dd className="text-stone-900 font-mono">
                      ****{employee.bankDetails.last4Account}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-stone-500">No bank information provided yet</p>
              )}
            </CardBody>
          </Card>

          {/* Agreements */}
          <Card>
            <CardHeader>
              <CardTitle>Agreements</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {employee.agreements.length === 0 ? (
                <div className="p-6 text-stone-500">No agreements to display</div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {employee.agreements.map((agreement) => (
                    <div key={agreement.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-stone-900">{agreement.agreementTemplate.title}</p>
                        <p className="text-sm text-stone-500">
                          {agreement.accepted && agreement.acceptedAt
                            ? `Accepted on ${formatDateTime(agreement.acceptedAt)}`
                            : 'Not yet accepted'}
                        </p>
                      </div>
                      <Badge variant={agreement.accepted ? 'success' : 'default'}>
                        {agreement.accepted ? 'Signed' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {employee.documents.length === 0 ? (
                <div className="p-6 text-stone-500">No documents uploaded yet</div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {employee.documents.map((doc) => (
                    <div key={doc.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-stone-900">{doc.fileName}</p>
                          <p className="text-sm text-stone-500">
                            {formatStatus(doc.type)} • Uploaded {formatDateTime(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Onboarding Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Progress</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-stone-100">
                {employee.onboardingSteps.map((step, index) => (
                  <div key={step.id} className="px-6 py-4 flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.status === 'COMPLETED'
                          ? 'bg-emerald-500 text-white'
                          : step.status === 'IN_PROGRESS'
                          ? 'bg-amber-500 text-white'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {step.status === 'COMPLETED' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-stone-900">{step.stepTemplate.name}</p>
                      <p className="text-sm text-stone-500">
                        {step.status === 'COMPLETED' && step.completedAt
                          ? `Completed ${formatDate(step.completedAt)}`
                          : formatStatus(step.status)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-stone-500">Account created</dt>
                  <dd className="text-stone-900">{formatDate(employee.user.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-500">Profile updated</dt>
                  <dd className="text-stone-900">{formatDate(employee.updatedAt)}</dd>
                </div>
                {employee.onboardingCompletedAt && (
                  <div className="flex justify-between">
                    <dt className="text-stone-500">Onboarding completed</dt>
                    <dd className="text-stone-900">{formatDate(employee.onboardingCompletedAt)}</dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

