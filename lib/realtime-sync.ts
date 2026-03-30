/**
 * Real-time data synchronization utility
 * Dispatches events when data changes so all components can refresh
 */

export type SyncEventType = 
  | 'mastery-updated'
  | 'question-answered'
  | 'practice-session-updated'

export interface SyncEvent {
  type: SyncEventType
  timestamp: number
  data?: {
    conceptId?: string
    questionId?: string
    isCorrect?: boolean
    userId?: string
    profileId?: string
  }
}

const SYNC_EVENT_NAME = 'adaptiq:data-sync'

/**
 * Dispatch a sync event to notify all listening components
 */
export function dispatchSyncEvent(event: SyncEvent) {
  if (typeof window === 'undefined') return
  
  window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { 
    detail: event 
  }))
}

/**
 * Subscribe to sync events
 * Returns cleanup function to remove listener
 */
export function subscribeSyncEvents(callback: (event: SyncEvent) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<SyncEvent>
    callback(customEvent.detail)
  }
  
  window.addEventListener(SYNC_EVENT_NAME, handler)
  
  return () => {
    window.removeEventListener(SYNC_EVENT_NAME, handler)
  }
}

/**
 * Helper to dispatch mastery update event
 */
export function notifyMasteryUpdated(data: {
  conceptId: string
  userId: string
  profileId: string
  isCorrect: boolean
}) {
  dispatchSyncEvent({
    type: 'mastery-updated',
    timestamp: Date.now(),
    data,
  })
}

/**
 * Helper to dispatch question answered event
 */
export function notifyQuestionAnswered(data: {
  questionId: string
  conceptId: string
  isCorrect: boolean
  userId: string
}) {
  dispatchSyncEvent({
    type: 'question-answered',
    timestamp: Date.now(),
    data,
  })
}
