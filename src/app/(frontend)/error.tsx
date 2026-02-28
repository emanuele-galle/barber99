'use client'

import Link from 'next/link'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c]">
      <div className="text-center p-8 max-w-md">
        <h2
          className="text-2xl md:text-3xl font-bold mb-4 text-white"
          style={{ fontFamily: 'var(--font-cinzel), serif' }}
        >
          Qualcosa è andato storto
        </h2>
        <p className="text-white/60 mb-6">
          Si è verificato un errore imprevisto. Riprova o torna alla pagina iniziale.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#d4a855] text-[#0c0c0c] rounded-lg font-semibold hover:bg-[#e8c882] transition-colors"
          >
            Riprova
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-[#d4a855]/50 text-[#d4a855] rounded-lg hover:bg-[#d4a855]/10 transition-colors"
          >
            Torna alla Home
          </Link>
        </div>
      </div>
    </div>
  )
}
