import { removeAuthCookie } from '@/lib/auth';
import { successResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  await removeAuthCookie();
  return successResponse({ message: 'Logged out successfully' });
}

