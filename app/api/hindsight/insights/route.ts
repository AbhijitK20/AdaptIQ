import { NextResponse } from 'next/server'
import { isHindsightEnabled, recallHindsight, reflectHindsight } from '@/lib/hindsight/server'
import { createClient } from '@/lib/supabase/server'

type InsightRequest = {
  userId: string
  profileId: string
  query: string
  subject?: string
}

function isInsightRequest(payload: unknown): payload is InsightRequest {
  if (!payload || typeof payload !== 'object') return false
  const candidate = payload as Partial<InsightRequest>
  return Boolean(candidate.userId && candidate.profileId && candidate.query)
}

export async function POST(request: Request) {
  if (!isHindsightEnabled()) {
    return NextResponse.json({ ok: true, skipped: 'hindsight-disabled', insight: null })
  }

  const body = await request.json().catch(() => null)
  if (!isInsightRequest(body)) {
    return NextResponse.json({ error: 'Invalid insight payload' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const resolvedUserId = user?.id ?? body.userId

    const [recall, reflection] = await Promise.all([
      recallHindsight({
        userId: resolvedUserId,
        profileId: body.profileId,
        query: body.query,
        subject: body.subject,
        maxTokens: 600,
      }),
      reflectHindsight({
        userId: resolvedUserId,
        profileId: body.profileId,
        query: body.query,
        subject: body.subject,
        maxTokens: 220,
      }),
    ])

    return NextResponse.json({
      ok: true,
      insight: reflection.text,
      recall: recall.slice(0, 8),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to build insight', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

