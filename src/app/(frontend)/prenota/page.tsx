export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BookingForm from '@/components/BookingForm'

export const metadata: Metadata = {
  title: 'Prenota Appuntamento | Barber 99 Serra San Bruno',
  description:
    'Prenota il tuo appuntamento online da Barber 99. Taglio capelli, barba, meches. Via San Biagio 3, Serra San Bruno (VV).',
  alternates: {
    canonical: '/prenota',
  },
  openGraph: {
    title: 'Prenota Appuntamento | Barber 99 Serra San Bruno',
  },
}

export default function PrenotaPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0c0c0c] pt-24">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-12">
          <div className="text-center mb-6 md:mb-12">
            <p className="text-gold font-cormorant text-lg mb-2 hidden md:block">Barber 99</p>
            <h1 className="text-3xl md:text-5xl font-cinzel font-bold text-white mb-4">
              Prenota<span className="hidden md:inline"> il Tuo Appuntamento</span>
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto hidden md:block">
              Seleziona il servizio e l&apos;orario che preferisci.
              Conferma la tua prenotazione in pochi click.
            </p>
          </div>
          <BookingForm />
        </div>
      </main>
      <Footer />
    </>
  )
}
