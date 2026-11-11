'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Users, UserCheck, FileText, LogOut, Camera } from 'lucide-react'
import Link from 'next/link'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }
      setUser(user)
      
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)

      const { data: postsData } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setPosts(postsData || [])
      setStats(prev => ({ ...prev, posts: postsData?.length || 0 }))

      const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id)
      const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id)
      setStats(prev => ({ ...prev, followers: followers || 0, following: following || 0 }))
    }
    getData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      // 1. رفع الصورة لـ Bucket ديال avatars
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // 2. جلب الرابط العام
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // 3. تحديث جدول profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile({ ...profile, avatar_url: publicUrl })
    } catch (error: any) {
      alert('خطأ ف رفع الصورة: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  if (!user || !profile) return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft size={20} /> رجوع للرئيسية
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm">
            <LogOut size={18} /> خروج
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="flex items-center gap-4 mb-6">
            {/* صورة البروفايل مع زر الكاميرا */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-blue-500" />
              ) : (
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl border-2 border-blue-500">
                  {profile.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera className="text-white" size={24} />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleAvatarUpload} 
                className="hidden" 
              />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name || profile.username}</h1>
              <p className="text-gray-500">@{profile.username}</p>
              {uploading && <p className="text-sm text-blue-600 mt-1">جاري رفع الصورة...</p>}
            </div>
          </div>

          <div className="flex gap-6 border-t pt-4">
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-gray-900">{stats.posts}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 justify-center"><FileText size={14} /> منشورات</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-gray-900">{stats.followers}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 justify-center"><Users size={14} /> متابعين</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-gray-900">{stats.following}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 justify-center"><UserCheck size={14} /> متابَعين</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">منشوراتي</h2>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 bg-white p-6 rounded-xl shadow">مازال ما نشرتي والو</p>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white p-4 rounded-xl shadow">
                <p className="text-gray-800 mb-2">{post.content}</p>
                {post.image_url && <img src={post.image_url} alt="Post" className="w-full rounded-lg max-h-64 object-cover mb-2" />}
                <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString('ar-MA')}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}