export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MobileNav from '@/components/MobileNav'
import HomeWrapper from '@/components/HomeWrapper'
import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'
import ServicesSection from '@/components/sections/ServicesSection'
// import GallerySection from '@/components/sections/GallerySection' // Temporaneamente disabilitato
import InstagramGallerySection from '@/components/sections/InstagramGallerySection'
import ReviewsSection from '@/components/sections/ReviewsSection'
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

  const [servicesData, reviewsData] = await Promise.all([
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
  ])

  return {
    services: servicesData.docs as unknown as ServiceDoc[],
    reviews: reviewsData.docs as unknown as ReviewDoc[],
  }
}

export default async function Home() {
  const { services, reviews } = await getData()

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
    </HomeWrapper>
  )
}
