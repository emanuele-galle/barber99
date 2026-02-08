import Link from 'next/link'

export default function AdminNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-5xl font-bold text-white mb-2">404</h1>
        <h2 className="text-xl text-gray-400 mb-6">Pagina non trovata</h2>
        <p className="text-gray-500 mb-8">
          La pagina richiesta non esiste nel pannello di amministrazione.
        </p>
        <Link
          href="/admin-panel"
          className="px-6 py-3 bg-[#d4a855] text-black rounded-lg hover:bg-[#c49a4a] transition-colors font-medium"
        >
          Torna alla Dashboard
        </Link>
      </div>
    </div>
  )
}
