import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { auditLogWithRequest } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PATCH - Approve, deny, or revoke a PTO request (admin only)
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

    if (!action || !['APPROVE', 'DENY', 'REVOKE'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    // Require reason for denial or revocation
    if ((action === 'DENY' || action === 'REVOKE') && (!notes || notes.trim() === '')) {
      return NextResponse.json({ 
        success: false, 
        error: `A reason is required when ${action === 'DENY' ? 'denying' : 'revoking'} a PTO request` 
      }, { status: 400 });
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

    // Validate status transitions
    if (action === 'APPROVE' || action === 'DENY') {
      if (ptoRequest.status !== 'PENDING') {
        return NextResponse.json({ success: false, error: 'Can only approve/deny pending requests' }, { status: 400 });
      }
    }

    if (action === 'REVOKE') {
      if (ptoRequest.status !== 'APPROVED') {
        return NextResponse.json({ success: false, error: 'Can only revoke approved requests' }, { status: 400 });
      }
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

    const balanceField = ptoRequest.type === 'VACATION' ? 'vacationUsed' :
                         ptoRequest.type === 'SICK' ? 'sickUsed' : 'personalUsed';

    // If approved, add to used balance
    if (action === 'APPROVE') {
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

    // If revoking, restore the balance (subtract from used)
    if (action === 'REVOKE') {
      const existingBalance = await prisma.pTOBalance.findUnique({
        where: { employeeId: ptoRequest.employeeId },
      });

      if (existingBalance) {
        await prisma.pTOBalance.update({
          where: { employeeId: ptoRequest.employeeId },
          data: {
            [balanceField]: {
              decrement: ptoRequest.totalDays,
            },
          },
        });
      }
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
        previousStatus: ptoRequest.status,
        newStatus,
        notes,
        wasRevoked: action === 'REVOKE',
      },
    }, request.headers);

    const actionWord = action === 'APPROVE' ? 'approved' : action === 'REVOKE' ? 'revoked' : 'denied';
    return NextResponse.json({
      success: true,
      message: `PTO request ${actionWord} successfully`,
    });
  } catch (error) {
    console.error('Process PTO error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process PTO request' }, { status: 500 });
  }
}

