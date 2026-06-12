'use client'

import { useMemo, useRef, type KeyboardEvent } from 'react'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
}

export default function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = value.split('').slice(0, length)

  const boxes = useMemo(
    () => Array.from({ length }, (_, index) => ({ index, digit: digits[index] || '' })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, length]
  )

  const handleChange = (index: number, rawValue: string) => {
    const nextValue = rawValue.replace(/[^0-9]/g, '').slice(0, 1)
    const nextDigits = boxes.map((box) => box.digit)
    nextDigits[index] = nextValue
    onChange(nextDigits.join(''))

    if (nextValue && refs.current[index + 1]) {
      refs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && refs.current[index - 1]) {
      refs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="grid grid-cols-6 gap-3">
      {boxes.map(({ index, digit }) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          aria-label={`Cifra ${index + 1} din ${length}`}
          className="h-14 w-full rounded-[18px] border border-[var(--border)] bg-white text-center text-[18px] font-semibold text-[var(--text)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[rgba(0,113,227,0.16)]"
        />
      ))}
    </div>
  )
}
