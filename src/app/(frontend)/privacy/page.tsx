import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy | Barber 99 Serra San Bruno',
  description: 'Informativa sulla privacy di Barber 99 - Come trattiamo i tuoi dati personali',
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0c0c0c] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-white mb-8"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            Privacy Policy
          </h1>

          <div className="prose prose-invert prose-sm md:prose-base max-w-none">
            <p className="text-white/70 mb-6">
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                1. Titolare del Trattamento
              </h2>
              <div className="text-white/70 space-y-2">
                <p><strong className="text-white">Barber 99 di Cosimo Pisani</strong></p>
                <p>Via San Biagio 3, 89822 Serra San Bruno (VV)</p>
                <p>P.IVA: 03936920796</p>
                <p>Telefono: +39 327 126 3091</p>
                <p>Email: <a href="mailto:info@barber99.it" className="text-[#d4a855] hover:underline">info@barber99.it</a></p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                2. Dati Raccolti
              </h2>
              <p className="text-white/70 mb-4">
                Raccogliamo i seguenti dati personali:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li><strong className="text-white">Dati di contatto:</strong> nome, cognome, email, numero di telefono</li>
                <li><strong className="text-white">Dati di prenotazione:</strong> data e ora degli appuntamenti, servizi richiesti</li>
                <li><strong className="text-white">Dati di navigazione:</strong> indirizzo IP, browser, sistema operativo (tramite cookie tecnici)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                3. Finalita del Trattamento
              </h2>
              <p className="text-white/70 mb-4">
                I dati vengono trattati per:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Gestione delle prenotazioni e degli appuntamenti</li>
                <li>Comunicazioni relative ai servizi richiesti</li>
                <li>Risposta alle richieste di contatto</li>
                <li>Adempimento di obblighi di legge</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                4. Base Giuridica
              </h2>
              <p className="text-white/70">
                Il trattamento dei dati si basa su:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2 mt-4">
                <li>Esecuzione di un contratto o misure precontrattuali (prenotazioni)</li>
                <li>Consenso dell&apos;interessato (form di contatto)</li>
                <li>Legittimo interesse del titolare (sicurezza del sito)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                5. Conservazione dei Dati
              </h2>
              <p className="text-white/70">
                I dati personali vengono conservati per il tempo necessario alle finalita per cui sono stati raccolti
                e comunque non oltre i termini previsti dalla legge. I dati di prenotazione vengono conservati per
                un massimo di 2 anni dalla data dell&apos;appuntamento.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                6. Diritti dell&apos;Interessato
              </h2>
              <p className="text-white/70 mb-4">
                Ai sensi degli articoli 15-22 del GDPR, hai diritto a:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>Accedere ai tuoi dati personali</li>
                <li>Richiedere la rettifica o la cancellazione</li>
                <li>Limitare il trattamento</li>
                <li>Opporti al trattamento</li>
                <li>Richiedere la portabilita dei dati</li>
                <li>Revocare il consenso in qualsiasi momento</li>
              </ul>
              <p className="text-white/70 mt-4">
                Per esercitare i tuoi diritti, contattaci al numero +39 327 126 3091 o via email a{' '}
                <a href="mailto:info@barber99.it" className="text-[#d4a855] hover:underline">info@barber99.it</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                7. Cookie
              </h2>
              <p className="text-white/70">
                Per informazioni sui cookie utilizzati, consulta la nostra{' '}
                <Link href="/cookie" className="text-[#d4a855] hover:underline">
                  Cookie Policy
                </Link>.
              </p>
            </section>

            <section className="mb-8 border-t border-white/10 pt-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "var(--font-cinzel), serif" }}>
                Sviluppo e Gestione Tecnica del Sito
              </h2>
              <p className="text-white/70">Questo sito web è stato realizzato e viene gestito da:</p>
              <p className="text-white/70 mt-2">
                <strong className="text-white">FODI S.r.l. – Startup Innovativa</strong><br />
                Via Santicelli 18/A, 88068 Soverato (CZ)<br />
                P.IVA: 03856160793<br />
                Email: <a href="mailto:info@fodisrl.it" className="text-[#d4a855] hover:underline">info@fodisrl.it</a><br />
                Tel: +39 0963 576433<br />
                Web: <a href="https://www.fodisrl.it" target="_blank" rel="noopener noreferrer" className="text-[#d4a855] hover:underline">www.fodisrl.it</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                9. Modifiche alla Privacy Policy
              </h2>
              <p className="text-white/70">
                Il Titolare si riserva il diritto di apportare modifiche alla presente informativa in qualunque momento.
                Le modifiche saranno pubblicate su questa pagina.
              </p>
            </section>
          </div>

          <div className="mt-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#d4a855] hover:text-[#e8c882] transition-colors"
            >
              &larr; Torna alla Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
