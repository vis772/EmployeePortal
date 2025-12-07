import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { auditLogWithRequest } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST - Disable 2FA (requires password confirmation)
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    // Get user with password hash
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true, totpEnabled: true },
    });

    if (!dbUser?.totpEnabled) {
      return NextResponse.json({ success: false, error: '2FA is not enabled' }, { status: 400 });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, dbUser.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 400 });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpEnabled: false,
        totpSecret: null,
        backupCodes: null,
      },
    });

    // Audit log
    await auditLogWithRequest({
      userId: user.id,
      action: 'TWO_FACTOR_DISABLED',
      entityType: 'User',
      entityId: user.id,
    }, request.headers);

    return NextResponse.json({
      success: true,
      message: '2FA has been disabled',
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json({ success: false, error: 'Failed to disable 2FA' }, { status: 500 });
  }
}

