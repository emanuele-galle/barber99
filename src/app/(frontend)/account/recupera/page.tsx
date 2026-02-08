'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'

export default function RecuperaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSent(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Errore durante l\'invio')
      }
    } catch {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link
          href="/account/login"
          className="inline-flex items-center gap-2 text-[rgba(255,255,255,0.6)] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna al login
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Recupera Password</h1>
          <p className="text-[rgba(255,255,255,0.6)]">
            Inserisci la tua email per ricevere il link di reset
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">Email inviata!</h3>
              <p className="text-[rgba(255,255,255,0.6)] text-sm">
                Se l&apos;email è associata a un account, riceverai un link per reimpostare la password. Controlla anche lo spam.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="recover-email" className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(255,255,255,0.4)]" />
                  <input
                    id="recover-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 pl-10 text-white text-[16px] placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#d4a855] transition-colors"
                    placeholder="La tua email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d4a855] hover:bg-[#c49745] disabled:bg-[#d4a855]/50 text-black font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  'Invia link di reset'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
