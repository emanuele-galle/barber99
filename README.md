# Barber 99 - Cosimo Pisani

Sito web e sistema di prenotazione online per **Barber 99**, barbershop di Cosimo Pisani a Serra San Bruno (VV).

**Dominio:** [barber99.it](https://barber99.it)
**Preview:** [barber99.fodivps2.cloud](https://barber99.fodivps2.cloud)

## Funzionalita

- Homepage con sezioni Hero, Chi Siamo, Servizi, Galleria Instagram, Recensioni, Contatti
- Prenotazione online appuntamenti con selezione servizio, data e orario
- Area clienti con registrazione, login, gestione profilo e storico prenotazioni
- Pannello admin per gestione appuntamenti, clienti, servizi, orari, galleria, recensioni
- Cancellazione appuntamento via link email
- PWA (Progressive Web App) con service worker
- SEO ottimizzato con JSON-LD (BarberShop), sitemap dinamica, meta tags per pagina
- Galleria Instagram integrata

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4, Lucide Icons, Motion (Framer Motion)
- **CMS/Backend:** Payload CMS 3 (collections: services, reviews, gallery, users)
- **Database:** PostgreSQL (Prisma + Payload adapter)
- **Storage:** MinIO S3 (immagini galleria)
- **Auth:** JWT custom con jose (area clienti) + Payload auth (admin)
- **Language:** TypeScript 5

## Struttura Progetto

```
src/app/
  (frontend)/     # Pagine pubbliche (home, prenota, servizi, account, privacy, cookie, termini)
  (admin-panel)/  # Pannello amministrazione (appuntamenti, clienti, servizi, orari, galleria)
  (auth)/         # Login admin panel
  (payload)/      # Payload CMS admin UI
  api/            # API routes (auth, booking, services, health)
```

## Setup Locale

```bash
cp .env.example .env
# Configurare DATABASE_URL, PAYLOAD_SECRET, NEXT_PUBLIC_SITE_URL
npm install
npm run dev
```

## Deploy

Il progetto gira in Docker su VPS con Traefik come reverse proxy.

```bash
# Build e avvio
docker compose build && docker compose up -d

# Rebuild dopo modifiche
/home/sviluppatore/scripts/docker-smart-rebuild.sh app --no-cache

# Logs
docker compose logs -f app
```

Il deploy automatico avviene tramite GitHub Actions su push al branch `main`.
