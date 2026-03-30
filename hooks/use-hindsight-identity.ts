'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useHindsightIdentity(activeProfileId: string) {
  const [userId, setUserId] = useState(`local:${activeProfileId}`)
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!isMounted) return
      setUserId(data.user?.id ?? `local:${activeProfileId}`)
    }

    loadUser()
    return () => {
      isMounted = false
    }
  }, [activeProfileId, supabase.auth])

  return { userId, profileId: activeProfileId }
}

