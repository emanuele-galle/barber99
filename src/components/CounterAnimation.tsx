'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'motion/react'

interface CounterAnimationProps {
  end: number
  suffix?: string
  duration?: number
  decimals?: number
  className?: string
}

export default function CounterAnimation({
  end,
  suffix = '',
  duration = 2,
  decimals = 0,
  className = '',
}: CounterAnimationProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true
      const startTime = Date.now()
      const endTime = startTime + duration * 1000

      const animate = () => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / (duration * 1000), 1)

        // Easing function (easeOutExpo)
        const easeOutExpo = 1 - Math.pow(2, -10 * progress)
        const currentCount = easeOutExpo * end

        setCount(currentCount)

        if (now < endTime) {
          requestAnimationFrame(animate)
        } else {
          setCount(end)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [isInView, end, duration])

  const displayValue = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toString()

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {displayValue}{suffix}
    </motion.span>
  )
}
