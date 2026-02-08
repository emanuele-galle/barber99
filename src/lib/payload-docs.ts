/**
 * Shared type definitions for Payload CMS documents used across frontend pages.
 * These correspond to the collection field schemas in src/collections/.
 *
 * Without generated payload-types.ts, Payload's find() returns opaque types.
 * These interfaces + asPayloadDocs() provide a single, explicit cast point
 * instead of scattered `as unknown as T` assertions.
 */

export interface ServiceDoc {
  id: string | number
  slug: string
  name: string
  shortDescription?: string
  description?: unknown
  price: number
  duration: number
  icon?: string
  category: string
  featured?: boolean
  active?: boolean
  order?: number
  image?: { url?: string } | null
}

export interface ReviewDoc {
  id: string | number
  author: string
  rating: number
  text: string
  createdAt: string
  source?: string
  featured?: boolean
  verified?: boolean
}

export interface GalleryDoc {
  id: string | number
  title: string
  image?: { url?: string } | null
  category: string
  featured?: boolean
}

/**
 * Cast Payload find().docs to a known document type.
 * Centralizes the unavoidable type assertion in one place.
 */
export function asPayloadDocs<T>(docs: unknown[]): T[] {
  return docs as T[]
}
