/**
 * Script one-shot per rimuovere appuntamenti duplicati
 * Eseguire con: npx tsx scripts/fix-duplicate-appointments.ts
 */

import 'dotenv/config'

const PAYLOAD_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

async function fixDuplicates() {
  console.log('Fetching future appointments...')

  // Get today's date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  // Fetch all future non-cancelled appointments via Payload REST API
  const res = await fetch(
    `${PAYLOAD_URL}/api/appointments?where[date][greater_than_equal]=${todayStr}&where[status][not_equals]=cancelled&limit=500&sort=date,time`,
  )

  if (!res.ok) {
    console.error('Failed to fetch appointments:', res.status)
    process.exit(1)
  }

  const data = await res.json()
  const appointments = data.docs || []

  console.log(`Found ${appointments.length} future appointments`)

  // Group by date + time
  const groups = new Map<string, typeof appointments>()
  for (const apt of appointments) {
    const dateStr = new Date(apt.date).toISOString().split('T')[0]
    const key = `${dateStr}_${apt.time}`
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(apt)
  }

  // Find duplicates
  let fixed = 0
  for (const [key, group] of groups) {
    if (group.length <= 1) continue

    console.log(`\nDuplicate found: ${key} (${group.length} appointments)`)

    // Keep the oldest (first created), cancel the rest
    const sorted = group.sort((a: { createdAt: string }, b: { createdAt: string }) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    const keeper = sorted[0]
    console.log(`  KEEPING: ${keeper.id} - ${keeper.clientName} (created ${keeper.createdAt})`)

    for (let i = 1; i < sorted.length; i++) {
      const dup = sorted[i]
      console.log(`  CANCELLING: ${dup.id} - ${dup.clientName} (created ${dup.createdAt})`)

      const cancelRes = await fetch(`${PAYLOAD_URL}/api/appointments/${dup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          cancellationReason: 'Duplicato automatico rimosso',
        }),
      })

      if (cancelRes.ok) {
        fixed++
        console.log(`    -> Cancelled successfully`)
      } else {
        console.error(`    -> Failed to cancel: ${cancelRes.status}`)
      }
    }
  }

  console.log(`\nDone. Fixed ${fixed} duplicate appointments.`)
}

fixDuplicates().catch(console.error)
