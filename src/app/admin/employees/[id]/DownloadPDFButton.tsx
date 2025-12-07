'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface DownloadPDFButtonProps {
  employeeId: string;
  employeeName: string;
  hasOnboardingPDF: boolean;
}

export function DownloadPDFButton({ employeeId, employeeName, hasOnboardingPDF }: DownloadPDFButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!hasOnboardingPDF) {
      toast.error('No onboarding PDF available. Complete the employee onboarding first.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/employees/${employeeId}/pdf`);
      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to get PDF');
        return;
      }

      // Open PDF in new tab or trigger download
      window.open(data.data.fileUrl, '_blank');
      toast.success('Opening PDF...');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading || !hasOnboardingPDF}
      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        hasOnboardingPDF
          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
      }`}
      title={hasOnboardingPDF ? 'Download Onboarding Record PDF' : 'Complete onboarding to generate PDF'}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {hasOnboardingPDF ? 'Download PDF' : 'PDF Not Available'}
        </>
      )}
    </button>
  );
}

