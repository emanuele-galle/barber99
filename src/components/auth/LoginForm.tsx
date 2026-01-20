'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useClientAuth } from './ClientAuthProvider'

export function LoginForm() {
  const router = useRouter()
  const { login } = useClientAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(email, password)

    if (result.success) {
      router.push('/account')
    } else {
      setError(result.error || 'Errore durante il login')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(255,255,255,0.4)]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 pl-10 text-white placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#d4a855] transition-colors"
            placeholder="La tua email"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(255,255,255,0.4)]" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 pl-10 pr-10 text-white placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#d4a855] transition-colors"
            placeholder="La tua password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.4)] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
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
            Accesso in corso...
          </>
        ) : (
          'Accedi'
        )}
      </button>

      <p className="text-center text-sm text-[rgba(255,255,255,0.5)]">
        Non hai ancora un account?{' '}
        <Link href="/account/registrati" className="text-[#d4a855] hover:underline">
          Registrati dopo una prenotazione
        </Link>
      </p>
    </form>
  )
}
