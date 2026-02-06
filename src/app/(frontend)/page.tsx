export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MobileNav from '@/components/MobileNav'
import GoogleReviewsBadge from '@/components/GoogleReviewsBadge'
import HomeWrapper from '@/components/HomeWrapper'
import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'
import ServicesSection from '@/components/sections/ServicesSection'
// import GallerySection from '@/components/sections/GallerySection' // Temporaneamente disabilitato
import InstagramGallerySection from '@/components/sections/InstagramGallerySection'
import ReviewsSection from '@/components/sections/ReviewsSection'
// WhyChooseUsSection rimossa
import ContactSection from '@/components/sections/ContactSection'

// Types for database entities
interface ServiceDoc {
  id: string | number
  name: string
  shortDescription?: string
  price: number
  duration: number
  icon?: string
  featured?: boolean
}

interface GalleryDoc {
  id: string | number
  title: string
  image?: { url?: string } | null
  category: string
  featured?: boolean
}

interface ReviewDoc {
  id: string | number
  author: string
  rating: number
  text: string
  createdAt: string
  source?: string
}

async function getData() {
  const payload = await getPayload({ config })

  const [servicesData, reviewsData, allReviewsData] = await Promise.all([
    payload.find({
      collection: 'services',
      where: { active: { equals: true } },
      sort: 'order',
      limit: 20,
    }),
    payload.find({
      collection: 'reviews',
      where: { featured: { equals: true } },
      sort: '-createdAt',
      limit: 10,
    }),
    payload.find({
      collection: 'reviews',
      limit: 0, // only get totalDocs count
    }),
  ])

  return {
    services: servicesData.docs as unknown as ServiceDoc[],
    reviews: reviewsData.docs as unknown as ReviewDoc[],
    totalReviewCount: allReviewsData.totalDocs,
  }
}

export default async function Home() {
  const { services, reviews, totalReviewCount } = await getData()

  // Calculate average rating from featured reviews
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 5.0

  return (
    <HomeWrapper>
      <Header />
      <main className="mobile-safe-bottom">
        <HeroSection />
        <AboutSection />
        <ServicesSection services={services} />
        <InstagramGallerySection instagramHandle="barber___99" />
        <ReviewsSection reviews={reviews} />
        <ContactSection />
      </main>
      <Footer />
      <MobileNav />
      {totalReviewCount > 0 && (
        <GoogleReviewsBadge
          averageRating={averageRating}
          reviewCount={totalReviewCount}
        />
      )}
    </HomeWrapper>
  )
}
