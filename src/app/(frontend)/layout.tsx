import type { Metadata, Viewport } from 'next'
import { Cinzel, Cormorant_Garamond, Montserrat } from 'next/font/google'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import { ToastProvider } from '@/components/Toast'
import { ClientAuthProvider } from '@/components/auth/ClientAuthProvider'

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0c0c0c',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Barber 99 di Cosimo Pisani | Barbiere a Serra San Bruno (VV)',
    template: '%s | Barber 99 - Barbiere Serra San Bruno',
  },
  description:
    'Cosimo Pisani, barbiere professionista a Serra San Bruno dal 2015. Taglio capelli uomo, barba, meches e trattamenti personalizzati. Prenota online. Via San Biagio 3, 89822 Serra San Bruno (VV).',
  keywords: [
    'barbiere serra san bruno',
    'cosimo pisani barbiere',
    'barber 99 serra san bruno',
    'taglio capelli uomo serra san bruno',
    'barba serra san bruno',
    'meches uomo calabria',
    'barbiere vibo valentia',
    'barber shop calabria',
    'parrucchiere uomo serra san bruno',
    'barbiere calabria',
    'taglio barba professionale',
    'prenotazione barbiere online',
  ],
  authors: [{ name: 'Cosimo Pisani - Barber 99' }],
  creator: 'Cosimo Pisani',
  publisher: 'Barber 99 di Cosimo Pisani',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: '/',
    siteName: 'Barber 99 - Cosimo Pisani',
    title: 'Barber 99 di Cosimo Pisani | Barbiere a Serra San Bruno',
    description:
      'Cosimo Pisani, il tuo barbiere di fiducia a Serra San Bruno dal 2015. Taglio capelli, barba e meches. Prenota online il tuo appuntamento.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Barber 99 di Cosimo Pisani - Barbiere a Serra San Bruno',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barber 99 di Cosimo Pisani | Barbiere Serra San Bruno',
    description:
      'Cosimo Pisani, barbiere professionista. Taglio, barba e meches. Prenota online.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
}

// Schema.org JSON-LD for Local Business
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BarberShop',
  '@id': 'https://barber99.fodivps2.cloud/#organization',
  name: 'Barber 99 di Cosimo Pisani',
  alternateName: ['Barber 99', 'Barber99 Serra San Bruno'],
  description:
    'Cosimo Pisani, barbiere professionista a Serra San Bruno dal 2015. Taglio capelli uomo, barba, meches e trattamenti personalizzati. Prenota online il tuo appuntamento.',
  url: 'https://barber99.fodivps2.cloud',
  logo: 'https://barber99.fodivps2.cloud/images/logo/barber99-logo.png',
  image: [
    'https://barber99.fodivps2.cloud/images/hero-bg.jpg',
    'https://barber99.fodivps2.cloud/images/og-image.jpg',
  ],
  telephone: '+39 327 126 3091',
  email: 'info@barber99.it',
  founder: {
    '@type': 'Person',
    name: 'Cosimo Pisani',
    jobTitle: 'Barbiere Professionista',
    worksFor: {
      '@id': 'https://barber99.fodivps2.cloud/#organization',
    },
  },
  foundingDate: '2015',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Via San Biagio 3',
    addressLocality: 'Serra San Bruno',
    addressRegion: 'VV',
    postalCode: '89822',
    addressCountry: 'IT',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 38.5740463,
    longitude: 16.3292693,
  },
  hasMap: 'https://www.google.com/maps?q=38.5740463,16.3292693',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Monday',
      opens: '10:00',
      closes: '19:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '19:00',
    },
  ],
  priceRange: '€',
  currenciesAccepted: 'EUR',
  paymentAccepted: 'Contanti, Carta di Credito, Bancomat',
  areaServed: [
    {
      '@type': 'City',
      name: 'Serra San Bruno',
    },
    {
      '@type': 'State',
      name: 'Vibo Valentia',
    },
  ],
  sameAs: [
    'https://www.instagram.com/barber___99/',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    reviewCount: '50',
    bestRating: '5',
    worstRating: '1',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servizi Barbiere',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Taglio',
          description: 'Taglio capelli con 1 shampoo incluso',
        },
        price: '10',
        priceCurrency: 'EUR',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Meches',
          description: 'Meches per un look personalizzato',
        },
        price: '30',
        priceCurrency: 'EUR',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Barba',
          description: 'Rifinitura e styling della barba',
        },
        price: '5',
        priceCurrency: 'EUR',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Taglio + Barba',
          description: 'Pacchetto taglio capelli e barba',
        },
        price: '15',
        priceCurrency: 'EUR',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Taglio + Meches',
          description: 'Taglio capelli con meches',
        },
        price: '40',
        priceCurrency: 'EUR',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Taglio + Barba + Meches',
          description: 'Pacchetto completo',
        },
        price: '45',
        priceCurrency: 'EUR',
      },
    ],
  },
}

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Barber 99" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Barber 99" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0c0c0c" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${cinzel.variable} ${cormorant.variable} ${montserrat.variable} antialiased`}
        style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
      >
        {/* Skip Link for Accessibility */}
        <a href="#main-content" className="skip-link">
          Vai al contenuto principale
        </a>

        <ClientAuthProvider>
          <ToastProvider>
            <main id="main-content">
              {children}
            </main>
          </ToastProvider>
        </ClientAuthProvider>

        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
