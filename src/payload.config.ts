import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { it } from '@payloadcms/translations/languages/it'
import { en } from '@payloadcms/translations/languages/en'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Services } from './collections/Services'
import { Appointments } from './collections/Appointments'
import { OpeningHours } from './collections/OpeningHours'
import { Gallery } from './collections/Gallery'
import { Reviews } from './collections/Reviews'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { ClosedDays } from './collections/ClosedDays'
import { InstagramPosts } from './collections/InstagramPosts'
import { Clients } from './collections/Clients'

// Globals
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Barber 99 Admin',
    },
  },
  i18n: {
    supportedLanguages: { it, en },
    fallbackLanguage: 'it',
  },
  collections: [
    Users,
    Media,
    Services,
    Appointments,
    Clients,
    OpeningHours,
    ClosedDays,
    Gallery,
    InstagramPosts,
    Reviews,
    ContactSubmissions,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.S3_BUCKET || 'barber99-media',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY || '',
          secretAccessKey: process.env.S3_SECRET_KEY || '',
        },
        region: process.env.S3_REGION || 'us-east-1',
        forcePathStyle: true,
      },
    }),
  ],
  sharp,
  localization: {
    locales: [
      {
        label: 'Italiano',
        code: 'it',
      },
      {
        label: 'English',
        code: 'en',
      },
    ],
    defaultLocale: 'it',
    fallback: true,
  },
})
