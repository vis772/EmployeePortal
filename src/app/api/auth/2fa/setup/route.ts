import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateTOTPSecret, generateTOTPUri, generateQRCode } from '@/lib/totp';
import { encrypt } from '@/lib/encryption';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET - Generate 2FA setup data (secret + QR code)
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if 2FA is already enabled
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { totpEnabled: true },
    });

    if (dbUser?.totpEnabled) {
      return NextResponse.json({ 
        success: false, 
        error: '2FA is already enabled. Disable it first to set up a new device.' 
      }, { status: 400 });
    }

    // Generate new secret
    const secret = generateTOTPSecret();
    const uri = generateTOTPUri(user.email, secret);
    const qrCode = await generateQRCode(uri);

    // Temporarily store the secret (encrypted) - will be confirmed on verify
    const encryptedSecret = encrypt(secret);
    await prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: encryptedSecret },
    });

    return NextResponse.json({
      success: true,
      data: {
        secret, // Show this to user so they can manually enter if QR doesn't work
        qrCode,
      },
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ success: false, error: 'Failed to setup 2FA' }, { status: 500 });
  }
}

