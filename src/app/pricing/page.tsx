'use client'

import { useState, useEffect, useRef } from 'react'
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
  const paypalRef = useRef<any>(null)

  const supabase = createClient()

  // جلب المستخدم و البروفايل
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

    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === '1') setSuccess(true)
  }, [])

  // رندر الـ PayPal button
  useEffect(() => {
    if (!user) return

    const renderPaypal = () => {
      if (!(window as any).paypalSdk?.Buttons) return
      const el = document.getElementById('paypal-subscribe-button')
      if (!el || el.children.length > 0) return
      ;(window as any).paypalSdk.Buttons({
        style: { shape: 'pill', color: 'blue', layout: 'vertical', label: 'subscribe' },
        createSubscription: (data: any, actions: any) => {
          return actions.subscription.create({
            plan_id: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID,
            custom_id: `${user.id}|premium_monthly`,
            subscriber: { name: { given_name: profile?.full_name || profile?.username || 'User' } },
          })
        },
        onApprove: (data: any) => {
          fetch('/api/paypal/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, subscriptionId: data.subscriptionID }),
          }).then(() => {
            setSuccess(true)
            supabase.from('profiles').select('*').eq('id', user.id).single()
              .then(({ data: p }) => setProfile(p))
          })
        },
      }).render('#paypal-subscribe-button')
    }

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    if (!clientId) return

    if (document.querySelector('script[data-paypal-sdk]')) {
      renderPaypal()
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription&locale=ar_MA&currency=MAD`
    script.setAttribute('data-paypal-sdk', 'true')
    script.setAttribute('data-namespace', 'paypalSdk')
    script.onload = renderPaypal
    document.body.appendChild(script)
  }, [user, profile])

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

        {!user && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-4 rounded-xl mb-6 text-center">
            <p className="font-semibold mb-2">🔒 خاصك تسجل الدخول باش تشترك</p>
            <Link href="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
              تسجيل الدخول
            </Link>
          </div>
        )}

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
              <div className="space-y-3">
                <div id="paypal-subscribe-button" className="w-full"></div>
                {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
                  <p className="text-center text-xs text-gray-400">الدفع عبر PayPal</p>
                ) : (
                  <p className="text-center text-xs text-gray-400">
                    PayPal غير مُعد بعد — أضف NEXT_PUBLIC_PAYPAL_CLIENT_ID
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          الدفع آمن و مشفر بواسطة <span className="font-semibold">PayPal</span>
        </p>
      </div>
    </div>
  )
}
