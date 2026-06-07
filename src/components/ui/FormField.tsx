'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <label className="block text-sm text-[var(--text)]">
      <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </span>
      <input
        ref={ref}
        className={`w-full rounded-[18px] border border-[var(--border)] bg-white px-4 py-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[rgba(0,113,227,0.16)] ${className}`}
        {...props}
      />
      {error ? <p className="mt-2 text-[12px] text-rose-600">{error}</p> : null}
    </label>
  )
)

FormField.displayName = 'FormField'

export default FormField
