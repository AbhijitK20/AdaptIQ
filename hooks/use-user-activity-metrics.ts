'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UserActivityMetrics {
  questionsAnswered: number
  studyStreak: number
  hoursSpentThisWeek: number
  isLoading: boolean
}

const DEFAULT_METRICS: UserActivityMetrics = {
  questionsAnswered: 0,
  studyStreak: 0,
  hoursSpentThisWeek: 0,
  isLoading: true,
}

export function useUserActivityMetrics(authUserId?: string): UserActivityMetrics {
  const supabase = createClient()
  const [metrics, setMetrics] = useState<UserActivityMetrics>(DEFAULT_METRICS)

  useEffect(() => {
    // Skip if no valid auth user ID or if it's a local ID
    if (!authUserId || authUserId.startsWith('local:')) {
      setMetrics({
        questionsAnswered: 0,
        studyStreak: 0,
        hoursSpentThisWeek: 0,
        isLoading: false,
      })
      return
    }

    let mounted = true

    const fetchMetrics = async () => {
      try {
        const thisMonth = new Date()
        thisMonth.setDate(1)
        thisMonth.setHours(0, 0, 0, 0)

        // Try to fetch from question_attempts first
        const { data: questionAttempts } = await supabase
          .from('question_attempts')
          .select('id, created_at')
          .eq('user_id', authUserId)
          .gte('created_at', thisMonth.toISOString())

        // Also fetch from user_catalog_mastery as fallback/supplement
        const { data: masteryData } = await supabase
          .from('user_catalog_mastery')
          .select('attempts, updated_at')
          .eq('user_id', authUserId)

        // Fetch all practice sessions for this user from last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: sessions } = await supabase
          .from('practice_sessions')
          .select('id, started_at, ended_at')
          .eq('user_id', authUserId)
          .gte('started_at', sevenDaysAgo.toISOString())

        if (!mounted) return

        // Calculate questions answered - use question_attempts if available, otherwise sum from mastery
        let questionsAnsweredCount = 0
        if (questionAttempts && questionAttempts.length > 0) {
          questionsAnsweredCount = questionAttempts.length
        } else if (masteryData && masteryData.length > 0) {
          // Sum all attempts from mastery data
          questionsAnsweredCount = masteryData.reduce((sum, row) => sum + (row.attempts ?? 0), 0)
        }

        // Calculate study streak from mastery updates and sessions
        const studyDates = new Set<string>()
        
        // Add dates from practice sessions
        ;(sessions || []).forEach((session) => {
          if (session.started_at) {
            const date = new Date(session.started_at)
            studyDates.add(date.toISOString().split('T')[0])
          }
        })
        
        // Also consider mastery update dates for streak calculation
        ;(masteryData || []).forEach((row) => {
          if (row.updated_at) {
            const date = new Date(row.updated_at)
            studyDates.add(date.toISOString().split('T')[0])
          }
        })

        const sortedDates = Array.from(studyDates)
          .map((d) => new Date(d))
          .sort((a, b) => b.getTime() - a.getTime())

        let streak = 0
        let currentDate = new Date()
        currentDate.setHours(0, 0, 0, 0)

        for (const date of sortedDates) {
          date.setHours(0, 0, 0, 0)
          const daysDiff = Math.round((currentDate.getTime() - date.getTime()) / (24 * 60 * 60 * 1000))
          if (daysDiff === 0 || daysDiff === 1) {
            streak++
            currentDate = new Date(date)
          } else {
            break
          }
        }

        // Calculate hours spent this week
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        let hoursThisWeek = (sessions || []).reduce((total, session) => {
          if (!session.started_at || !session.ended_at) return total
          const start = new Date(session.started_at)
          const end = new Date(session.ended_at)
          if (start >= oneWeekAgo) {
            return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          }
          return total
        }, 0)

        // If no sessions, estimate based on mastery updates (rough estimate: 1 min per question)
        if (hoursThisWeek === 0 && masteryData && masteryData.length > 0) {
          const recentAttempts = masteryData.filter((row) => {
            if (!row.updated_at) return false
            return new Date(row.updated_at) >= oneWeekAgo
          })
          const totalRecentAttempts = recentAttempts.reduce((sum, row) => sum + (row.attempts ?? 0), 0)
          hoursThisWeek = totalRecentAttempts / 60 // Rough estimate: 1 min per question
        }

        if (mounted) {
          setMetrics({
            questionsAnswered: questionsAnsweredCount,
            studyStreak: streak,
            hoursSpentThisWeek: Math.round(hoursThisWeek * 10) / 10,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error('Failed to fetch user activity metrics:', error)
        if (mounted) {
          setMetrics({
            questionsAnswered: 0,
            studyStreak: 0,
            hoursSpentThisWeek: 0,
            isLoading: false,
          })
        }
      }
    }

    void fetchMetrics()

    // Set up real-time subscriptions for all relevant tables
    let questionsChannel: any = null
    let sessionsChannel: any = null
    let masteryChannel: any = null

    if (authUserId) {
      questionsChannel = supabase
        .channel(`user_questions_${authUserId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'question_attempts',
            filter: `user_id=eq.${authUserId}`,
          },
          () => {
            void fetchMetrics()
          },
        )
        .subscribe()

      sessionsChannel = supabase
        .channel(`user_sessions_${authUserId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'practice_sessions',
            filter: `user_id=eq.${authUserId}`,
          },
          () => {
            void fetchMetrics()
          },
        )
        .subscribe()

      // Also subscribe to mastery changes for real-time sync
      masteryChannel = supabase
        .channel(`user_mastery_metrics_${authUserId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_catalog_mastery',
            filter: `user_id=eq.${authUserId}`,
          },
          () => {
            void fetchMetrics()
          },
        )
        .subscribe()
    }

    return () => {
      mounted = false
      if (questionsChannel) {
        supabase.removeChannel(questionsChannel)
      }
      if (sessionsChannel) {
        supabase.removeChannel(sessionsChannel)
      }
      if (masteryChannel) {
        supabase.removeChannel(masteryChannel)
      }
    }
  }, [authUserId, supabase])

  return metrics
}
