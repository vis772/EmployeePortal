'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, description, id, ...props }, ref) => {
    const checkboxId = id || props.name;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-slate-300 text-nova-500',
              'focus:ring-2 focus:ring-nova-400 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'text-sm font-medium',
                  error ? 'text-red-600' : 'text-slate-700'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-slate-500">{description}</p>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };

