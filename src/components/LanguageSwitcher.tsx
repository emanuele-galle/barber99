'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const languages = [
  { code: 'it', label: 'IT', flag: '🇮🇹' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
]

export default function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Detect current locale from pathname
  const currentLocale = pathname.startsWith('/en') ? 'en' : 'it'
  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0]

  const switchLanguage = (locale: string) => {
    setIsOpen(false)

    // Remove current locale prefix if exists
    let newPath = pathname
    if (pathname.startsWith('/en')) {
      newPath = pathname.replace('/en', '') || '/'
    }

    // Add new locale prefix if not default
    if (locale === 'en') {
      newPath = `/en${newPath === '/' ? '' : newPath}`
    }

    router.push(newPath)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-300 hover:text-gold transition-colors"
        aria-label="Switch language"
      >
        <span>{currentLang.flag}</span>
        <span>{currentLang.label}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-1 w-24 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-800 transition-colors ${
                lang.code === currentLocale ? 'text-gold' : 'text-gray-300'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
