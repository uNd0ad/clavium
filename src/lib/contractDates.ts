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
