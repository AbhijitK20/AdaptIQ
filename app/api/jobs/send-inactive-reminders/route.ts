import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getReminderFallbackNudge, isHindsightEnabled, reflectHindsight, retainHindsightEvent } from '@/lib/hindsight/server'

type ReminderStateRow = {
  user_id: string
  last_known_activity_at: string
  last_reminder_sent_at: string | null
  reminder_count: number
  updated_at?: string
}

const DAY_MS = 24 * 60 * 60 * 1000
const FIRST_REMINDER_DAYS = 2
const REPEAT_REMINDER_DAYS = 7

function diffDays(fromIso: string, to: Date) {
  return Math.floor((to.getTime() - new Date(fromIso).getTime()) / DAY_MS)
}

async function sendReminderEmail(params: {
  apiKey: string
  from: string
  to: string
  appUrl: string
  displayName: string
  nudgeText: string
}) {
  const subject = 'You left your course incomplete — continue your learning journey'
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin-bottom: 8px;">Hi ${params.displayName},</h2>
      <p>You haven’t been active on AdaptIQ recently, and your course progress is waiting for you.</p>
      <p>${params.nudgeText}</p>
      <p>Come back and complete what you started — even a short session today will move you forward.</p>
      <p>
        <a href="${params.appUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
          Continue Learning
        </a>
      </p>
      <p style="font-size: 13px; color: #6b7280;">If you’re already back, you can ignore this email.</p>
    </div>
  `

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject,
      html,
      text: `Hi ${params.displayName},\n\nYou haven’t been active on AdaptIQ recently, and your course progress is waiting for you.\n${params.nudgeText}\n\nContinue learning here: ${params.appUrl}\n\nIf you’re already back, ignore this email.`,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend API error (${response.status}): ${body}`)
  }
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const resendApiKey = process.env.RESEND_API_KEY
  const reminderFromEmail = process.env.REMINDER_FROM_EMAIL
  const reminderAppUrl = process.env.REMINDER_APP_URL || 'http://localhost:3000'
  const reminderJobSecret = process.env.REMINDER_JOB_SECRET

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Missing SUPABASE env vars: NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY' },
      { status: 500 },
    )
  }

  if (!resendApiKey || !reminderFromEmail) {
    return NextResponse.json(
      { error: 'Missing email env vars: RESEND_API_KEY/REMINDER_FROM_EMAIL' },
      { status: 500 },
    )
  }

  if (!reminderJobSecret) {
    return NextResponse.json({ error: 'Missing REMINDER_JOB_SECRET' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization') || ''
  const providedSecret = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : request.headers.get('x-job-secret')

  if (providedSecret !== reminderJobSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const dryRun = url.searchParams.get('dryRun') === '1'

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const stateMap = new Map<string, ReminderStateRow>()
  const { data: existingStates, error: stateError } = await admin
    .from('user_reminder_state')
    .select('user_id,last_known_activity_at,last_reminder_sent_at,reminder_count')

  if (stateError) {
    return NextResponse.json(
      {
        error:
          'Failed to read user_reminder_state. Ensure table exists (see scripts/sql/create_reminder_state_table.sql).',
        details: stateError.message,
      },
      { status: 500 },
    )
  }

  for (const row of (existingStates as ReminderStateRow[]) ?? []) {
    stateMap.set(row.user_id, row)
  }

  const now = new Date()
  const sentTo: string[] = []
  const skipped: string[] = []
  const upserts: ReminderStateRow[] = []

  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) {
      return NextResponse.json({ error: `Failed to list users: ${error.message}` }, { status: 500 })
    }

    const users = data.users ?? []
    for (const user of users) {
      if (!user.email || !user.last_sign_in_at && !user.created_at) {
        skipped.push(user.id)
        continue
      }

      const currentActivityIso = user.last_sign_in_at ?? user.created_at
      const existing = stateMap.get(user.id)
      let reminderCount = existing?.reminder_count ?? 0
      let lastReminderSentAt = existing?.last_reminder_sent_at ?? null
      let lastKnownActivityAt = existing?.last_known_activity_at ?? currentActivityIso

      if (new Date(currentActivityIso).getTime() > new Date(lastKnownActivityAt).getTime()) {
        reminderCount = 0
        lastReminderSentAt = null
        lastKnownActivityAt = currentActivityIso
      }

      const inactiveDays = diffDays(currentActivityIso, now)
      let shouldSend = false

      if (reminderCount === 0 && inactiveDays >= FIRST_REMINDER_DAYS) {
        shouldSend = true
      } else if (reminderCount > 0 && lastReminderSentAt) {
        const daysSinceLastReminder = diffDays(lastReminderSentAt, now)
        shouldSend = daysSinceLastReminder >= REPEAT_REMINDER_DAYS
      }

      if (shouldSend) {
        const profileId = (user.user_metadata?.active_profile_id as string | undefined) ?? 'unknown'
        let nudgeText = getReminderFallbackNudge()

        if (isHindsightEnabled()) {
          try {
            const reflection = await reflectHindsight({
              userId: user.id,
              profileId,
              query: 'Write one short, supportive reminder line to motivate the learner to resume unfinished study.',
              maxTokens: 120,
            })
            if (reflection.text.trim().length > 0) {
              nudgeText = reflection.text.trim()
            }
          } catch {
            nudgeText = getReminderFallbackNudge()
          }
        }

        if (!dryRun) {
          await sendReminderEmail({
            apiKey: resendApiKey,
            from: reminderFromEmail,
            to: user.email,
            appUrl: reminderAppUrl,
            displayName:
              `${user.user_metadata?.first_name ?? ''}`.trim() ||
              user.email.split('@')[0] ||
              'Learner',
            nudgeText,
          })
        }
        reminderCount += 1
        lastReminderSentAt = now.toISOString()
        sentTo.push(user.email)

        if (isHindsightEnabled()) {
          await retainHindsightEvent({
            eventType: 'reminder',
            userId: user.id,
            profileId,
            reasonTag: reminderCount === 1 ? 'first-reminder' : 'repeat-reminder',
            metadata: {
              email: user.email,
              dry_run: String(dryRun),
            },
            timestamp: now.toISOString(),
          })
        }
      } else {
        skipped.push(user.email)
      }

      upserts.push({
        user_id: user.id,
        last_known_activity_at: lastKnownActivityAt,
        last_reminder_sent_at: lastReminderSentAt,
        reminder_count: reminderCount,
      })
    }

    if (users.length < perPage) break
    page += 1
  }

  if (upserts.length > 0) {
    const { error: upsertError } = await admin.from('user_reminder_state').upsert(upserts, {
      onConflict: 'user_id',
    })
    if (upsertError) {
      return NextResponse.json(
        { error: `Failed to upsert reminder state: ${upsertError.message}` },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    sentCount: sentTo.length,
    skippedCount: skipped.length,
    sentTo,
  })
}

