import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // All supported locales
  locales: ['it', 'en'],

  // Default locale when no match
  defaultLocale: 'it',

  // Don't use locale prefix for default locale
  localePrefix: 'as-needed',
})
