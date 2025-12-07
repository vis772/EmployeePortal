'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Button, Input, Select } from '@/components/ui';
import toast from 'react-hot-toast';

interface Employee {
  id: string;
  name: string;
}

interface UploadPayStubButtonProps {
  employees: Employee[];
}

export function UploadPayStubButton({ employees }: UploadPayStubButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    payDate: '',
    grossPay: '',
    netPay: '',
    hoursWorked: '',
    hourlyRate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a PDF file');
      return;
    }

    if (!formData.employeeId || !formData.payPeriodStart || !formData.payPeriodEnd || !formData.payDate || !formData.grossPay || !formData.netPay) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      const response = await fetch('/api/admin/paystubs', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Failed to upload pay stub');
        return;
      }

      toast.success('Pay stub uploaded successfully');
      setShowModal(false);
      setFile(null);
      setFormData({
        employeeId: '',
        payPeriodStart: '',
        payPeriodEnd: '',
        payDate: '',
        grossPay: '',
        netPay: '',
        hoursWorked: '',
        hourlyRate: '',
      });
      router.refresh();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload pay stub');
    } finally {
      setLoading(false);
    }
  };

  const employeeOptions = [
    { value: '', label: 'Select an employee' },
    ...employees.map(e => ({ value: e.id, label: e.name })),
  ];

  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Upload Pay Stub
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Upload Pay Stub"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Employee *
            </label>
            <Select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              options={employeeOptions}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pay Period Start *
              </label>
              <Input
                type="date"
                value={formData.payPeriodStart}
                onChange={(e) => setFormData({ ...formData, payPeriodStart: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pay Period End *
              </label>
              <Input
                type="date"
                value={formData.payPeriodEnd}
                onChange={(e) => setFormData({ ...formData, payPeriodEnd: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Pay Date *
            </label>
            <Input
              type="date"
              value={formData.payDate}
              onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gross Pay *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.grossPay}
                onChange={(e) => setFormData({ ...formData, grossPay: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Net Pay *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.netPay}
                onChange={(e) => setFormData({ ...formData, netPay: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hours Worked
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.hoursWorked}
                onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                placeholder="40.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hourly Rate
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Pay Stub PDF *
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-nova-50 file:text-nova-700 hover:file:bg-nova-100"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Pay Stub'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

