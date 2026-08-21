// Small presentation helpers for CST.

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = Math.max(0, now - then)

  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'hace un momento'
  if (minutes < 60) return `hace ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`

  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `hace ${weeks} sem`

  return new Date(iso).toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
  })
}

// Normalize text for accent-insensitive, case-insensitive comparison.
export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// "Bismarck García" -> "B. García"
export function shortName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '—'
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return parts[0]
  const first = parts[0][0]
  const last = parts[parts.length - 1]
  return `${first}. ${last}`
}
