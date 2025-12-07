import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { verifyTOTP, generateBackupCodes, hashBackupCode } from '@/lib/totp';
import { decrypt } from '@/lib/encryption';
import { auditLogWithRequest } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST - Verify TOTP code and enable 2FA
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { code } = body;

    if (!code || code.length !== 6) {
      return NextResponse.json({ success: false, error: 'Invalid code format' }, { status: 400 });
    }

    // Get user's pending TOTP secret
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { totpSecret: true, totpEnabled: true },
    });

    if (!dbUser?.totpSecret) {
      return NextResponse.json({ success: false, error: 'No 2FA setup in progress' }, { status: 400 });
    }

    if (dbUser.totpEnabled) {
      return NextResponse.json({ success: false, error: '2FA is already enabled' }, { status: 400 });
    }

    // Decrypt and verify
    const secret = decrypt(dbUser.totpSecret);
    const isValid = verifyTOTP(code, secret);

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 400 });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpEnabled: true,
        backupCodes: JSON.stringify(hashedBackupCodes),
      },
    });

    // Audit log
    await auditLogWithRequest({
      userId: user.id,
      action: 'TWO_FACTOR_ENABLED',
      entityType: 'User',
      entityId: user.id,
    }, request.headers);

    return NextResponse.json({
      success: true,
      data: {
        backupCodes, // Show these to user ONCE
      },
      message: '2FA enabled successfully. Save your backup codes!',
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json({ success: false, error: 'Failed to verify 2FA' }, { status: 500 });
  }
}

