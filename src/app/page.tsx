'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Users, UserCheck, FileText, LogOut, Camera, Pencil, Save, X } from 'lucide-react'
import Link from 'next/link'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 })
  const [uploading, setUploading] = useState(false)
  
  // حالات التعديل
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }
      setUser(user)
      
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
      setEditName(profileData?.full_name || '')
      setEditBio(profileData?.bio || '')

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
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)

      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      if (updateError) throw updateError

      setProfile({ ...profile, avatar_url: publicUrl })
    } catch (error: any) {
      alert('خطأ ف رفع الصورة: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editName, bio: editBio })
        .eq('id', user.id)
      
      if (error) throw error
      
      setProfile({ ...profile, full_name: editName, bio: editBio })
      setIsEditing(false)
    } catch (error: any) {
      alert('خطأ ف الحفظ: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (!user || !profile) return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
            <ArrowLeft size={20} /> رجوع للرئيسية
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm transition">
            <LogOut size={18} /> خروج
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => !isEditing && document.getElementById('avatar-input')?.click()}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-blue-500" />
                ) : (
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl border-2 border-blue-500">
                    {profile.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                {!isEditing && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Camera className="text-white" size={24} />
                  </div>
                )}
                <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      placeholder="الاسم الكامل" 
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <textarea 
                      value={editBio} 
                      onChange={(e) => setEditBio(e.target.value)} 
                      placeholder="نبذة تعريفية عنك..." 
                      rows={2}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50">
                        <Save size={16} /> {saving ? 'جاري الحفظ...' : 'حفظ'}
                      </button>
                      <button onClick={() => { setIsEditing(false); setEditName(profile.full_name || ''); setEditBio(profile.bio || ''); }} className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        <X size={16} /> إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.full_name || profile.username}</h1>
                    <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>
                    {profile.bio && <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">{profile.bio}</p>}
                    {uploading && <p className="text-sm text-blue-600 mt-1">جاري رفع الصورة...</p>}
                  </>
                )}
              </div>
            </div>
            
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <Pencil size={16} /> تعديل
              </button>
            )}
          </div>

          <div className="flex gap-6 border-t dark:border-gray-700 pt-4">
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.posts}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-center"><FileText size={14} /> منشورات</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.followers}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-center"><Users size={14} /> متابعين</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.following}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-center"><UserCheck size={14} /> متابَعين</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-8">منشوراتي</h2>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">مازال ما نشرتي والو</p>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <p className="text-gray-800 dark:text-gray-200 mb-2 whitespace-pre-wrap">{post.content}</p>
                {post.image_url && <img src={post.image_url} alt="Post" className="w-full rounded-lg max-h-64 object-cover mb-2" />}
                <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(post.created_at).toLocaleDateString('ar-MA')}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}