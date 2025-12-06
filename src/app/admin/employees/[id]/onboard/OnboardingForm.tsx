'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Checkbox, Card, CardBody } from '@/components/ui';
import { formatDateForInput, formatDateTime, formatFileSize } from '@/lib/utils';
import toast from 'react-hot-toast';

interface OnboardingFormProps {
  employee: any;
  agreementTemplates: any[];
}

export function OnboardingForm({ employee, agreementTemplates }: OnboardingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [documents, setDocuments] = useState(employee.documents || []);
  
  // Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    fullName: employee.fullName || '',
    dateOfBirth: formatDateForInput(employee.dateOfBirth) || '',
    phone: employee.phone || '',
    address: employee.address || '',
    emergencyContactName: employee.emergencyContactName || '',
    emergencyContactRelationship: employee.emergencyContactRelationship || '',
    emergencyContactPhone: employee.emergencyContactPhone || '',
  });

  // Bank Info
  const [bankInfo, setBankInfo] = useState({
    bankName: employee.bankDetails?.bankName || '',
    accountType: employee.bankDetails?.accountType || '',
    routingNumber: employee.bankDetails?.routingNumber || '',
    accountNumber: employee.bankDetails?.accountNumber || '',
  });

  // Employment Details
  const [employmentDetails, setEmploymentDetails] = useState({
    roleTitle: employee.roleTitle || '',
    startDate: formatDateForInput(employee.startDate) || '',
    employmentType: employee.employmentType || '',
    wage: employee.wage ? String(employee.wage) : '',
  });

  // Agreements
  const [agreements, setAgreements] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    agreementTemplates.forEach((template) => {
      const existing = employee.agreements?.find((a: any) => a.agreementTemplateId === template.id);
      initial[template.id] = existing?.accepted || false;
    });
    return initial;
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');

  const tabs = [
    { name: 'Personal Info', key: 'personal' },
    { name: 'Bank Details', key: 'bank' },
    { name: 'Employment', key: 'employment' },
    { name: 'Documents', key: 'documents' },
    { name: 'Agreements', key: 'agreements' },
  ];

  const handleFileUpload = async () => {
    if (!selectedFile || !documentType) {
      toast.error('Please select a file and document type');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', documentType);

      const res = await fetch(`/api/admin/employees/${employee.id}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to upload file');
        return;
      }

      toast.success('File uploaded successfully!');
      setDocuments([data.data, ...documents]);
      setSelectedFile(null);
      setDocumentType('');
    } catch (error) {
      toast.error('An error occurred while uploading');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/employees/${employee.id}/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalInfo,
          bankInfo,
          employmentDetails,
          agreements: Object.entries(agreements).map(([templateId, accepted]) => ({
            templateId,
            accepted,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save');
        return;
      }

      toast.success('Employee information saved successfully!');
      router.push(`/admin/employees/${employee.id}`);
      router.refresh();
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === index
                ? 'border-nova-500 text-nova-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Personal Info Tab */}
      {activeTab === 0 && (
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={personalInfo.fullName}
            onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={personalInfo.dateOfBirth}
              onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={personalInfo.phone}
              onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
              required
            />
          </div>
          <Input
            label="Address"
            value={personalInfo.address}
            onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
            required
          />
          
          <h3 className="text-sm font-medium text-slate-700 pt-4 border-t">Emergency Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Name"
              value={personalInfo.emergencyContactName}
              onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContactName: e.target.value })}
              required
            />
            <Input
              label="Relationship"
              value={personalInfo.emergencyContactRelationship}
              onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContactRelationship: e.target.value })}
              required
            />
          </div>
          <Input
            label="Emergency Phone"
            type="tel"
            value={personalInfo.emergencyContactPhone}
            onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContactPhone: e.target.value })}
            required
          />
        </div>
      )}

      {/* Bank Details Tab */}
      {activeTab === 1 && (
        <div className="space-y-4">
          <Input
            label="Bank Name"
            value={bankInfo.bankName}
            onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
            required
          />
          <Select
            label="Account Type"
            value={bankInfo.accountType}
            onChange={(e) => setBankInfo({ ...bankInfo, accountType: e.target.value })}
            options={[
              { value: 'CHECKING', label: 'Checking' },
              { value: 'SAVINGS', label: 'Savings' },
            ]}
            placeholder="Select account type"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Routing Number"
              value={bankInfo.routingNumber}
              onChange={(e) => setBankInfo({ ...bankInfo, routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9) })}
              required
            />
            <Input
              label="Account Number"
              value={bankInfo.accountNumber}
              onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value.replace(/\D/g, '') })}
              required
            />
          </div>
        </div>
      )}

      {/* Employment Tab */}
      {activeTab === 2 && (
        <div className="space-y-4">
          <Input
            label="Role / Position"
            value={employmentDetails.roleTitle}
            onChange={(e) => setEmploymentDetails({ ...employmentDetails, roleTitle: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={employmentDetails.startDate}
              onChange={(e) => setEmploymentDetails({ ...employmentDetails, startDate: e.target.value })}
              required
            />
            <Select
              label="Employment Type"
              value={employmentDetails.employmentType}
              onChange={(e) => setEmploymentDetails({ ...employmentDetails, employmentType: e.target.value })}
              options={[
                { value: 'SALARY', label: 'Salary' },
                { value: 'HOURLY', label: 'Hourly' },
              ]}
              placeholder="Select type"
              required
            />
          </div>
          <Input
            label={employmentDetails.employmentType === 'HOURLY' ? 'Hourly Rate ($)' : 'Annual Salary ($)'}
            type="number"
            value={employmentDetails.wage}
            onChange={(e) => setEmploymentDetails({ ...employmentDetails, wage: e.target.value })}
          />
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 3 && (
        <div className="space-y-6">
          {/* Upload new document */}
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
            <h3 className="text-sm font-medium text-slate-700 mb-4">Upload New Document</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Select
                label="Document Type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                options={[
                  { value: 'ID', label: 'Government ID' },
                  { value: 'DRIVERS_LICENSE', label: "Driver's License" },
                  { value: 'PASSPORT', label: 'Passport' },
                  { value: 'OTHER', label: 'Other Document' },
                ]}
                placeholder="Select type"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">File</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-nova-50 file:text-nova-600 hover:file:bg-nova-100"
                />
              </div>
            </div>
            <Button
              onClick={handleFileUpload}
              isLoading={isUploading}
              disabled={!selectedFile || !documentType}
              size="sm"
            >
              Upload Document
            </Button>
          </div>

          {/* Existing documents */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Uploaded Documents</h3>
            {documents.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-nova-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-nova-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{doc.fileName}</p>
                        <p className="text-xs text-slate-500">
                          {doc.type} • {doc.fileSize ? formatFileSize(doc.fileSize) : ''} • {formatDateTime(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-nova-600 hover:text-nova-700"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agreements Tab */}
      {activeTab === 4 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 mb-4">
            Mark agreements as signed on behalf of the employee.
          </p>
          {agreementTemplates.map((template) => (
            <div key={template.id} className="p-4 border border-slate-200 rounded-lg">
              <Checkbox
                label={template.title}
                description={template.description}
                checked={agreements[template.id] || false}
                onChange={(e) => setAgreements({ ...agreements, [template.id]: e.target.checked })}
              />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
        <div className="flex gap-2">
          {activeTab > 0 && (
            <Button variant="secondary" onClick={() => setActiveTab(activeTab - 1)}>
              Previous
            </Button>
          )}
          {activeTab < tabs.length - 1 && (
            <Button variant="secondary" onClick={() => setActiveTab(activeTab + 1)}>
              Next
            </Button>
          )}
        </div>
        <Button onClick={handleSave} isLoading={isLoading}>
          {employee.onboardingStatus === 'COMPLETED' ? 'Save Changes' : 'Complete Onboarding'}
        </Button>
      </div>
    </div>
  );
}
