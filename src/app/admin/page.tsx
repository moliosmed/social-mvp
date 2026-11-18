'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Users, FileText, MessageCircle, Heart, BarChart3, DollarSign, Crown, Rocket, X } from 'lucide-react'
import Link from 'next/link'

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }
      setUser(user)
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      const json = await res.json()
      if (res.status === 403) setError('ما عندكش الصلاحية باش تدخل لهاد الصفحة.')
      else if (json.error) setError(json.error)
      else setData(json)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">جاري التحميل...</div>

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
          <X className="mx-auto text-red-500 mb-4" size={40} />
          <h1 className="text-xl font-bold text-gray-900 mb-2">ممنوع</h1>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">العودة للرئيسية</Link>
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'المستخدمين', value: data.counts.users, icon: Users, color: 'text-blue-600' },
    { label: 'المنشورات', value: data.counts.posts, icon: FileText, color: 'text-green-600' },
    { label: 'التعليقات', value: data.counts.comments, icon: MessageCircle, color: 'text-purple-600' },
    { label: 'التفاعلات', value: data.counts.reactions, icon: Heart, color: 'text-red-500' },
    { label: 'المجموعات', value: data.counts.groups, icon: BarChart3, color: 'text-orange-500' },
    { label: 'الرسائل', value: data.counts.messages, icon: MessageCircle, color: 'text-cyan-600' },
    { label: 'مستخدمي Premium', value: data.counts.premiumUsers, icon: Crown, color: 'text-yellow-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">👑 لوحة تحكم Admin</h1>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-blue-600 hover:underline">العودة</Link>
            <button onClick={() => supabase.auth.signOut().then(() => (window.location.href = '/'))} className="text-sm text-red-600 hover:underline">خروج</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* الدخل */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500 flex items-center gap-2"><Rocket size={16} /> دخل التعزيزات</p>
            <p className="text-3xl font-bold text-orange-500 mt-1">{data.revenue.boosts.toFixed(2)} MAD</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500 flex items-center gap-2"><Users size={16} /> دخل المجموعات</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{data.revenue.groups.toFixed(2)} MAD</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow border-2 border-green-200">
            <p className="text-sm text-gray-500 flex items-center gap-2"><DollarSign size={16} /> الـ total</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{data.revenue.total.toFixed(2)} MAD</p>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-white p-4 rounded-xl shadow">
              <c.icon className={`${c.color} mb-2`} size={22} />
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          ))}
        </div>

        {/* آخر التعزيزات */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-bold text-gray-900 mb-3">🚀 آخر التعزيزات</h2>
          {data.boosts.length === 0 ? (
            <p className="text-gray-500 text-sm">مازال ما كاين حتى تعزيز.</p>
          ) : (
            <div className="space-y-2">
              {data.boosts.slice(-5).reverse().map((b: any) => (
                <div key={b.id || Math.random()} className="flex justify-between text-sm border-b pb-2">
                  <span className="text-gray-600">{b.plan} · {b.amount} MAD</span>
                  <span className={b.status === 'active' ? 'text-green-600' : 'text-gray-400'}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
