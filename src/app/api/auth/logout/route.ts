import { removeAuthCookie } from '@/lib/auth';
import { successResponse } from '@/lib/utils';

export async function POST() {
  await removeAuthCookie();
  return successResponse({ message: 'Logged out successfully' });
}

