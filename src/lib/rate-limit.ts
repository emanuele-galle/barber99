interface RateLimitEntry {
  count: number
  resetAt: number
}

// Extend globalThis to persist rate limit store across module reloads in Next.js
declare global {
  // eslint-disable-next-line no-var
  var __rateLimitStore: Map<string, RateLimitEntry> | undefined
  // eslint-disable-next-line no-var
  var __rateLimitCleanup: boolean | undefined
}

if (!globalThis.__rateLimitStore) {
  globalThis.__rateLimitStore = new Map<string, RateLimitEntry>()
}
const store = globalThis.__rateLimitStore

// Cleanup stale entries every 60 seconds
if (!globalThis.__rateLimitCleanup) {
  globalThis.__rateLimitCleanup = true
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 60_000)
}

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export function rateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1 }
  }

  entry.count++
  const allowed = entry.count <= config.maxRequests
  return { allowed, remaining: Math.max(0, config.maxRequests - entry.count) }
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}

// Pre-configured limits
export const RATE_LIMITS = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  booking: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
  contact: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  cancel: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
} as const
