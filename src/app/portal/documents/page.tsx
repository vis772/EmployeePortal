import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardBody, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatDateTime, formatStatus, formatFileSize } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getDocuments(userId: string) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId },
    include: {
      agreements: {
        include: { agreementTemplate: true },
        orderBy: { agreementTemplate: { order: 'asc' } },
      },
      documents: {
        orderBy: { uploadedAt: 'desc' },
      },
    },
  });
  return profile;
}

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const profile = await getDocuments(user.id);

  if (!profile) {
    redirect('/login');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Documents</h1>
        <p className="text-slate-500 mt-1">View your agreements and uploaded documents</p>
      </div>

      {/* Agreements */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Agreements</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {profile.agreements.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No agreements on file
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {profile.agreements.map((agreement) => (
                <div key={agreement.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {agreement.agreementTemplate.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {agreement.accepted && agreement.acceptedAt
                          ? `Signed on ${formatDateTime(agreement.acceptedAt)}`
                          : 'Pending signature'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={agreement.accepted ? 'success' : 'warning'}>
                    {agreement.accepted ? 'Signed' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Uploaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {profile.documents.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No documents uploaded
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {profile.documents.map((doc) => (
                <div key={doc.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-nova-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-nova-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{doc.fileName}</p>
                      <p className="text-sm text-slate-500">
                        {formatStatus(doc.type)} • {doc.fileSize ? formatFileSize(doc.fileSize) : ''} • {formatDateTime(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-nova-600 hover:text-nova-700 font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Info note */}
      <div className="mt-6 p-4 bg-slate-100 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-slate-600">
            If you need to upload additional documents or update existing ones, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
