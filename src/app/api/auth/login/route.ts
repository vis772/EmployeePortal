import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkRateLimit, resetRateLimit, LOGIN_RATE_LIMIT } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Check rate limit (by email to prevent brute force on specific accounts)
    const rateLimitKey = `login:${email.toLowerCase()}`;
    const rateLimit = checkRateLimit(rateLimitKey, LOGIN_RATE_LIMIT);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Too many login attempts. Please try again in ${rateLimit.retryAfter} seconds.` 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { employeeProfile: { select: { id: true, onboardingStatus: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_MAX_AGE }
    );

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        onboardingStatus: user.employeeProfile?.onboardingStatus || null,
      },
    });

    // Set the cookie on the response
    response.cookies.set('nova_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_MAX_AGE,
      path: '/',
    });

    // Reset rate limit on successful login
    resetRateLimit(rateLimitKey);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
