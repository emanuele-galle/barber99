import { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export const metadata: Metadata = {
  title: "Termini e Condizioni | Barber 99 Serra San Bruno",
  description: "Termini e condizioni di utilizzo del sito web di Barber 99.",
}

export default function TerminiPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0c0c0c] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-white mb-8"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            Termini e Condizioni
          </h1>
          <p className="text-white/50 text-sm mb-8">Ultimo aggiornamento: Febbraio 2026</p>

          <div className="text-white/70 leading-relaxed">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "var(--font-cinzel), serif" }}>
                1. Oggetto
              </h2>
              <p className="text-white/70">
                I presenti Termini e Condizioni disciplinano l&apos;utilizzo del sito web di Barber 99,
                barbershop situato a Serra San Bruno (VV). L&apos;accesso e l&apos;utilizzo del sito implicano
                l&apos;accettazione integrale dei presenti termini.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "var(--font-cinzel), serif" }}>
                2. Servizi Offerti
              </h2>
              <p className="text-white/70 mb-3">
                Attraverso il sito web, Barber 99 offre:
              </p>
              <ul className="list-disc list-inside text-white/70 space-y-1 ml-2">
                <li>Informazioni sui servizi di barberia disponibili</li>
                <li>Galleria fotografica dei lavori realizzati</li>
                <li>Contatti e orari di apertura</li>
                <li>Sistema di prenotazione appuntamenti</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "var(--font-cinzel), serif" }}>
                3. Prenotazioni
              </h2>
              <p className="text-white/70">
                Le prenotazioni effettuate tramite il sito sono soggette a disponibilità.
                L&apos;utente è tenuto a presentarsi all&apos;orario concordato o a cancellare/modificare
                la prenotazione con adeguato preavviso. Ripetute mancate presentazioni potranno comportare
                la sospensione del servizio di prenotazione online.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "var(--font-cinzel), serif" }}>
                4. Proprietà Intellettuale
              </h2>
              <p className="text-white/70">
                Tutti i contenuti del sito (testi, immagini, logo, grafica) sono di proprietà di Barber 99
                o dei rispettivi titolari e sono protetti dalle leggi sul diritto d&apos;autore.
                È vietata la riproduzione, anche parziale, senza autorizzazione scritta.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "var(--font-cinzel), serif" }}>
                5. Limitazione di Responsabilità
              </h2>
              <p className="text-white/70">
                Barber 99 si impegna a mantenere le informazioni del sito accurate e aggiornate,
                ma non garantisce la completezza o l&apos;esattezza dei contenuti. Il sito è fornito
                &quot;così com&apos;è&quot; senza garanzie di alcun tipo.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "var(--font-cinzel), serif" }}>
                6. Legge Applicabile
              </h2>
              <p className="text-white/70">
                I presenti termini sono regolati dalla legge italiana.
                Per qualsiasi controversia sarà competente il Foro di Vibo Valentia.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: "var(--font-cinzel), serif" }}>
                7. Contatti
              </h2>
              <p className="text-white/70">
                Per qualsiasi domanda relativa ai presenti termini, puoi contattarci al numero{" "}
                <a href="tel:+393271263091" className="text-[#d4a855] hover:underline">
                  +39 327 126 3091
                </a>{" "}o via email a{" "}
                <a href="mailto:info@barber99.it" className="text-[#d4a855] hover:underline">
                  info@barber99.it
                </a>.
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
