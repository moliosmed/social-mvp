'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Users, UserCheck, FileText, LogOut, Camera, Pencil, Save, X, Trash2, AlertTriangle, Bookmark, Check } from 'lucide-react'
import Link from 'next/link'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [myPosts, setMyPosts] = useState<any[]>([])
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0, bookmarks: 0 })
  const [uploading, setUploading] = useState(false)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saving, setSaving] = useState(false)
  
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'badges'>('posts')
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  // 🏆 حالات الشارات
  const [badges, setBadges] = useState<any[]>([])
  const [allBadges, setAllBadges] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { 
        window.location.href = '/'
        return 
      }
      setUser(user)
      
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
      setEditName(profileData?.full_name || '')
      setEditBio(profileData?.bio || '')

      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setMyPosts(postsData || [])

      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select(`
          *,
          post:posts(
            *,
            profiles(id, username, full_name, avatar_url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      const saved = bookmarksData
        ?.map((b: any) => b.post)
        .filter((p: any) => p !== null) || []
      setSavedPosts(saved)

      const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id)
      const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id)
      
      setStats({ 
        posts: postsData?.length || 0, 
        followers: followers || 0, 
        following: following || 0,
        bookmarks: saved.length
      })

      // 🏆 جلب الشارات المكتسبة
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges(id, name, description, icon)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
      
      setBadges(userBadges || [])

      // 🏆 جلب كل الشارات المتاحة
      const { data: availableBadges } = await supabase
        .from('badges')
        .select('*')
        .order('name', { ascending: true })
      
      setAllBadges(availableBadges || [])
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

  const handleDeletePost = async (postId: string) => {
    if (!confirm('واش متأكد بغيتي تحيد هاد المنشور؟')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (!error) {
      setMyPosts(prev => prev.filter(p => p.id !== postId))
      setStats(prev => ({ ...prev, posts: prev.posts - 1 }))
    } else {
      alert('خطأ ف الحذف: ' + error.message)
    }
  }

  const handleRemoveBookmark = async (postId: string) => {
    const { error } = await supabase.from('bookmarks').delete().eq('post_id', postId).eq('user_id', user.id)
    if (!error) {
      setSavedPosts(prev => prev.filter(p => p.id !== postId))
      setStats(prev => ({ ...prev, bookmarks: prev.bookmarks - 1 }))
    } else {
      alert('خطأ: ' + error.message)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'حذف') return
    if (!user) return
    
    setDeleting(true)
    try {
      const { data: avatarFiles } = await supabase.storage.from('avatars').list()
      const userAvatars = avatarFiles?.filter(f => f.name.startsWith(user.id)) || []
      if (userAvatars.length > 0) {
        await supabase.storage.from('avatars').remove(userAvatars.map(f => f.name))
      }

      const { data: postFiles } = await supabase.storage.from('posts').list()
      const userPosts = postFiles?.filter(f => f.name.startsWith(user.id)) || []
      if (userPosts.length > 0) {
        await supabase.storage.from('posts').remove(userPosts.map(f => f.name))
      }

      await supabase.from('messages').delete().eq('sender_id', user.id)
      await supabase.from('bookmarks').delete().eq('user_id', user.id)
      await supabase.from('user_badges').delete().eq('user_id', user.id)
      await supabase.from('comment_likes').delete().eq('user_id', user.id)
      await supabase.from('comments').delete().eq('user_id', user.id)
      await supabase.from('likes').delete().eq('user_id', user.id)
      await supabase.from('notifications').delete().eq('user_id', user.id)
      await supabase.from('notifications').delete().eq('actor_id', user.id)
      await supabase.from('follows').delete().eq('follower_id', user.id)
      await supabase.from('follows').delete().eq('following_id', user.id)
      await supabase.from('posts').delete().eq('user_id', user.id)
      await supabase.from('conversations').delete().or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      await supabase.from('profiles').delete().eq('id', user.id)

      await supabase.auth.signOut()
      alert('✅ تم حذف حسابك بنجاح.')
      window.location.href = '/'
    } catch (error: any) {
      alert('خطأ ف حذف الحساب: ' + error.message)
    } finally {
      setDeleting(false)
    }
  }

  if (!user || !profile) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">جاري التحميل...</div>
  }

  // 🏷️ الشارات المكتسبة
  const earnedBadgeIds = new Set(badges.map(b => b.badge_id))

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
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => !isEditing && (document.getElementById('avatar-input') as HTMLInputElement)?.click()}>
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
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <textarea 
                      value={editBio} 
                      onChange={(e) => setEditBio(e.target.value)} 
                      placeholder="نبذة تعريفية عنك..." 
                      rows={2}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                        <Save size={16} /> {saving ? 'جاري الحفظ...' : 'حفظ'}
                      </button>
                      <button onClick={() => { setIsEditing(false); setEditName(profile.full_name || ''); setEditBio(profile.bio || ''); }} className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-300">
                        <X size={16} /> إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900">{profile.full_name || profile.username}</h1>
                    <p className="text-gray-500">@{profile.username}</p>
                    {profile.bio && <p className="text-gray-700 mt-2 text-sm">{profile.bio}</p>}
                    {uploading && <p className="text-sm text-blue-600 mt-1">جاري رفع الصورة...</p>}
                  </>
                )}
              </div>
            </div>
            
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Pencil size={16} /> تعديل
              </button>
            )}
          </div>

          <div className="flex gap-4 border-t pt-4">
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
            <div className="text-center flex-1">
              <p className="text-xl font-bold text-yellow-600">{stats.bookmarks}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 justify-center"><Bookmark size={14} /> محفوظات</p>
            </div>
          </div>
        </div>

        {/* التبويبات */}
        <div className="flex border-b border-gray-200 mb-4 bg-white rounded-t-xl shadow-sm">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'posts'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText size={16} /> منشوراتي
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'saved'
                ? 'text-yellow-600 border-b-2 border-yellow-600 bg-yellow-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Bookmark size={16} /> المحفوظات
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'badges'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>🏆</span> الشارات
          </button>
        </div>

        {/* محتوى التبويب */}
        <div className="space-y-4">
          {activeTab === 'posts' && (
            <>
              {myPosts.length === 0 ? (
                <p className="text-center text-gray-500 bg-white p-6 rounded-xl shadow">مازال ما نشرتي والو</p>
              ) : (
                myPosts.map((post: any) => (
                  <div key={post.id} className="bg-white p-4 rounded-xl shadow">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString('ar-MA')}</p>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="text-gray-400 hover:text-red-600 transition p-1"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-gray-800 mb-2 whitespace-pre-wrap">{post.content}</p>
                    {post.image_url && <img src={post.image_url} alt="Post" className="w-full rounded-lg max-h-64 object-cover" />}
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'saved' && (
            <>
              {savedPosts.length === 0 ? (
                <div className="text-center text-gray-500 bg-white p-8 rounded-xl shadow">
                  <Bookmark size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium mb-1">ما كاين حتى منشور محفوظ</p>
                  <p className="text-sm">حفظ المنشورات من الصفحة الرئيسية باش تلقاهم هنا</p>
                </div>
              ) : (
                savedPosts.map((post: any) => (
                  <div key={post.id} className="bg-white p-4 rounded-xl shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {post.profiles?.avatar_url ? (
                          <img src={post.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                            {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{post.profiles?.full_name || post.profiles?.username}</p>
                          <p className="text-xs text-gray-500">@{post.profiles?.username}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveBookmark(post.id)}
                        className="text-yellow-500 hover:text-yellow-700 transition p-1"
                        title="إلغاء الحفظ"
                      >
                        <Bookmark size={18} className="fill-yellow-500" />
                      </button>
                    </div>
                    <p className="text-gray-800 mb-2 whitespace-pre-wrap">{post.content}</p>
                    {post.image_url && <img src={post.image_url} alt="Post" className="w-full rounded-lg max-h-64 object-cover mb-2" />}
                    <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString('ar-MA')}</p>
                  </div>
                ))
              )}
            </>
          )}

          {/* 🏆 تبويب الشارات */}
          {activeTab === 'badges' && (
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🏆</span> الشارات والإنجازات
                <span className="text-sm font-normal text-gray-500">({badges.length}/{allBadges.length})</span>
              </h2>
              
              {allBadges.length === 0 ? (
                <p className="text-center text-gray-500 py-8">ما كاين حتى شارة متاحة</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {allBadges.map((badge: any) => {
                    const earned = earnedBadgeIds.has(badge.id)
                    const earnedDate = badges.find(b => b.badge_id === badge.id)?.earned_at
                    
                    return (
                      <div 
                        key={badge.id} 
                        className={`relative flex flex-col items-center p-3 rounded-lg border transition-all cursor-pointer ${
                          earned 
                            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700 hover:scale-105' 
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50 grayscale'
                        }`}
                        title={`${badge.name}: ${badge.description}${earned ? `\n✓ تم الربح: ${new Date(earnedDate).toLocaleDateString('ar-MA')}` : ''}`}
                      >
                        <span className="text-4xl mb-1">{badge.icon}</span>
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 text-center">{badge.name}</p>
                        {earned && earnedDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(earnedDate).toLocaleDateString('ar-MA')}
                          </p>
                        )}
                        {earned && (
                          <div className="absolute top-1 right-1 text-green-500">
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              
              {badges.length === 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 ابدأ بالتفاعل مع التطبيق (نشر، تعليق، إعجاب) باش تربح شارات!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* منطقة الخطر */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow border-2 border-red-100">
          <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
            <AlertTriangle size={20} /> منطقة الخطر
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            حذف الحساب هو إجراء نهائي. سيتم حذف جميع بياناتك ومنشوراتك ورسائلك بشكل دائم.
          </p>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
          >
            <Trash2 size={16} /> حذف حسابي نهائياً
          </button>
        </div>
      </div>

      {/* Modal تأكيد الحذف */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">حذف الحساب نهائياً</h2>
                <p className="text-sm text-gray-500">هاد الإجراء ما يمكنش التراجع عنو</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800 mb-2">غادي يتحيد من حسابك:</p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                <li>كل المنشورات والصور ديالك</li>
                <li>كل التعليقات والإعجابات والمحفوظات</li>
                <li>كل الرسائل والمحادثات</li>
                <li>كل المتابعين والمتابَعين</li>
                <li>كل الإشعارات والشارات</li>
                <li>صورة البروفايل والـ Bio</li>
              </ul>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              باش تتأكد، كتب <b className="text-red-600">"حذف"</b> فـ الخانة تحت:
            </label>
            <input 
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder='اكتب "حذف" هنا'
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none mb-4"
            />

            <div className="flex gap-2">
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText('') }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
              >
                إلغاء
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'حذف' || deleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} /> حذف نهائياً
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}