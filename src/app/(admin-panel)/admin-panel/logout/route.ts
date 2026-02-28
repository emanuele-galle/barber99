import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function handleLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
  redirect('/admin-panel/login')
}

export async function POST() {
  return handleLogout()
}

export async function GET() {
  return handleLogout()
}
