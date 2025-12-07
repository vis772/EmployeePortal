import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { auditLogWithRequest } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PATCH - Approve or deny a PTO request (admin only)
 */
export async function PATCH(
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
    const body = await request.json();
    const { action, notes } = body;

    if (!action || !['APPROVE', 'DENY'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    // Get the request
    const ptoRequest = await prisma.pTORequest.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });

    if (!ptoRequest) {
      return NextResponse.json({ success: false, error: 'PTO request not found' }, { status: 404 });
    }

    if (ptoRequest.status !== 'PENDING') {
      return NextResponse.json({ success: false, error: 'Request has already been processed' }, { status: 400 });
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'DENIED';

    // Update request
    await prisma.pTORequest.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedById: user.id,
        reviewedAt: new Date(),
        reviewNotes: notes,
      },
    });

    // If approved, update the balance
    if (action === 'APPROVE') {
      const balanceField = ptoRequest.type === 'VACATION' ? 'vacationUsed' :
                           ptoRequest.type === 'SICK' ? 'sickUsed' : 'personalUsed';

      await prisma.pTOBalance.upsert({
        where: { employeeId: ptoRequest.employeeId },
        create: {
          employeeId: ptoRequest.employeeId,
          vacationDays: 10,
          sickDays: 5,
          personalDays: 3,
          [balanceField]: ptoRequest.totalDays,
        },
        update: {
          [balanceField]: {
            increment: ptoRequest.totalDays,
          },
        },
      });
    }

    // Audit log
    await auditLogWithRequest({
      userId: user.id,
      action: action === 'APPROVE' ? 'PTO_REQUEST_APPROVE' : 'PTO_REQUEST_DENY',
      entityType: 'PTORequest',
      entityId: id,
      details: { 
        employeeId: ptoRequest.employeeId,
        type: ptoRequest.type,
        totalDays: ptoRequest.totalDays,
        notes,
      },
    }, request.headers);

    return NextResponse.json({
      success: true,
      message: `PTO request ${action.toLowerCase()}d successfully`,
    });
  } catch (error) {
    console.error('Process PTO error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process PTO request' }, { status: 500 });
  }
}

