type StatusBadgeProps = {
  label: string
  variant?: 'success' | 'warning' | 'danger' | 'info'
}

const badgeStyles: Record<NonNullable<StatusBadgeProps['variant']>, string> = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  danger: 'bg-rose-100 text-rose-800 border-rose-200',
  info: 'bg-sky-100 text-sky-800 border-sky-200',
}

export default function StatusBadge({ label, variant = 'info' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase ${badgeStyles[variant]}`}>
      {label}
    </span>
  )
}
