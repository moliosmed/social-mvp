'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Auth from '@/components/Auth'
import Feed from '@/components/Feed'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-xl">جاري التحميل...</p></div>
  }

  if (!user) return <Auth />
  return <Feed />
}