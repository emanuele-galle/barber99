import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN
const SYNC_SECRET = process.env.INSTAGRAM_SYNC_SECRET
const INSTAGRAM_USERNAME = 'barber___99'

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'http://vps-panel-minio:9000',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true,
})

const BUCKET_NAME = process.env.S3_BUCKET || 'barber99-media'

async function uploadToMinIO(key: string, buffer: Buffer, contentType: string): Promise<string> {
  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }))
  return `${process.env.S3_ENDPOINT || 'http://vps-panel-minio:9000'}/${BUCKET_NAME}/${key}`
}

async function processImage(imageBuffer: Buffer): Promise<{ webp: Buffer; width: number; height: number }> {
  const metadata = await sharp(imageBuffer).metadata()
  const webp = await sharp(imageBuffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()
  return { webp, width: metadata.width || 0, height: metadata.height || 0 }
}

interface ApifyPost {
  id: string
  shortCode: string
  caption: string
  timestamp: string
  displayUrl: string
  url: string
  type: string // 'Image' | 'Video' | 'Sidecar'
  likesCount: number
  commentsCount: number
  images?: string[]
}

async function fetchInstagramPosts(): Promise<ApifyPost[]> {
  const actorId = 'apify~instagram-api-scraper'
  const runUrl = `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_API_TOKEN}`

  const runResponse = await fetch(runUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      directUrls: [`https://www.instagram.com/${INSTAGRAM_USERNAME}/`],
      resultsType: 'posts',
      resultsLimit: 20,
      addParentData: false,
    }),
  })

  if (!runResponse.ok) {
    const error = await runResponse.text()
    throw new Error(`Apify run failed: ${runResponse.status} - ${error}`)
  }

  const runData = await runResponse.json()
  const runId = runData.data?.id

  if (!runId) {
    throw new Error('No run ID returned from Apify')
  }

  // Poll every 5s, max 5 min
  const maxWait = 5 * 60 * 1000
  const pollInterval = 5000
  const startTime = Date.now()

  while (Date.now() - startTime < maxWait) {
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_TOKEN}`
    )
    const statusData = await statusRes.json()
    const status = statusData.data?.status

    if (status === 'SUCCEEDED') break
    if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
      throw new Error(`Apify run ${status}`)
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }

  const datasetId = runData.data?.defaultDatasetId
  if (!datasetId) throw new Error('No dataset ID found')

  const itemsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}&format=json`
  )
  const items = await itemsRes.json()

  return items as ApifyPost[]
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const secret = request.headers.get('x-sync-secret')
    if (!SYNC_SECRET || secret !== SYNC_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!APIFY_API_TOKEN) {
      return NextResponse.json({ error: 'APIFY_API_TOKEN not configured' }, { status: 500 })
    }

    const payload = await getPayload({ config })

    // Fetch posts from Instagram via Apify
    const posts = await fetchInstagramPosts()

    // Get existing Instagram IDs to deduplicate
    const existing = await payload.find({
      collection: 'instagram-posts',
      limit: 200,
      depth: 0,
    })
    const existingIds = new Set(existing.docs.map(d => d.instagramId))

    let synced = 0
    let skipped = 0
    let errors = 0

    const validInstagramIds: string[] = []

    for (const post of posts) {
      const instagramId = post.id || post.shortCode
      const permalink = post.url || `https://www.instagram.com/p/${post.shortCode}/`

      validInstagramIds.push(instagramId)

      // Skip if already synced
      if (existingIds.has(instagramId)) {
        skipped++
        continue
      }

      // Skip videos (keep images and carousels first image)
      if (post.type === 'Video') {
        skipped++
        continue
      }

      try {
        // Get the image URL
        const imageUrl = post.type === 'Sidecar' && post.images?.length
          ? post.images[0]
          : post.displayUrl

        if (!imageUrl) {
          skipped++
          continue
        }

        // Download image
        const imageRes = await fetch(imageUrl)
        if (!imageRes.ok) {
          console.error(`Failed to download image for ${post.shortCode}: ${imageRes.status}`)
          errors++
          continue
        }

        const imageBuffer = Buffer.from(await imageRes.arrayBuffer())

        // Process to WebP
        const processed = await processImage(imageBuffer)

        // Upload to MinIO
        const key = `instagram/ig-${post.shortCode}-${Date.now()}.webp`
        const mediaUrl = await uploadToMinIO(key, processed.webp, 'image/webp')

        // Determine media type
        let mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' = 'IMAGE'
        if (post.type === 'Sidecar') mediaType = 'CAROUSEL_ALBUM'
        if (post.type === 'Video') mediaType = 'VIDEO'

        // Create in Payload CMS
        await payload.create({
          collection: 'instagram-posts',
          data: {
            instagramId,
            mediaUrl,
            thumbnailUrl: mediaUrl,
            permalink,
            caption: post.caption || '',
            mediaType,
            timestamp: post.timestamp || new Date().toISOString(),
            isVisible: true,
          },
        })

        synced++
      } catch (err) {
        console.error(`Error syncing post ${post.shortCode}:`, err)
        errors++
      }
    }

    // Cleanup: remove posts no longer on Instagram
    let deleted = 0
    if (validInstagramIds.length > 0) {
      const toDelete = await payload.find({
        collection: 'instagram-posts',
        where: {
          instagramId: { not_in: validInstagramIds },
        },
        limit: 100,
      })

      for (const doc of toDelete.docs) {
        await payload.delete({ collection: 'instagram-posts', id: doc.id })
        deleted++
      }
    }

    return NextResponse.json({ synced, skipped, errors, deleted, total: posts.length })
  } catch (error) {
    console.error('Instagram sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
