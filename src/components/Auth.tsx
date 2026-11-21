'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 pl-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
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