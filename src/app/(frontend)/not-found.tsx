import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c] pt-24 pb-12">
        <div className="text-center px-4 max-w-lg">
          <p className="text-[#d4a855] font-cormorant text-lg mb-3">Barber 99</p>
          <h1 className="text-6xl md:text-8xl font-cinzel font-bold text-white mb-4">404</h1>
          <h2 className="text-xl md:text-2xl font-cinzel text-white mb-4">
            Pagina non trovata
          </h2>
          <p className="text-white/60 mb-8">
            La pagina che stai cercando non esiste o è stata spostata.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-[#d4a855] text-black rounded-lg hover:bg-[#c49a4a] transition-colors font-medium"
            >
              Torna alla Home
            </Link>
            <Link
              href="/prenota"
              className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              Prenota Appuntamento
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
