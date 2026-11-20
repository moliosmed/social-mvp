'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const supabase = createClient()

  // التقاط رابط الدعوة
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref')
    if (ref) localStorage.setItem('ref_code', ref)
  }, [])

  // تسجيل الدعوة
  const recordReferral = async (newUserId: string) => {
    const ref = localStorage.getItem('ref_code')
    if (!ref) return
    try {
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .or(`username.eq.${ref},id.eq.${ref}`)
        .single()
      if (referrer && referrer.id !== newUserId) {
        await supabase.from('referrals').insert({ referrer_id: referrer.id, referred_id: newUserId }).then(() => {}, () => {})
      }
      localStorage.removeItem('ref_code')
    } catch {}
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: email.split('@')[0] } }
        })
        if (error) throw error
        if (data?.user) await recordReferral(data.user.id)
        setMessage('تم إنشاء الحساب! يمكنك الدخول الآن.')
        setIsSignUp(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = '/'
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {isSignUp ? 'إنشاء حساب جديد' : 'مرحبا بك'}
            </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? 'انضم إلينا' : 'سجل دخولك للمتابعة'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="space-y-4">
            <input
              type="email"
              required
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {message && (
            <div className={`text-sm text-center ${message.includes('تم') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? 'جاري التحميل...' : (isSignUp ? 'تسجيل' : 'دخول')}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            {isSignUp ? 'لديك حساب؟ سجل دخول' : "ليس لديك حساب؟ سجل الآن"}
          </button>
        </div>
      </div>
    </div>
  )
}