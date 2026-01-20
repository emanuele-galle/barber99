export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import { MessageSquare, Mail, Phone, Calendar, CheckCircle, Clock } from 'lucide-react'
import { ContactActions } from '@/components/admin-panel/ContactActions'

async function getContacts() {
  const payload = await getPayload({ config })
  const contacts = await payload.find({
    collection: 'contact-submissions',
    sort: '-createdAt',
    limit: 100,
  })
  return contacts.docs
}

export default async function ContattiPage() {
  const contacts = await getContacts()

  return (
    <div className="space-y-6 admin-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Contatti</h1>
        <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
          Messaggi ricevuti dal form di contatto
        </p>
      </div>

      {/* Contacts list */}
      {contacts.length > 0 ? (
        <div className="grid gap-4">
          {contacts.map((contact) => {
            const isNew = contact.status === 'new'
            return (
              <div
                key={contact.id}
                className={`admin-card p-5 ${isNew ? 'border-[rgba(239,68,68,0.3)]' : ''}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Status indicator */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isNew ? 'bg-[rgba(239,68,68,0.1)]' : 'bg-[rgba(34,197,94,0.1)]'
                    }`}
                  >
                    {isNew ? (
                      <Clock className="w-5 h-5 text-red-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{contact.name}</h3>
                      {isNew && <span className="admin-badge admin-badge-error">Nuovo</span>}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-[rgba(255,255,255,0.6)] mb-3">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {contact.email}
                      </span>
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(contact.createdAt).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-[rgba(255,255,255,0.8)] whitespace-pre-wrap">
                      {contact.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <ContactActions
                    contactId={String(contact.id)}
                    currentStatus={contact.status as string}
                    email={contact.email as string}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="admin-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(212,168,85,0.1)] flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-[#d4a855]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nessun messaggio</h3>
          <p className="text-[rgba(255,255,255,0.5)]">
            Non hai ancora ricevuto messaggi
          </p>
        </div>
      )}
    </div>
  )
}
