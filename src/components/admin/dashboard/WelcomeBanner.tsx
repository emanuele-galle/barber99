'use client'

import { useAuth } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

const WelcomeBanner: React.FC = () => {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [greeting, setGreeting] = useState<string>('Benvenuto')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const hour = currentTime.getHours()
    if (hour >= 5 && hour < 12) {
      setGreeting('Buongiorno')
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Buon pomeriggio')
    } else {
      setGreeting('Buonasera')
    }
  }, [currentTime])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const userName = (user as { name?: string; email: string })?.name || (user as { email: string })?.email?.split('@')[0] || 'Admin'

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 50%, #1a1a1a 100%)',
        borderRadius: '20px',
        padding: '0',
        marginBottom: '28px',
        border: '1px solid rgba(212, 168, 85, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Animated background pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 20% -20%, rgba(212, 168, 85, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 120%, rgba(212, 168, 85, 0.1) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(212, 168, 85, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 168, 85, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />

      {/* Decorative scissors icon */}
      <div
        style={{
          position: 'absolute',
          right: '40px',
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.06,
          pointerEvents: 'none',
        }}
      >
        <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="#d4a855" strokeWidth="0.5">
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: '32px 40px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          {/* Left side - Greeting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Avatar with glow */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4a855, #b48835)',
                  opacity: 0.4,
                  filter: 'blur(8px)',
                }}
              />
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4a855 0%, #c49845 50%, #b48835 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#0c0c0c',
                  position: 'relative',
                  boxShadow: '0 4px 16px rgba(212, 168, 85, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>

            <div>
              <p
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '13px',
                  color: '#d4a855',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {greeting}
              </p>
              <h1
                style={{
                  margin: 0,
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                {userName}
              </h1>
              <p
                style={{
                  margin: '8px 0 0 0',
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)',
                  }}
                />
                Pannello Amministrazione
              </p>
            </div>
          </div>

          {/* Right side - Time widget */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '16px',
              padding: '20px 28px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              minWidth: '200px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#ffffff',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                letterSpacing: '0.05em',
                lineHeight: 1,
                marginBottom: '8px',
              }}
            >
              {formatTime(currentTime)}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'capitalize',
              }}
            >
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, #d4a855 50%, transparent 100%)',
          opacity: 0.6,
        }}
      />
    </div>
  )
}

export default WelcomeBanner
