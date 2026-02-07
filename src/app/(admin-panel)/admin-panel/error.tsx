'use client'

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c]">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Errore</h2>
        <p className="text-gray-400 mb-6">
          Si è verificato un errore. Riprova o torna alla dashboard.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#d4a855] text-black rounded-lg hover:bg-[#c49a4a] transition-colors font-medium"
          >
            Riprova
          </button>
          <a
            href="/admin-panel"
            className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
