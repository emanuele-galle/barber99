'use client'

import React from 'react'

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
        style={{ backgroundColor: '#d4a855' }}
      >
        BS
      </div>
      <span className="text-lg font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
        Barber 99
      </span>
    </div>
  )
}

export default Logo
