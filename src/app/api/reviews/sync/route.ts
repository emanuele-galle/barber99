import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN
const SYNC_SECRET = process.env.INSTAGRAM_SYNC_SECRET
const GOOGLE_MAPS_SEARCH = 'Barber 99 Serra San Bruno'

interface ApifyReview {
  name?: string
  text?: string
  textTranslated?: string
  publishAt?: string
  publishedAtDate?: string
  stars?: number
  reviewId?: string
  reviewUrl?: string
  reviewerUrl?: string
  reviewerNumberOfReviews?: number
  isLocalGuide?: boolean
  responseFromOwnerText?: string
}

async function fetchGoogleReviews(): Promise<{ reviews: ApifyReview[]; placeInfo: { placeId?: string; totalScore?: number; reviewsCount?: number } }> {
  // Step 1: Find the place and get reviews using compass/crawler-google-places
  const actorId = 'compass~crawler-google-places'
  const runUrl = `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_API_TOKEN}`

  const googleMapsUrl = process.env.GOOGLE_MAPS_URL || 'https://www.google.com/maps/place/Barber99/@38.5794179,16.332718,17z/data=!4m2!3m1!1s0x1315453549585e87:0xfeb44ab340380fd1'

  const runResponse = await fetch(runUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startUrls: [{ url: googleMapsUrl }],
      language: 'it',
      maxCrawledPlacesPerSearch: 1,
      maxReviews: 50,
      reviewsSort: 'newest',
      scrapeReviewsPersonalData: true,
    }),
  })

  if (!runResponse.ok) {
    const error = await runResponse.text()
    throw new Error(`Apify run failed: ${runResponse.status} - ${error}`)
  }

  const runData = await runResponse.json()
  const runId = runData.data?.id

  if (!runId) throw new Error('No run ID returned from Apify')

  // Wait for completion (max 5 min)
  let status = 'RUNNING'
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000))
    const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_TOKEN}`)
    const statusData = await statusRes.json()
    status = statusData.data?.status
    if (status === 'SUCCEEDED' || status === 'FAILED' || status === 'ABORTED') break
  }

  if (status !== 'SUCCEEDED') throw new Error(`Apify run ${status}`)

  // Get results
  const datasetId = runData.data?.defaultDatasetId
  const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}&format=json`)
  const items = await itemsRes.json()

  if (!items || items.length === 0) {
    return { reviews: [], placeInfo: {} }
  }

  const place = items[0]
  return {
    reviews: place.reviews || [],
    placeInfo: {
      placeId: place.placeId,
      totalScore: place.totalScore,
      reviewsCount: place.reviewsCount,
    },
  }
}

// eslint-disable-next-line sonarjs/cognitive-complexity -- Reviews sync with Google Places, deduplication, stats
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Auth: accept sync secret (for N8N) or admin session (for admin panel)
    const syncSecret = request.headers.get('x-sync-secret')
    if (syncSecret && SYNC_SECRET && syncSecret === SYNC_SECRET) {
      // Authenticated via sync secret (N8N automated sync)
    } else {
      try {
        const authHeader = request.headers.get('authorization')
        const cookie = request.headers.get('cookie')
        const headers = new Headers()
        if (authHeader) headers.set('Authorization', authHeader)
        if (cookie) headers.set('Cookie', cookie)
        const { user } = await payload.auth({ headers })
        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
      } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    if (!APIFY_API_TOKEN) {
      return NextResponse.json({ error: 'APIFY_API_TOKEN not configured' }, { status: 500 })
    }
    const { reviews, placeInfo } = await fetchGoogleReviews()

    if (reviews.length === 0) {
      return NextResponse.json({ synced: 0, message: 'No reviews found', placeInfo })
    }

    // Get existing review IDs for dedup
    const existing = await payload.find({
      collection: 'reviews',
      where: { googleReviewId: { exists: true } },
      limit: 500,
      depth: 0,
    })
    const existingIds = new Set(existing.docs.map((d: Record<string, unknown>) => d.googleReviewId))

    let synced = 0
    let skipped = 0

    for (const review of reviews) {
      const reviewId = review.reviewId || `${review.name}-${review.publishedAtDate}`

      if (existingIds.has(reviewId)) {
        skipped++
        continue
      }

      if (!review.text && !review.textTranslated) {
        skipped++
        continue
      }

      try {
        await payload.create({
          collection: 'reviews',
          data: {
            googleReviewId: reviewId,
            author: review.name || 'Anonimo',
            rating: review.stars || 5,
            text: review.text || review.textTranslated || '',
            source: 'google',
            featured: (review.stars || 5) >= 4 && (review.text || '').length > 20,
            verified: true,
          },
        })
        synced++
      } catch (err) {
        console.error(`Failed to sync review ${reviewId}:`, err)
      }
    }

    return NextResponse.json({
      synced,
      skipped,
      total: reviews.length,
      placeInfo,
    })
  } catch (error) {
    console.error('Reviews sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
