'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Qualcosa è andato storto</h2>
        <p className="text-gray-600 mb-6">
          Si è verificato un errore imprevisto. Riprova o torna alla pagina iniziale.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Riprova
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-black rounded-lg hover:bg-gray-50 transition-colors"
          >
            Torna alla Home
          </a>
        </div>
      </div>
    </div>
  )
}
