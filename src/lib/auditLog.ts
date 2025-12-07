/**
 * Audit Log Utility
 * Tracks all sensitive actions in the system for security and compliance
 */

import { prisma } from './db';

// Match the AuditAction enum from Prisma
export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_COMPLETE'
  | 'TWO_FACTOR_ENABLED'
  | 'TWO_FACTOR_DISABLED'
  | 'PROFILE_UPDATE'
  | 'EMPLOYEE_CREATE'
  | 'EMPLOYEE_UPDATE'
  | 'EMPLOYEE_DELETE'
  | 'PTO_REQUEST_CREATE'
  | 'PTO_REQUEST_APPROVE'
  | 'PTO_REQUEST_DENY'
  | 'PTO_REQUEST_CANCEL'
  | 'PAYSTUB_UPLOAD'
  | 'PAYSTUB_VIEW'
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_VIEW'
  | 'SETTINGS_UPDATE';

interface AuditLogParams {
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        details: params.details ? JSON.stringify(params.details) : null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (error) {
    // Log the error but don't fail the main operation
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Extract IP address from request headers
 */
export function getClientIP(headers: Headers): string | null {
  // Check common proxy headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return null;
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(headers: Headers): string | null {
  return headers.get('user-agent');
}

/**
 * Helper to create audit log with request info
 */
export async function auditLogWithRequest(
  params: Omit<AuditLogParams, 'ipAddress' | 'userAgent'>,
  headers: Headers
): Promise<void> {
  await createAuditLog({
    ...params,
    ipAddress: getClientIP(headers),
    userAgent: getUserAgent(headers),
  });
}

