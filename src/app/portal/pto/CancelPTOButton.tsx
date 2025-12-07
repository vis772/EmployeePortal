'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CancelPTOButtonProps {
  requestId: string;
}

export function CancelPTOButton({ requestId }: CancelPTOButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/pto/${requestId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to cancel request');
        return;
      }

      toast.success('Request cancelled');
      router.refresh();
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
    >
      {loading ? 'Cancelling...' : 'Cancel'}
    </button>
  );
}

