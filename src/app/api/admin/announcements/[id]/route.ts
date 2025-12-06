import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { announcementSchema } from '@/lib/validations';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/utils';

// GET - Get single announcement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (!requireRole(user, ['ADMIN'])) return forbiddenResponse();

  const { id } = await params;

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: {
      createdByAdmin: { select: { email: true } },
    },
  });

  if (!announcement) {
    return notFoundResponse('Announcement');
  }

  return successResponse(announcement);
}

// PUT - Update announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (!requireRole(user, ['ADMIN'])) return forbiddenResponse();

  const { id } = await params;

  try {
    const body = await request.json();

    // Validate input
    const result = announcementSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.errors[0].message);
    }

    const { title, body: announcementBody, isActive } = result.data;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        body: announcementBody,
        isActive,
      },
    });

    return successResponse(announcement, 'Announcement updated successfully');
  } catch (error) {
    console.error('Update announcement error:', error);
    return errorResponse('Failed to update announcement', 500);
  }
}

// DELETE - Delete announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (!requireRole(user, ['ADMIN'])) return forbiddenResponse();

  const { id } = await params;

  try {
    await prisma.announcement.delete({
      where: { id },
    });

    return successResponse(null, 'Announcement deleted successfully');
  } catch (error) {
    console.error('Delete announcement error:', error);
    return errorResponse('Failed to delete announcement', 500);
  }
}

