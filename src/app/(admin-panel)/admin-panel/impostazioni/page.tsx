export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import { Settings, Building2, Calendar, Bell, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface SiteSettingsData {
  businessInfo?: {
    businessName?: string
    ownerName?: string
    address?: string
    city?: string
    phone?: string
    email?: string
    instagram?: string
  }
  booking?: {
    slotInterval?: number
    minAdvanceHours?: number
    maxAdvanceDays?: number
  }
  notifications?: {
    emailConfirmation?: boolean
    autoReminder?: boolean
    n8nWebhookActive?: boolean
  }
}

async function getSettings(): Promise<SiteSettingsData> {
  const payload = await getPayload({ config })

  try {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
    })
    return settings as SiteSettingsData
  } catch {
    // Return defaults if global not found
    return {
      businessInfo: {
        businessName: 'Barber 99',
        ownerName: 'Cosimo Pisani',
        address: 'Via San Biagio 3',
        city: '89822 Serra San Bruno (VV)',
        phone: '+39 327 126 3091',
        instagram: '@barber___99',
      },
      booking: {
        slotInterval: 30,
        minAdvanceHours: 2,
        maxAdvanceDays: 30,
      },
      notifications: {
        emailConfirmation: true,
        autoReminder: true,
        n8nWebhookActive: true,
      },
    }
  }
}

export default async function ImpostazioniPage() {
  const settings = await getSettings()

  const businessName = settings.businessInfo?.businessName || 'Barber 99'
  const address = settings.businessInfo?.address || 'Via San Biagio 3'
  const city = settings.businessInfo?.city || '89822 Serra San Bruno (VV)'
  const fullAddress = city ? `${address}, ${city}` : address
  const phone = settings.businessInfo?.phone || '+39 327 126 3091'

  const slotInterval = settings.booking?.slotInterval || 30
  const minAdvanceHours = settings.booking?.minAdvanceHours || 2
  const maxAdvanceDays = settings.booking?.maxAdvanceDays || 30

  const emailConfirmation = settings.notifications?.emailConfirmation ?? true
  const autoReminder = settings.notifications?.autoReminder ?? true
  const n8nWebhookActive = settings.notifications?.n8nWebhookActive ?? true

  return (
    <div className="space-y-6 admin-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Impostazioni</h1>
        <p className="text-[rgba(255,255,255,0.5)] mt-1">
          Configura il tuo studio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profilo Salone */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[rgba(212,168,85,0.1)] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#d4a855]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Profilo Salone</h2>
              <p className="text-sm text-[rgba(255,255,255,0.5)]">
                Informazioni di base dello studio
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-[rgba(255,255,255,0.5)] mb-1">Nome</p>
              <p className="text-white font-medium">{businessName}</p>
            </div>
            <div>
              <p className="text-sm text-[rgba(255,255,255,0.5)] mb-1">Indirizzo</p>
              <p className="text-white">{fullAddress}</p>
            </div>
            <div>
              <p className="text-sm text-[rgba(255,255,255,0.5)] mb-1">Telefono</p>
              <p className="text-white">{phone}</p>
            </div>
          </div>

          <p className="text-xs text-[rgba(255,255,255,0.4)] mt-6">
            Per modificare queste informazioni, accedi al pannello Payload CMS
          </p>
        </div>

        {/* Prenotazioni */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[rgba(34,197,94,0.1)] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Prenotazioni</h2>
              <p className="text-sm text-[rgba(255,255,255,0.5)]">
                Impostazioni di prenotazione
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Intervallo slot</p>
                <p className="text-sm text-[rgba(255,255,255,0.5)]">
                  Durata minima tra appuntamenti
                </p>
              </div>
              <p className="text-[#d4a855] font-mono">{slotInterval} min</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Anticipo minimo</p>
                <p className="text-sm text-[rgba(255,255,255,0.5)]">
                  Ore prima per prenotare
                </p>
              </div>
              <p className="text-[#d4a855] font-mono">{minAdvanceHours} ore</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Anticipo massimo</p>
                <p className="text-sm text-[rgba(255,255,255,0.5)]">
                  Giorni in anticipo per prenotare
                </p>
              </div>
              <p className="text-[#d4a855] font-mono">{maxAdvanceDays} giorni</p>
            </div>
          </div>
        </div>

        {/* Notifiche */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[rgba(59,130,246,0.1)] flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Notifiche</h2>
              <p className="text-sm text-[rgba(255,255,255,0.5)]">
                Reminder e comunicazioni
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email conferma</p>
                <p className="text-sm text-[rgba(255,255,255,0.5)]">
                  Invia email alla prenotazione
                </p>
              </div>
              <div className={`admin-badge ${emailConfirmation ? 'admin-badge-success' : 'admin-badge-default'}`}>
                {emailConfirmation ? 'Attivo' : 'Disattivo'}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Reminder automatico</p>
                <p className="text-sm text-[rgba(255,255,255,0.5)]">
                  24h prima dell&apos;appuntamento
                </p>
              </div>
              <div className={`admin-badge ${autoReminder ? 'admin-badge-success' : 'admin-badge-default'}`}>
                {autoReminder ? 'Attivo' : 'Disattivo'}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Webhook N8N</p>
                <p className="text-sm text-[rgba(255,255,255,0.5)]">
                  Integrazione automazioni
                </p>
              </div>
              <div className={`admin-badge ${n8nWebhookActive ? 'admin-badge-success' : 'admin-badge-default'}`}>
                {n8nWebhookActive ? 'Connesso' : 'Non connesso'}
              </div>
            </div>
          </div>
        </div>

        {/* Link Rapidi */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Gestione Avanzata</h2>
              <p className="text-sm text-[rgba(255,255,255,0.5)]">
                Accesso rapido alle configurazioni
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/admin-panel/orari"
              className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[#d4a855] transition-all"
            >
              <span className="text-white">Gestisci Orari di Apertura</span>
              <ExternalLink className="w-4 h-4 text-[rgba(255,255,255,0.5)]" />
            </Link>
            <Link
              href="/admin-panel/barbieri"
              className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[#d4a855] transition-all"
            >
              <span className="text-white">Gestisci Barbieri</span>
              <ExternalLink className="w-4 h-4 text-[rgba(255,255,255,0.5)]" />
            </Link>
            <Link
              href="/admin-panel/servizi"
              className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[#d4a855] transition-all"
            >
              <span className="text-white">Gestisci Servizi</span>
              <ExternalLink className="w-4 h-4 text-[rgba(255,255,255,0.5)]" />
            </Link>
            <a
              href="/admin"
              target="_blank"
              className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[#d4a855] transition-all"
            >
              <span className="text-white">Payload CMS Admin</span>
              <ExternalLink className="w-4 h-4 text-[rgba(255,255,255,0.5)]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
