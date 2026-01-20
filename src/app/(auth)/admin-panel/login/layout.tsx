import { Cinzel, Montserrat } from 'next/font/google'
import '@/app/globals.css'
import '@/app/(admin-panel)/admin-panel/admin.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata = {
  title: 'Login - Barber 99 Admin',
  description: 'Accedi al pannello di amministrazione',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className={`${cinzel.variable} ${montserrat.variable}`}>
      <body className="bg-[#0a0a0a] text-white font-montserrat antialiased">
        {children}
      </body>
    </html>
  )
}
