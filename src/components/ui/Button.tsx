import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import Spinner from './Spinner'

type Variant = 'primary' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  children: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  outline: 'btn-outline',
}

// Buton consistent cu stare de încărcare: spinner + dezactivare, fără salt de lățime.
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading = false, disabled, className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${variantClass[variant]} ${loading ? 'cursor-not-allowed opacity-80' : ''} ${className}`}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  )
)

Button.displayName = 'Button'

export default Button
