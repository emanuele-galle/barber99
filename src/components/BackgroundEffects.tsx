'use client'

import { motion } from 'motion/react'
import { useShouldReduceMotion } from '@/hooks/useIsMobile'

interface GradientOrbProps {
  color?: 'gold' | 'dark'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
  delay?: number
}

const sizeMap = {
  sm: 'w-32 h-32 md:w-48 md:h-48',
  md: 'w-48 h-48 md:w-72 md:h-72',
  lg: 'w-64 h-64 md:w-96 md:h-96',
  xl: 'w-96 h-96 md:w-[500px] md:h-[500px]',
}

const positionMap = {
  'top-left': '-top-20 -left-20',
  'top-right': '-top-20 -right-20',
  'bottom-left': '-bottom-20 -left-20',
  'bottom-right': '-bottom-20 -right-20',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
}

const blurMap = {
  sm: 'blur-2xl',
  md: 'blur-3xl',
  lg: 'blur-[100px]',
  xl: 'blur-[150px]',
}

export function GradientOrb({
  color = 'gold',
  size = 'md',
  position = 'top-right',
  blur = 'lg',
  animate = true,
  delay = 0,
}: GradientOrbProps) {
  const shouldReduceMotion = useShouldReduceMotion()

  const colorClass = color === 'gold'
    ? 'bg-[#d4a855]/20'
    : 'bg-white/5'

  // Su mobile: render statico senza animazioni
  if (shouldReduceMotion) {
    return (
      <div
        className={`absolute rounded-full pointer-events-none opacity-40 ${sizeMap[size]} ${positionMap[position]} ${blurMap[blur]} ${colorClass}`}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={animate ? {
        opacity: [0.3, 0.5, 0.3],
        scale: [1, 1.1, 1],
      } : { opacity: 0.4, scale: 1 }}
      transition={animate ? {
        duration: 8,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      } : { duration: 1, delay }}
      className={`absolute rounded-full pointer-events-none ${sizeMap[size]} ${positionMap[position]} ${blurMap[blur]} ${colorClass}`}
    />
  )
}

interface FloatingParticlesProps {
  count?: number
  color?: 'gold' | 'white'
}

export function FloatingParticles({ count = 20, color = 'gold' }: FloatingParticlesProps) {
  const shouldReduceMotion = useShouldReduceMotion()

  // Su mobile: non renderizzare affatto le particelle (risparmio maggiore)
  if (shouldReduceMotion) {
    return null
  }

  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
  }))

  const colorClass = color === 'gold' ? 'bg-[#d4a855]' : 'bg-white'

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${colorClass}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

interface GridPatternProps {
  opacity?: number
}

export function GridPattern({ opacity = 0.03 }: GridPatternProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(212, 168, 85, ${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212, 168, 85, ${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />
  )
}

interface NoiseTextureProps {
  opacity?: number
}

export function NoiseTexture({ opacity = 0.03 }: NoiseTextureProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity,
      }}
    />
  )
}

interface AnimatedLineProps {
  direction?: 'horizontal' | 'vertical'
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function AnimatedLine({ direction = 'horizontal', position = 'bottom' }: AnimatedLineProps) {
  const shouldReduceMotion = useShouldReduceMotion()
  const isHorizontal = direction === 'horizontal'

  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
    left: 'left-0 top-0 bottom-0',
    right: 'right-0 top-0 bottom-0',
  }

  // Su mobile: linea statica
  if (shouldReduceMotion) {
    return (
      <div className={`absolute ${positionClasses[position]} overflow-hidden`}>
        <div
          className={`${isHorizontal ? 'h-px w-full' : 'w-px h-full'} bg-gradient-to-r from-transparent via-[#d4a855]/50 to-transparent`}
        />
      </div>
    )
  }

  return (
    <div className={`absolute ${positionClasses[position]} overflow-hidden`}>
      <motion.div
        className={`${isHorizontal ? 'h-px w-full' : 'w-px h-full'} bg-gradient-to-r from-transparent via-[#d4a855]/50 to-transparent`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
    </div>
  )
}

interface SectionDividerProps {
  variant?: 'simple' | 'ornate' | 'gradient'
}

export function SectionDivider({ variant = 'gradient' }: SectionDividerProps) {
  const shouldReduceMotion = useShouldReduceMotion()

  if (variant === 'simple') {
    return (
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#d4a855]/30 to-transparent" />
    )
  }

  if (variant === 'ornate') {
    return (
      <div className="flex items-center justify-center gap-4 py-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#d4a855]/30" />
        <div className="w-2 h-2 rotate-45 bg-[#d4a855]/50" />
        <div className="w-3 h-3 rotate-45 border border-[#d4a855]/50" />
        <div className="w-2 h-2 rotate-45 bg-[#d4a855]/50" />
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#d4a855]/30" />
      </div>
    )
  }

  // Su mobile: versione statica del gradient divider
  if (shouldReduceMotion) {
    return (
      <div className="relative h-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4a855]/5 to-transparent" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4a855]/40 to-transparent" />
      </div>
    )
  }

  return (
    <div className="relative h-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4a855]/5 to-transparent" />
      <motion.div
        className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4a855]/40 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
    </div>
  )
}

interface GlowingBorderProps {
  children: React.ReactNode
  className?: string
}

export function GlowingBorder({ children, className = '' }: GlowingBorderProps) {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d4a855]/0 via-[#d4a855]/50 to-[#d4a855]/0 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">{children}</div>
    </div>
  )
}

// Preset combinations for easy use
export function BackgroundEffectsGold() {
  return (
    <>
      <GradientOrb color="gold" size="lg" position="top-right" delay={0} />
      <GradientOrb color="gold" size="md" position="bottom-left" delay={2} />
      <FloatingParticles count={15} color="gold" />
      <NoiseTexture opacity={0.02} />
    </>
  )
}

export function BackgroundEffectsSubtle() {
  return (
    <>
      <GradientOrb color="dark" size="xl" position="center" animate={false} />
      <NoiseTexture opacity={0.015} />
    </>
  )
}

export function BackgroundEffectsPremium() {
  return (
    <>
      <GradientOrb color="gold" size="xl" position="top-right" delay={0} />
      <GradientOrb color="gold" size="lg" position="bottom-left" delay={3} />
      <GradientOrb color="dark" size="md" position="center" delay={1.5} />
      <FloatingParticles count={25} color="gold" />
      <GridPattern opacity={0.02} />
      <NoiseTexture opacity={0.02} />
    </>
  )
}
