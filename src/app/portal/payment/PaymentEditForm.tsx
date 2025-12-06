'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select } from '@/components/ui';
import toast from 'react-hot-toast';

interface PaymentEditFormProps {
  bankDetails: {
    bankName: string;
    accountType: string;
    routingNumber: string;
    accountNumber: string;
  } | null;
}

export function PaymentEditForm({ bankDetails }: PaymentEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    accountType: '',
    routingNumber: '',
    accountNumber: '',
    confirmAccountNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
    if (!formData.accountType) newErrors.accountType = 'Account type is required';
    if (!formData.routingNumber.trim()) newErrors.routingNumber = 'Routing number is required';
    if (formData.routingNumber.length !== 9) newErrors.routingNumber = 'Routing number must be 9 digits';
    if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers must match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);

    try {
      const res = await fetch('/api/portal/payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: formData.bankName,
          accountType: formData.accountType,
          routingNumber: formData.routingNumber,
          accountNumber: formData.accountNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to update bank details');
        return;
      }

      toast.success('Bank details updated successfully!');
      setFormData({
        bankName: '',
        accountType: '',
        routingNumber: '',
        accountNumber: '',
        confirmAccountNumber: '',
      });
      router.refresh();
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Bank Name"
        name="bankName"
        placeholder="e.g., Chase Bank, Bank of America"
        value={formData.bankName}
        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
        error={errors.bankName}
        required
      />

      <Select
        label="Account Type"
        name="accountType"
        placeholder="Select account type"
        value={formData.accountType}
        onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
        error={errors.accountType}
        options={[
          { value: 'CHECKING', label: 'Checking' },
          { value: 'SAVINGS', label: 'Savings' },
        ]}
        required
      />

      <Input
        label="Routing Number"
        name="routingNumber"
        placeholder="9-digit routing number"
        value={formData.routingNumber}
        onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9) })}
        error={errors.routingNumber}
        required
      />

      <Input
        label="Account Number"
        name="accountNumber"
        placeholder="Your account number"
        value={formData.accountNumber}
        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
        error={errors.accountNumber}
        required
      />

      <Input
        label="Confirm Account Number"
        name="confirmAccountNumber"
        placeholder="Re-enter your account number"
        value={formData.confirmAccountNumber}
        onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
        error={errors.confirmAccountNumber}
        required
      />

      <div className="pt-4">
        <Button type="submit" isLoading={isLoading} className="w-full">
          Update Bank Details
        </Button>
      </div>
    </form>
  );
}

