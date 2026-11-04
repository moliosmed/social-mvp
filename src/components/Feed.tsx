'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Heart, Send, MessageCircle, Image as ImageIcon, X, UserPlus, Check, User, Search } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('') // جديد: حالة البحث
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

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

  if (!user) return null

  // جديد: فلتر المنشورات حسب البحث
  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Social MVP</h1>
          <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
            <User size={20} /> <span className="text-sm font-medium">البروفايل</span>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        {/* جديد: شريط البحث */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="قلب على منشور أو مستخدم..." 
            className="w-full pr-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" 
          />
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <form onSubmit={handlePost} className="space-y-3">
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="شنو كاين ف بالك؟" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
            {imageFile && (
              <div className="relative w-fit">
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="max-h-48 rounded-lg" />
                <button type="button" onClick={() => { setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={16} /></button>
              </div>
            )}
            <div className="flex justify-between items-center">
              <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="flex items-center gap-2 text-blue-600 cursor-pointer hover:text-blue-700">
                <ImageIcon size={20} /> <span className="text-sm">أضف صورة</span>
              </label>
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50">
                <Send size={18} /> {loading ? 'جاري النشر...' : 'انشر'}
              </button>
            </div>
          </form>
        </div>

        {filteredPosts.length === 0 ? (
          <p className="text-center text-gray-500 bg-white p-6 rounded-xl shadow">
            {searchQuery ? 'ما لقينا والو كيطابق البحث ديالك 🔍' : 'مازال ما كاين حتى منشور'}
          </p>
        ) : (
          filteredPosts.map(post => (
            <div key={post.id} className="bg-white p-4 rounded-xl shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-bold text-gray-900">{post.profiles?.full_name || post.profiles?.username}</span>
                </div>
                {post.user_id !== user.id && (
                  <button onClick={() => handleFollow(post.profiles.id)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition ${following.has(post.profiles.id) ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    {following.has(post.profiles.id) ? <><Check size={16} /> متابع</> : <><UserPlus size={16} /> متابعة</>}
                  </button>
                )}
              </div>
              <p className="text-gray-800 mb-3">{post.content}</p>
              {post.image_url && <img src={post.image_url} alt="Post" className="w-full rounded-lg mb-3 max-h-96 object-cover" />}
              <div className="flex items-center gap-4 mb-2">
                <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1 transition ${post.likes?.some((l: any) => l.user_id === user.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
                  <Heart size={18} className={post.likes?.some((l: any) => l.user_id === user.id) ? 'fill-red-500' : ''} /> <span>{post.likes?.length || 0}</span>
                </button>
                <button onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })} className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition">
                  <MessageCircle size={18} /> <span>{post.comments?.length || 0}</span>
                </button>
              </div>
              {showComments[post.id] && (
                <div className="mt-4 space-y-3 border-t pt-3">
                  {post.comments?.map((comment: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded-lg text-sm">
                      <span className="font-bold text-gray-900">{comment.profiles?.username}: </span>{comment.content}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input type="text" value={commentTexts[post.id] || ''} onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })} placeholder="كتب تعليق..." className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" onKeyPress={(e) => { if (e.key === 'Enter') handleComment(post.id) }} />
                    <button onClick={() => handleComment(post.id)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">أرسل</button>
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