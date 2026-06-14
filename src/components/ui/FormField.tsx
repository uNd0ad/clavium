'use client'

import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, className = '', type, ...props }, ref) => {
    const [show, setShow] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword && show ? 'text' : type

    return (
      <label className="block text-sm text-[var(--text)]">
        <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {label}
        </span>
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`w-full rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 ${isPassword ? 'pr-12' : ''} text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[rgba(0,113,227,0.16)] ${className}`}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShow((value) => !value)}
              aria-label={show ? 'Ascunde parola' : 'Arată parola'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-[var(--brand)]"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : null}
        </div>
        {error ? <p className="mt-2 text-[12px] text-rose-600">{error}</p> : null}
      </label>
    )
  }
)

FormField.displayName = 'FormField'

export default FormField
