'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Textarea } from '@/components/ui';
import toast from 'react-hot-toast';

interface PTORequestFormProps {
  vacationRemaining: number;
  sickRemaining: number;
  personalRemaining: number;
}

export function PTORequestForm({ vacationRemaining, sickRemaining, personalRemaining }: PTORequestFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'VACATION',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (end < start) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/pto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to submit request');
        return;
      }

      toast.success('Time off request submitted!');
      setFormData({ type: 'VACATION', startDate: '', endDate: '', reason: '' });
      router.refresh();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'VACATION', label: `Vacation (${vacationRemaining} days available)` },
    { value: 'SICK', label: `Sick Leave (${sickRemaining} days available)` },
    { value: 'PERSONAL', label: `Personal (${personalRemaining} days available)` },
  ];

  // Calculate days
  let totalDays = 0;
  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end >= start) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Type
          </label>
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={typeOptions}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Start Date
          </label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            End Date
          </label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            min={formData.startDate || new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>

      {totalDays > 0 && (
        <div className="bg-nova-50 border border-nova-200 rounded-lg p-3">
          <p className="text-sm text-nova-700">
            <span className="font-medium">Total days requested:</span> {totalDays} day{totalDays !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Reason (optional)
        </label>
        <Textarea
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Brief description of why you're requesting time off..."
          rows={3}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
}

