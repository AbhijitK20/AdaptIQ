import type { HindsightReflectResult, HindsightStructuredEvent } from '@/lib/hindsight/types'

type HindsightMemoryItem = {
  content: string
  context?: string
  timestamp?: string
  document_id?: string
  metadata?: Record<string, string>
  tags?: string[]
}

type HindsightRecallResponse = {
  results?: Array<{
    id: string
    text: string
    type: string
    context?: string | null
    metadata?: Record<string, string> | null
    tags?: string[]
  }>
}

type HindsightReflectResponse = {
  text?: string
  structured_output?: unknown
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function getOptionalEnv(name: string): string | null {
  const value = process.env[name]
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function sanitizeForBankId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')
}

function getHindsightConfig() {
  const baseUrl = getOptionalEnv('HINDSIGHT_API_URL')
  if (!baseUrl) return null

  return {
    baseUrl: baseUrl.replace(/\/+$/, ''),
    apiKey: getOptionalEnv('HINDSIGHT_API_KEY'),
    bankPrefix: getOptionalEnv('HINDSIGHT_BANK_PREFIX') ?? 'adaptiq-user',
  }
}

function getBankId(userId: string) {
  const config = getHindsightConfig()
  if (!config) {
    throw new Error('Hindsight is not configured: set HINDSIGHT_API_URL')
  }
  return `${config.bankPrefix}-${sanitizeForBankId(userId)}`
}

export function isHindsightEnabled() {
  return Boolean(getHindsightConfig())
}

async function callHindsight<T>(path: string, payload: unknown): Promise<T> {
  const config = getHindsightConfig()
  if (!config) {
    throw new Error('Hindsight is not configured: set HINDSIGHT_API_URL')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`
  }

  const response = await fetch(`${config.baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Hindsight API error (${response.status}) at ${path}: ${body}`)
  }

  return (await response.json()) as T
}

function buildEventContent(event: HindsightStructuredEvent) {
  const lines = [
    `Event: ${event.eventType}`,
    `User: ${event.userId}`,
    `Profile: ${event.profileId}`,
  ]

  if (event.subject) lines.push(`Subject: ${event.subject}`)
  if (event.chapter) lines.push(`Chapter: ${event.chapter}`)
  if (event.conceptName) lines.push(`Concept: ${event.conceptName}`)
  if (event.conceptId) lines.push(`Concept ID: ${event.conceptId}`)
  if (typeof event.isCorrect === 'boolean') lines.push(`Correct: ${event.isCorrect}`)
  if (typeof event.accuracy === 'number') lines.push(`Accuracy: ${event.accuracy}`)
  if (event.reasonTag) lines.push(`Reason: ${event.reasonTag}`)
  if (typeof event.recommendationAccepted === 'boolean') {
    lines.push(`Recommendation accepted: ${event.recommendationAccepted}`)
  }

  if (event.metadata) {
    for (const [key, value] of Object.entries(event.metadata)) {
      lines.push(`${key}: ${value}`)
    }
  }

  return lines.join('\n')
}

function buildEventTags(event: HindsightStructuredEvent) {
  const tags = [
    `user:${event.userId}`,
    `profile:${event.profileId}`,
    `event:${event.eventType}`,
  ]
  if (event.subject) tags.push(`subject:${event.subject}`)
  if (event.chapter) tags.push(`chapter:${event.chapter}`)
  if (event.conceptId) tags.push(`concept:${event.conceptId}`)
  return tags
}

export async function retainHindsightEvent(event: HindsightStructuredEvent) {
  const bankId = getBankId(event.userId)
  const timestamp = event.timestamp ?? new Date().toISOString()
  const item: HindsightMemoryItem = {
    content: buildEventContent(event),
    context: `adaptiq:${event.eventType}`,
    timestamp,
    document_id: `${event.eventType}:${event.userId}:${timestamp}`,
    metadata: {
      profile_id: event.profileId,
      ...(event.subject ? { subject: event.subject } : {}),
      ...(event.chapter ? { chapter: event.chapter } : {}),
      ...(event.conceptId ? { concept_id: event.conceptId } : {}),
      ...(event.reasonTag ? { reason_tag: event.reasonTag } : {}),
      ...(event.metadata ?? {}),
    },
    tags: buildEventTags(event),
  }

  await callHindsight(`/v1/default/banks/${encodeURIComponent(bankId)}/memories`, {
    items: [item],
    async: false,
  })
}

export async function recallHindsight(params: {
  userId: string
  profileId: string
  query: string
  subject?: string
  maxTokens?: number
}) {
  const bankId = getBankId(params.userId)
  const tags = [`user:${params.userId}`, `profile:${params.profileId}`]
  if (params.subject) tags.push(`subject:${params.subject}`)

  const response = await callHindsight<HindsightRecallResponse>(
    `/v1/default/banks/${encodeURIComponent(bankId)}/memories/recall`,
    {
      query: params.query,
      types: ['world', 'experience', 'observation'],
      budget: 'mid',
      max_tokens: params.maxTokens ?? 800,
      tags,
      tags_match: 'all_strict',
    },
  )

  return response.results ?? []
}

export async function reflectHindsight(params: {
  userId: string
  profileId: string
  query: string
  subject?: string
  maxTokens?: number
}): Promise<HindsightReflectResult> {
  const bankId = getBankId(params.userId)
  const tags = [`user:${params.userId}`, `profile:${params.profileId}`]
  if (params.subject) tags.push(`subject:${params.subject}`)

  const response = await callHindsight<HindsightReflectResponse>(
    `/v1/default/banks/${encodeURIComponent(bankId)}/reflect`,
    {
      query: params.query,
      budget: 'mid',
      max_tokens: params.maxTokens ?? 300,
      tags,
      tags_match: 'all_strict',
      include: { facts: {} },
    },
  )

  return {
    text: response.text ?? '',
    structured_output: response.structured_output,
  }
}

export function getReminderFallbackNudge() {
  return 'You were making progress in AdaptIQ — come back for a short session and continue where you left off.'
}

export function getHindsightRequiredVarsHint() {
  return ['HINDSIGHT_API_URL', 'HINDSIGHT_API_KEY (optional)', 'HINDSIGHT_BANK_PREFIX (optional)']
}

export function assertReminderEnv() {
  getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
  getRequiredEnv('RESEND_API_KEY')
  getRequiredEnv('REMINDER_FROM_EMAIL')
  getRequiredEnv('REMINDER_JOB_SECRET')
}

