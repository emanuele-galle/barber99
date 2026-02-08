'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, Search, ChevronDown, Mail } from 'lucide-react'
import { useToast } from '@/components/Toast'

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
}

export function ReviewRequestForm() {
  const { showToast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [customMessage, setCustomMessage] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchClients() {
      setLoading(true)
      try {
        const res = await fetch('/api/clients?limit=200', { credentials: 'include' })
        if (!res.ok) throw new Error('Errore caricamento clienti')
        const data = await res.json()
        const withEmail = (data.docs || []).filter((c: Client) => c.email)
        setClients(withEmail)
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (client: Client) => {
    setSelectedClient(client)
    setSearch('')
    setDropdownOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return

    setSending(true)
    try {
      const res = await fetch('/api/reviews/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientId: selectedClient.id,
          clientName: selectedClient.name,
          clientEmail: selectedClient.email,
          customMessage: customMessage || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Errore sconosciuto' }))
        throw new Error(data.error || 'Errore nell\'invio')
      }

      showToast('success', `Richiesta inviata a ${selectedClient.name}`, 'Email inviata')
      setSelectedClient(null)
      setCustomMessage('')
    } catch (error) {
      showToast(
        'error',
        error instanceof Error ? error.message : 'Errore nell\'invio della richiesta',
        'Errore'
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="admin-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[rgba(212,168,85,0.1)] flex items-center justify-center">
          <Mail className="w-5 h-5 text-[#d4a855]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Richiedi Recensione</h2>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">
            Invia un&apos;email personalizzata a un cliente per chiedergli di lasciare una recensione su Google.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client selector */}
        <div ref={dropdownRef} className="relative">
          <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-1.5">
            Cliente
          </label>

          {selectedClient ? (
            <div className="flex items-center justify-between bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2.5">
              <div>
                <span className="text-white font-medium">{selectedClient.name}</span>
                <span className="text-[rgba(255,255,255,0.4)] text-sm ml-2">{selectedClient.email}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="text-[rgba(255,255,255,0.4)] hover:text-white text-sm transition-colors"
              >
                Cambia
              </button>
            </div>
          ) : (
            <>
              <div
                className="flex items-center bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2.5 cursor-text"
                onClick={() => setDropdownOpen(true)}
              >
                <Search className="w-4 h-4 text-[rgba(255,255,255,0.3)] mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setDropdownOpen(true)
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Cerca cliente per nome..."
                  className="bg-transparent text-white placeholder-[rgba(255,255,255,0.3)] outline-none flex-1 text-sm"
                />
                <ChevronDown className="w-4 h-4 text-[rgba(255,255,255,0.3)] flex-shrink-0" />
              </div>

              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-[rgba(255,255,255,0.4)]" />
                      <span className="ml-2 text-sm text-[rgba(255,255,255,0.4)]">Caricamento...</span>
                    </div>
                  ) : filteredClients.length === 0 ? (
                    <div className="py-3 px-4 text-sm text-[rgba(255,255,255,0.4)]">
                      Nessun cliente con email trovato
                    </div>
                  ) : (
                    filteredClients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleSelect(client)}
                        className="w-full text-left px-4 py-2.5 hover:bg-[rgba(212,168,85,0.1)] transition-colors border-b border-[rgba(255,255,255,0.05)] last:border-b-0"
                      >
                        <div className="text-sm font-medium text-white">{client.name}</div>
                        <div className="text-xs text-[rgba(255,255,255,0.4)]">{client.email}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Custom message */}
        <div>
          <label className="block text-sm font-medium text-[rgba(255,255,255,0.7)] mb-1.5">
            Messaggio (opzionale)
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Messaggio personalizzato (opzionale)"
            rows={3}
            className="w-full bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2.5 text-white placeholder-[rgba(255,255,255,0.3)] text-sm outline-none focus:border-[#d4a855] transition-colors resize-none"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!selectedClient || sending}
          className="admin-btn admin-btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Invio in corso...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Invia Richiesta Recensione
            </>
          )}
        </button>
      </form>
    </div>
  )
}
