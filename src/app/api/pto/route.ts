import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { auditLogWithRequest } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET - Get PTO requests for the current employee
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get employee profile
    const employee = await prisma.employeeProfile.findUnique({
      where: { userId: user.id },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee profile not found' }, { status: 404 });
    }

    const [requests, balance] = await Promise.all([
      prisma.pTORequest.findMany({
        where: { employeeId: employee.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pTOBalance.findUnique({
        where: { employeeId: employee.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { requests, balance },
    });
  } catch (error) {
    console.error('Get PTO error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get PTO data' }, { status: 500 });
  }
}

/**
 * POST - Create a new PTO request
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, startDate, endDate, reason } = body;

    // Validate input
    if (!type || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Get employee profile
    const employee = await prisma.employeeProfile.findUnique({
      where: { userId: user.id },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee profile not found' }, { status: 404 });
    }

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check balance
    const balance = await prisma.pTOBalance.findUnique({
      where: { employeeId: employee.id },
    });

    if (balance) {
      let available = 0;
      if (type === 'VACATION') {
        available = Number(balance.vacationDays) - Number(balance.vacationUsed);
      } else if (type === 'SICK') {
        available = Number(balance.sickDays) - Number(balance.sickUsed);
      } else if (type === 'PERSONAL') {
        available = Number(balance.personalDays) - Number(balance.personalUsed);
      }

      if (totalDays > available) {
        return NextResponse.json({ 
          success: false, 
          error: `Insufficient ${type.toLowerCase()} days. Available: ${available}, Requested: ${totalDays}` 
        }, { status: 400 });
      }
    }

    // Create request
    const ptoRequest = await prisma.pTORequest.create({
      data: {
        employeeId: employee.id,
        type,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
        status: 'PENDING',
      },
    });

    // Audit log
    await auditLogWithRequest({
      userId: user.id,
      action: 'PTO_REQUEST_CREATE',
      entityType: 'PTORequest',
      entityId: ptoRequest.id,
      details: { type, startDate, endDate, totalDays },
    }, request.headers);

    return NextResponse.json({
      success: true,
      data: ptoRequest,
      message: 'PTO request submitted successfully',
    });
  } catch (error) {
    console.error('Create PTO error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create PTO request' }, { status: 500 });
  }
}

