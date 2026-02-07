'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { Instagram, Calendar, Clock, Award } from 'lucide-react'
import { GradientOrb, FloatingParticles, NoiseTexture, SectionDivider } from '@/components/BackgroundEffects'

interface Barber {
  id: string | number
  name: string
  role?: string
  shortBio?: string
  photo?: { url?: string } | null
  specialties?: Array<{ name: string }> | null
  experience?: number
  availability?: {
    monday?: boolean
    tuesday?: boolean
    wednesday?: boolean
    thursday?: boolean
    friday?: boolean
    saturday?: boolean
    sunday?: boolean
  }
  instagram?: string
  order?: number
}

interface TeamSectionProps {
  barbers: Barber[]
}

// Helper to get availability string
function getAvailabilityString(availability?: Barber['availability']): string {
  if (!availability) return 'Mar-Sab'

  const days: { key: keyof NonNullable<typeof availability>; short: string }[] = [
    { key: 'monday', short: 'Lun' },
    { key: 'tuesday', short: 'Mar' },
    { key: 'wednesday', short: 'Mer' },
    { key: 'thursday', short: 'Gio' },
    { key: 'friday', short: 'Ven' },
    { key: 'saturday', short: 'Sab' },
    { key: 'sunday', short: 'Dom' },
  ]

  const activeDays = days.filter(d => availability[d.key])
  if (activeDays.length === 0) return 'Non disponibile'
  if (activeDays.length === 7) return 'Tutti i giorni'

  // Find consecutive ranges
  const firstDay = activeDays[0]?.short
  const lastDay = activeDays[activeDays.length - 1]?.short
  return `${firstDay}-${lastDay}`
}

export default function TeamSection({ barbers }: TeamSectionProps) {
  // If no barbers from database, show empty state
  if (!barbers || barbers.length === 0) {
    return (
      <section id="team" className="section-padding bg-[#0c0c0c] relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60">Nessun barbiere disponibile al momento.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="team" className="section-padding bg-[#0c0c0c] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <GradientOrb color="gold" size="lg" position="top-right" blur="xl" delay={0.5} />
        <GradientOrb color="dark" size="xl" position="bottom-left" blur="lg" delay={1} />
        <FloatingParticles count={12} color="gold" />
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
            className="text-[#d4a855] text-sm md:text-base tracking-[0.3em] uppercase mb-4"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
            Il Nostro Team
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            I Maestri Barbieri
          </h2>
          <div className="gold-divider" />
          <p className="text-white/60 max-w-2xl mx-auto mt-6">
            Professionisti appassionati pronti a prendersi cura del tuo look
            con competenza e dedizione.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {barbers.map((member, index) => {
            const isFounder = index === 0 || member.role?.toLowerCase().includes('master') || member.role?.toLowerCase().includes('fondatore')
            const photoUrl = member.photo?.url || '/images/gallery-2.webp'
            const specialties = member.specialties?.map(s => s.name) || []
            const experienceYears = member.experience ? `${member.experience}+ anni` : '5+ anni'
            const availabilityStr = getAvailabilityString(member.availability)
            const instagramHandle = member.instagram || ''

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 * index }}
                className="group"
              >
                <div className="card-dark overflow-hidden relative">
                  {/* Featured Badge */}
                  {isFounder && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-[#d4a855] text-[#0c0c0c] text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {member.role?.toLowerCase().includes('fondatore') ? 'Fondatore' : 'Master'}
                      </span>
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative h-80 overflow-hidden">
                    <Image
                      src={photoUrl}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/40 to-transparent" />

                    {/* Instagram */}
                    {instagramHandle && (
                      <a
                        href={`https://instagram.com/${instagramHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#0c0c0c]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#d4a855]/20"
                        aria-label={`Profilo Instagram di ${member.name}`}
                      >
                        <Instagram className="w-5 h-5 text-[#d4a855]" />
                      </a>
                    )}

                    {/* Hover Overlay with Quick Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-1.5 text-white/80 text-shadow-sm">
                          <Award className="w-4 h-4 text-[#d4a855]" />
                          <span>{experienceYears}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/80 text-shadow-sm">
                          <Clock className="w-4 h-4 text-[#d4a855]" />
                          <span>{availabilityStr}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3
                          className="text-xl font-semibold text-white mb-1"
                          style={{ fontFamily: 'var(--font-cinzel), serif' }}
                        >
                          {member.name}
                        </h3>
                        <p className="text-[#d4a855] text-sm md:text-base">{member.role || 'Barbiere'}</p>
                      </div>
                    </div>

                    <p className="text-white/60 text-sm md:text-base mb-4 line-clamp-2 group-hover:line-clamp-none transition-all">
                      {member.shortBio || 'Esperto barbiere con passione per il suo lavoro.'}
                    </p>

                    {/* Specialties */}
                    {specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {specialties.slice(0, 3).map((specialty) => (
                          <span
                            key={specialty}
                            className="text-xs md:text-sm px-3 py-1 rounded-full bg-[#d4a855]/10 text-[#d4a855]"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick Book Button - appears on hover */}
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      whileInView={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <Link
                        href={`/prenota?barber=${encodeURIComponent(member.name)}`}
                        className="btn-outline-gold btn-ripple w-full text-center text-sm py-2 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <Calendar className="w-4 h-4" />
                        Prenota con {member.name}
                      </Link>
                    </motion.div>
                  </div>

                  {/* Expanded Hover Card Overlay - Desktop */}
                  <div className="hidden md:block absolute inset-0 bg-[#151515]/95 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 p-6 flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden relative ring-2 ring-[#d4a855]">
                          <Image
                            src={photoUrl}
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3
                            className="text-xl font-semibold text-white"
                            style={{ fontFamily: 'var(--font-cinzel), serif' }}
                          >
                            {member.name}
                          </h3>
                          <p className="text-[#d4a855] text-sm md:text-base">{member.role || 'Barbiere'}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-white/60">
                            <span className="flex items-center gap-1">
                              <Award className="w-3 h-3 text-[#d4a855]" />
                              {experienceYears}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#d4a855]" />
                              {availabilityStr}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-white/80 text-sm md:text-base mb-4">
                        {member.shortBio || 'Esperto barbiere con passione per il suo lavoro.'}
                      </p>

                      {/* Specialties */}
                      {specialties.length > 0 && (
                        <div className="mb-4">
                          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Specialità</p>
                          <div className="flex flex-wrap gap-2">
                            {specialties.map((specialty) => (
                              <span
                                key={specialty}
                                className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-[#d4a855]/10 text-[#d4a855] border border-[#d4a855]/20"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Link
                        href={`/prenota?barber=${encodeURIComponent(member.name)}`}
                        className="btn-gold w-full text-center text-sm py-3 flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Prenota Appuntamento
                      </Link>
                      {instagramHandle && (
                        <a
                          href={`https://instagram.com/${instagramHandle.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline-gold w-full text-center text-sm py-2 flex items-center justify-center gap-2"
                        >
                          <Instagram className="w-4 h-4" />
                          {instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <SectionDivider variant="gradient" />
    </section>
  )
}
