import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Cookie Policy | Barber 99 Serra San Bruno',
  description: 'Informativa sui cookie di Barber 99 - Come utilizziamo i cookie sul nostro sito',
}

export default function CookiePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0c0c0c] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-white mb-8"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            Cookie Policy
          </h1>

          <div className="prose prose-invert prose-sm md:prose-base max-w-none">
            <p className="text-white/70 mb-6">
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                1. Cosa Sono i Cookie
              </h2>
              <p className="text-white/70">
                I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web.
                Servono a migliorare la tua esperienza di navigazione, ricordare le tue preferenze e raccogliere informazioni
                statistiche sull&apos;utilizzo del sito.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                2. Titolare del Trattamento
              </h2>
              <div className="text-white/70 space-y-2">
                <p><strong className="text-white">Barber 99 di Cosimo Pisani</strong></p>
                <p>Via San Biagio 3, 89822 Serra San Bruno (VV)</p>
                <p>P.IVA: 03936920796</p>
                <p>Telefono: +39 327 126 3091</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                3. Tipologie di Cookie Utilizzati
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Cookie Tecnici (Necessari)</h3>
                <p className="text-white/70 mb-4">
                  Questi cookie sono essenziali per il funzionamento del sito e non possono essere disabilitati.
                </p>
                <div className="bg-white/5 rounded-xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 text-white">Nome</th>
                        <th className="text-left py-2 text-white">Scopo</th>
                        <th className="text-left py-2 text-white">Durata</th>
                      </tr>
                    </thead>
                    <tbody className="text-white/70">
                      <tr className="border-b border-white/5">
                        <td className="py-2">session</td>
                        <td className="py-2">Gestione sessione utente</td>
                        <td className="py-2">Sessione</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2">cookie_consent</td>
                        <td className="py-2">Memorizza preferenze cookie</td>
                        <td className="py-2">1 anno</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Cookie di Terze Parti</h3>
                <p className="text-white/70 mb-4">
                  Il sito utilizza servizi di terze parti che potrebbero installare cookie:
                </p>
                <div className="bg-white/5 rounded-xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 text-white">Servizio</th>
                        <th className="text-left py-2 text-white">Scopo</th>
                        <th className="text-left py-2 text-white">Privacy Policy</th>
                      </tr>
                    </thead>
                    <tbody className="text-white/70">
                      <tr className="border-b border-white/5">
                        <td className="py-2">Google Maps</td>
                        <td className="py-2">Visualizzazione mappa</td>
                        <td className="py-2">
                          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#F4662F] hover:underline">
                            Link
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                4. Come Gestire i Cookie
              </h2>
              <p className="text-white/70 mb-4">
                Puoi gestire le preferenze sui cookie in diversi modi:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-2">
                <li>
                  <strong className="text-white">Impostazioni del browser:</strong> la maggior parte dei browser permette di rifiutare o accettare i cookie
                </li>
                <li>
                  <strong className="text-white">Cancellazione cookie:</strong> puoi eliminare i cookie gia installati dalle impostazioni del browser
                </li>
              </ul>

              <div className="mt-4 bg-white/5 rounded-xl p-4">
                <p className="text-white/70 text-sm mb-3">Link alle istruzioni per i browser piu comuni:</p>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>
                    <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#F4662F] hover:underline">
                      Google Chrome
                    </a>
                  </li>
                  <li>
                    <a href="https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie" target="_blank" rel="noopener noreferrer" className="text-[#F4662F] hover:underline">
                      Mozilla Firefox
                    </a>
                  </li>
                  <li>
                    <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#F4662F] hover:underline">
                      Safari
                    </a>
                  </li>
                  <li>
                    <a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-[#F4662F] hover:underline">
                      Microsoft Edge
                    </a>
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                5. Conseguenze della Disabilitazione dei Cookie
              </h2>
              <p className="text-white/70">
                La disabilitazione dei cookie tecnici potrebbe compromettere alcune funzionalita del sito,
                come il sistema di prenotazione o la visualizzazione della mappa.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                6. Sviluppo del Sito Web
              </h2>
              <p className="text-white/70">
                Questo sito web e stato realizzato da <strong className="text-white">Fodi S.r.l.</strong>{' '}
                (<a href="https://www.fodisrl.it" target="_blank" rel="noopener noreferrer" className="text-[#F4662F] hover:underline">www.fodisrl.it</a>).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                7. Aggiornamenti
              </h2>
              <p className="text-white/70">
                Questa Cookie Policy puo essere aggiornata periodicamente. Ti consigliamo di consultare
                regolarmente questa pagina per essere informato su eventuali modifiche.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
                8. Contatti
              </h2>
              <p className="text-white/70">
                Per qualsiasi domanda relativa all&apos;uso dei cookie, puoi contattarci al numero{' '}
                <a href="tel:+393271263091" className="text-[#F4662F] hover:underline">
                  +39 327 126 3091
                </a>{' '}
                o consultare la nostra{' '}
                <Link href="/privacy" className="text-[#F4662F] hover:underline">
                  Privacy Policy
                </Link>.
              </p>
            </section>
          </div>

          <div className="mt-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#F4662F] hover:text-[#FF8555] transition-colors"
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
