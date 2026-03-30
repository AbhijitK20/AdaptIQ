'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AccuracyData {
  day: string
  accuracy: number
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const EMPTY_WEEK: AccuracyData[] = WEEK_DAYS.map((day) => ({ day, accuracy: 0 }))

export function useAccuracyOverTime(authUserId?: string) {
  const supabase = createClient()
  const [data, setData] = useState<AccuracyData[]>(EMPTY_WEEK)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Skip if no valid auth user ID
    if (!authUserId || authUserId.startsWith('local:')) {
      setData(EMPTY_WEEK)
      setIsLoading(false)
      return
    }

    let mounted = true
    let questionsChannel: any = null
    let masteryChannel: any = null

    const fetchAccuracyData = async () => {
      try {
        // Fetch question attempts from the last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: attempts, error: attemptsError } = await supabase
          .from('question_attempts')
          .select('id, created_at, is_correct')
          .eq('user_id', authUserId)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: true })

        // Also fetch mastery updates from the last 7 days as fallback
        const { data: masteryUpdates, error: masteryError } = await supabase
          .from('user_catalog_mastery')
          .select('concept_id, mastery_level, updated_at')
          .eq('user_id', authUserId)
          .gte('updated_at', sevenDaysAgo.toISOString())
          .order('updated_at', { ascending: true })

        if (attemptsError && masteryError) throw attemptsError || masteryError
        if (!mounted) return

        // Build a map of all 7 days with stats
        const dailyStats = new Map<string, { correct: number; total: number }>()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Initialize all 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          const dayKey = date.toISOString().split('T')[0]
          dailyStats.set(dayKey, { correct: 0, total: 0 })
        }

        // Process question attempts if available
        if (attempts && attempts.length > 0) {
          attempts.forEach((attempt) => {
            const attemptDate = new Date(attempt.created_at)
            attemptDate.setHours(0, 0, 0, 0)
            const dayKey = attemptDate.toISOString().split('T')[0]
            
            const stats = dailyStats.get(dayKey)
            if (stats) {
              stats.total++
              if (attempt.is_correct) {
                stats.correct++
              }
            }
          })
        } else if (masteryUpdates && masteryUpdates.length > 0) {
          // Fallback to mastery updates if no question attempts
          // Use mastery_level as a proxy for accuracy
          masteryUpdates.forEach((update) => {
            if (!update.updated_at) return
            const updateDate = new Date(update.updated_at)
            updateDate.setHours(0, 0, 0, 0)
            const dayKey = updateDate.toISOString().split('T')[0]
            
            const stats = dailyStats.get(dayKey)
            if (stats) {
              stats.total++
              // Consider mastery >= 0.5 as "correct" for chart purposes
              if ((update.mastery_level ?? 0) >= 0.5) {
                stats.correct++
              }
            }
          })
        }

        // Convert to chart data in order
        const chartData: AccuracyData[] = []
        // Get sorted dates
        const sortedEntries = Array.from(dailyStats.entries())
          .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())

        sortedEntries.forEach(([, stats], index) => {
          // Calculate accuracy: 0 if no attempts, otherwise percentage
          const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
          chartData.push({
            day: WEEK_DAYS[index],
            accuracy,
          })
        })

        if (mounted) {
          setData(chartData)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to fetch accuracy data:', error)
        if (mounted) {
          setData(EMPTY_WEEK)
          setIsLoading(false)
        }
      }
    }

    void fetchAccuracyData()

    // Set up real-time subscriptions for both tables
    if (authUserId) {
      questionsChannel = supabase
        .channel(`user_accuracy_questions_${authUserId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'question_attempts',
            filter: `user_id=eq.${authUserId}`,
          },
          async () => {
            await fetchAccuracyData()
          },
        )
        .subscribe()

      masteryChannel = supabase
        .channel(`user_accuracy_mastery_${authUserId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_catalog_mastery',
            filter: `user_id=eq.${authUserId}`,
          },
          async () => {
            await fetchAccuracyData()
          },
        )
        .subscribe()
    }

    return () => {
      mounted = false
      if (questionsChannel) {
        supabase.removeChannel(questionsChannel)
      }
      if (masteryChannel) {
        supabase.removeChannel(masteryChannel)
      }
    }
  }, [authUserId, supabase])

  return { data, isLoading }
}
