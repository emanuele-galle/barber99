'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { MapPin, Phone, Clock, Mail, Calendar, Instagram, Send, Loader2, CheckCircle } from 'lucide-react'
import { GradientOrb, NoiseTexture } from '@/components/BackgroundEffects'

const contactInfo = [
  {
    icon: MapPin,
    label: 'Indirizzo',
    value: 'Via San Biagio 3',
    subValue: '89822 Serra San Bruno (VV)',
    href: 'https://www.google.com/maps/search/?api=1&query=Via+San+Biagio+3,+89822+Serra+San+Bruno+VV',
  },
  {
    icon: Phone,
    label: 'Telefono',
    value: '+39 327 126 3091',
    href: 'tel:+393271263091',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@barber99.it',
    href: 'mailto:info@barber99.it',
  },
  {
    icon: Clock,
    label: 'Orari',
    value: 'Mar-Sab: 09:00-19:00',
    subValue: 'Lun: 10:00-19:00 | Dom: Chiuso',
  },
]

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'info',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante invio')
      }

      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', subject: 'info', message: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante invio messaggio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="section-padding bg-[#151515] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <GradientOrb color="dark" size="lg" position="bottom-left" blur="xl" animate={false} />
        <NoiseTexture opacity={0.02} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            className="text-[#d4a855] text-sm tracking-[0.3em] uppercase mb-4"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
            Vieni a Trovarci
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            Contatti
          </h2>
          <div className="gold-divider" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Contact Info + Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3
              className="text-2xl font-semibold text-white mb-8"
              style={{ fontFamily: 'var(--font-cinzel), serif' }}
            >
              Informazioni di Contatto
            </h3>

            <div className="space-y-6 mb-8">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#d4a855]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-[#d4a855]" />
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-white hover:text-[#d4a855] transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-white">{item.value}</p>
                    )}
                    {item.subValue && (
                      <p className="text-white/60 text-sm">{item.subValue}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div className="mb-8 pt-6 border-t border-white/10">
              <p className="text-white/50 text-sm mb-4">Seguici sui Social</p>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/barber___99/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-[#d4a855]/10 flex items-center justify-center hover:bg-[#d4a855]/20 transition-colors"
                >
                  <Instagram className="w-5 h-5 text-[#d4a855]" />
                </a>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/prenota"
              className="btn-gold inline-flex items-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Prenota un Appuntamento
            </Link>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-[#1a1a1a] rounded-2xl p-6 md:p-8 border border-white/5">
              <h3
                className="text-xl font-semibold text-white mb-6"
                style={{ fontFamily: 'var(--font-cinzel), serif' }}
              >
                Inviaci un Messaggio
              </h3>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Messaggio Inviato!
                  </h4>
                  <p className="text-white/60 mb-6">
                    Ti risponderemo il prima possibile.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-[#d4a855] hover:underline"
                  >
                    Invia un altro messaggio
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name & Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm text-white/70 mb-2">
                        Nome *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Il tuo nome"
                        className="w-full px-4 py-3 rounded-xl bg-[#111] border border-white/10 text-white text-[16px] placeholder:text-white/30 focus:outline-none focus:border-[#d4a855]/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm text-white/70 mb-2">
                        Email *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="la@tua.email"
                        className="w-full px-4 py-3 rounded-xl bg-[#111] border border-white/10 text-white text-[16px] placeholder:text-white/30 focus:outline-none focus:border-[#d4a855]/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm text-white/70 mb-2">
                      Telefono
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+39 ..."
                      className="w-full px-4 py-3 rounded-xl bg-[#111] border border-white/10 text-white text-[16px] placeholder:text-white/30 focus:outline-none focus:border-[#d4a855]/50 transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm text-white/70 mb-2">
                      Messaggio *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="Scrivi il tuo messaggio..."
                      className="w-full px-4 py-3 rounded-xl bg-[#111] border border-white/10 text-white text-[16px] placeholder:text-white/30 focus:outline-none focus:border-[#d4a855]/50 transition-colors resize-none"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-gold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Invio in corso...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Invia Messaggio
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 relative rounded-xl overflow-hidden h-[300px]"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1559.5!2d16.3292693!3d38.5740463!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x131393e5c5c5c5c5%3A0x0!2sVia+San+Biagio%2C+3%2C+89822+Serra+San+Bruno+VV!5e0!3m2!1sit!2sit!4v1705693200000"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="grayscale"
          />
          <div className="absolute inset-0 pointer-events-none border border-[#d4a855]/20 rounded-xl" />
        </motion.div>
      </div>
    </section>
  )
}
