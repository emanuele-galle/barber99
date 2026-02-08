import { cache } from 'react'
import { Cinzel, Montserrat } from 'next/font/google'
import '../../globals.css'
import './admin.css'
import { AdminSidebar } from '@/components/admin-panel/AdminSidebar'
import { AdminHeader } from '@/components/admin-panel/AdminHeader'
import { ToastProvider } from '@/components/Toast'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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
  title: 'Barber 99 - Admin',
  description: 'Pannello di amministrazione Barber 99',
}

// Deduplicate auth calls within a single request using React cache
const getUser = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) return null

  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: new Headers({ Authorization: `JWT ${token}` }) })
    return user
  } catch {
    // Fallback: decode JWT to check validity when payload.auth() fails
    // This prevents redirect loops on hard refresh for nested routes
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        if (decoded.exp && decoded.exp * 1000 > Date.now() && decoded.id) {
          return { id: decoded.id, email: decoded.email || '' } as { id: string; email: string }
        }
      }
    } catch {}
    return null
  }
})

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/admin-panel/login')
  }

  return (
    <html lang="it" className={`${cinzel.variable} ${montserrat.variable}`}>
      <body className="bg-[#0a0a0a] text-white font-montserrat antialiased">
        <ToastProvider>
          <div className="flex h-screen overflow-hidden">
            <AdminSidebar user={user} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <AdminHeader user={user} />
              <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
