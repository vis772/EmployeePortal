import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET - Retrieve the onboarding PDF for an employee (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!requireRole(user, ['ADMIN'])) {
    return NextResponse.json({ success: false, error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  const { id } = params;

  try {
    // Check if employee exists
    const employee = await prisma.employeeProfile.findUnique({
      where: { id },
      include: {
        documents: {
          where: { type: 'ONBOARDING_PDF' },
          orderBy: { uploadedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    if (employee.documents.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No onboarding PDF found. Complete the employee onboarding first.' 
      }, { status: 404 });
    }

    const pdfDocument = employee.documents[0];

    return NextResponse.json({
      success: true,
      data: {
        fileName: pdfDocument.fileName,
        fileUrl: pdfDocument.fileUrl,
        uploadedAt: pdfDocument.uploadedAt,
        fileSize: pdfDocument.fileSize,
      },
    });
  } catch (error) {
    console.error('Get PDF error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve PDF' }, { status: 500 });
  }
}

