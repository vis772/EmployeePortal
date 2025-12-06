import { prisma } from '@/lib/db';
import { Card, CardBody, CardHeader, CardTitle, Badge } from '@/components/ui';

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
        <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
        <p className="text-stone-500 mt-1">Configure onboarding steps and agreements</p>
      </div>

      <div className="space-y-6">
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

