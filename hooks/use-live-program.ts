'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getActiveProgram,
} from '@/lib/data'
import { createClient } from '@/lib/supabase/client'
import { fetchRealtimeProgramFromCatalog } from '@/lib/live-data'
import { subscribeSyncEvents } from '@/lib/realtime-sync'
import type { ProgramCatalogEntry } from '@/lib/types'

// Empty program structure for loading state
const createEmptyProgram = (profileId: string): ProgramCatalogEntry => ({
  profile: { id: profileId, label: '', trackType: 'school', preferredSubjects: [] },
  subjects: [],
  chapters: [],
  modules: [],
  concepts: [],
  conceptDependencies: [],
  questions: [],
  quizzes: [],
})

export function useLiveProgram(activeProfileId: string) {
  const supabase = createClient()
  const fallbackProgram = useMemo(() => getActiveProgram(activeProfileId), [activeProfileId])
  const [program, setProgram] = useState<ProgramCatalogEntry | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authUserId, setAuthUserId] = useState<string | undefined>()

  // Refetch program data
  const refetchProgram = useCallback(async () => {
    if (!authUserId) return
    try {
      const updatedProgram = await fetchRealtimeProgramFromCatalog(supabase, fallbackProgram.profile, authUserId)
      if (updatedProgram) {
        setProgram(updatedProgram)
      }
    } catch (e) {
      console.error('Failed to update program data:', e)
    }
  }, [authUserId, fallbackProgram.profile, supabase])

  useEffect(() => {
    let mounted = true
    let channel: any = null

    const load = async () => {
      setIsLoading(true)
      try {
        const { data } = await supabase.auth.getUser()
        if (!mounted) return
        
        setAuthUserId(data.user?.id)
        
        const realtimeProgram = await fetchRealtimeProgramFromCatalog(supabase, fallbackProgram.profile, data.user?.id)
        if (!mounted) return
        
        if (realtimeProgram) {
          setProgram(realtimeProgram)
          setIsLive(true)
        } else {
          // Only use fallback if DB fetch fails
          setProgram(fallbackProgram)
          setIsLive(false)
        }
        setIsLoading(false)

        // Set up real-time subscription after successful load
        if (data.user?.id && mounted) {
          channel = supabase
            .channel(`user_mastery_${data.user.id}_${activeProfileId}`)
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
                  const updatedProgram = await fetchRealtimeProgramFromCatalog(supabase, fallbackProgram.profile, data.user?.id)
                  if (mounted && updatedProgram) {
                    setProgram(updatedProgram)
                  }
                } catch (e) {
                  console.error('Failed to update program data:', e)
                }
              },
            )
            .subscribe()
        }
      } catch (error) {
        console.error('Failed to load program:', error)
        if (mounted) {
          setProgram(fallbackProgram)
          setIsLive(false)
          setIsLoading(false)
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

  // Also listen for client-side sync events for immediate UI updates
  useEffect(() => {
    const unsubscribe = subscribeSyncEvents((event) => {
      if (event.type === 'mastery-updated') {
        // Refetch program data when mastery is updated locally
        void refetchProgram()
      }
    })

    return unsubscribe
  }, [refetchProgram])

  // Use empty program during loading, actual program when loaded
  const currentProgram = program ?? createEmptyProgram(activeProfileId)

  const stats = useMemo(() => {
    const total = currentProgram.concepts.length
    const mastered = currentProgram.concepts.filter((concept) => concept.status === 'mastered').length
    const weak = currentProgram.concepts.filter((concept) => concept.status === 'weak').length
    const missing = currentProgram.concepts.filter((concept) => concept.status === 'missing').length
    const avgAccuracy = total > 0
      ? currentProgram.concepts.reduce((sum, concept) => sum + (concept.accuracy ?? 0), 0) / total
      : 0
    return {
      total,
      mastered,
      weak,
      missing,
      avgAccuracy,
      masteredPercent: total > 0 ? Math.round((mastered / total) * 100) : 0,
      weakPercent: total > 0 ? Math.round((weak / total) * 100) : 0,
      missingPercent: total > 0 ? Math.round((missing / total) * 100) : 0,
    }
  }, [currentProgram.concepts])

  const weakConcepts = useMemo(
    () => [...currentProgram.concepts]
      .filter((concept) => concept.status === 'weak' || concept.status === 'missing')
      .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1)),
    [currentProgram.concepts],
  )

  const suggestedConcept = useMemo(
    () => weakConcepts[0] ?? null,
    [weakConcepts],
  )

  const adaptiveRecommendation = useMemo(() => {
    const conceptMap = new Map(currentProgram.concepts.map((concept) => [concept.id, concept]))
    const missingPrerequisite = currentProgram.conceptDependencies
      .map((dependency) => conceptMap.get(dependency.parentConceptId))
      .find((concept) => concept?.status === 'missing')
    if (missingPrerequisite) return { concept: missingPrerequisite, reason: 'missing-prerequisite' as const }

    const weakConcept = [...currentProgram.concepts]
      .filter((concept) => concept.status === 'weak')
      .sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1))[0]
    if (weakConcept) return { concept: weakConcept, reason: 'weak-concept' as const }

    const nextUnlocked = currentProgram.concepts.find((concept) => concept.status !== 'mastered')
    if (nextUnlocked) return { concept: nextUnlocked, reason: 'next-unlocked' as const }

    return null
  }, [currentProgram.conceptDependencies, currentProgram.concepts])

  return {
    program: currentProgram,
    stats,
    weakConcepts,
    suggestedConcept,
    adaptiveRecommendation,
    isLive,
    isLoading,
  }
}

