import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/admin', '/portal'];
// Routes only for admins (including onboarding employees)
const adminRoutes = ['/admin'];
// Routes only for employees
const employeeRoutes = ['/portal'];

// Simple JWT decode (without verification - verification happens in API routes)
function decodeToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get the auth token from cookies
  const token = request.cookies.get('nova_auth_token')?.value;

  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Decode the token
  const payload = decodeToken(token);

  if (!payload) {
    // Invalid token, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('nova_auth_token');
    return response;
  }

  // Check role-based access
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isEmployeeRoute = employeeRoutes.some(route => pathname.startsWith(route));

  if (isAdminRoute && payload.role !== 'ADMIN') {
    // Non-admin trying to access admin routes
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  if (isEmployeeRoute && payload.role !== 'EMPLOYEE') {
    // Non-employee trying to access employee routes
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and api
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};

