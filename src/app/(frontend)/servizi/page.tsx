export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MobileNav from '@/components/MobileNav'
import { Scissors, Clock, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Servizi Barbiere - Taglio, Barba, Meches',
  description:
    'Scopri tutti i servizi di Barber 99 a Serra San Bruno: taglio capelli uomo, barba, meches e pacchetti combinati. Prezzi trasparenti e prenotazione online.',
  keywords: [
    'servizi barbiere serra san bruno',
    'taglio capelli uomo prezzo',
    'barba prezzo',
    'meches uomo prezzo',
    'barbiere economico calabria',
  ],
  alternates: {
    canonical: '/servizi',
  },
  openGraph: {
    title: 'Servizi e Prezzi | Barber 99 - Serra San Bruno',
    description:
      'Taglio, barba, meches e pacchetti combinati. Prenota online il tuo appuntamento da Barber 99.',
  },
}

interface ServiceDoc {
  id: string | number
  slug: string
  name: string
  shortDescription?: string
  price: number
  duration: number
  icon?: string
  category: string
  featured?: boolean
}

const categoryLabels: Record<string, string> = {
  haircut: 'Taglio',
  beard: 'Barba',
  styling: 'Styling & Colore',
  package: 'Pacchetti',
}

const categoryOrder = ['haircut', 'beard', 'styling', 'package']

async function getServices() {
  const payload = await getPayload({ config })
  const data = await payload.find({
    collection: 'services',
    where: { active: { equals: true } },
    sort: 'order',
    limit: 50,
  })
  return data.docs as unknown as ServiceDoc[]
}

export default async function ServiziPage() {
  const services = await getServices()

  // Group by category
  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      label: categoryLabels[cat] || cat,
      services: services.filter((s) => s.category === cat),
    }))
    .filter((g) => g.services.length > 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Servizi Barber 99',
    description: 'Tutti i servizi offerti da Barber 99 a Serra San Bruno',
    itemListElement: services.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: s.name,
        url: `https://barber99.fodivps2.cloud/servizi/${s.slug}`,
        provider: {
          '@type': 'BarberShop',
          name: 'Barber 99 di Cosimo Pisani',
        },
        offers: {
          '@type': 'Offer',
          price: s.price,
          priceCurrency: 'EUR',
        },
      },
    })),
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0c0c0c] pt-24 pb-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="max-w-5xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="text-sm text-white/40 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#d4a855] transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">Servizi</span>
          </nav>

          {/* Page Header */}
          <div className="text-center mb-16">
            <p
              className="text-[#d4a855] text-sm tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              I Nostri Servizi
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              Servizi e Prezzi
            </h1>
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#d4a855] to-[#e8c882] mx-auto mb-6" />
            <p className="text-white/60 max-w-2xl mx-auto">
              Ogni servizio è eseguito con cura e attenzione ai dettagli da Cosimo Pisani,
              barbiere professionista a Serra San Bruno dal 2015.
            </p>
          </div>

          {/* Services by Category */}
          <div className="space-y-12">
            {grouped.map((group) => (
              <section key={group.category}>
                <h2
                  className="text-2xl font-bold text-white mb-6 border-l-4 border-[#d4a855] pl-4"
                  style={{ fontFamily: 'var(--font-cinzel), serif' }}
                >
                  {group.label}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {group.services.map((service) => (
                    <Link
                      key={service.id}
                      href={`/servizi/${service.slug}`}
                      className="group bg-[#151515] border border-white/5 hover:border-[#d4a855]/30 rounded-xl p-6 transition-all duration-300 hover:bg-[#1a1a1a]"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#d4a855]/10 flex items-center justify-center">
                            <Scissors className="w-5 h-5 text-[#d4a855]" />
                          </div>
                          <div>
                            <h3
                              className="text-lg font-semibold text-white group-hover:text-[#e8c882] transition-colors"
                              style={{ fontFamily: 'var(--font-cinzel), serif' }}
                            >
                              {service.name}
                            </h3>
                            <div className="flex items-center gap-1 text-white/40 text-sm">
                              <Clock className="w-3 h-3" />
                              <span>{service.duration} min</span>
                            </div>
                          </div>
                        </div>
                        <span
                          className="text-2xl font-bold text-[#d4a855]"
                          style={{ fontFamily: 'var(--font-cinzel), serif' }}
                        >
                          &euro;{service.price}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[#d4a855] text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Dettagli e prenota</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16 p-8 bg-[#151515] rounded-xl border border-[#d4a855]/20">
            <h2
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              Prenota il Tuo Appuntamento
            </h2>
            <p className="text-white/60 mb-6">
              Scegli il servizio e prenota online in pochi secondi
            </p>
            <Link
              href="/prenota"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#d4a855] to-[#e8c882] text-[#0c0c0c] rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Prenota Ora
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  )
}
