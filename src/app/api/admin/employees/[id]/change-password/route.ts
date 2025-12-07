import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { auditLogWithRequest } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST - Admin changes an employee's password
 */
export async function POST(
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

  const { id } = params; // This is the employee profile ID

  try {
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword) {
      return NextResponse.json({ success: false, error: 'New password is required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Get employee profile with user
    const employee = await prisma.employeeProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    // Hash and update password
    const newPasswordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: employee.userId },
      data: { passwordHash: newPasswordHash },
    });

    // Audit log
    await auditLogWithRequest({
      userId: user.id,
      action: 'EMPLOYEE_UPDATE',
      entityType: 'User',
      entityId: employee.userId,
      details: { 
        action: 'admin_password_reset',
        employeeId: id,
        employeeEmail: employee.user.email,
      },
    }, request.headers);

    return NextResponse.json({
      success: true,
      message: 'Employee password changed successfully',
    });
  } catch (error) {
    console.error('Admin change password error:', error);
    return NextResponse.json({ success: false, error: 'Failed to change password' }, { status: 500 });
  }
}

