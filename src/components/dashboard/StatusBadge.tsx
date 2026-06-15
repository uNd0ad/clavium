type StatusBadgeProps = {
  label: string
  variant?: 'success' | 'warning' | 'danger' | 'info'
}

const badgeStyles: Record<NonNullable<StatusBadgeProps['variant']>, string> = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  warning: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  danger: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  info: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
}

export default function StatusBadge({ label, variant = 'info' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-2xs font-semibold tracking-[0.16em] uppercase ${badgeStyles[variant]}`}>
      {label}
    </span>
  )
}
