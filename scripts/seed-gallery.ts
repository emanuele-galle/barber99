import { getPayload } from 'payload'
import config from '../src/payload.config'
import path from 'path'
import fs from 'fs'

const galleryData = [
  {
    title: 'Taglio Fade Moderno',
    filename: 'gallery-1.webp',
    category: 'haircut' as const,
    featured: true,
    order: 1,
  },
  {
    title: 'Styling Barbiere',
    filename: 'gallery-2.webp',
    category: 'styling' as const,
    featured: true,
    order: 2,
  },
  {
    title: 'Taglio Classico',
    filename: 'gallery-3.webp',
    category: 'haircut' as const,
    featured: false,
    order: 3,
  },
  {
    title: 'Ambiente Negozio',
    filename: 'gallery-4.webp',
    category: 'shop' as const,
    featured: true,
    order: 4,
  },
  {
    title: 'Taglio Capelli Professionale',
    filename: 'taglio-capelli-gallery.webp',
    category: 'haircut' as const,
    featured: true,
    order: 5,
  },
  {
    title: 'Rasatura Barba Tradizionale',
    filename: 'rasatura-barba.webp',
    category: 'beard' as const,
    featured: true,
    order: 6,
  },
  {
    title: 'Cura della Barba',
    filename: 'barba-macchinetta.webp',
    category: 'beard' as const,
    featured: false,
    order: 7,
  },
  {
    title: 'Dettagli e Finiture',
    filename: 'pennello-barbiere.webp',
    category: 'styling' as const,
    featured: false,
    order: 8,
  },
]

const reviewsData = [
  {
    author: 'Marco R.',
    rating: 5,
    text: 'Barbieri professionali e ambiente accogliente. Il miglior taglio che abbia mai fatto. Tornerò sicuramente!',
    source: 'google' as const,
    featured: true,
  },
  {
    author: 'Luca P.',
    rating: 5,
    text: 'Servizio eccellente, personale cortese e competente. Consiglio vivamente per un\'esperienza di qualità.',
    source: 'google' as const,
    featured: true,
  },
  {
    author: 'Andrea M.',
    rating: 5,
    text: 'Finalmente ho trovato il mio barbiere di fiducia. Graziano è un vero artista con le forbici!',
    source: 'facebook' as const,
    featured: true,
  },
  {
    author: 'Giuseppe T.',
    rating: 4,
    text: 'Ottima rasatura tradizionale, come quelle di una volta. Atmosfera rilassante e prodotti di qualità.',
    source: 'google' as const,
    featured: true,
  },
]

async function seed() {
  console.log('🌱 Starting seed...')

  const payload = await getPayload({ config })

  // Seed Gallery
  console.log('\n📸 Seeding gallery...')

  for (const item of galleryData) {
    const imagePath = path.join(process.cwd(), 'public', 'images', item.filename)

    if (!fs.existsSync(imagePath)) {
      console.log(`  ⚠️  Image not found: ${item.filename}`)
      continue
    }

    try {
      // Check if media already exists
      const existingMedia = await payload.find({
        collection: 'media',
        where: {
          filename: { contains: item.filename.replace('.webp', '') },
        },
        limit: 1,
      })

      let mediaId: number

      if (existingMedia.docs.length > 0) {
        mediaId = existingMedia.docs[0].id as number
        console.log(`  ✓ Media already exists: ${item.filename} (ID: ${mediaId})`)
      } else {
        // Upload image to media collection
        const fileBuffer = fs.readFileSync(imagePath)
        const media = await payload.create({
          collection: 'media',
          data: {
            alt: item.title,
          },
          file: {
            data: fileBuffer,
            name: item.filename,
            mimetype: 'image/webp',
            size: fileBuffer.length,
          },
        })
        mediaId = media.id as number
        console.log(`  ✓ Uploaded: ${item.filename} (ID: ${mediaId})`)
      }

      // Check if gallery item already exists
      const existingGallery = await payload.find({
        collection: 'gallery',
        where: {
          title: { equals: item.title },
        },
        limit: 1,
      })

      if (existingGallery.docs.length > 0) {
        console.log(`  ✓ Gallery item already exists: ${item.title}`)
        continue
      }

      // Create gallery entry
      await payload.create({
        collection: 'gallery',
        data: {
          title: item.title,
          image: mediaId,
          category: item.category,
          featured: item.featured,
          order: item.order,
        },
      })
      console.log(`  ✓ Created gallery item: ${item.title}`)
    } catch (error) {
      console.error(`  ✗ Error with ${item.filename}:`, error)
    }
  }

  // Seed Reviews
  console.log('\n⭐ Seeding reviews...')

  for (const review of reviewsData) {
    try {
      // Check if review already exists
      const existingReview = await payload.find({
        collection: 'reviews',
        where: {
          author: { equals: review.author },
          text: { equals: review.text },
        },
        limit: 1,
      })

      if (existingReview.docs.length > 0) {
        console.log(`  ✓ Review already exists: ${review.author}`)
        continue
      }

      await payload.create({
        collection: 'reviews',
        data: review,
      })
      console.log(`  ✓ Created review: ${review.author}`)
    } catch (error) {
      console.error(`  ✗ Error creating review for ${review.author}:`, error)
    }
  }

  console.log('\n✅ Seed completed!')
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
