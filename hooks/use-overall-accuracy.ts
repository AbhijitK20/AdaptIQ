'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface OverallAccuracyMetrics {
  overallAccuracy: number
  totalAttempts: number
  correctAttempts: number
  isLoading: boolean
}

export function useOverallAccuracy(authUserId?: string, profileId?: string) {
  const supabase = createClient()
  const [metrics, setMetrics] = useState<OverallAccuracyMetrics>({
    overallAccuracy: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    isLoading: true,
  })

  useEffect(() => {
    // Skip if no valid auth user ID or if it's a local ID
    if (!authUserId || authUserId.startsWith('local:')) {
      setMetrics({
        overallAccuracy: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        isLoading: false,
      })
      return
    }

    let mounted = true
    let channel: any = null

    const fetchAccuracy = async () => {
      try {
        // Fetch all question attempts for this user (no date filter - all time)
        const { data: attempts, error } = await supabase
          .from('question_attempts')
          .select('id, is_correct')
          .eq('user_id', authUserId)

        if (error) throw error
        if (!mounted) return

        const totalAttempts = attempts?.length || 0
        const correctAttempts = attempts?.filter((a) => a.is_correct).length || 0
        const overallAccuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0

        if (mounted) {
          setMetrics({
            overallAccuracy,
            totalAttempts,
            correctAttempts,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error('Failed to fetch overall accuracy:', error)
        if (mounted) {
          setMetrics({
            overallAccuracy: 0,
            totalAttempts: 0,
            correctAttempts: 0,
            isLoading: false,
          })
        }
      }
    }

    void fetchAccuracy()

    // Set up real-time subscription to question attempts (listen to all events, not just INSERT)
    if (authUserId) {
      channel = supabase
        .channel(`user_accuracy_all_${authUserId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'question_attempts',
            filter: `user_id=eq.${authUserId}`,
          },
          async () => {
            // Refetch when any attempt is recorded or updated
            await fetchAccuracy()
          },
        )
        .subscribe()
    }

    return () => {
      mounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [authUserId, profileId, supabase])

  return metrics
}
