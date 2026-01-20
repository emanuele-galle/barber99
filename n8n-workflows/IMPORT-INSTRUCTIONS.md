# Istruzioni Import Workflow N8N

## Workflow: Barber99 - Instagram Sync

Questo workflow sincronizza automaticamente i post Instagram nel database Payload di Barber99.

### File da importare
`/var/www/projects/barber99/n8n-workflows/barber99-instagram-sync.json`

### Come importare

1. **Accedi a N8N**
   - URL: https://n8n.fodivps2.cloud
   - Usa le credenziali admin

2. **Importa il workflow**
   - Click su "Workflows" nel menu laterale
   - Click su "+ Add workflow" > "Import from File"
   - Seleziona il file `barber99-instagram-sync.json`
   - Il workflow verrà importato DISATTIVATO (come richiesto)

3. **Configura il token Instagram** (da fare dopo l'importazione)
   - Vai su Settings > Environment Variables in N8N
   - Aggiungi la variabile:
     - Name: `INSTAGRAM_ACCESS_TOKEN`
     - Value: `<il tuo Instagram Graph API Access Token>`

4. **Attiva il workflow**
   - Apri il workflow "Barber99 - Instagram Sync"
   - Click su "Activate" in alto a destra
   - Il workflow si eseguirà ogni 6 ore automaticamente

---

## Dettagli Workflow

### Funzionalità
1. **Schedule Trigger**: Esegue ogni 6 ore
2. **Fetch Instagram Media**: Recupera i post da Instagram Graph API
3. **Has Data?**: Verifica se ci sono dati da sincronizzare
4. **Split Posts**: Divide i post per elaborarli singolarmente
5. **Save to Payload**: Salva ogni post nel database Payload
6. **Collect IDs**: Raccoglie gli ID Instagram sincronizzati
7. **Cleanup Old Posts**: Elimina i post non più presenti su Instagram

### Endpoint Payload
- **POST** `http://barber99:3000/api/instagram-posts` - Crea/aggiorna post
- **DELETE** `http://barber99:3000/api/instagram-posts` - Elimina post obsoleti

### Note
- Il workflow usa il container name `barber99` per comunicare con Payload (rete Docker interna)
- Il token Instagram deve avere i permessi: `instagram_basic`, `instagram_manage_insights`
- I post vengono sincronizzati con deduplicazione basata su `instagramId`

---

## Troubleshooting

### Token Instagram scaduto
Se il workflow fallisce con errore 401:
1. Rigenera il token su Facebook Developers
2. Aggiorna la variabile `INSTAGRAM_ACCESS_TOKEN` in N8N
3. I token Instagram scadono ogni 60 giorni (long-lived) o 1 ora (short-lived)

### Endpoint Payload non raggiungibile
Se il workflow fallisce a salvare i post:
1. Verifica che il container `barber99` sia running: `docker ps | grep barber99`
2. Verifica che l'endpoint API sia attivo: `curl http://barber99:3000/api/instagram-posts`

### Log N8N
Per vedere i log del workflow:
```bash
sudo docker logs vps-panel-n8n -f --tail 100
```
