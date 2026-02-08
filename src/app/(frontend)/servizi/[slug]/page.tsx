export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MobileNav from '@/components/MobileNav'
import { Scissors, Clock, ArrowRight, ArrowLeft, MapPin, Phone, Calendar } from 'lucide-react'

import { asPayloadDocs } from '@/lib/payload-docs'
import type { ServiceDoc } from '@/lib/payload-docs'

// SEO descriptions per service slug
const seoContent: Record<
  string,
  { description: string; longDescription: string; benefits: string[] }
> = {
  taglio: {
    description:
      'Taglio capelli uomo professionale a Serra San Bruno. Include shampoo. €10 - Prenota online da Barber 99.',
    longDescription:
      'Il taglio capelli da Barber 99 è un\'esperienza completa che include consulenza personalizzata e shampoo. Cosimo Pisani analizza la forma del viso e la texture dei capelli per consigliarti il taglio più adatto al tuo stile. Che tu preferisca un taglio classico, moderno o di tendenza, ogni dettaglio viene curato con precisione.',
    benefits: [
      'Consulenza personalizzata sul taglio',
      'Shampoo incluso nel servizio',
      'Tecniche di taglio moderne e classiche',
      'Consigli per la cura quotidiana',
    ],
  },
  meches: {
    description:
      'Meches uomo professionali a Serra San Bruno. Schiariture naturali e personalizzate. €30 - Prenota online da Barber 99.',
    longDescription:
      'Le meches da Barber 99 sono realizzate con tecnica a mano libera per un effetto naturale e luminoso. Cosimo seleziona le tonalità più adatte al tuo colore naturale per creare un look personalizzato che valorizza i tuoi lineamenti. Il risultato è un effetto sfumato e armonioso.',
    benefits: [
      'Tecnica a mano libera per effetto naturale',
      'Tonalità personalizzate',
      'Prodotti di qualità per la protezione del capello',
      'Risultato duraturo e naturale',
    ],
  },
  barba: {
    description:
      'Rifinitura barba professionale a Serra San Bruno. Styling e cura della barba. €5 - Prenota online da Barber 99.',
    longDescription:
      'Il servizio barba da Barber 99 include rifinitura precisa con rasoio e macchinetta, definizione dei contorni e styling. Cosimo utilizza prodotti specifici per ammorbidire e idratare la barba, garantendo un risultato pulito e curato che dura nel tempo.',
    benefits: [
      'Rifinitura precisa con rasoio',
      'Definizione contorni e linee',
      'Prodotti idratanti e ammorbidenti',
      'Consigli per la manutenzione quotidiana',
    ],
  },
  'taglio-barba': {
    description:
      'Pacchetto Taglio + Barba a Serra San Bruno. Servizio completo uomo. €15 - Prenota online da Barber 99.',
    longDescription:
      'Il pacchetto Taglio + Barba è la scelta ideale per chi vuole un look completo e curato. Combina il taglio capelli professionale con la rifinitura della barba in un unico appuntamento. Un servizio completo che ti permette di risparmiare tempo e denaro.',
    benefits: [
      'Risparmio rispetto ai servizi singoli',
      'Look completo in un\'unica sessione',
      'Armonia tra taglio e barba',
      'Include shampoo',
    ],
  },
  'taglio-meches': {
    description:
      'Pacchetto Taglio + Meches a Serra San Bruno. Taglio e colorazione uomo. €40 - Prenota online da Barber 99.',
    longDescription:
      'Il pacchetto Taglio + Meches combina il taglio personalizzato con le schiariture per un risultato coordinato e armonioso. Cosimo studia il look ideale considerando entrambi i trattamenti insieme, per un effetto naturale e moderno.',
    benefits: [
      'Risultato coordinato taglio e colore',
      'Risparmio rispetto ai servizi singoli',
      'Look personalizzato e moderno',
      'Consulenza integrata su taglio e colore',
    ],
  },
  'taglio-barba-meches': {
    description:
      'Pacchetto completo Taglio + Barba + Meches a Serra San Bruno. Il trattamento più completo. €45 - Prenota online da Barber 99.',
    longDescription:
      'Il pacchetto completo è il nostro servizio premium che include taglio capelli, rifinitura barba e meches. L\'esperienza definitiva per chi vuole un look completamente rinnovato e curato in ogni dettaglio. Il miglior rapporto qualità-prezzo per un restyling totale.',
    benefits: [
      'Massimo risparmio: tutti i servizi inclusi',
      'Restyling completo in un\'unica sessione',
      'Look coordinato testa e barba',
      'Include shampoo e trattamenti',
    ],
  },
}

async function getService(slug: string) {
  const payload = await getPayload({ config })
  const data = await payload.find({
    collection: 'services',
    where: {
      and: [{ slug: { equals: slug } }, { active: { equals: true } }],
    },
    limit: 1,
  })
  return asPayloadDocs<ServiceDoc>(data.docs)[0]
}

