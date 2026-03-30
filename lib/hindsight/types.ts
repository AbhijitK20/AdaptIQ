export type HindsightEventType =
  | 'quiz_result'
  | 'diagnosis'
  | 'recommendation'
  | 'concept_interaction'
  | 'progress_snapshot'
  | 'reminder'

export interface HindsightStructuredEvent {
  eventType: HindsightEventType
  userId: string
  profileId: string
  subject?: string
  chapter?: string
  conceptId?: string
  conceptName?: string
  isCorrect?: boolean
  accuracy?: number
  reasonTag?: string
  recommendationAccepted?: boolean
  metadata?: Record<string, string>
  timestamp?: string
}

export interface HindsightReflectResult {
  text: string
  structured_output?: unknown
}

