'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';

interface ProfileEditFormProps {
  profile: {
    id: string;
    phone: string | null;
    address: string | null;
    emergencyContactName: string | null;
    emergencyContactRelationship: string | null;
    emergencyContactPhone: string | null;
  };
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: profile.phone || '',
    address: profile.address || '',
    emergencyContactName: profile.emergencyContactName || '',
    emergencyContactRelationship: profile.emergencyContactRelationship || '',
    emergencyContactPhone: profile.emergencyContactPhone || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data.error || 'Failed to update profile' });
        toast.error(data.error || 'Failed to update profile');
        return;
      }

      toast.success('Profile updated successfully!');
      router.refresh();
    } catch (error) {
      setErrors({ form: 'An error occurred' });
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          error={errors.phone}
          required
        />

        <div className="md:col-span-2">
          <Input
            label="Address"
            name="address"
            placeholder="123 Main St, City, State ZIP"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={errors.address}
            required
          />
        </div>
      </div>

      <div className="pt-6 border-t border-stone-200">
        <h3 className="text-sm font-medium text-stone-700 mb-4">Emergency Contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Contact Name"
            name="emergencyContactName"
            placeholder="Jane Doe"
            value={formData.emergencyContactName}
            onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
            error={errors.emergencyContactName}
            required
          />

          <Input
            label="Relationship"
            name="emergencyContactRelationship"
            placeholder="Spouse, Parent, etc."
            value={formData.emergencyContactRelationship}
            onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
            error={errors.emergencyContactRelationship}
            required
          />

          <Input
            label="Phone Number"
            name="emergencyContactPhone"
            type="tel"
            placeholder="(555) 987-6543"
            value={formData.emergencyContactPhone}
            onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
            error={errors.emergencyContactPhone}
            required
          />
        </div>
      </div>

      {errors.form && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{errors.form}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}

