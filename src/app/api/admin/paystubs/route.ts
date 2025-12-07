import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { put } from '@vercel/blob';
import { auditLogWithRequest } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET - Get all pay stubs (admin only)
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!requireRole(user, ['ADMIN'])) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;

    const payStubs = await prisma.payStub.findMany({
      where,
      include: {
        employee: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { payDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: payStubs,
    });
  } catch (error) {
    console.error('Get pay stubs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get pay stubs' }, { status: 500 });
  }
}

/**
 * POST - Upload a new pay stub (admin only)
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!requireRole(user, ['ADMIN'])) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const employeeId = formData.get('employeeId') as string;
    const payPeriodStart = formData.get('payPeriodStart') as string;
    const payPeriodEnd = formData.get('payPeriodEnd') as string;
    const payDate = formData.get('payDate') as string;
    const grossPay = formData.get('grossPay') as string;
    const netPay = formData.get('netPay') as string;
    const deductions = formData.get('deductions') as string;
    const hoursWorked = formData.get('hoursWorked') as string;
    const hourlyRate = formData.get('hourlyRate') as string;

    if (!file || !employeeId || !payPeriodStart || !payPeriodEnd || !payDate || !grossPay || !netPay) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Check if employee exists
    const employee = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    // Upload file to Vercel Blob
    const timestamp = Date.now();
    const fileName = `paystubs/${employeeId}/paystub_${timestamp}.pdf`;
    
    const blob = await put(fileName, file, {
      access: 'public',
      contentType: 'application/pdf',
    });

    // Create pay stub record
    const payStub = await prisma.payStub.create({
      data: {
        employeeId,
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd),
        payDate: new Date(payDate),
        grossPay: parseFloat(grossPay),
        netPay: parseFloat(netPay),
        deductions: deductions || null,
        hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        fileName: file.name,
        fileUrl: blob.url,
      },
    });

    // Audit log
    await auditLogWithRequest({
      userId: user.id,
      action: 'PAYSTUB_UPLOAD',
      entityType: 'PayStub',
      entityId: payStub.id,
      details: { employeeId, payDate, grossPay, netPay },
    }, request.headers);

    return NextResponse.json({
      success: true,
      data: payStub,
      message: 'Pay stub uploaded successfully',
    });
  } catch (error) {
    console.error('Upload pay stub error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload pay stub' }, { status: 500 });
  }
}

