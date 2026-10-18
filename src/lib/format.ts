const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

const day = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' })

export function formatInr(value: number) {
  return inr.format(Number.isFinite(value) ? value : 0)
}

export function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return day.format(date)
}
