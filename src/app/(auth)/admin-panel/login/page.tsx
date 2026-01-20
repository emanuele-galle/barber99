'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Mail, Lock, Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.errors?.[0]?.message || 'Credenziali non valide')
      }

      router.push('/admin-panel')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(244,102,47,0.08),transparent_70%)]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(244,102,47,0.05),transparent_70%)]" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Image
              src="/images/logo/barber99-logo.png"
              alt="Barber 99 Logo"
              width={80}
              height={96}
              className="h-20 w-auto mx-auto"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-white font-cinzel">Barber 99</h1>
          <p className="text-[rgba(255,255,255,0.5)] text-sm mt-1">Pannello Amministrazione</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111111] border border-[rgba(244,102,47,0.15)] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Accedi</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(255,255,255,0.4)]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="admin-input pl-11"
                  placeholder="admin@barber99.it"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(255,255,255,0.4)]" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="admin-input pl-11"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full admin-btn admin-btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Accesso in corso...
                </>
              ) : (
                'Accedi'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[rgba(255,255,255,0.4)] text-xs mt-6">
          Dashboard riservata al personale autorizzato
        </p>
      </div>
    </div>
  )
}
