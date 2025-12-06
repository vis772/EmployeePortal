import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { profileUpdateSchema } from '@/lib/validations';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils';

// GET - Get current user profile
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (!requireRole(user, ['EMPLOYEE'])) return forbiddenResponse();

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: { select: { email: true } },
    },
  });

  if (!profile) {
    return errorResponse('Profile not found', 404);
  }

  return successResponse(profile);
}

// PUT - Update profile
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (!requireRole(user, ['EMPLOYEE'])) return forbiddenResponse();

  try {
    const body = await request.json();

    // Validate input
    const result = profileUpdateSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.errors[0].message);
    }

    const {
      phone,
      address,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
    } = result.data;

    const profile = await prisma.employeeProfile.update({
      where: { userId: user.id },
      data: {
        phone,
        address,
        emergencyContactName,
        emergencyContactRelationship,
        emergencyContactPhone,
      },
    });

    return successResponse(profile, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse('Failed to update profile', 500);
  }
}

