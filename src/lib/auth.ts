import { cookies } from 'next/headers'
import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import bcrypt from 'bcryptjs'

const secret = process.env.CLIENT_AUTH_SECRET || process.env.PAYLOAD_SECRET
if (!secret) {
  throw new Error('CLIENT_AUTH_SECRET or PAYLOAD_SECRET environment variable is required')
}
const CLIENT_AUTH_SECRET = new TextEncoder().encode(secret)

const CLIENT_TOKEN_NAME = 'barber99-client-token'
const TOKEN_EXPIRY = '7d' // 7 days

export interface ClientTokenPayload extends JWTPayload {
  clientId: string
  email: string
  name: string
}

// Password hashing using bcrypt (secure, with salt)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Legacy migration: verify old SHA-256 hashes (will be rehashed on login)
  if (hashedPassword.startsWith('sha256:')) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return `sha256:${hashHex}` === hashedPassword
  }
  // bcrypt verification
  return bcrypt.compare(password, hashedPassword)
}

// Check if a password hash needs migration to bcrypt
export function needsRehash(hashedPassword: string): boolean {
  return hashedPassword.startsWith('sha256:')
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
    const { clientId, email, name } = payload as ClientTokenPayload
    if (!clientId || !email || !name) return null
    return payload as ClientTokenPayload
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
  if (!email || email.length > 254) return false
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(email)
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters, max 128, at least one letter and one number
  return password.length >= 8 && password.length <= 128 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)
}
