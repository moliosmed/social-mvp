'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, MessageCircle, Image as ImageIcon, X, UserPlus, Check, User, Search, Moon, Sun, Trash2, Bell, Loader, Share2, Pencil, Save, Bookmark, ThumbsUp, Heart } from 'lucide-react'
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
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  
  // حالات تعديل التعليقات
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState('')
  
  // حالات المحفوظات
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  
  // 🎭 حالات التفاعلات
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)
  
  // ✏️ حالات تعديل المنشورات
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editPostContent, setEditPostContent] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const observerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const POSTS_PER_PAGE = 10

  const REACTIONS = {
    like: { emoji: '👍', label: 'Like', color: 'text-blue-500' },
    love: { emoji: '❤️', label: 'Love', color: 'text-red-500' },
    haha: { emoji: '😂', label: 'Haha', color: 'text-yellow-500' },
    wow: { emoji: '😮', label: 'Wow', color: 'text-yellow-500' },
    sad: { emoji: '😢', label: 'Sad', color: 'text-yellow-500' },
    angry: { emoji: '😡', label: 'Angry', color: 'text-orange-500' }
  }

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
        await fetchBookmarks(user.id)
        await fetchPosts(true)
        fetchNotifications(user.id)
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('realtime-social')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => fetchPosts(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchPosts(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comment_likes' }, () => fetchPosts(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookmarks' }, () => fetchBookmarks(user.id))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.new.user_id === user.id) {
          setNotifications(prev => [payload.new, ...prev])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  useEffect(() => {
    if (!observerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMorePosts()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(observerRef.current)

    return () => observer.disconnect()
  }, [hasMore, loadingMore, posts.length])

  const fetchFollowing = async (userId: string) => {
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', userId)
    if (data) setFollowing(new Set(data.map(f => f.following_id)))
  }

  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase.from('bookmarks').select('post_id').eq('user_id', userId)
    if (data) setBookmarks(new Set(data.map(b => b.post_id)))
  }

  const fetchPosts = async (reset = false) => {
    setLoading(true)
    const from = reset ? 0 : posts.length
    const to = from + POSTS_PER_PAGE - 1

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *, 
        profiles(id, username, full_name, avatar_url), 
        reactions(user_id, type),
        comments(
          id, 
          content, 
          user_id,
          profiles(username, avatar_url),
          comment_likes(user_id)
        )
      `)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      setError('خطأ ف جلب المنشورات: ' + error.message)
    } else if (data) {
      if (reset) {
        setPosts(data)
      } else {
        setPosts(prev => [...prev, ...data])
      }
      setHasMore(data.length === POSTS_PER_PAGE)
    }
    setLoading(false)
  }

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    await fetchPosts(false)
    setLoadingMore(false)
  }

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:actor_id(username, avatar_url),
        post:post_id(content)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data)
  }

  const markNotificationsAsRead = async () => {
    if (!user) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setShowNotifications(!showNotifications)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const sendNotification = async (targetUserId: string, type: string, postId?: string, commentId?: string) => {
    if (!user || targetUserId === user.id) return
    await supabase.from('notifications').insert({
      user_id: targetUserId,
      actor_id: user.id,
      type,
      post_id: postId || null,
      comment_id: commentId || null
    })
  }

  const handleFollow = async (targetUserId: string) => {
    if (!user || targetUserId === user.id) return
    if (following.has(targetUserId)) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId)
      setFollowing(prev => { const next = new Set(prev); next.delete(targetUserId); return next })
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId })
      setFollowing(prev => new Set(prev).add(targetUserId))
      await sendNotification(targetUserId, 'follow')
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
      await fetchPosts(true)
    } catch (err: any) { setError('خطأ: ' + err.message) }
    finally { setLoading(false) }
  }

  const handleReaction = async (postId: string, postOwnerId: string, reactionType: string) => {
    if (!user) return
    
    const existing = post => post.reactions?.find((r: any) => r.user_id === user.id)
    const post = posts.find(p => p.id === postId)
    const myReaction = post ? existing(post) : null
    
    if (myReaction && myReaction.type === reactionType) {
      await supabase.from('reactions').delete().eq('post_id', postId).eq('user_id', user.id)
    } else if (myReaction) {
      await supabase.from('reactions').update({ type: reactionType }).eq('post_id', postId).eq('user_id', user.id)
    } else {
      await supabase.from('reactions').insert({ 
        post_id: postId, 
        user_id: user.id, 
        type: reactionType 
      })
      await sendNotification(postOwnerId, 'like', postId)
    }
    
    setShowReactionPicker(null)
    await fetchPosts(true)
  }

  const handleCommentLike = async (commentId: string, commentOwnerId: string, postId: string) => {
    const { data: existing } = await supabase.from('comment_likes').select('id').eq('comment_id', commentId).eq('user_id', user.id).single()
    if (existing) {
      await supabase.from('comment_likes').delete().eq('id', existing.id)
    } else {
      await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id })
      await sendNotification(commentOwnerId, 'comment_like', postId, commentId)
    }
    await fetchPosts(true)
  }

  const handleComment = async (postId: string, postOwnerId: string) => {
    const text = commentTexts[postId]
    if (!text?.trim()) return
    const { data: inserted } = await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content: text }).select()
    setCommentTexts({ ...commentTexts, [postId]: '' })
    if (inserted && inserted[0]) {
      await sendNotification(postOwnerId, 'comment', postId, inserted[0].id)
    }
    await fetchPosts(true)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('واش متأكد بغيتي تحيد هاد المنشور؟')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (!error) await fetchPosts(true)
    else alert('خطأ ف الحذف: ' + error.message)
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('واش متأكد بغيتي تحيد هاد التعليق؟')) return
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (!error) await fetchPosts(true)
    else alert('خطأ ف الحذف: ' + error.message)
  }

  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId)
    setEditCommentText(currentText)
  }

  const handleSaveEdit = async (commentId: string) => {
    if (!editCommentText.trim()) return
    const { error } = await supabase.from('comments').update({ content: editCommentText }).eq('id', commentId)
    if (!error) {
      setEditingCommentId(null)
      setEditCommentText('')
      await fetchPosts(true)
    } else {
      alert('خطأ ف التعديل: ' + error.message)
    }
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditCommentText('')
  }

  // ✏️ ميزة تعديل المنشورات
  const handleEditPost = (postId: string, currentContent: string) => {
    setEditingPostId(postId)
    setEditPostContent(currentContent)
  }

  const handleSavePostEdit = async (postId: string) => {
    if (!editPostContent.trim()) return
    const { error } = await supabase.from('posts').update({ content: editPostContent }).eq('id', postId)
    if (!error) {
      setEditingPostId(null)
      setEditPostContent('')
      await fetchPosts(true)
    } else {
      alert('خطأ ف التعديل: ' + error.message)
    }
  }

  const handleCancelPostEdit = () => {
    setEditingPostId(null)
    setEditPostContent('')
  }

  const handleBookmark = async (postId: string) => {
    if (!user) return
    
    if (bookmarks.has(postId)) {
      await supabase.from('bookmarks').delete().eq('post_id', postId).eq('user_id', user.id)
      setBookmarks(prev => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    } else {
      await supabase.from('bookmarks').insert({ post_id: postId, user_id: user.id })
      setBookmarks(prev => new Set(prev).add(postId))
    }
  }

  const handleShare = async (post: any) => {
    const shareData = {
      title: 'منشور من Molios Empire',
      text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
      url: window.location.href
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
      alert('تم نسخ رابط المنشور!')
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

  const getNotificationText = (n: any) => {
    const actorName = n.actor?.username || 'مستخدم'
    if (n.type === 'like') return `<b>${actorName}</b> تفاعل مع منشورك`
    if (n.type === 'comment') return `<b>${actorName}</b> علق على منشورك`
    if (n.type === 'comment_like') return `<b>${actorName}</b> عجبو تعليقك`
    if (n.type === 'follow') return `<b>${actorName}</b> بدا كيتبعك`
    return 'إشعار جديد'
  }

  const getReactionSummary = (reactions: any[]) => {
    if (!reactions || reactions.length === 0) return null
    
    const counts: {[key: string]: number} = {}
    reactions.forEach(r => {
      counts[r.type] = (counts[r.type] || 0) + 1
    })
    
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    const topEmojis = sorted.slice(0, 3).map(([type]) => REACTIONS[type as keyof typeof REACTIONS].emoji)
    const totalCount = reactions.length
    
    return { topEmojis, totalCount, sorted }
  }

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      <header className={`sticky top-0 z-20 border-b px-4 py-3 shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-300`}>
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <h1 className="text-xl font-bold text-blue-600">Molios Empire</h1>
          
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
            <div className="relative">
              <button 
                onClick={markNotificationsAsRead}
                className={`p-2 rounded-lg transition relative ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className={`absolute left-0 mt-2 w-80 rounded-xl shadow-xl border z-50 max-h-96 overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`p-3 border-b font-bold text-sm ${darkMode ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-800'}`}>
                    الإشعارات
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">ما كاين حتى إشعار جديد 🎉</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-3 border-b text-sm flex gap-3 items-start ${!n.read ? (darkMode ? 'bg-gray-700/50' : 'bg-blue-50/50') : ''} ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        {n.actor?.avatar_url ? (
                          <img src={n.actor.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                            {n.actor?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <p className={textPrimary} dangerouslySetInnerHTML={{ __html: getNotificationText(n) }} />
                          <p className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleDateString('ar-MA')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <Link href="/messages" className={`flex items-center gap-2 text-sm transition ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}>
              <MessageCircle size={18} /> <span className="hidden sm:inline">الرسائل</span>
            </Link>
            
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
          <>
            {filteredPosts.map(post => {
              const myReaction = post.reactions?.find((r: any) => r.user_id === user.id)
              const summary = getReactionSummary(post.reactions)
              
              return (
                <div key={post.id} className={`p-4 rounded-xl shadow border ${cardBg} transition-colors duration-300`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {post.profiles?.avatar_url ? (
                        <img src={post.profiles.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className={`font-bold ${textPrimary}`}>{post.profiles?.full_name || post.profiles?.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* ✏️ أزرار تعديل وحذف المنشور */}
                      {post.user_id === user.id && (
                        <>
                          <button 
                            onClick={() => handleEditPost(post.id, post.content)}
                            className="text-gray-400 hover:text-blue-600 transition p-1" 
                            title="تعديل المنشور"
                          >
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-600 transition p-1" title="حذف المنشور">
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                      {post.user_id !== user.id && (
                        <button onClick={() => handleFollow(post.profiles.id)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition ${following.has(post.profiles.id) ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                          {following.has(post.profiles.id) ? <><Check size={16} /> متابع</> : <><UserPlus size={16} /> متابعة</>}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* ✏️ وضع التعديل */}
                  {editingPostId === post.id ? (
                    <div className="space-y-2 mb-3">
                      <textarea 
                        value={editPostContent}
                        onChange={(e) => setEditPostContent(e.target.value)}
                        className={`w-full p-3 border rounded-lg ${inputBg}`}
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleSavePostEdit(post.id)}
                          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
                        >
                          <Save size={14} /> حفظ
                        </button>
                        <button 
                          onClick={handleCancelPostEdit}
                          className="flex items-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                        >
                          <X size={14} /> إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={`${textPrimary} mb-3 whitespace-pre-wrap`}>{post.content}</p>
                  )}
                  
                  {post.image_url && <img src={post.image_url} alt="Post" className="w-full rounded-lg mb-3 max-h-96 object-cover border border-gray-200" />}
                  
                  {summary && summary.totalCount > 0 && (
                    <div className={`flex items-center gap-2 mb-2 text-sm ${textSecondary}`}>
                      <div className="flex -space-x-1">
                        {summary.topEmojis.map((emoji, idx) => (
                          <span key={idx} className="text-base">{emoji}</span>
                        ))}
                      </div>
                      <span>{summary.totalCount}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-2 border-t border-b py-2 relative">
                    <div className="relative flex-1">
                      <button 
                        onMouseEnter={() => setShowReactionPicker(post.id)}
                        onMouseLeave={() => setShowReactionPicker(null)}
                        onClick={() => handleReaction(post.id, post.user_id, myReaction?.type || 'like')}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition ${
                          myReaction 
                            ? `${REACTIONS[myReaction.type as keyof typeof REACTIONS].color} font-medium` 
                            : `${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`
                        }`}
                      >
                        {myReaction ? (
                          <>
                            <span className="text-xl">{REACTIONS[myReaction.type as keyof typeof REACTIONS].emoji}</span>
                            <span className="text-sm">{REACTIONS[myReaction.type as keyof typeof REACTIONS].label}</span>
                          </>
                        ) : (
                          <>
                            <ThumbsUp size={18} />
                            <span className="text-sm">تفاعل</span>
                          </>
                        )}
                      </button>
                      
                      {showReactionPicker === post.id && (
                        <div className={`absolute bottom-full left-0 mb-2 flex gap-1 p-2 rounded-full shadow-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                          {Object.entries(REACTIONS).map(([type, data]) => (
                            <button
                              key={type}
                              onClick={() => handleReaction(post.id, post.user_id, type)}
                              onMouseEnter={() => setShowReactionPicker(post.id)}
                              className="text-2xl hover:scale-125 transition-transform p-1"
                              title={data.label}
                            >
                              {data.emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`}>
                      <MessageCircle size={18} /> <span className="text-sm">{post.comments?.length || 0}</span>
                    </button>
                    <button onClick={() => handleShare(post)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`}>
                      <Share2 size={18} /> <span className="text-sm hidden sm:inline">مشاركة</span>
                    </button>
                    <button 
                      onClick={() => handleBookmark(post.id)}
                      className={`flex items-center justify-center p-2 rounded-lg transition ${bookmarks.has(post.id) ? 'text-yellow-500' : `${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`}`}
                      title={bookmarks.has(post.id) ? 'إلغاء الحفظ' : 'حفظ'}
                    >
                      <Bookmark size={18} className={bookmarks.has(post.id) ? 'fill-yellow-500' : ''} />
                    </button>
                  </div>

                  {showComments[post.id] && (
                    <div className={`mt-4 space-y-3 border-t pt-3 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      {post.comments?.map((comment: any, idx: number) => (
                        <div key={idx} className={`p-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-start gap-2">
                            {comment.profiles?.avatar_url ? (
                              <img src={comment.profiles.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                                {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                            <div className="flex-1">
                              {editingCommentId === comment.id ? (
                                <div className="space-y-2">
                                  <input 
                                    type="text"
                                    value={editCommentText}
                                    onChange={(e) => setEditCommentText(e.target.value)}
                                    className={`w-full p-2 border rounded-lg text-sm ${inputBg}`}
                                    autoFocus
                                  />
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleSaveEdit(comment.id)}
                                      className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition"
                                    >
                                      <Save size={12} /> حفظ
                                    </button>
                                    <button 
                                      onClick={handleCancelEdit}
                                      className="flex items-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                                    >
                                      <X size={12} /> إلغاء
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <span className={`font-bold ${textPrimary}`}>{comment.profiles?.username}: </span>
                                      <span className={textPrimary}>{comment.content}</span>
                                    </div>
                                    {comment.user_id === user.id && (
                                      <div className="flex gap-1 flex-shrink-0">
                                        <button 
                                          onClick={() => handleEditComment(comment.id, comment.content)}
                                          className="text-blue-500 hover:text-blue-700 transition p-1"
                                          title="تعديل التعليق"
                                        >
                                          <Pencil size={14} />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteComment(comment.id)}
                                          className="text-red-500 hover:text-red-700 transition p-1"
                                          title="حذف التعليق"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <button 
                                    onClick={() => handleCommentLike(comment.id, comment.user_id, post.id)}
                                    className={`flex items-center gap-1 mt-1 text-xs transition ${comment.comment_likes?.some((l: any) => l.user_id === user.id) ? 'text-red-500' : `${textSecondary} hover:text-red-500`}`}
                                  >
                                    <Heart size={12} className={comment.comment_likes?.some((l: any) => l.user_id === user.id) ? 'fill-red-500' : ''} />
                                    <span>{comment.comment_likes?.length || 0}</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input type="text" value={commentTexts[post.id] || ''} onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })} placeholder="كتب تعليق..." className={`flex-1 p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${inputBg}`} onKeyPress={(e) => { if (e.key === 'Enter') handleComment(post.id, post.user_id) }} />
                        <button onClick={() => handleComment(post.id, post.user_id)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition">أرسل</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            
            <div ref={observerRef} className="flex justify-center py-4">
              {loadingMore && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader className="animate-spin" size={20} />
                  <span>جاري تحميل المزيد...</span>
                </div>
              )}
              {!hasMore && posts.length > 0 && (
                <p className="text-gray-400 text-sm">وصلتي للنهاية 🎉</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}