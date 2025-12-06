import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (!requireRole(user, ['ADMIN'])) return forbiddenResponse();

  const { id } = params;

  try {
    const body = await request.json();
    const { personalInfo, bankInfo, employmentDetails, agreements } = body;

    // Check if employee exists
    const employee = await prisma.employeeProfile.findUnique({
      where: { id },
    });

    if (!employee) {
      return notFoundResponse('Employee');
    }

    // Update personal info
    await prisma.employeeProfile.update({
      where: { id },
      data: {
        fullName: personalInfo.fullName,
        dateOfBirth: personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth) : null,
        phone: personalInfo.phone,
        address: personalInfo.address,
        emergencyContactName: personalInfo.emergencyContactName,
        emergencyContactRelationship: personalInfo.emergencyContactRelationship,
        emergencyContactPhone: personalInfo.emergencyContactPhone,
        roleTitle: employmentDetails.roleTitle,
        startDate: employmentDetails.startDate ? new Date(employmentDetails.startDate) : null,
        employmentType: employmentDetails.employmentType || null,
        wage: employmentDetails.wage ? parseFloat(employmentDetails.wage) : null,
        onboardingStatus: 'COMPLETED',
        onboardingCompletedAt: new Date(),
      },
    });

    // Update bank details
    if (bankInfo.bankName && bankInfo.accountNumber) {
      const last4Account = bankInfo.accountNumber.slice(-4);
      await prisma.bankDetails.upsert({
        where: { employeeId: id },
        create: {
          employeeId: id,
          bankName: bankInfo.bankName,
          accountType: bankInfo.accountType || 'CHECKING',
          routingNumber: bankInfo.routingNumber,
          accountNumber: bankInfo.accountNumber,
          last4Account,
          confirmed: true,
        },
        update: {
          bankName: bankInfo.bankName,
          accountType: bankInfo.accountType || 'CHECKING',
          routingNumber: bankInfo.routingNumber,
          accountNumber: bankInfo.accountNumber,
          last4Account,
          confirmed: true,
        },
      });
    }

    // Update agreements
    if (agreements && Array.isArray(agreements)) {
      for (const agreement of agreements) {
        await prisma.employeeAgreement.upsert({
          where: {
            employeeId_agreementTemplateId: {
              employeeId: id,
              agreementTemplateId: agreement.templateId,
            },
          },
          create: {
            employeeId: id,
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

    // Update onboarding steps to completed
    await prisma.employeeOnboardingStep.updateMany({
      where: { employeeId: id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return successResponse(null, 'Employee onboarded successfully');
  } catch (error) {
    console.error('Onboard employee error:', error);
    return errorResponse('Failed to onboard employee', 500);
  }
}