async function getAllServices() {
  const payload = await getPayload({ config })
  const data = await payload.find({
    collection: 'services',
    where: { active: { equals: true } },
    sort: 'order',
    limit: 50,
  })
  return asPayloadDocs<ServiceDoc>(data.docs)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) return {}

  const seo = seoContent[slug]
  const description =
    seo?.description ||
    `${service.name} a Serra San Bruno. €${service.price} - Prenota online da Barber 99.`

  return {
    title: `${service.name} - €${service.price}`,
    description,
    keywords: [
      `${service.name.toLowerCase()} serra san bruno`,
      `${service.name.toLowerCase()} prezzo`,
      `barbiere ${service.name.toLowerCase()}`,
      'barber 99 servizi',
      'barbiere calabria',
    ],
    alternates: {
      canonical: `/servizi/${slug}`,
    },
    openGraph: {
      title: `${service.name} - €${service.price} | Barber 99`,
      description,
    },
  }
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [service, allServices] = await Promise.all([getService(slug), getAllServices()])

  if (!service) notFound()

  const seo = seoContent[slug] || {
    description: '',
    longDescription: `Servizio ${service.name} presso Barber 99 di Cosimo Pisani a Serra San Bruno.`,
    benefits: [],
  }

  // Other services for cross-linking
  const otherServices = allServices.filter((s) => s.slug !== slug).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: seo.longDescription,
    provider: {
      '@type': 'BarberShop',
      name: 'Barber 99 di Cosimo Pisani',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Via San Biagio 3',
        addressLocality: 'Serra San Bruno',
        addressRegion: 'VV',
        postalCode: '89822',
        addressCountry: 'IT',
      },
      telephone: '+39 327 126 3091',
    },
    offers: {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `https://barber99.it/servizi/${slug}`,
    },
    areaServed: {
      '@type': 'City',
      name: 'Serra San Bruno',
    },
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0c0c0c] pt-24 pb-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="text-sm text-white/40 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#d4a855] transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/servizi" className="hover:text-[#d4a855] transition-colors">
              Servizi
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">{service.name}</span>
          </nav>

          {/* Back link */}
          <Link
            href="/servizi"
            className="inline-flex items-center gap-2 text-white/50 hover:text-[#d4a855] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Tutti i servizi
          </Link>

          {/* Service Header */}
          <div className="bg-[#151515] rounded-2xl border border-white/5 p-8 md:p-12 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                {service.featured && (
                  <span className="inline-block bg-gradient-to-r from-[#d4a855] to-[#e8c882] text-[#0c0c0c] text-xs font-bold px-4 py-1.5 rounded-full uppercase mb-4">
                    Più Popolare
                  </span>
                )}
                <h1
                  className="text-3xl md:text-4xl font-bold text-white mb-4"
                  style={{ fontFamily: 'var(--font-cinzel), serif' }}
                >
                  {service.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-white/60">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#d4a855]" />
                    <span>{service.duration} minuti</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-[#d4a855]" />
                    <span>Cosimo Pisani</span>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p
                  className="text-4xl md:text-5xl font-bold text-[#d4a855] mb-2"
                  style={{ fontFamily: 'var(--font-cinzel), serif' }}
                >
                  &euro;{service.price}
                </p>
                <Link
                  href={`/prenota?service=${encodeURIComponent(service.name)}`}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#d4a855] to-[#e8c882] text-[#0c0c0c] rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  <Calendar className="w-5 h-5" />
                  Prenota Ora
                </Link>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <h2
                className="text-xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-cinzel), serif' }}
              >
                Descrizione del Servizio
              </h2>
              <p className="text-white/70 leading-relaxed">{seo.longDescription}</p>

              {seo.benefits.length > 0 && (
                <div className="mt-8">
                  <h3
                    className="text-lg font-bold text-white mb-4"
                    style={{ fontFamily: 'var(--font-cinzel), serif' }}
                  >
                    Cosa Include
                  </h3>
                  <ul className="space-y-3">
                    {seo.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3 text-white/70">
                        <div className="w-5 h-5 rounded-full bg-[#d4a855]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-[#d4a855]" />
                        </div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar - Info Card */}
            <div className="space-y-4">
              <div className="bg-[#151515] rounded-xl border border-white/5 p-6">
                <h3
                  className="text-lg font-bold text-white mb-4"
                  style={{ fontFamily: 'var(--font-cinzel), serif' }}
                >
                  Informazioni
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 text-white/60">
                    <MapPin className="w-4 h-4 text-[#d4a855]" />
                    <span>Via San Biagio 3, Serra San Bruno (VV)</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/60">
                    <Phone className="w-4 h-4 text-[#d4a855]" />
                    <a href="tel:+393271263091" className="hover:text-[#d4a855] transition-colors">
                      327 126 3091
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-white/60">
                    <Clock className="w-4 h-4 text-[#d4a855]" />
                    <div>
                      <p>Lun: 10:00 - 19:00</p>
                      <p>Mar-Sab: 09:00 - 19:00</p>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href={`/prenota?service=${encodeURIComponent(service.name)}`}
                className="block w-full py-3 bg-gradient-to-r from-[#d4a855] to-[#e8c882] text-[#0c0c0c] rounded-lg font-semibold text-center hover:opacity-90 transition-opacity"
              >
                Prenota Questo Servizio
              </Link>
            </div>
          </div>

          {/* Other Services */}
          {otherServices.length > 0 && (
            <div className="border-t border-white/10 pt-12">
              <h2
                className="text-2xl font-bold text-white mb-6"
                style={{ fontFamily: 'var(--font-cinzel), serif' }}
              >
                Altri Servizi
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {otherServices.map((s) => (
                  <Link
                    key={s.id}
                    href={`/servizi/${s.slug}`}
                    className="group bg-[#151515] border border-white/5 hover:border-[#d4a855]/30 rounded-xl p-5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className="font-semibold text-white group-hover:text-[#e8c882] transition-colors"
                        style={{ fontFamily: 'var(--font-cinzel), serif' }}
                      >
                        {s.name}
                      </h3>
                      <span className="text-[#d4a855] font-bold">&euro;{s.price}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/40 text-sm">
                      <Clock className="w-3 h-3" />
                      <span>{s.duration} min</span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-6">
                <Link
                  href="/servizi"
                  className="text-[#d4a855] hover:text-[#e8c882] transition-colors inline-flex items-center gap-2"
                >
                  Vedi tutti i servizi
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  )
}
