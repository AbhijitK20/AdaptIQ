'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProgramCatalogEntry } from '@/lib/types'
import { fetchRealtimeProgramFromCatalog } from '@/lib/live-data'
import { subscribeSyncEvents } from '@/lib/realtime-sync'

export interface FastDataFetchState {
  program: ProgramCatalogEntry | null
  authUserId: string | undefined
  isLoading: boolean
  error: Error | null
}

/**
 * Fast data fetching hook that:
 * - Gets auth user ID immediately
 * - Fetches program data in parallel
 * - Sets up real-time subscriptions
 * - Listens for client-side sync events for immediate updates
 * - Used across dashboard, knowledge-map, practice pages
 */
export function useFastDataFetch(activeProfileId: string, fallbackProgram: ProgramCatalogEntry | null) {
  const supabase = createClient()
  const [state, setState] = useState<FastDataFetchState>({
    program: fallbackProgram,
    authUserId: undefined,
    isLoading: true,
    error: null,
  })

  // Refetch program data
  const refetchProgram = useCallback(async () => {
    if (!state.authUserId || !fallbackProgram) return
    try {
      const updated = await fetchRealtimeProgramFromCatalog(
        supabase,
        fallbackProgram.profile,
        state.authUserId,
      )
      if (updated) {
        setState((prev) => ({
          ...prev,
          program: updated,
        }))
      }
    } catch (e) {
      console.error('Failed to update program data:', e)
    }
  }, [state.authUserId, fallbackProgram, supabase])

  useEffect(() => {
    let mounted = true
    let channel: any = null

    const load = async () => {
      try {
        // Step 1: Get auth user ID immediately
        const { data } = await supabase.auth.getUser()
        if (!mounted) return

        setState((prev) => ({
          ...prev,
          authUserId: data.user?.id,
        }))

        // Step 2: Fetch program data in parallel
        if (fallbackProgram) {
          const realtimeProgram = await fetchRealtimeProgramFromCatalog(
            supabase,
            fallbackProgram.profile,
            data.user?.id,
          )

          if (!mounted) return

          setState((prev) => ({
            ...prev,
            program: realtimeProgram || prev.program,
            isLoading: false,
          }))

          // Step 3: Set up real-time subscription
          if (data.user?.id && realtimeProgram) {
            channel = supabase
              .channel(`fast_mastery_${data.user.id}_${activeProfileId}`)
              .on(
                'postgres_changes',
                {
                  event: '*',
                  schema: 'public',
                  table: 'user_catalog_mastery',
                  filter: `user_id=eq.${data.user.id}`,
                },
                async () => {
                  try {
                    const updated = await fetchRealtimeProgramFromCatalog(
                      supabase,
                      fallbackProgram.profile,
                      data.user?.id,
                    )
                    if (mounted && updated) {
                      setState((prev) => ({
                        ...prev,
                        program: updated,
                      }))
                    }
                  } catch (e) {
                    console.error('Failed to update program data:', e)
                  }
                },
              )
              .subscribe()
          }
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
          }))
        }
      } catch (error) {
        console.error('Failed to load fast data:', error)
        if (mounted) {
          setState((prev) => ({
            ...prev,
            error: error as Error,
            isLoading: false,
          }))
        }
      }
    }

    void load()

    return () => {
      mounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [activeProfileId, fallbackProgram, supabase])

  // Listen for client-side sync events for immediate UI updates
  useEffect(() => {
    const unsubscribe = subscribeSyncEvents((event) => {
      if (event.type === 'mastery-updated') {
        void refetchProgram()
      }
    })

    return unsubscribe
  }, [refetchProgram])

  return state
}
