import { prisma } from '@/lib/db';
import { Card, CardBody, CardHeader, CardTitle, Badge } from '@/components/ui';
import { AdminChangePassword } from './AdminChangePassword';

export const dynamic = 'force-dynamic';

async function getSettings() {
  const [stepTemplates, agreementTemplates] = await Promise.all([
    prisma.onboardingStepTemplate.findMany({ orderBy: { order: 'asc' } }),
    prisma.agreementTemplate.findMany({ orderBy: { order: 'asc' } }),
  ]);

  return { stepTemplates, agreementTemplates };
}

export default async function SettingsPage() {
  const { stepTemplates, agreementTemplates } = await getSettings();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Configure your account and system settings</p>
      </div>

      <div className="space-y-6">
        {/* Admin Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-nova-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Change Your Password
            </CardTitle>
          </CardHeader>
          <CardBody>
            <AdminChangePassword />
          </CardBody>
        </Card>
        {/* Onboarding Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Steps</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-stone-100">
              {stepTemplates.map((step, index) => (
                <div key={step.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-sm font-medium text-stone-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">{step.name}</p>
                    {step.description && (
                      <p className="text-sm text-stone-500">{step.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {step.isRequired && (
                      <Badge variant="info">Required</Badge>
                    )}
                    <Badge variant={step.isActive ? 'success' : 'default'}>
                      {step.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Agreement Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Agreement Templates</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-stone-100">
              {agreementTemplates.map((agreement) => (
                <div key={agreement.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-900">{agreement.title}</p>
                    {agreement.description && (
                      <p className="text-sm text-stone-500">{agreement.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {agreement.isRequired && (
                      <Badge variant="info">Required</Badge>
                    )}
                    <Badge variant={agreement.isActive ? 'success' : 'default'}>
                      {agreement.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Info note */}
        <div className="p-4 bg-stone-100 rounded-lg">
          <p className="text-sm text-stone-600">
            <strong>Note:</strong> Editing onboarding steps and agreement templates directly is currently disabled. 
            In a production environment, you would have full CRUD capabilities here. 
            The templates are seeded when the database is initialized.
          </p>
        </div>
      </div>
    </div>
  );
}

