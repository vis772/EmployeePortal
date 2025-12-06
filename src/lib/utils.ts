import { clsx, type ClassValue } from 'clsx';

// Utility for combining class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format date for display
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format date for input fields
export function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

// Format datetime for display
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Mask account number to show only last 4 digits
export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) return '****';
  return '****' + accountNumber.slice(-4);
}

// Get onboarding status badge color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800';
    case 'IN_PROGRESS':
      return 'bg-amber-100 text-amber-800';
    case 'NOT_STARTED':
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

// Get step status badge color
export function getStepStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-500';
    case 'IN_PROGRESS':
      return 'bg-amber-500';
    case 'NOT_STARTED':
    default:
      return 'bg-slate-300';
  }
}

// Format status for display
export function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

// Generate a random password
export function generateRandomPassword(length: number = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Validate file type for document upload
export function isValidFileType(fileName: string, allowedTypes: string[]): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// API response helpers
export function successResponse<T>(data: T, message?: string) {
  return Response.json({ success: true, data, message }, { status: 200 });
}

export function errorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function unauthorizedResponse() {
  return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

export function forbiddenResponse() {
  return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
}

export function notFoundResponse(resource: string = 'Resource') {
  return Response.json({ success: false, error: `${resource} not found` }, { status: 404 });
}

