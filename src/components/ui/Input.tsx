import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  errorId?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, error, errorId, ...props }, ref) => {
    const isInvalid = props['aria-invalid'] === 'true' || error ? 'true' : 'false';
    const describedBy = errorId || props['aria-describedby'];

    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={isInvalid}
          aria-describedby={describedBy}
          className={cn(
            'block w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'focus:ring-2 focus:outline-none',
            'transition-all duration-200',
            isInvalid === 'true'
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
              : 'border-slate-200 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/30',
            className
          )}
          {...props}
        />
        {error && <p id={errorId} className="text-xs text-red-500 mt-1 font-medium" role="alert">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
