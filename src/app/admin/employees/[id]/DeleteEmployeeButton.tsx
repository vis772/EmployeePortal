'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal } from '@/components/ui';
import toast from 'react-hot-toast';

interface DeleteEmployeeButtonProps {
  employeeId: string;
  employeeName: string;
}

export function DeleteEmployeeButton({ employeeId, employeeName }: DeleteEmployeeButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete employee');
        return;
      }

      toast.success('Employee deleted successfully');
      router.push('/admin/employees');
      router.refresh();
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setIsOpen(true)}>
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Delete Employee"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete <strong>{employeeName}</strong>? This action cannot be undone and will permanently remove:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
            <li>All personal information</li>
            <li>Bank details</li>
            <li>Uploaded documents</li>
            <li>Agreement records</li>
          </ul>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
              Delete Employee
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

