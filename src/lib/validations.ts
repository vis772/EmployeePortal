import { z } from 'zod';

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Personal info step validation
export const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactRelationship: z.string().min(2, 'Relationship is required'),
  emergencyContactPhone: z.string().min(10, 'Valid phone number is required'),
});

// Bank info step validation
export const bankInfoSchema = z.object({
  bankName: z.string().min(2, 'Bank name is required'),
  accountType: z.enum(['CHECKING', 'SAVINGS'], {
    errorMap: () => ({ message: 'Please select an account type' }),
  }),
  routingNumber: z.string().length(9, 'Routing number must be 9 digits'),
  accountNumber: z.string().min(8, 'Account number must be at least 8 digits').max(17, 'Account number must be at most 17 digits'),
  confirmAccountNumber: z.string(),
  confirmed: z.boolean().refine((val) => val === true, {
    message: 'You must confirm the information is correct',
  }),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: 'Account numbers must match',
  path: ['confirmAccountNumber'],
});

// Employment details step validation
export const employmentDetailsSchema = z.object({
  roleTitle: z.string().min(2, 'Role/position is required'),
  startDate: z.string().min(1, 'Start date is required'),
  employmentType: z.enum(['HOURLY', 'SALARY'], {
    errorMap: () => ({ message: 'Please select employment type' }),
  }),
  wage: z.string().optional(),
});

// Agreements step validation
export const agreementsSchema = z.object({
  agreements: z.array(z.object({
    agreementId: z.string(),
    accepted: z.boolean(),
    isRequired: z.boolean(),
  })).refine(
    (agreements) => agreements.filter(a => a.isRequired).every(a => a.accepted),
    { message: 'All required agreements must be accepted' }
  ),
  documentType: z.enum(['ID', 'DRIVERS_LICENSE', 'PASSPORT', 'OTHER']).optional(),
  documentFile: z.any().optional(), // File validation is handled separately
});

// Invite employee validation
export const inviteEmployeeSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Announcement validation
export const announcementSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  body: z.string().min(10, 'Body must be at least 10 characters'),
  isActive: z.boolean().default(true),
});

// Profile update validation (for employee portal)
export const profileUpdateSchema = z.object({
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactRelationship: z.string().min(2, 'Relationship is required'),
  emergencyContactPhone: z.string().min(10, 'Valid phone number is required'),
});

// Bank update validation
export const bankUpdateSchema = z.object({
  bankName: z.string().min(2, 'Bank name is required'),
  accountType: z.enum(['CHECKING', 'SAVINGS']),
  routingNumber: z.string().length(9, 'Routing number must be 9 digits'),
  accountNumber: z.string().min(8, 'Account number must be at least 8 digits').max(17, 'Account number must be at most 17 digits'),
  confirmAccountNumber: z.string(),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: 'Account numbers must match',
  path: ['confirmAccountNumber'],
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type BankInfoInput = z.infer<typeof bankInfoSchema>;
export type EmploymentDetailsInput = z.infer<typeof employmentDetailsSchema>;
export type AgreementsInput = z.infer<typeof agreementsSchema>;
export type InviteEmployeeInput = z.infer<typeof inviteEmployeeSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type BankUpdateInput = z.infer<typeof bankUpdateSchema>;

