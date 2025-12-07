/**
 * PDF Generator for Employee Onboarding Records
 * Generates a comprehensive PDF document with all employee onboarding information
 */

import { jsPDF } from 'jspdf';

interface EmployeeData {
  fullName: string | null;
  email: string;
  dateOfBirth: Date | null;
  phone: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactRelationship: string | null;
  emergencyContactPhone: string | null;
  roleTitle: string | null;
  startDate: Date | null;
  employmentType: string | null;
  wage: number | null;
  bankName?: string | null;
  accountType?: string | null;
  last4Account?: string | null;
  agreements?: Array<{
    title: string;
    accepted: boolean;
    acceptedAt: Date | null;
  }>;
  onboardingCompletedAt: Date | null;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(date: Date | null | undefined): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number | null | undefined, type: string | null): string {
  if (amount === null || amount === undefined) return 'N/A';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
  return type === 'HOURLY' ? `${formatted}/hr` : `${formatted}/yr`;
}

export function generateOnboardingPDF(employee: EmployeeData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Helper function to add a section header
  const addSectionHeader = (title: string) => {
    doc.setFillColor(100, 149, 237); // Cornflower blue
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 4, yPos + 6);
    doc.setTextColor(0, 0, 0);
    yPos += 12;
  };

  // Helper function to add a field
  const addField = (label: string, value: string, indent = 0) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(label + ':', margin + indent, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(value || 'N/A', margin + 60 + indent, yPos);
    yPos += 6;
  };

  // === HEADER ===
  doc.setFillColor(65, 105, 225); // Royal blue
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Nova Creations', margin, 15);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Employee Onboarding Record', margin, 25);

  doc.setFontSize(10);
  doc.text(`Generated: ${formatDateTime(new Date())}`, pageWidth - margin - 60, 15);
  
  yPos = 45;

  // === EMPLOYEE SUMMARY ===
  doc.setFillColor(240, 248, 255); // Alice blue background
  doc.rect(margin, yPos, pageWidth - 2 * margin, 25, 'F');
  doc.setDrawColor(100, 149, 237);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 25, 'S');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(employee.fullName || 'Employee Name Not Provided', margin + 5, yPos + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(employee.email, margin + 5, yPos + 18);
  
  doc.setTextColor(34, 139, 34); // Green
  doc.setFont('helvetica', 'bold');
  doc.text('ONBOARDING COMPLETED', pageWidth - margin - 55, yPos + 14);
  
  yPos += 35;

  // === PERSONAL INFORMATION ===
  addSectionHeader('Personal Information');
  addField('Full Name', employee.fullName || 'N/A');
  addField('Email', employee.email);
  addField('Date of Birth', formatDate(employee.dateOfBirth));
  addField('Phone Number', employee.phone || 'N/A');
  addField('Address', employee.address || 'N/A');
  yPos += 5;

  // === EMERGENCY CONTACT ===
  addSectionHeader('Emergency Contact');
  addField('Contact Name', employee.emergencyContactName || 'N/A');
  addField('Relationship', employee.emergencyContactRelationship || 'N/A');
  addField('Phone Number', employee.emergencyContactPhone || 'N/A');
  yPos += 5;

  // === EMPLOYMENT DETAILS ===
  addSectionHeader('Employment Details');
  addField('Position/Role', employee.roleTitle || 'N/A');
  addField('Start Date', formatDate(employee.startDate));
  addField('Employment Type', employee.employmentType || 'N/A');
  addField('Compensation', formatCurrency(employee.wage, employee.employmentType));
  yPos += 5;

  // === BANK INFORMATION ===
  addSectionHeader('Bank Information (Confidential)');
  addField('Bank Name', employee.bankName || 'N/A');
  addField('Account Type', employee.accountType || 'N/A');
  addField('Account Number', employee.last4Account ? `****${employee.last4Account}` : 'N/A');
  yPos += 5;

  // === AGREEMENTS ===
  if (employee.agreements && employee.agreements.length > 0) {
    addSectionHeader('Signed Agreements');
    employee.agreements.forEach((agreement) => {
      const status = agreement.accepted ? '✓ Accepted' : '✗ Not Accepted';
      const date = agreement.accepted && agreement.acceptedAt 
        ? ` on ${formatDateTime(agreement.acceptedAt)}` 
        : '';
      addField(agreement.title, `${status}${date}`);
    });
    yPos += 5;
  }

  // === COMPLETION INFO ===
  addSectionHeader('Onboarding Completion');
  addField('Completed On', formatDateTime(employee.onboardingCompletedAt));
  
  // === FOOTER ===
  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `CONFIDENTIAL - Nova Creations Employee Record | Page ${pageNum} of ${totalPages}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  };

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  // Return as Buffer for server-side use
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

