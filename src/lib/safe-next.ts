/** Prevents open redirects: only same-origin absolute paths are allowed. */
export function safeNext(next: string | null | undefined, fallback = '/') {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/auth')) return fallback
  return next
}
