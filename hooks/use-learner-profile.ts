import { useCallback, useEffect, useState } from 'react'
import { defaultProfileId } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'adaptiq.activeProfileId'
const PROFILE_EVENT = 'adaptiq:profile-change'

export function useLearnerProfile() {
  const [activeProfileId, setActiveProfileId] = useState(defaultProfileId)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    const load = async () => {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored && mounted) {
        setActiveProfileId(stored)
      }

      const { data } = await supabase.auth.getUser()
      const metadataProfileId = data.user?.user_metadata?.active_profile_id as string | undefined
      if (metadataProfileId && mounted) {
        setActiveProfileId(metadataProfileId)
        window.localStorage.setItem(STORAGE_KEY, metadataProfileId)
      }
    }

    void load()
    return () => {
      mounted = false
    }
  }, [supabase.auth])

  useEffect(() => {
    const syncProfile = (event: Event) => {
      const customEvent = event as CustomEvent<string>
      if (customEvent.detail) {
        setActiveProfileId(customEvent.detail)
      } else {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (stored) setActiveProfileId(stored)
      }
    }

    window.addEventListener(PROFILE_EVENT, syncProfile)
    window.addEventListener('storage', syncProfile)

    return () => {
      window.removeEventListener(PROFILE_EVENT, syncProfile)
      window.removeEventListener('storage', syncProfile)
    }
  }, [])

  const updateProfile = useCallback(async (nextProfileId: string) => {
    setActiveProfileId(nextProfileId)
    window.localStorage.setItem(STORAGE_KEY, nextProfileId)
    window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: nextProfileId }))
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      await supabase.auth.updateUser({
        data: { ...data.user.user_metadata, active_profile_id: nextProfileId },
      })
    }
  }, [supabase])

  return { activeProfileId, setActiveProfileId: updateProfile }
}
