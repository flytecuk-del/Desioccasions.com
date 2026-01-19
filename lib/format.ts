export function normalizeE164(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('+')) return trimmed
  // If user enters a UK/US/CA number without +, we can't guess reliably.
  // Keep simple for MVP: require +countrycode.
  return trimmed
}

export function safeText(s: string, max = 180): string {
  const t = (s || '').toString().trim()
  return t.length > max ? t.slice(0, max - 1) + '…' : t
}
