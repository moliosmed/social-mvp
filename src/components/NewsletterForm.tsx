'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type State = 'idle' | 'loading' | 'done' | 'error' | 'dup'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [msg, setMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const value = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setState('error')
      setMsg('دخل بريد إلكتروني صحيح.')
      return
    }
    setState('loading')
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: value, source: 'web-newsletter' })
      if (error) {
        // 23505 = unique_violation
        if (error.code === '23505') {
          setState('dup')
          setMsg('أنت مسجل من قبل — شكراً! 🌟')
        } else {
          throw error
        }
        return
      }
      setState('done')
      setMsg('تسجيلك تـم! غادي يوصلوك جديد النصائح. 🚀')
    } catch (err: any) {
      setState('error')
      setMsg(err?.message || 'حدث خطأ، عاود من بعد.')
    }
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="بريدك الإلكتروني"
          className="flex-1 rounded-xl bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-6 py-3 transition"
        >
          {state === 'loading' ? 'كايـتسجل...' : 'سجل مجاناً'}
        </button>
      </div>
      {msg && (
        <p
          className={`mt-4 text-center text-sm ${
            state === 'done' || state === 'dup'
              ? 'text-green-400'
              : 'text-red-400'
          }`}
        >
          {msg}
        </p>
      )}
    </form>
  )
}
