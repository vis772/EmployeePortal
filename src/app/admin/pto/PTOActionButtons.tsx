'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Button, Textarea } from '@/components/ui';
import toast from 'react-hot-toast';

interface PTOActionButtonsProps {
  requestId: string;
}

export function PTOActionButtons({ requestId }: PTOActionButtonsProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'APPROVE' | 'DENY'>('APPROVE');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/pto/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to process request');
        return;
      }

      toast.success(data.message);
      setShowModal(false);
      router.refresh();
    } catch (error) {
      console.error('Action error:', error);
      toast.error('Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (actionType: 'APPROVE' | 'DENY') => {
    setAction(actionType);
    setNotes('');
    setShowModal(true);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => openModal('APPROVE')}
          className="inline-flex items-center px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Approve
        </button>
        <button
          onClick={() => openModal('DENY')}
          className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Deny
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${action === 'APPROVE' ? 'Approve' : 'Deny'} PTO Request`}
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to {action.toLowerCase()} this PTO request?
          </p>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for the employee..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant={action === 'APPROVE' ? 'primary' : 'danger'}
              onClick={handleAction}
              disabled={loading}
            >
              {loading ? 'Processing...' : action === 'APPROVE' ? 'Approve' : 'Deny'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

