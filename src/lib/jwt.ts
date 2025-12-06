import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

// Verify and decode a JWT token (safe for middleware)
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

