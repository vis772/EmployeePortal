import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const TOKEN_NAME = 'nova_auth_token';
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  employeeProfileId?: string;
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify a password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create a JWT token
export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_MAX_AGE });
}

// Verify and decode a JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(payload: JWTPayload): Promise<void> {
  const token = createToken(payload);
  const cookieStore = await cookies();
  
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  });
}

// Remove auth cookie
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

// Get current authenticated user from cookies
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  // Fetch user from database to ensure they still exist and get current data
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { employeeProfile: { select: { id: true } } },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    employeeProfileId: user.employeeProfile?.id,
  };
}

// Authenticate user with email and password
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { employeeProfile: { select: { id: true } } },
  });

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Set the auth cookie
  await setAuthCookie({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeProfileId: user.employeeProfile?.id,
    },
  };
}

// Register a new user (for inviting employees)
export async function createUser(
  email: string,
  password: string,
  role: Role = Role.EMPLOYEE
): Promise<{ success: true; userId: string } | { success: false; error: string }> {
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return { success: false, error: 'User with this email already exists' };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      role,
      employeeProfile: role === Role.EMPLOYEE ? { create: {} } : undefined,
    },
    include: { employeeProfile: true },
  });

  // If employee, create onboarding steps
  if (role === Role.EMPLOYEE && user.employeeProfile) {
    const stepTemplates = await prisma.onboardingStepTemplate.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    await prisma.employeeOnboardingStep.createMany({
      data: stepTemplates.map((template) => ({
        employeeId: user.employeeProfile!.id,
        stepTemplateId: template.id,
        status: 'NOT_STARTED',
      })),
    });
  }

  return { success: true, userId: user.id };
}

// Check if user has required role
export function requireRole(user: AuthUser | null, allowedRoles: Role[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

