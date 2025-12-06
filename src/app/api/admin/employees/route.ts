import { NextRequest } from 'next/server';
import { getCurrentUser, createUser, requireRole } from '@/lib/auth';
import { inviteEmployeeSchema } from '@/lib/validations';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils';

// GET - List all employees
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (!requireRole(user, ['ADMIN'])) return forbiddenResponse();

  const employees = await prisma.employeeProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true } },
      onboardingSteps: {
        include: { stepTemplate: true },
        orderBy: { stepTemplate: { order: 'asc' } },
      },
    },
  });

  return successResponse(employees);
}

// POST - Invite new employee
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (!requireRole(user, ['ADMIN'])) return forbiddenResponse();

  try {
    const body = await request.json();

    // Validate input
    const result = inviteEmployeeSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.errors[0].message);
    }

    const { email, password } = result.data;

    // Create user
    const createResult = await createUser(email, password, 'EMPLOYEE');

    if (!createResult.success) {
      return errorResponse(createResult.error);
    }

    return successResponse({ userId: createResult.userId }, 'Employee invited successfully');
  } catch (error) {
    console.error('Invite employee error:', error);
    return errorResponse('Failed to invite employee', 500);
  }
}

