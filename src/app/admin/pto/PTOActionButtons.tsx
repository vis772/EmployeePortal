'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Button, Textarea } from '@/components/ui';
import toast from 'react-hot-toast';

interface PTOActionButtonsProps {
  requestId: string;
  status: string;
}

export function PTOActionButtons({ requestId, status }: PTOActionButtonsProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'APPROVE' | 'DENY' | 'REVOKE'>('APPROVE');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const requiresReason = action === 'DENY' || action === 'REVOKE';

  const handleAction = async () => {
    // Validate reason is provided for deny/revoke
    if (requiresReason && (!notes || notes.trim() === '')) {
      toast.error(`A reason is required when ${action === 'DENY' ? 'denying' : 'revoking'} a request`);
      return;
    }

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

  const openModal = (actionType: 'APPROVE' | 'DENY' | 'REVOKE') => {
    setAction(actionType);
    setNotes('');
    setShowModal(true);
  };

  const getModalTitle = () => {
    switch (action) {
      case 'APPROVE': return 'Approve PTO Request';
      case 'DENY': return 'Deny PTO Request';
      case 'REVOKE': return 'Revoke Approved PTO Request';
    }
  };

  const getActionLabel = () => {
    switch (action) {
      case 'APPROVE': return 'Approve';
      case 'DENY': return 'Deny';
      case 'REVOKE': return 'Revoke';
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {status === 'PENDING' && (
          <>
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
          </>
        )}
        {status === 'APPROVED' && (
          <button
            onClick={() => openModal('REVOKE')}
            className="inline-flex items-center px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Revoke
          </button>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={getModalTitle()}
      >
        <div className="space-y-4">
          {action === 'REVOKE' && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-amber-800">
                  Revoking this request will restore the employee&apos;s PTO balance and mark the request as denied.
                </p>
              </div>
            </div>
          )}
          
          <p className="text-slate-600">
            Are you sure you want to {action.toLowerCase()} this PTO request?
          </p>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {requiresReason ? 'Reason (required)' : 'Notes (optional)'}
              {requiresReason && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={requiresReason 
                ? "Please provide a reason for this decision..." 
                : "Add any notes for the employee..."}
              rows={3}
              className={requiresReason && !notes.trim() ? 'border-red-300' : ''}
            />
            {requiresReason && (
              <p className="text-xs text-slate-500 mt-1">
                The employee will see this reason.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant={action === 'APPROVE' ? 'primary' : 'danger'}
              onClick={handleAction}
              disabled={loading || (requiresReason && !notes.trim())}
            >
              {loading ? 'Processing...' : getActionLabel()}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

