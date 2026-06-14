import { describe, it, expect } from 'vitest'
import { firstRentDueDate } from '@/lib/contractDates'

describe('firstRentDueDate', () => {
  it('folosește dueDay din aceeași lună când e după startDate', () => {
    const due = firstRentDueDate(new Date('2026-01-03'), 10)
    expect(due.getFullYear()).toBe(2026)
    expect(due.getMonth()).toBe(0)
    expect(due.getDate()).toBe(10)
  })

  it('trece la luna următoare când dueDay e înainte de startDate', () => {
    const due = firstRentDueDate(new Date('2026-01-15'), 10)
    expect(due.getFullYear()).toBe(2026)
    expect(due.getMonth()).toBe(1)
    expect(due.getDate()).toBe(10)
  })

  it('acceptă startDate în aceeași zi cu dueDay', () => {
    const due = firstRentDueDate(new Date('2026-03-05'), 5)
    expect(due.getFullYear()).toBe(2026)
    expect(due.getMonth()).toBe(2)
    expect(due.getDate()).toBe(5)
  })
})
