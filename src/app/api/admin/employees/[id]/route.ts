import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Get single employee
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!requireRole(user, ['ADMIN'])) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { id } = params;

  const employee = await prisma.employeeProfile.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, createdAt: true } },
      bankDetails: true,
      onboardingSteps: {
        include: { stepTemplate: true },
        orderBy: { stepTemplate: { order: 'asc' } },
      },
      agreements: {
        include: { agreementTemplate: true },
      },
      documents: {
        orderBy: { uploadedAt: 'desc' },
      },
    },
  });

  if (!employee) {
    return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: employee });
}

// DELETE - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!requireRole(user, ['ADMIN'])) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { id } = params;

  try {
    // Get the employee profile to find the user ID
    const employee = await prisma.employeeProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    // Delete the user (this will cascade delete the employee profile and related data)
    await prisma.user.delete({
      where: { id: employee.userId },
    });

    return NextResponse.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete employee' }, { status: 500 });
  }
}

