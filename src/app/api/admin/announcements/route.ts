import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { announcementSchema } from '@/lib/validations';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// GET - List all announcements
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (!requireRole(user, ['ADMIN'])) return forbiddenResponse();

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdByAdmin: { select: { email: true } },
    },
  });

  return successResponse(announcements);
}

// POST - Create new announcement
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (!requireRole(user, ['ADMIN'])) return forbiddenResponse();

  try {
    const body = await request.json();

    // Validate input
    const result = announcementSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.errors[0].message);
    }

    const { title, body: announcementBody, isActive } = result.data;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body: announcementBody,
        isActive,
        createdByAdminId: user.id,
      },
    });

    return successResponse(announcement, 'Announcement created successfully');
  } catch (error) {
    console.error('Create announcement error:', error);
    return errorResponse('Failed to create announcement', 500);
  }
}

