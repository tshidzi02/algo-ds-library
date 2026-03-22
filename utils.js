export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export const FREQ_OPTIONS = ['Monthly','Weekly','Bi-weekly','Annual','Once-off']

export const FREQ_COLOR = {
  Monthly: { bg: '#edf7f0', color: '#2a5c3a' },
  Weekly: { bg: '#e8f0fb', color: '#1a3a5c' },
  'Bi-weekly': { bg: '#e8f0fb', color: '#1a3a5c' },
  Annual: { bg: '#f3eefb', color: '#4a1a6e' },
  'Once-off': { bg: '#fff4e8', color: '#b85a10' },
}

export function fmt(n) {
  if (n == null || isNaN(n)) return 'R 0'
  return 'R\u00a0' + Math.round(n).toLocaleString('en-ZA')
}

export function fmtShort(n) {
  if (n == null || isNaN(n)) return 'R0'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1e6) return sign + 'R' + (abs / 1e6).toFixed(1) + 'M'
  if (abs >= 1e3) return sign + 'R' + (abs / 1e3).toFixed(0) + 'k'
  return sign + 'R' + Math.round(abs)
}

export function today() {
  return new Date()
}

export function toDateStr(date) {
  return date.toISOString().split('T')[0]
}
