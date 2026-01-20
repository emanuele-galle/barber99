#!/usr/bin/env node

/**
 * Seed script for Barber Sergi database
 * Run with: DATABASE_URL="..." node scripts/seed-data.mjs
 */

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://barber_sergi_user:BarberSergi2026Pwd@localhost:5432/barber_sergi_db'

import pg from 'pg'
const { Pool } = pg

const pool = new Pool({ connectionString: DATABASE_URL })

const services = [
  {
    slug: 'taglio-classico',
    name: 'Taglio Classico',
    shortDescription: 'Taglio capelli tradizionale con rifinitura a forbice e macchinetta',
    price: 30,
    duration: 45,
    category: 'haircut',
    icon: 'Scissors',
    featured: true,
    active: true,
    order: 1,
  },
  {
    slug: 'razor-fade',
    name: 'Razor Fade',
    shortDescription: 'Sfumatura precisa con rasoio per un look moderno e pulito',
    price: 35,
    duration: 45,
    category: 'haircut',
    icon: 'Zap',
    featured: true,
    active: true,
    order: 2,
  },
  {
    slug: 'rasatura-tradizionale',
    name: 'Rasatura Tradizionale',
    shortDescription: 'Rasatura completa con rasoio a mano libera e trattamento viso',
    price: 30,
    duration: 30,
    category: 'beard',
    icon: 'Droplets',
    featured: false,
    active: true,
    order: 3,
  },
  {
    slug: 'modellatura-barba',
    name: 'Modellatura Barba',
    shortDescription: 'Definizione e modellatura della barba con linee precise',
    price: 25,
    duration: 30,
    category: 'beard',
    icon: 'Wand2',
    featured: false,
    active: true,
    order: 4,
  },
  {
    slug: 'grey-blending',
    name: 'Grey Blending',
    shortDescription: 'Copertura graduale dei capelli bianchi per un look naturale',
    price: 40,
    duration: 45,
    category: 'treatment',
    icon: 'Sparkles',
    featured: false,
    active: true,
    order: 5,
  },
  {
    slug: 'full-experience',
    name: 'Full Experience',
    shortDescription: 'Pacchetto completo: taglio, barba, trattamento viso e styling',
    price: 75,
    duration: 90,
    category: 'package',
    icon: 'Crown',
    featured: true,
    active: true,
    order: 6,
  },
]

const barbers = [
  {
    slug: 'graziano',
    name: 'Graziano',
    role: 'Master Barber',
    shortBio: 'Fondatore del salone con oltre 15 anni di esperienza',
    experience: 15,
    instagram: '@graziano_barber',
    active: true,
    order: 1,
  },
  {
    slug: 'marco',
    name: 'Marco',
    role: 'Senior Barber',
    shortBio: 'Specializzato in tagli moderni e sfumature razor fade',
    experience: 8,
    instagram: '@marco_barber',
    active: true,
    order: 2,
  },
  {
    slug: 'alessandro',
    name: 'Alessandro',
    role: 'Barber',
    shortBio: 'Esperto in rasatura tradizionale e cura della barba',
    experience: 5,
    instagram: '@alessandro_barber',
    active: true,
    order: 3,
  },
]

async function seedServices() {
  console.log('Seeding services...')

  for (const service of services) {
    // Insert into services table
    const result = await pool.query(
      `INSERT INTO services (slug, price, duration, category, icon, featured, active, "order", created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET
         price = EXCLUDED.price,
         duration = EXCLUDED.duration,
         category = EXCLUDED.category,
         icon = EXCLUDED.icon,
         featured = EXCLUDED.featured,
         active = EXCLUDED.active,
         "order" = EXCLUDED."order",
         updated_at = NOW()
       RETURNING id`,
      [service.slug, service.price, service.duration, service.category, service.icon, service.featured, service.active, service.order]
    )
    const serviceId = result.rows[0].id

    // Insert localized data (Italian)
    await pool.query(
      `INSERT INTO services_locales (_parent_id, _locale, name, short_description)
       VALUES ($1, 'it', $2, $3)
       ON CONFLICT (_locale, _parent_id) DO UPDATE SET
         name = EXCLUDED.name,
         short_description = EXCLUDED.short_description`,
      [serviceId, service.name, service.shortDescription]
    )

    console.log(`  - ${service.name} (ID: ${serviceId})`)
  }
}

async function seedBarbers() {
  console.log('Seeding barbers...')

  for (const barber of barbers) {
    // Insert into barbers table (name is NOT localized for barbers)
    const result = await pool.query(
      `INSERT INTO barbers (name, slug, experience, instagram, active, "order", created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         experience = EXCLUDED.experience,
         instagram = EXCLUDED.instagram,
         active = EXCLUDED.active,
         "order" = EXCLUDED."order",
         updated_at = NOW()
       RETURNING id`,
      [barber.name, barber.slug, barber.experience, barber.instagram, barber.active, barber.order]
    )
    const barberId = result.rows[0].id

    // Insert localized data (Italian) - role and short_bio are localized
    await pool.query(
      `INSERT INTO barbers_locales (_parent_id, _locale, role, short_bio)
       VALUES ($1, 'it', $2, $3)
       ON CONFLICT (_locale, _parent_id) DO UPDATE SET
         role = EXCLUDED.role,
         short_bio = EXCLUDED.short_bio`,
      [barberId, barber.role, barber.shortBio]
    )

    console.log(`  - ${barber.name} (ID: ${barberId})`)
  }
}

async function main() {
  console.log('Starting seed...')
  console.log('Database:', DATABASE_URL.replace(/:[^:@]+@/, ':***@'))

  try {
    await seedServices()
    await seedBarbers()
    console.log('\nSeed completed successfully!')
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
