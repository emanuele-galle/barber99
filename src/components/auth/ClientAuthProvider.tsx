'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  preferences?: {
    preferredBarber?: { id: string; name: string }
    hairNotes?: string
    preferredServices?: { id: string; name: string }[]
  }
  totalVisits?: number
  lastVisit?: string
  tags?: string[]
}

interface ClientAuthContextType {
  client: Client | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshClient: () => Promise<void>
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined)

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setClient(data.client)
      } else {
        setClient(null)
      }
    } catch {
      setClient(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClient()
  }, [fetchClient])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await res.json()

      if (res.ok) {
        setClient(data.client)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Errore durante il login' }
      }
    } catch {
      return { success: false, error: 'Errore di connessione' }
    }
  }

  const register = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await res.json()

      if (res.ok) {
        setClient(data.client)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Errore durante la registrazione' }
      }
    } catch {
      return { success: false, error: 'Errore di connessione' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setClient(null)
    }
  }

  const refreshClient = async () => {
    await fetchClient()
  }

  return (
    <ClientAuthContext.Provider
      value={{
        client,
        isLoading,
        isAuthenticated: !!client,
        login,
        register,
        logout,
        refreshClient,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  )
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext)
  if (context === undefined) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider')
  }
  return context
}
