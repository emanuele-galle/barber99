import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// GET - Fetch Instagram posts for gallery display
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)

    const limit = parseInt(searchParams.get('limit') || '12')
    const page = parseInt(searchParams.get('page') || '1')

    const posts = await payload.find({
      collection: 'instagram-posts',
      where: {
        isVisible: { equals: true },
      },
      sort: '-timestamp',
      limit,
      page,
    })

    return NextResponse.json({
      success: true,
      docs: posts.docs,
      totalDocs: posts.totalDocs,
      totalPages: posts.totalPages,
      page: posts.page,
      hasNextPage: posts.hasNextPage,
    })
  } catch (error) {
    console.error('Error fetching Instagram posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST - Create/Update Instagram post (used by N8N sync)
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    const {
      instagramId,
      mediaUrl,
      thumbnailUrl,
      permalink,
      caption,
      mediaType,
      timestamp,
    } = body

    // Check if post already exists
    const existing = await payload.find({
      collection: 'instagram-posts',
      where: {
        instagramId: { equals: instagramId },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      // Update existing post
      const updated = await payload.update({
        collection: 'instagram-posts',
        id: existing.docs[0].id,
        data: {
          mediaUrl,
          thumbnailUrl,
          permalink,
          caption,
          mediaType,
          timestamp,
        },
      })

      return NextResponse.json({
        success: true,
        action: 'updated',
        post: updated,
      })
    } else {
      // Create new post
      const created = await payload.create({
        collection: 'instagram-posts',
        data: {
          instagramId,
          mediaUrl,
          thumbnailUrl,
          permalink,
          caption,
          mediaType,
          timestamp,
          isVisible: true,
        },
      })

      return NextResponse.json({
        success: true,
        action: 'created',
        post: created,
      })
    }
  } catch (error) {
    console.error('Error creating/updating Instagram post:', error)
    return NextResponse.json(
      { error: 'Failed to save post' },
      { status: 500 }
    )
  }
}

// DELETE - Remove posts not in Instagram anymore (cleanup)
export async function DELETE(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    const { instagramIds } = body // Array of valid Instagram IDs

    if (!Array.isArray(instagramIds)) {
      return NextResponse.json(
        { error: 'instagramIds must be an array' },
        { status: 400 }
      )
    }

    // Find posts not in the provided list
    const postsToDelete = await payload.find({
      collection: 'instagram-posts',
      where: {
        instagramId: {
          not_in: instagramIds,
        },
      },
      limit: 100,
    })

    // Delete each
    for (const post of postsToDelete.docs) {
      await payload.delete({
        collection: 'instagram-posts',
        id: post.id,
      })
    }

    return NextResponse.json({
      success: true,
      deleted: postsToDelete.docs.length,
    })
  } catch (error) {
    console.error('Error cleaning up Instagram posts:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup posts' },
      { status: 500 }
    )
  }
}
