'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Heart, Send, MessageCircle, Image as ImageIcon, X, UserPlus, Check, User, Search, Moon, Sun, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function Feed() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [commentTexts, setCommentTexts] = useState<{[key: string]: string}>({})
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true') setDarkMode(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await fetchFollowing(user.id)
        fetchPosts()
      }
    }
    getUser()

    // إعداد الاستماع الفوري (Real-time)
    const channel = supabase
      .channel('realtime-social')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchPosts)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchFollowing = async (userId: string) => {
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', userId)
    if (data) setFollowing(new Set(data.map(f => f.following_id)))
  }

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(id, username, full_name), likes(user_id), comments(content, profiles(username))')
      .order('created_at', { ascending: false })
    if (error) setError('خطأ ف جلب المنشورات: ' + error.message)
    else if (data) setPosts(data)
  }

  const handleFollow = async (targetUserId: string) => {
    if (!user || targetUserId === user.id) return
    if (following.has(targetUserId)) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId)
      setFollowing(prev => { const next = new Set(prev); next.delete(targetUserId); return next })
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId })
      setFollowing(prev => new Set(prev).add(targetUserId))
    }
  }

  const handlePost = async (e: any) => {
    e.preventDefault()
    if (!content.trim() && !imageFile) return
    setError(''); setLoading(true)
    let imageUrl = null
    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('posts').upload(fileName, imageFile)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(fileName)
        imageUrl = publicUrl
      }
      const { error: insertError } = await supabase.from('posts').insert({ user_id: user.id, content, image_url: imageUrl }).select()
      if (insertError) throw insertError
      setContent(''); setImageFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchPosts()
    } catch (err: any) { setError('خطأ: ' + err.message) }
    finally { setLoading(false) }
  }

  const handleLike = async (postId: string) => {
    const { data: existing } = await supabase.from('likes').select('id').eq('post_id', postId).eq('user_id', user.id).single()
    if (existing) await supabase.from('likes').delete().eq('id', existing.id)
    else await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
    fetchPosts()
  }

  const handleComment = async (postId: string) => {
    const text = commentTexts[postId]
    if (!text?.trim()) return
    await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content: text })
    setCommentTexts({ ...commentTexts, [postId]: '' })
    fetchPosts()
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('واش متأكد بغيتي تحيد هاد المنشور؟')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (!error) {
      fetchPosts()
    } else {
      alert('خطأ ف الحذف: ' + error.message)
    }
  }

  if (!user) return null

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-900'
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500'
  const inputBg = darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      <header className={`sticky top-0 z-10 border-b px-4 py-3 shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-300`}>
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <h1 className="text-xl font-bold text-blue-600">Social MVP</h1>
          
          <div className="relative w-full sm:w-64">
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSecondary}`} size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="قلب على منشور أو مستخدم..." 
              className={`w-full pr-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${inputBg}`} 
            />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/profile" className={`flex items-center gap-2 text-sm transition ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}>
              <User size={18} /> <span className="hidden sm:inline">البروفايل</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        <div className={`p-4 rounded-xl shadow border ${cardBg} transition-colors duration-300`}>
          <form onSubmit={handlePost} className="space-y-3">
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="شنو كاين ف بالك؟" className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`} rows={3} />
            {imageFile && (
              <div className="relative w-fit">
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="max-h-48 rounded-lg border border-gray-200" />
                <button type="button" onClick={() => { setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="flex justify-between items-center">
              <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${darkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50'}`}>
                <ImageIcon size={20} /> <span className="text-sm">أضف صورة</span>
              </label>
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition">
                <Send size={18} /> {loading ? 'جاري النشر...' : 'انشر'}
              </button>
            </div>
          </form>
        </div>

        {filteredPosts.length === 0 ? (
          <p className={`text-center p-6 rounded-xl shadow border ${cardBg} ${textSecondary}`}>
            {searchQuery ? 'ما لقينا والو كيطابق البحث ديالك 🔍' : 'مازال ما كاين حتى منشور'}
          </p>
        ) : (
          filteredPosts.map(post => (
            <div key={post.id} className={`p-4 rounded-xl shadow border ${cardBg} transition-colors duration-300`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
{post.profiles?.avatar_url ? (
  <img src={post.profiles.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
) : (
  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
    {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
  </div>
)}                  </div>
                  <span className={`font-bold ${textPrimary}`}>{post.profiles?.full_name || post.profiles?.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  {post.user_id === user.id && (
                    <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-600 transition p-1" title="حذف المنشور">
                      <Trash2 size={18} />
                    </button>
                  )}
                  {post.user_id !== user.id && (
                    <button onClick={() => handleFollow(post.profiles.id)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition ${following.has(post.profiles.id) ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      {following.has(post.profiles.id) ? <><Check size={16} /> متابع</> : <><UserPlus size={16} /> متابعة</>}
                    </button>
                  )}
                </div>
              </div>
              <p className={`${textPrimary} mb-3 whitespace-pre-wrap`}>{post.content}</p>
              {post.image_url && <img src={post.image_url} alt="Post" className="w-full rounded-lg mb-3 max-h-96 object-cover border border-gray-200" />}
              <div className="flex items-center gap-4 mb-2">
                <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1 transition ${post.likes?.some((l: any) => l.user_id === user.id) ? 'text-red-500' : `${textSecondary} hover:text-red-500`}`}>
                  <Heart size={18} className={post.likes?.some((l: any) => l.user_id === user.id) ? 'fill-red-500' : ''} /> <span>{post.likes?.length || 0}</span>
                </button>
                <button onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })} className={`flex items-center gap-1 transition ${textSecondary} hover:text-blue-500`}>
                  <MessageCircle size={18} /> <span>{post.comments?.length || 0}</span>
                </button>
              </div>
              {showComments[post.id] && (
                <div className={`mt-4 space-y-3 border-t pt-3 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  {post.comments?.map((comment: any, idx: number) => (
                    <div key={idx} className={`p-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <span className={`font-bold ${textPrimary}`}>{comment.profiles?.username}: </span>
                      <span className={textPrimary}>{comment.content}</span>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input type="text" value={commentTexts[post.id] || ''} onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })} placeholder="كتب تعليق..." className={`flex-1 p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${inputBg}`} onKeyPress={(e) => { if (e.key === 'Enter') handleComment(post.id) }} />
                    <button onClick={() => handleComment(post.id)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition">أرسل</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}