const dateTimeFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const dateFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
const numberFormat = new Intl.NumberFormat('id-ID')

export const formatNumber = (n) => numberFormat.format(n ?? 0)

export function formatDateTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : dateTimeFormat.format(date)
}

export function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : dateFormat.format(date)
}

/** 65 -> "1:05" */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds ?? 0))
  const minutes = Math.floor(s / 60)
  return `${minutes}:${String(s % 60).padStart(2, '0')}`
}

export const DEATH_CAUSE_LABEL = {
  wall: 'Menabrak tembok',
  self: 'Menabrak badan sendiri',
}

export const deathCauseLabel = (cause) => DEATH_CAUSE_LABEL[cause] ?? '-'
