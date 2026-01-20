'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { useClientAuth } from '@/components/auth/ClientAuthProvider'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated } = useClientAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/account')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4a855]" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[rgba(255,255,255,0.6)] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna al sito
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Accedi</h1>
          <p className="text-[rgba(255,255,255,0.6)]">
            Accedi per gestire le tue prenotazioni
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
