'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'

function ResetForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="text-center py-4">
        <p className="text-red-400 mb-4">Link non valido. Richiedi un nuovo link di reset.</p>
        <Link href="/account/recupera" className="text-[#d4a855] hover:underline">
          Recupera password
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Le password non coincidono')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/account/login'), 3000)
      } else {
        setError(data.error || 'Errore durante il reset')
      }
    } catch {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-white font-medium mb-2">Password aggiornata!</h3>
        <p className="text-[rgba(255,255,255,0.6)] text-sm">
          Verrai reindirizzato al login...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
          Nuova Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(255,255,255,0.4)]" />
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 pl-10 pr-10 text-white text-[16px] placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#d4a855] transition-colors"
            placeholder="Minimo 8 caratteri"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.4)] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-[rgba(255,255,255,0.4)] text-xs mt-1">Almeno 8 caratteri, una lettera e un numero</p>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">
          Conferma Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(255,255,255,0.4)]" />
          <input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 pl-10 text-white text-[16px] placeholder:text-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#d4a855] transition-colors"
            placeholder="Ripeti la password"
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
            Aggiornamento...
          </>
        ) : (
          'Imposta nuova password'
        )}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
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
          <h1 className="text-3xl font-bold text-white mb-2">Nuova Password</h1>
          <p className="text-[rgba(255,255,255,0.6)]">
            Scegli una nuova password per il tuo account
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
          <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-[#d4a855] mx-auto" />}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
