'use client'

import { motion, useInView } from 'motion/react'
import { useRef, useState, useEffect } from 'react'
import { Clock, Star, Users, Scissors } from 'lucide-react'
import { GradientOrb, NoiseTexture, SectionDivider } from '@/components/BackgroundEffects'
import { useShouldReduceMotion } from '@/hooks/useIsMobile'

interface StatItem {
  icon: typeof Clock
  value: number
  suffix: string
  label: string
}

const stats: StatItem[] = [
  { icon: Scissors, value: 9, suffix: '+', label: 'Anni di Esperienza' },
  { icon: Users, value: 1500, suffix: '+', label: 'Clienti Soddisfatti' },
  { icon: Star, value: 5, suffix: '.0', label: 'Valutazione Google' },
  { icon: Clock, value: 6, suffix: '/7', label: 'Giorni alla Settimana' },
]

function AnimatedCounter({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 2000
    const steps = 60
    const stepTime = duration / steps
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span>
      {count.toLocaleString('it-IT')}{suffix}
    </span>
  )
}

export default function WhyChooseUsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const shouldReduceMotion = useShouldReduceMotion()

  return (
    <>
      <section ref={sectionRef} className="py-16 md:py-24 bg-[#0c0c0c] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <GradientOrb color="gold" size="md" position="center" blur="xl" delay={0} />
          <NoiseTexture opacity={0.02} />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {shouldReduceMotion ? (
            <>
              <div className="text-center mb-12">
                <p
                  className="text-[#d4a855] text-sm md:text-base tracking-[0.3em] uppercase mb-4"
                  style={{ fontFamily: 'var(--font-cormorant), serif' }}
                >
                  I Numeri Parlano
                </p>
                <h2
                  className="text-3xl md:text-5xl font-bold text-white mb-4"
                  style={{ fontFamily: 'var(--font-cinzel), serif' }}
                >
                  Perch&eacute; Sceglierci
                </h2>
                <div className="gold-divider" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={index}
                      className="text-center p-6 rounded-xl bg-[#151515] border border-white/5"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#d4a855]/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-[#d4a855]" />
                      </div>
                      <p
                        className="text-3xl md:text-4xl font-bold text-[#d4a855] mb-2"
                        style={{ fontFamily: 'var(--font-cinzel), serif' }}
                      >
                        {stat.value.toLocaleString('it-IT')}{stat.suffix}
                      </p>
                      <p className="text-white/60 text-sm md:text-base">{stat.label}</p>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <p
                  className="text-[#d4a855] text-sm md:text-base tracking-[0.3em] uppercase mb-4"
                  style={{ fontFamily: 'var(--font-cormorant), serif' }}
                >
                  I Numeri Parlano
                </p>
                <h2
                  className="text-3xl md:text-5xl font-bold text-white mb-4"
                  style={{ fontFamily: 'var(--font-cinzel), serif' }}
                >
                  Perch&eacute; Sceglierci
                </h2>
                <div className="gold-divider" />
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="text-center p-6 rounded-xl bg-[#151515] border border-white/5 hover:border-[#d4a855]/20 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#d4a855]/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-[#d4a855]" />
                      </div>
                      <p
                        className="text-3xl md:text-4xl font-bold text-[#d4a855] mb-2"
                        style={{ fontFamily: 'var(--font-cinzel), serif' }}
                      >
                        <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={isInView} />
                      </p>
                      <p className="text-white/60 text-sm md:text-base">{stat.label}</p>
                    </motion.div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>
      <SectionDivider variant="simple" />
    </>
  )
}
