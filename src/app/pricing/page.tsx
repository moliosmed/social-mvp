'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Check, X, Sparkles, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

const FREE_FEATURES = [
  'إنشاء منشورات نصية',
  'إضافة صور',
  'الإعجاب بالمنشورات',
  'التعليقات',
  'متابعة المستخدمين',
]

const PREMIUM_FEATURES = [
  'كل مميزات المجاني',
  'علامة التوثيق ✓',
  'بدون إعلانات',
  'أولوية في الظهور',
  'إحصائيات متقدمة',
  'دعم أولوية',
]

export default function Pricing() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
    }
    getData()

    // التحقق من نجاح الدفع
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === '1') {
      setSuccess(true)
      // تحديث حالة البروفايل
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => setProfile(data))
      }
    }
  }, [])

  const handleSubscribe = async () => {
    if (!user) { window.location.href = '/'; return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payzone/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan: 'premium_monthly' })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'حدث خطأ، حاول مرة أخرى')
      }
    } catch (e: any) {
      setError('حدث خطأ: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const isPremium = profile?.premium

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft size={20} /> رجوع
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            <span className="text-blue-600">Molios Empire</span> Premium
          </h1>
          <p className="text-gray-500 text-lg">طور تجربتك و ادعم المنصة</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-center">
            🎉 تم الاشتراك بنجاح! مرحبا بك في Premium
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* المجاني */}
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">مجاني</h2>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              0 <span className="text-base font-normal text-gray-500">MAD / شهر</span>
            </div>
            <p className="text-gray-500 text-sm mb-6">للأبد</p>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-400 font-semibold"
            >
              خطتك الحالية
            </button>
          </div>

          {/* البريميوم */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-500 relative">
            <div className="absolute -top-3 right-6 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles size={12} /> موصى به
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium</h2>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              29.90 <span className="text-base font-normal text-gray-500">MAD / شهر</span>
            </div>
            <p className="text-gray-500 text-sm mb-6">إلغاء في أي وقت</p>
            <ul className="space-y-3 mb-8">
              {PREMIUM_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-blue-500 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {isPremium ? (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold flex items-center justify-center gap-2"
              >
                <Check size={18} /> أنت Premium ✓
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {loading ? 'جاري التحضير...' : 'اشترك الآن'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          الدفع آمن و مشفر بواسطة <span className="font-semibold">PayZone</span>
        </p>
      </div>
    </div>
  )
}
