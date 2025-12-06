import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (!requireRole(user, ['EMPLOYEE'])) return forbiddenResponse();

  try {
    const body = await request.json();
    const { stepKey, data } = body;

    // Get employee profile
    const profile = await prisma.employeeProfile.findUnique({
      where: { userId: user.id },
      include: { onboardingSteps: { include: { stepTemplate: true } } },
    });

    if (!profile) {
      return errorResponse('Profile not found', 404);
    }

    // Find the step template
    const stepTemplate = await prisma.onboardingStepTemplate.findUnique({
      where: { key: stepKey },
    });

    if (!stepTemplate) {
      return errorResponse('Step not found', 404);
    }

    // Update data based on step
    switch (stepKey) {
      case 'personal_info':
        await prisma.employeeProfile.update({
          where: { id: profile.id },
          data: {
            fullName: data.fullName,
            dateOfBirth: new Date(data.dateOfBirth),
            phone: data.phone,
            address: data.address,
            emergencyContactName: data.emergencyContactName,
            emergencyContactRelationship: data.emergencyContactRelationship,
            emergencyContactPhone: data.emergencyContactPhone,
            onboardingStatus: 'IN_PROGRESS',
          },
        });
        break;

      case 'bank_info':
        const last4Account = data.accountNumber.slice(-4);
        await prisma.bankDetails.upsert({
          where: { employeeId: profile.id },
          create: {
            employeeId: profile.id,
            bankName: data.bankName,
            accountType: data.accountType,
            routingNumber: data.routingNumber,
            accountNumber: data.accountNumber,
            last4Account,
            confirmed: data.confirmed,
          },
          update: {
            bankName: data.bankName,
            accountType: data.accountType,
            routingNumber: data.routingNumber,
            accountNumber: data.accountNumber,
            last4Account,
            confirmed: data.confirmed,
          },
        });
        break;

      case 'employment_details':
        await prisma.employeeProfile.update({
          where: { id: profile.id },
          data: {
            roleTitle: data.roleTitle,
            startDate: new Date(data.startDate),
            employmentType: data.employmentType,
            wage: data.wage ? parseFloat(data.wage) : null,
          },
        });
        break;

      case 'agreements':
        // Update agreements
        if (data.agreements && Array.isArray(data.agreements)) {
          for (const agreement of data.agreements) {
            await prisma.employeeAgreement.upsert({
              where: {
                employeeId_agreementTemplateId: {
                  employeeId: profile.id,
                  agreementTemplateId: agreement.templateId,
                },
              },
              create: {
                employeeId: profile.id,
                agreementTemplateId: agreement.templateId,
                accepted: agreement.accepted,
                acceptedAt: agreement.accepted ? new Date() : null,
              },
              update: {
                accepted: agreement.accepted,
                acceptedAt: agreement.accepted ? new Date() : null,
              },
            });
          }
        }

        // Handle document upload (fake for now)
        if (data.document) {
          await prisma.employeeDocument.create({
            data: {
              employeeId: profile.id,
              type: data.document.type,
              fileName: data.document.fileName,
              fileUrl: `/uploads/${profile.id}/${data.document.fileName}`,
              mimeType: 'application/pdf',
              fileSize: 100000,
            },
          });
        }
        break;

      case 'review':
        // No data to save for review step
        break;

      default:
        return errorResponse('Unknown step', 400);
    }

    // Mark current step as completed
    await prisma.employeeOnboardingStep.updateMany({
      where: {
        employeeId: profile.id,
        stepTemplateId: stepTemplate.id,
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Mark next step as in progress (if any)
    const nextTemplate = await prisma.onboardingStepTemplate.findFirst({
      where: {
        order: stepTemplate.order + 1,
        isActive: true,
      },
    });

    if (nextTemplate) {
      await prisma.employeeOnboardingStep.updateMany({
        where: {
          employeeId: profile.id,
          stepTemplateId: nextTemplate.id,
        },
        data: {
          status: 'IN_PROGRESS',
        },
      });
    }

    // Fetch updated profile
    const updatedProfile = await prisma.employeeProfile.findUnique({
      where: { id: profile.id },
      include: {
        bankDetails: true,
        onboardingSteps: {
          include: { stepTemplate: true },
          orderBy: { stepTemplate: { order: 'asc' } },
        },
        agreements: {
          include: { agreementTemplate: true },
        },
        documents: true,
      },
    });

    return successResponse({ profile: updatedProfile }, 'Step saved successfully');
  } catch (error) {
    console.error('Save step error:', error);
    return errorResponse('Failed to save step', 500);
  }
}

