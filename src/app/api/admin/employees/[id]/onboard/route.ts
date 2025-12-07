import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/utils';
import { encrypt } from '@/lib/encryption';
import { generateOnboardingPDF } from '@/lib/pdfGenerator';
import { put } from '@vercel/blob';

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

    // Check if employee exists with user data
    const existingEmployee = await prisma.employeeProfile.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
      },
    });

    if (!existingEmployee) {
      return notFoundResponse('Employee');
    }

    const onboardingCompletedAt = new Date();

    // Update personal info
    const updatedEmployee = await prisma.employeeProfile.update({
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
        onboardingCompletedAt,
      },
    });

    // Update bank details (encrypted)
    let bankDetails = null;
    if (bankInfo.bankName && bankInfo.accountNumber) {
      const last4Account = bankInfo.accountNumber.slice(-4);
      // Encrypt sensitive bank data
      const encryptedAccountNumber = encrypt(bankInfo.accountNumber);
      const encryptedRoutingNumber = encrypt(bankInfo.routingNumber);
      
      bankDetails = await prisma.bankDetails.upsert({
        where: { employeeId: id },
        create: {
          employeeId: id,
          bankName: bankInfo.bankName,
          accountType: bankInfo.accountType || 'CHECKING',
          routingNumber: encryptedRoutingNumber,
          accountNumber: encryptedAccountNumber,
          last4Account,
          confirmed: true,
        },
        update: {
          bankName: bankInfo.bankName,
          accountType: bankInfo.accountType || 'CHECKING',
          routingNumber: encryptedRoutingNumber,
          accountNumber: encryptedAccountNumber,
          last4Account,
          confirmed: true,
        },
      });
    }

    // Update agreements and collect for PDF
    const agreementData: Array<{ title: string; accepted: boolean; acceptedAt: Date | null }> = [];
    if (agreements && Array.isArray(agreements)) {
      for (const agreement of agreements) {
        const template = await prisma.agreementTemplate.findUnique({
          where: { id: agreement.templateId },
        });
        
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

        if (template) {
          agreementData.push({
            title: template.title,
            accepted: agreement.accepted,
            acceptedAt: agreement.accepted ? new Date() : null,
          });
        }
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

    // Generate onboarding PDF
    try {
      const pdfData = {
        fullName: personalInfo.fullName,
        email: existingEmployee.user.email,
        dateOfBirth: personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth) : null,
        phone: personalInfo.phone,
        address: personalInfo.address,
        emergencyContactName: personalInfo.emergencyContactName,
        emergencyContactRelationship: personalInfo.emergencyContactRelationship,
        emergencyContactPhone: personalInfo.emergencyContactPhone,
        roleTitle: employmentDetails.roleTitle,
        startDate: employmentDetails.startDate ? new Date(employmentDetails.startDate) : null,
        employmentType: employmentDetails.employmentType,
        wage: employmentDetails.wage ? parseFloat(employmentDetails.wage) : null,
        bankName: bankInfo.bankName,
        accountType: bankInfo.accountType,
        last4Account: bankInfo.accountNumber ? bankInfo.accountNumber.slice(-4) : null,
        agreements: agreementData,
        onboardingCompletedAt,
      };

      const pdfBuffer = generateOnboardingPDF(pdfData);

      // Upload PDF to Vercel Blob
      const timestamp = Date.now();
      const safeName = (personalInfo.fullName || 'employee').replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `onboarding-records/${id}/${safeName}_onboarding_${timestamp}.pdf`;

      const blob = await put(fileName, pdfBuffer, {
        access: 'public',
        contentType: 'application/pdf',
      });

      // Delete any existing onboarding PDF for this employee
      await prisma.employeeDocument.deleteMany({
        where: {
          employeeId: id,
          type: 'ONBOARDING_PDF',
        },
      });

      // Save PDF reference to database
      await prisma.employeeDocument.create({
        data: {
          employeeId: id,
          type: 'ONBOARDING_PDF',
          fileName: `${safeName}_onboarding_record.pdf`,
          fileUrl: blob.url,
          mimeType: 'application/pdf',
          fileSize: pdfBuffer.length,
        },
      });

      console.log('Onboarding PDF generated and stored:', blob.url);
    } catch (pdfError) {
      console.error('Failed to generate onboarding PDF:', pdfError);
      // Don't fail the entire onboarding if PDF generation fails
    }

    return successResponse(null, 'Employee onboarded successfully');
  } catch (error) {
    console.error('Onboard employee error:', error);
    return errorResponse('Failed to onboard employee', 500);
  }
}

