'use client'

import type { HindsightStructuredEvent } from '@/lib/hindsight/types'

export async function trackHindsightEvent(event: HindsightStructuredEvent) {
  try {
    await fetch('/api/hindsight/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })
  } catch (error) {
    // Non-blocking telemetry path: keep UX unaffected if memory service is unavailable.
    console.error('Failed to track Hindsight event', error)
  }
}

export async function reflectWithHindsight(params: {
  userId: string
  profileId: string
  query: string
  subject?: string
}) {
  try {
    const response = await fetch('/api/hindsight/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch Hindsight insight', error)
    return null
  }
}

