import { getCurrentUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (!requireRole(user, ['EMPLOYEE'])) return forbiddenResponse();

  try {
    // Get employee profile
    const profile = await prisma.employeeProfile.findUnique({
      where: { userId: user.id },
      include: {
        onboardingSteps: {
          include: { stepTemplate: true },
        },
      },
    });

    if (!profile) {
      return errorResponse('Profile not found', 404);
    }

    // Check if all required steps are completed
    const requiredSteps = profile.onboardingSteps.filter(
      (step) => step.stepTemplate.isRequired
    );

    const allCompleted = requiredSteps.every(
      (step) => step.status === 'COMPLETED' || step.stepTemplate.key === 'review'
    );

    if (!allCompleted) {
      return errorResponse('Please complete all required steps before submitting', 400);
    }

    // Mark all steps as completed
    await prisma.employeeOnboardingStep.updateMany({
      where: { employeeId: profile.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Update profile status
    await prisma.employeeProfile.update({
      where: { id: profile.id },
      data: {
        onboardingStatus: 'COMPLETED',
        onboardingCompletedAt: new Date(),
      },
    });

    return successResponse(null, 'Onboarding completed successfully');
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return errorResponse('Failed to complete onboarding', 500);
  }
}

