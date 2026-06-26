/**
 * Adună `months` luni la o dată, fără overflow de lună. `setMonth` brut dă rezultate
 * greșite la sfârșit de lună (31 ian + 1 lună → 3 mar); aici fixăm ziua la ultima zi
 * validă a lunii țintă (31 ian + 1 lună → 28/29 feb).
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  const day = result.getDate()
  result.setDate(1)
  result.setMonth(result.getMonth() + months)
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()
  result.setDate(Math.min(day, lastDay))
  return result
}

/** Prima chirie scadentă: prima zi `dueDay` din lună pe sau după `startDate`. */
export function firstRentDueDate(startDate: Date, dueDay: number): Date {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const due = new Date(start)
  due.setDate(dueDay)
  if (due < start) {
    due.setMonth(due.getMonth() + 1)
  }
  return due
}
