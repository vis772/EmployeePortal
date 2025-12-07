import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * DELETE - Delete a pay stub (admin only)
 */
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
    const payStub = await prisma.payStub.findUnique({
      where: { id },
    });

    if (!payStub) {
      return NextResponse.json({ success: false, error: 'Pay stub not found' }, { status: 404 });
    }

    await prisma.payStub.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Pay stub deleted',
    });
  } catch (error) {
    console.error('Delete pay stub error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete pay stub' }, { status: 500 });
  }
}

