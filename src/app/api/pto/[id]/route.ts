import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { auditLogWithRequest } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * DELETE - Cancel a PTO request (employee can cancel their own pending requests)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    // Get employee profile
    const employee = await prisma.employeeProfile.findUnique({
      where: { userId: user.id },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee profile not found' }, { status: 404 });
    }

    // Get the request
    const ptoRequest = await prisma.pTORequest.findUnique({
      where: { id },
    });

    if (!ptoRequest) {
      return NextResponse.json({ success: false, error: 'PTO request not found' }, { status: 404 });
    }

    // Check ownership
    if (ptoRequest.employeeId !== employee.id) {
      return NextResponse.json({ success: false, error: 'Not authorized to cancel this request' }, { status: 403 });
    }

    // Can only cancel pending requests
    if (ptoRequest.status !== 'PENDING') {
      return NextResponse.json({ success: false, error: 'Can only cancel pending requests' }, { status: 400 });
    }

    // Update status to cancelled
    await prisma.pTORequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Audit log
    await auditLogWithRequest({
      userId: user.id,
      action: 'PTO_REQUEST_CANCEL',
      entityType: 'PTORequest',
      entityId: id,
    }, request.headers);

    return NextResponse.json({
      success: true,
      message: 'PTO request cancelled',
    });
  } catch (error) {
    console.error('Cancel PTO error:', error);
    return NextResponse.json({ success: false, error: 'Failed to cancel PTO request' }, { status: 500 });
  }
}

