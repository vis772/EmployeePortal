import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { bankUpdateSchema } from '@/lib/validations';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils';
import { encrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Get current bank details
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (!requireRole(user, ['EMPLOYEE'])) return forbiddenResponse();

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id },
    include: { bankDetails: true },
  });

  if (!profile) {
    return errorResponse('Profile not found', 404);
  }

  return successResponse(profile.bankDetails);
}

// PUT - Update bank details
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (!requireRole(user, ['EMPLOYEE'])) return forbiddenResponse();

  try {
    const body = await request.json();

    // Validate input (without confirmAccountNumber for API)
    const { bankName, accountType, routingNumber, accountNumber } = body;

    if (!bankName || !accountType || !routingNumber || !accountNumber) {
      return errorResponse('All fields are required');
    }

    if (routingNumber.length !== 9) {
      return errorResponse('Routing number must be 9 digits');
    }

    // Get profile
    const profile = await prisma.employeeProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Profile not found', 404);
    }

    const last4Account = accountNumber.slice(-4);
    
    // Encrypt sensitive bank data
    const encryptedAccountNumber = encrypt(accountNumber);
    const encryptedRoutingNumber = encrypt(routingNumber);

    const bankDetails = await prisma.bankDetails.upsert({
      where: { employeeId: profile.id },
      create: {
        employeeId: profile.id,
        bankName,
        accountType,
        routingNumber: encryptedRoutingNumber,
        accountNumber: encryptedAccountNumber,
        last4Account,
        confirmed: true,
      },
      update: {
        bankName,
        accountType,
        routingNumber: encryptedRoutingNumber,
        accountNumber: encryptedAccountNumber,
        last4Account,
        confirmed: true,
      },
    });

    return successResponse(bankDetails, 'Bank details updated successfully');
  } catch (error) {
    console.error('Update bank details error:', error);
    return errorResponse('Failed to update bank details', 500);
  }
}

