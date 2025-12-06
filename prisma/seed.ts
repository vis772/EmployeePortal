import { PrismaClient, Role, OnboardingStatus, EmploymentType, AccountType, StepStatus, DocumentType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.announcement.deleteMany();
  await prisma.employeeDocument.deleteMany();
  await prisma.employeeAgreement.deleteMany();
  await prisma.employeeOnboardingStep.deleteMany();
  await prisma.bankDetails.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agreementTemplate.deleteMany();
  await prisma.onboardingStepTemplate.deleteMany();

  console.log('✅ Cleared existing data');

  // Create onboarding step templates
  const stepTemplates = await Promise.all([
    prisma.onboardingStepTemplate.create({
      data: {
        name: 'Personal Information',
        key: 'personal_info',
        description: 'Basic personal and contact information',
        order: 1,
        isRequired: true,
      },
    }),
    prisma.onboardingStepTemplate.create({
      data: {
        name: 'Bank & Payment Info',
        key: 'bank_info',
        description: 'Banking details for payroll',
        order: 2,
        isRequired: true,
      },
    }),
    prisma.onboardingStepTemplate.create({
      data: {
        name: 'Employment Details',
        key: 'employment_details',
        description: 'Role and compensation information',
        order: 3,
        isRequired: true,
      },
    }),
    prisma.onboardingStepTemplate.create({
      data: {
        name: 'Agreements & Documents',
        key: 'agreements',
        description: 'Review and sign required documents',
        order: 4,
        isRequired: true,
      },
    }),
    prisma.onboardingStepTemplate.create({
      data: {
        name: 'Review & Submit',
        key: 'review',
        description: 'Review all information and complete onboarding',
        order: 5,
        isRequired: true,
      },
    }),
  ]);

  console.log('✅ Created onboarding step templates');

  // Create agreement templates
  const agreementTemplates = await Promise.all([
    prisma.agreementTemplate.create({
      data: {
        title: 'Employment Agreement',
        description: 'Standard employment contract outlining terms of employment, responsibilities, and expectations.',
        pdfUrl: '/documents/employment-agreement.pdf',
        isRequired: true,
        order: 1,
      },
    }),
    prisma.agreementTemplate.create({
      data: {
        title: 'Non-Disclosure Agreement (NDA)',
        description: 'Confidentiality agreement to protect company and client information.',
        pdfUrl: '/documents/nda.pdf',
        isRequired: true,
        order: 2,
      },
    }),
    prisma.agreementTemplate.create({
      data: {
        title: 'Employee Handbook Acknowledgment',
        description: 'Confirmation that you have read and understood the employee handbook.',
        pdfUrl: '/documents/handbook.pdf',
        isRequired: true,
        order: 3,
      },
    }),
    prisma.agreementTemplate.create({
      data: {
        title: 'Remote Work Policy',
        description: 'Guidelines and expectations for remote work arrangements.',
        pdfUrl: '/documents/remote-work-policy.pdf',
        isRequired: false,
        order: 4,
      },
    }),
  ]);

  console.log('✅ Created agreement templates');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12);
  const employeePassword = await bcrypt.hash('employee123', 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@novacreations.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Created admin user: admin@novacreations.com');

  // Create first employee (completed onboarding)
  const employee1 = await prisma.user.create({
    data: {
      email: 'sarah.johnson@novacreations.com',
      passwordHash: employeePassword,
      role: Role.EMPLOYEE,
      employeeProfile: {
        create: {
          fullName: 'Sarah Johnson',
          dateOfBirth: new Date('1992-05-15'),
          phone: '(555) 123-4567',
          address: '123 Main Street, San Francisco, CA 94102',
          emergencyContactName: 'Michael Johnson',
          emergencyContactRelationship: 'Spouse',
          emergencyContactPhone: '(555) 987-6543',
          roleTitle: 'Senior Designer',
          startDate: new Date('2024-01-15'),
          employmentType: EmploymentType.SALARY,
          wage: 85000,
          onboardingStatus: OnboardingStatus.COMPLETED,
          onboardingCompletedAt: new Date('2024-01-14'),
        },
      },
    },
    include: { employeeProfile: true },
  });

  // Add bank details for employee1
  await prisma.bankDetails.create({
    data: {
      employeeId: employee1.employeeProfile!.id,
      bankName: 'Chase Bank',
      accountType: AccountType.CHECKING,
      routingNumber: '021000021',
      accountNumber: '123456789012',
      last4Account: '9012',
      confirmed: true,
    },
  });

  // Create onboarding steps for employee1 (all completed)
  for (const template of stepTemplates) {
    await prisma.employeeOnboardingStep.create({
      data: {
        employeeId: employee1.employeeProfile!.id,
        stepTemplateId: template.id,
        status: StepStatus.COMPLETED,
        completedAt: new Date('2024-01-14'),
      },
    });
  }

  // Create agreements for employee1 (all signed)
  for (const agreement of agreementTemplates) {
    await prisma.employeeAgreement.create({
      data: {
        employeeId: employee1.employeeProfile!.id,
        agreementTemplateId: agreement.id,
        accepted: true,
        acceptedAt: new Date('2024-01-14'),
      },
    });
  }

  // Create document for employee1
  await prisma.employeeDocument.create({
    data: {
      employeeId: employee1.employeeProfile!.id,
      type: DocumentType.DRIVERS_LICENSE,
      fileName: 'sarah_johnson_dl.pdf',
      fileUrl: '/uploads/sarah_johnson_dl.pdf',
      mimeType: 'application/pdf',
      fileSize: 256000,
    },
  });

  console.log('✅ Created employee: sarah.johnson@novacreations.com (Completed)');

  // Create second employee (in progress onboarding)
  const employee2 = await prisma.user.create({
    data: {
      email: 'james.wilson@novacreations.com',
      passwordHash: employeePassword,
      role: Role.EMPLOYEE,
      employeeProfile: {
        create: {
          fullName: 'James Wilson',
          dateOfBirth: new Date('1988-11-22'),
          phone: '(555) 234-5678',
          address: '456 Oak Avenue, Oakland, CA 94612',
          emergencyContactName: 'Emily Wilson',
          emergencyContactRelationship: 'Sister',
          emergencyContactPhone: '(555) 876-5432',
          roleTitle: 'Project Manager',
          startDate: new Date('2024-06-01'),
          employmentType: EmploymentType.SALARY,
          onboardingStatus: OnboardingStatus.IN_PROGRESS,
        },
      },
    },
    include: { employeeProfile: true },
  });

  // Create onboarding steps for employee2 (partial completion)
  for (let i = 0; i < stepTemplates.length; i++) {
    const template = stepTemplates[i];
    let status: StepStatus = StepStatus.NOT_STARTED;
    let completedAt: Date | null = null;

    if (i < 2) {
      // First two steps completed
      status = StepStatus.COMPLETED;
      completedAt = new Date();
    } else if (i === 2) {
      // Third step in progress
      status = StepStatus.IN_PROGRESS;
    }

    await prisma.employeeOnboardingStep.create({
      data: {
        employeeId: employee2.employeeProfile!.id,
        stepTemplateId: template.id,
        status,
        completedAt,
      },
    });
  }

  // Bank details for employee2
  await prisma.bankDetails.create({
    data: {
      employeeId: employee2.employeeProfile!.id,
      bankName: 'Bank of America',
      accountType: AccountType.CHECKING,
      routingNumber: '026009593',
      accountNumber: '987654321098',
      last4Account: '1098',
      confirmed: true,
    },
  });

  console.log('✅ Created employee: james.wilson@novacreations.com (In Progress)');

  // Create third employee (not started)
  const employee3 = await prisma.user.create({
    data: {
      email: 'alex.chen@novacreations.com',
      passwordHash: employeePassword,
      role: Role.EMPLOYEE,
      employeeProfile: {
        create: {
          onboardingStatus: OnboardingStatus.NOT_STARTED,
        },
      },
    },
    include: { employeeProfile: true },
  });

  // Create onboarding steps for employee3 (none started)
  for (const template of stepTemplates) {
    await prisma.employeeOnboardingStep.create({
      data: {
        employeeId: employee3.employeeProfile!.id,
        stepTemplateId: template.id,
        status: StepStatus.NOT_STARTED,
      },
    });
  }

  console.log('✅ Created employee: alex.chen@novacreations.com (Not Started)');

  // Create announcements
  await prisma.announcement.create({
    data: {
      title: 'Welcome to Nova Creations!',
      body: 'We are excited to have you join our team! Please complete your onboarding as soon as possible. If you have any questions, reach out to HR at hr@novacreations.com.',
      isActive: true,
      createdByAdminId: admin.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Holiday Schedule 2024',
      body: 'Please note that the office will be closed on December 25th and January 1st for the holidays. Enjoy the time with your families!',
      isActive: true,
      createdByAdminId: admin.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'New Health Benefits',
      body: 'We are pleased to announce enhanced health benefits starting next month. Check your email for more details on the new plans available.',
      isActive: true,
      createdByAdminId: admin.id,
    },
  });

  console.log('✅ Created announcements');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Login credentials:');
  console.log('   Admin: admin@novacreations.com / admin123');
  console.log('   Employee: sarah.johnson@novacreations.com / employee123');
  console.log('   Employee: james.wilson@novacreations.com / employee123');
  console.log('   Employee: alex.chen@novacreations.com / employee123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

