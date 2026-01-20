# Workflow N8N per Barber99

Questa cartella contiene i workflow N8N da importare per le funzionalita di notifica email e sincronizzazione Instagram.

## Prerequisiti

### Gmail SMTP
1. Usa un account Gmail dedicato (es. noreply@barber99.it)
2. Abilita la verifica in 2 passaggi su Google Account
3. Vai su: Google Account → Sicurezza → Password per le app
4. Genera una nuova "App Password" per "Email"
5. In N8N, crea credenziali SMTP:
   - Host: `smtp.gmail.com`
   - Port: `465` (SSL) o `587` (TLS)
   - User: la tua email Gmail
   - Password: l'App Password generata

### Instagram Graph API
1. Converti l'account Instagram @barber___99 in Business o Creator
2. Collega l'account a una Facebook Page
3. Vai su developers.facebook.com e crea una nuova App (tipo Business)
4. Aggiungi il prodotto "Instagram Graph API"
5. Genera un Long-Lived Access Token con permesso `instagram_basic`
6. Salva il token come variabile ambiente N8N: `INSTAGRAM_ACCESS_TOKEN`

## Workflow Disponibili

### 1. barber99-email-confirm.json
**Trigger:** Webhook `barber99-booking`

Gestisce le notifiche email per:
- Conferma nuovo appuntamento
- Reminder manuale

**Da configurare:**
- Sostituisci `SMTP_CREDENTIAL_ID` con l'ID delle tue credenziali SMTP
- Personalizza il template email HTML se necessario

### 2. barber99-daily-reminder.json
**Trigger:** Schedule (ogni giorno alle 9:00)

Invia automaticamente reminder ai clienti con appuntamenti confermati per il giorno successivo.

**Da configurare:**
- Sostituisci `SMTP_CREDENTIAL_ID` con l'ID delle tue credenziali SMTP
- Verifica che l'URL del webhook punti correttamente al container barber99

### 3. barber99-instagram-sync.json
**Trigger:** Schedule (ogni 6 ore)

Sincronizza i post Instagram nel database Payload per visualizzarli nella galleria.

**Da configurare:**
- Aggiungi variabile ambiente `INSTAGRAM_ACCESS_TOKEN` in N8N
- Verifica che l'URL API punti correttamente al container barber99

## Importazione

1. Accedi a N8N: https://n8n.fodivps2.cloud
2. Vai su Workflows → Import
3. Seleziona il file JSON del workflow
4. Configura le credenziali necessarie
5. Attiva il workflow

## Test

### Email Conferma
Crea un nuovo appuntamento dal frontend e verifica che arrivi l'email.

### Reminder
1. Crea un appuntamento per domani con status "confirmed"
2. Esegui manualmente il workflow di reminder
3. Verifica che arrivi l'email e che `reminderSent` sia true

### Instagram Sync
1. Esegui manualmente il workflow
2. Verifica che i post appaiano in Payload Admin → Post Instagram
3. Verifica che appaiano nella galleria del frontend

## Troubleshooting

### Email non arrivano
- Verifica le credenziali SMTP in N8N
- Controlla i log di esecuzione del workflow
- Verifica che Gmail non blocchi le email (controlla spam)

### Instagram non si sincronizza
- Verifica che il token non sia scaduto (60 giorni)
- Controlla che l'account sia Business/Creator
- Verifica i permessi dell'app Facebook

### Webhook non risponde
- Verifica che il container barber99 sia attivo
- Controlla la rete Docker (entrambi devono essere sulla stessa rete)
