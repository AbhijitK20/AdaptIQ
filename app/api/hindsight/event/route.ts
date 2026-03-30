import { NextResponse } from 'next/server'
import { retainHindsightEvent, isHindsightEnabled } from '@/lib/hindsight/server'
import type { HindsightStructuredEvent } from '@/lib/hindsight/types'
import { createClient } from '@/lib/supabase/server'

function isEventPayload(payload: unknown): payload is HindsightStructuredEvent {
  if (!payload || typeof payload !== 'object') return false
  const candidate = payload as Partial<HindsightStructuredEvent>
  return Boolean(candidate.eventType && candidate.userId && candidate.profileId)
}

export async function POST(request: Request) {
  if (!isHindsightEnabled()) {
    return NextResponse.json({ ok: true, skipped: 'hindsight-disabled' })
  }

  const body = await request.json().catch(() => null)
  if (!isEventPayload(body)) {
    return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const eventPayload: HindsightStructuredEvent = {
      ...body,
      userId: user?.id ?? body.userId,
    }

    await retainHindsightEvent(eventPayload)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retain event', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

