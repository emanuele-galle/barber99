import { cookies } from 'next/headers'
import { SignJWT, jwtVerify, JWTPayload } from 'jose'

const CLIENT_AUTH_SECRET = new TextEncoder().encode(
  process.env.CLIENT_AUTH_SECRET || process.env.PAYLOAD_SECRET || 'barber99-client-auth-secret-min-32-chars'
)

const CLIENT_TOKEN_NAME = 'barber99-client-token'
const TOKEN_EXPIRY = '7d' // 7 days

export interface ClientTokenPayload extends JWTPayload {
  clientId: string
  email: string
  name: string
}

// Simple password hashing using Web Crypto API (available in Node.js and Edge)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  // Add a prefix to identify the hash method
  return `sha256:${hashHex}`
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  if (hashedPassword.startsWith('sha256:')) {
    const hash = await hashPassword(password)
    return hash === hashedPassword
  }
  // Fallback for plain text (should never happen in production)
  return password === hashedPassword
}

export async function createClientToken(payload: ClientTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(CLIENT_AUTH_SECRET)
}

export async function verifyClientToken(token: string): Promise<ClientTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, CLIENT_AUTH_SECRET)
    return payload as unknown as ClientTokenPayload
  } catch {
    return null
  }
}

export async function getClientFromCookie(): Promise<ClientTokenPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(CLIENT_TOKEN_NAME)?.value
    if (!token) return null
    return verifyClientToken(token)
  } catch {
    return null
  }
}

export async function setClientCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CLIENT_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearClientCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CLIENT_TOKEN_NAME)
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters
  return password.length >= 8
}
