'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, MessageCircle, Image as ImageIcon, X, UserPlus, Check, User, Search, Moon, Sun, Trash2, Bell, Loader, Share2, Pencil, Save, Bookmark, ThumbsUp, Heart, Plus, ChevronLeft, ChevronRight, BellOff, BellRing, Ban, Hash, Reply, RefreshCw, Users, BarChart3, Vote, FileText, TrendingUp, Activity, Globe, Rocket } from 'lucide-react'
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
  
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState('')
  
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editPostContent, setEditPostContent] = useState('')
  
  const [stories, setStories] = useState<any[]>([])
  const [uploadingStory, setUploadingStory] = useState(false)
  const [viewingStory, setViewingStory] = useState<any | null>(null)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  
  const [toasts, setToasts] = useState<any[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')
  
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set())
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null)
  const [trendingHashtags, setTrendingHashtags] = useState<any[]>([])
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyTexts, setReplyTexts] = useState<{[key: string]: string}>({})
  const [showReplies, setShowReplies] = useState<{[key: string]: boolean}>({})
  
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([])
  
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState<string[]>(['', ''])
  const [pollDuration, setPollDuration] = useState(24)
  
  const [communityStats, setCommunityStats] = useState({
    users: 0, posts: 0, comments: 0, reactions: 0, groups: 0, messages: 0
  })
  const [showStats, setShowStats] = useState(false)

  // 🚀 تعزيز المنشورات
  const [showBoostModal, setShowBoostModal] = useState(false)
  const [boostingPost, setBoostingPost] = useState<any>(null)
  const [boosting, setBoosting] = useState(false)

  // 🌐 حالات اللغة
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')
  const [showLangMenu, setShowLangMenu] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const storyInputRef = useRef<HTMLInputElement>(null)
  const observerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const POSTS_PER_PAGE = 10

  // 🎭 تعريف التفاعلات
  const REACTIONS = {
    like: { emoji: '👍', label: 'Like', color: 'text-blue-500' },
    love: { emoji: '❤️', label: 'Love', color: 'text-red-500' },
    haha: { emoji: '😂', label: 'Haha', color: 'text-yellow-500' },
    wow: { emoji: '😮', label: 'Wow', color: 'text-yellow-500' },
    sad: { emoji: '😢', label: 'Sad', color: 'text-yellow-500' },
    angry: { emoji: '😡', label: 'Angry', color: 'text-orange-500' }
  }

  // 🌐 قاموس الترجمة
  const translations = {
    ar: {
      title: 'Molios Empire',
      searchPlaceholder: 'قلب على منشور أو مستخدم...',
      notifications: 'الإشعارات',
      noNotifications: 'ما كاين حتى إشعار جديد 🎉',
      messages: 'الرسائل',
      groups: 'المجموعات',
      profile: 'البروفايل',
      yourStory: 'قصتك',
      suggestedForYou: 'مقترح لك',
      refresh: 'تحديث',
      follow: 'متابعة',
      following: 'متابع',
      trendingHashtags: 'الهاشتاجات الشائعة',
      cancelFilter: 'إلغاء الفلتر',
      whatsOnYourMind: 'شنو كاين ف بالك؟ استعمل #هاشتاج...',
      addImage: 'أضف صورة',
      image: 'صورة',
      poll: 'استطلاع',
      createPoll: 'إنشاء استطلاع',
      pollQuestion: 'سؤال الاستطلاع...',
      option: 'الخيار',
      addOption: 'إضافة خيار',
      duration: 'مدة الاستطلاع:',
      hour: 'ساعة',
      hours: 'ساعات',
      day: 'يوم',
      days: 'أيام',
      publish: 'انشر',
      publishing: 'جاري النشر...',
      noPosts: 'مازال ما كاين حتى منشور',
      noSearchResults: 'ما لقينا والو كيطابق البحث ديالك 🔍',
      noHashtagPosts: 'ما كاين حتى منشور بـ #',
      editPost: 'تعديل المنشور',
      deletePost: 'حذف المنشور',
      save: 'حفظ',
      cancel: 'إلغاء',
      interact: 'تفاعل',
      comments: 'تعليق',
      share: 'مشاركة',
      bookmark: 'حفظ',
      unbookmark: 'إلغاء الحفظ',
      writeComment: 'كتب تعليق...',
      send: 'أرسل',
      reply: 'رد',
      hide: 'إخفاء',
      showReplies: 'عرض',
      replyText: 'اكتب رد...',
      endOfFeed: 'وصلتي للنهاية 🎉',
      loadingMore: 'جاري تحميل المزيد...',
      communityStats: 'إحصائيات المجتمع',
      appActive: 'التطبيق نشط وحي!',
      members: 'عضو',
      postsStat: 'منشور',
      interactions: 'تفاعل',
      commentsStat: 'التعليقات',
      groupsStat: 'المجموعات',
      messagesStat: 'الرسائل',
      updateStats: 'تحديث الإحصائيات',
      ended: 'انتهى الاستطلاع',
      endsIn: 'ينتهي في',
      votes: 'صوت',
      like: 'Like',
      love: 'Love',
      haha: 'Haha',
      wow: 'Wow',
      sad: 'Sad',
      angry: 'Angry'
    },
    en: {
      title: 'Molios Empire',
      searchPlaceholder: 'Search for posts or users...',
      notifications: 'Notifications',
      noNotifications: 'No new notifications 🎉',
      messages: 'Messages',
      groups: 'Groups',
      profile: 'Profile',
      yourStory: 'Your Story',
      suggestedForYou: 'Suggested for you',
      refresh: 'Refresh',
      follow: 'Follow',
      following: 'Following',
      trendingHashtags: 'Trending Hashtags',
      cancelFilter: 'Cancel Filter',
      whatsOnYourMind: "What's on your mind? Use #hashtag...",
      addImage: 'Add Image',
      image: 'Image',
      poll: 'Poll',
      createPoll: 'Create Poll',
      pollQuestion: 'Poll question...',
      option: 'Option',
      addOption: 'Add Option',
      duration: 'Poll Duration:',
      hour: 'Hour',
      hours: 'Hours',
      day: 'Day',
      days: 'Days',
      publish: 'Publish',
      publishing: 'Publishing...',
      noPosts: 'No posts yet',
      noSearchResults: 'No results found 🔍',
      noHashtagPosts: 'No posts with #',
      editPost: 'Edit Post',
      deletePost: 'Delete Post',
      save: 'Save',
      cancel: 'Cancel',
      interact: 'Interact',
      comments: 'Comments',
      share: 'Share',
      bookmark: 'Save',
      unbookmark: 'Unsave',
      writeComment: 'Write a comment...',
      send: 'Send',
      reply: 'Reply',
      hide: 'Hide',
      showReplies: 'Show',
      replyText: 'Write a reply...',
      endOfFeed: 'You reached the end 🎉',
      loadingMore: 'Loading more...',
      communityStats: 'Community Stats',
      appActive: 'The app is active and alive!',
      members: 'Members',
      postsStat: 'Posts',
      interactions: 'Interactions',
      commentsStat: 'Comments',
      groupsStat: 'Groups',
      messagesStat: 'Messages',
      updateStats: 'Update Stats',
      ended: 'Poll Ended',
      endsIn: 'Ends in',
      votes: 'Votes',
      like: 'Like',
      love: 'Love',
      haha: 'Haha',
      wow: 'Wow',
      sad: 'Sad',
      angry: 'Angry'
    }
  }

  const t = translations[language]

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'ar' | 'en'
    if (savedLang) setLanguage(savedLang)
    
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true') setDarkMode(true)
    const savedDraft = localStorage.getItem('post_draft')
    if (savedDraft) setContent(savedDraft)
  }, [])

  useEffect(() => { 
    localStorage.setItem('darkMode', darkMode.toString()) 
    localStorage.setItem('language', language)
    // تغيير اتجاه الصفحة حسب اللغة
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [darkMode, language])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission)
      const saved = localStorage.getItem('pushEnabled')
      if (saved === 'true' && Notification.permission === 'granted') setPushEnabled(true)
    }
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await fetchFollowing(user.id)
        await fetchBookmarks(user.id)
        await fetchBlockedUsers(user.id)
        await fetchTrendingHashtags()
        await fetchSuggestedUsers(user.id)
        await fetchStories()
        await fetchCommunityStats()
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => { fetchPosts(true); fetchCommunityStats() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => { fetchPosts(true); fetchCommunityStats() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => { fetchPosts(true); fetchCommunityStats() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comment_likes' }, () => fetchPosts(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comment_replies' }, () => fetchPosts(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookmarks' }, () => fetchBookmarks(user.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => { fetchStories(); fetchCommunityStats() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hashtags' }, () => fetchTrendingHashtags())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_badges' }, () => {})
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => fetchCommunityStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchCommunityStats())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, async (payload) => {
        if (payload.new.user_id === user.id) {
          setNotifications(prev => [payload.new, ...prev])
          showToast(payload.new)
          if (soundEnabled) playNotificationSound()
          if (pushEnabled) await showBrowserNotification(payload.new)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id, soundEnabled, pushEnabled])

  useEffect(() => {
    if (!observerRef.current) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loadingMore) loadMorePosts() },
      { threshold: 0.5 }
    )
    observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, posts.length])

  const showToast = (notification: any) => {
    const toast = { id: Date.now() + Math.random(), message: notification.message || getNotificationText(notification), type: notification.type }
    setToasts(prev => [...prev, toast])
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== toast.id)) }, 5000)
  }

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGNoaFbWF2ZWF0bQAAAAAAAAAAAAAAAAAAAAAA')
    audio.volume = 0.3
    audio.play().catch(() => {})
  }

  const togglePushNotifications = async () => {
    if (!('Notification' in window)) return
    if (pushEnabled) { setPushEnabled(false); localStorage.setItem('pushEnabled', 'false') }
    else {
      if (Notification.permission === 'granted') { setPushEnabled(true); localStorage.setItem('pushEnabled', 'true'); showTestNotification() }
      else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        setPushPermission(permission)
        if (permission === 'granted') { setPushEnabled(true); localStorage.setItem('pushEnabled', 'true'); showTestNotification() }
      }
    }
  }

  const showBrowserNotification = async (notification: any) => {
    if (document.visibilityState === 'visible') return
    const actorName = notification.actor?.username || 'User'
    let title = 'New Notification', body = '', icon = notification.actor?.avatar_url || '/favicon.ico'
    if (notification.type === 'like') { title = `${actorName} liked your post 👍`; body = 'Click to view' }
    else if (notification.type === 'comment') { title = `${actorName} commented on your post 💬`; body = 'Click to view' }
    else if (notification.type === 'comment_like') { title = `${actorName} liked your comment ❤️`; body = 'Click to view' }
    else if (notification.type === 'follow') { title = `${actorName} started following you 👥`; body = 'Click to view profile' }
    try {
      const n = new Notification(title, { body, icon, badge: '/favicon.ico', tag: notification.id, requireInteraction: false })
      n.onclick = () => {
        window.focus()
        if (notification.post_id) { const element = document.getElementById(`post-${notification.post_id}`); if (element) element.scrollIntoView({ behavior: 'smooth' }) }
        n.close()
      }
      setTimeout(() => n.close(), 8000)
    } catch (err) { console.error('Error showing notification:', err) }
  }

  const showTestNotification = () => {
    if (Notification.permission === 'granted') new Notification('🎉 Notifications Enabled!', { body: 'You will receive notifications from Molios Empire', icon: '/favicon.ico' })
  }

  const fetchFollowing = async (userId: string) => {
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', userId)
    if (data) setFollowing(new Set(data.map(f => f.following_id)))
  }

  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase.from('bookmarks').select('post_id').eq('user_id', userId)
    if (data) setBookmarks(new Set(data.map(b => b.post_id)))
  }

  const fetchBlockedUsers = async (userId: string) => {
    const { data } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', userId)
    if (data) setBlockedUsers(new Set(data.map(b => b.blocked_id)))
  }

  const fetchTrendingHashtags = async () => {
    const { data } = await supabase.from('hashtags').select('*').order('count', { ascending: false }).limit(10)
    if (data) setTrendingHashtags(data)
  }

  const fetchSuggestedUsers = async (userId: string) => {
    const { data: following } = await supabase.from('follows').select('following_id').eq('follower_id', userId)
    const followingIds = following?.map(f => f.following_id) || []
    let query = supabase.from('profiles').select('id, username, full_name, avatar_url').neq('id', userId).limit(4)
    if (followingIds.length > 0) query = query.not('id', 'in', `(${followingIds.join(',')})`)
    const { data } = await query
    if (data) setSuggestedUsers(data)
  }

  const fetchStories = async () => {
    const { data } = await supabase.from('stories').select(`*, profiles(id, username, avatar_url)`).gte('expires_at', new Date().toISOString()).order('created_at', { ascending: false })
    if (data) setStories(data)
  }

  const fetchCommunityStats = async () => {
    try {
      const [usersRes, postsRes, commentsRes, reactionsRes, groupsRes, messagesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('reactions').select('id', { count: 'exact', head: true }),
        supabase.from('groups').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true })
      ])
      setCommunityStats({
        users: usersRes.count || 0,
        posts: postsRes.count || 0,
        comments: commentsRes.count || 0,
        reactions: reactionsRes.count || 0,
        groups: groupsRes.count || 0,
        messages: messagesRes.count || 0
      })
    } catch (err) { console.error('Error fetching stats:', err) }
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
          id, content, user_id, profiles(username, avatar_url), comment_likes(user_id),
          comment_replies(id, content, user_id, created_at, profiles(username, avatar_url))
        ),
        post_hashtags(hashtag_id, hashtags(name)),
        polls(
          id, question, expires_at,
          poll_options(id, option_text, position, poll_votes(id, user_id))
        )
      `)
      .order('created_at', { ascending: false })
      .range(from, to)
    if (error) setError('Error fetching posts: ' + error.message)
    else if (data) {
      if (reset) setPosts(data)
      else setPosts(prev => [...prev, ...data])
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
    const { data } = await supabase.from('notifications').select(`*, actor:actor_id(username, avatar_url), post:post_id(content)`).eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
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
    await supabase.from('notifications').insert({ user_id: targetUserId, actor_id: user.id, type, post_id: postId || null, comment_id: commentId || null })
  }

  const checkAndAwardBadges = async (userId: string) => {
    const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    const { count: commentsCount } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    const { count: likesCount } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    const { count: followersCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId)
    const { count: imagesCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId).not('image_url', 'is', null)
    const { count: messagesCount } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('sender_id', userId)
    const { data: allBadges } = await supabase.from('badges').select('*')
    const { data: userBadges } = await supabase.from('user_badges').select('badge_id').eq('user_id', userId)
    const earnedBadgeIds = new Set(userBadges?.map((ub: any) => ub.badge_id) || [])
    for (const badge of allBadges || []) {
      if (earnedBadgeIds.has(badge.id)) continue
      let shouldAward = false
      if (badge.requirement_type === 'posts' && (postsCount || 0) >= badge.requirement_value) shouldAward = true
      else if (badge.requirement_type === 'comments' && (commentsCount || 0) >= badge.requirement_value) shouldAward = true
      else if (badge.requirement_type === 'likes' && (likesCount || 0) >= badge.requirement_value) shouldAward = true
      else if (badge.requirement_type === 'followers' && (followersCount || 0) >= badge.requirement_value) shouldAward = true
      else if (badge.requirement_type === 'images' && (imagesCount || 0) >= badge.requirement_value) shouldAward = true
      else if (badge.requirement_type === 'messages' && (messagesCount || 0) >= badge.requirement_value) shouldAward = true
      if (shouldAward) {
        const { error: insertError } = await supabase.from('user_badges').insert({ user_id: userId, badge_id: badge.id })
        if (!insertError) showToast({ type: 'badge', message: `🏆 Congrats! You earned the "${badge.name}" badge ${badge.icon}` })
      }
    }
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
      await checkAndAwardBadges(targetUserId)
    }
  }

  const handleBlock = async (targetUserId: string) => {
    if (!user || targetUserId === user.id) return
    if (blockedUsers.has(targetUserId)) {
      if (!confirm(language === 'ar' ? 'واش متأكد بغيتي تلغي الحظر؟' : 'Are you sure you want to unblock?')) return
      await supabase.from('blocks').delete().eq('blocker_id', user.id).eq('blocked_id', targetUserId)
      setBlockedUsers(prev => { const next = new Set(prev); next.delete(targetUserId); return next })
    } else {
      if (!confirm(language === 'ar' ? 'واش متأكد بغيتي تحظر هاد المستخدم؟' : 'Are you sure you want to block this user?')) return
      await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: targetUserId })
      setBlockedUsers(prev => new Set(prev).add(targetUserId))
      if (following.has(targetUserId)) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId)
        setFollowing(prev => { const next = new Set(prev); next.delete(targetUserId); return next })
      }
    }
    await fetchPosts(true)
  }

  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#[\w\u0600-\u06FF]+/g)
    return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : []
  }

  const saveHashtags = async (postId: string, hashtags: string[]) => {
    for (const tagName of hashtags) {
      const { data: existing } = await supabase.from('hashtags').select('id').eq('name', tagName).single()
      let hashtagId: string
      if (existing) {
        hashtagId = existing.id
        await supabase.rpc('increment_count', { badge_id: hashtagId }).then(() => {}, () => {})
      } else {
        const { data: newHashtag } = await supabase.from('hashtags').insert({ name: tagName }).select('id').single()
        if (newHashtag) hashtagId = newHashtag.id
        else continue
      }
      await supabase.from('post_hashtags').insert({ post_id: postId, hashtag_id: hashtagId }).then(() => {}, () => {})
    }
  }

  const createPoll = async (postId: string) => {
    if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) {
      alert(language === 'ar' ? 'خاص السؤال و 2 خيارات على الأقل' : 'Question and at least 2 options are required')
      return null
    }
    const expiresAt = new Date(Date.now() + pollDuration * 60 * 60 * 1000).toISOString()
    const { data: poll, error: pollError } = await supabase.from('polls').insert({ post_id: postId, question: pollQuestion, expires_at: expiresAt }).select().single()
    if (pollError || !poll) return null
    const validOptions = pollOptions.filter(o => o.trim())
    for (let i = 0; i < validOptions.length; i++) {
      await supabase.from('poll_options').insert({ poll_id: poll.id, option_text: validOptions[i], position: i + 1 })
    }
    return poll
  }

  const handlePost = async (e: any) => {
    e.preventDefault()
    if (!content.trim() && !imageFile && !showPollCreator) return
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
      const { data: postData, error: insertError } = await supabase.from('posts').insert({ user_id: user.id, content, image_url: imageUrl }).select('id').single()
      if (insertError) throw insertError
      if (showPollCreator && postData) {
        await createPoll(postData.id)
        setShowPollCreator(false)
        setPollQuestion('')
        setPollOptions(['', ''])
      }
      const hashtags = extractHashtags(content)
      if (hashtags.length > 0 && postData) {
        await saveHashtags(postData.id, hashtags)
        await fetchTrendingHashtags()
      }
      setContent('')
      localStorage.removeItem('post_draft')
      setImageFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchPosts(true)
      await checkAndAwardBadges(user.id)
    } catch (err: any) { setError('Error: ' + err.message) }
    finally { setLoading(false) }
  }

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user) return
    await supabase.from('poll_votes').delete().eq('poll_id', pollId).eq('user_id', user.id)
    await supabase.from('poll_votes').insert({ poll_id: pollId, option_id: optionId, user_id: user.id })
    await fetchPosts(true)
  }

  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingStory(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('stories').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('stories').getPublicUrl(fileName)
      await supabase.from('stories').insert({ user_id: user.id, image_url: publicUrl })
      if (storyInputRef.current) storyInputRef.current.value = ''
      await fetchStories()
    } catch (err: any) { alert('Error uploading story: ' + err.message) }
    finally { setUploadingStory(false) }
  }

  const handleReaction = async (postId: string, postOwnerId: string, reactionType: string) => {
    if (!user) return
    const post = posts.find(p => p.id === postId)
    const myReaction = post?.reactions?.find((r: any) => r.user_id === user.id)
    if (myReaction && myReaction.type === reactionType) await supabase.from('reactions').delete().eq('post_id', postId).eq('user_id', user.id)
    else if (myReaction) await supabase.from('reactions').update({ type: reactionType }).eq('post_id', postId).eq('user_id', user.id)
    else {
      await supabase.from('reactions').insert({ post_id: postId, user_id: user.id, type: reactionType })
      await sendNotification(postOwnerId, 'like', postId)
    }
    setShowReactionPicker(null)
    await fetchPosts(true)
  }

  const handleCommentLike = async (commentId: string, commentOwnerId: string, postId: string) => {
    const { data: existing } = await supabase.from('comment_likes').select('id').eq('comment_id', commentId).eq('user_id', user.id).single()
    if (existing) await supabase.from('comment_likes').delete().eq('id', existing.id)
    else {
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
    if (inserted && inserted[0]) await sendNotification(postOwnerId, 'comment', postId, inserted[0].id)
    await fetchPosts(true)
    if (user) await checkAndAwardBadges(user.id)
  }

  const handleReply = async (commentId: string, commentOwnerId: string, postId: string) => {
    const text = replyTexts[commentId]
    if (!text?.trim()) return
    const { data: inserted, error } = await supabase.from('comment_replies').insert({ comment_id: commentId, user_id: user.id, content: text }).select()
    if (error) { alert('Error replying: ' + error.message); return }
    setReplyTexts({ ...replyTexts, [commentId]: '' })
    setReplyingTo(null)
    if (inserted && inserted[0]) await sendNotification(commentOwnerId, 'comment', postId, commentId)
    await fetchPosts(true)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm(language === 'ar' ? 'واش متأكد بغيتي تحيد هاد المنشور؟' : 'Are you sure you want to delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (!error) await fetchPosts(true)
    else alert('Error deleting: ' + error.message)
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(language === 'ar' ? 'واش متأكد بغيتي تحيد هاد التعليق؟' : 'Are you sure you want to delete this comment?')) return
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (!error) await fetchPosts(true)
    else alert('Error deleting: ' + error.message)
  }

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm(language === 'ar' ? 'واش متأكد بغيتي تحيد هاد الرد؟' : 'Are you sure you want to delete this reply?')) return
    const { error } = await supabase.from('comment_replies').delete().eq('id', replyId)
    if (!error) await fetchPosts(true)
    else alert('Error deleting: ' + error.message)
  }

  const handleEditComment = (commentId: string, currentText: string) => { setEditingCommentId(commentId); setEditCommentText(currentText) }
  const handleSaveEdit = async (commentId: string) => {
    if (!editCommentText.trim()) return
    const { error } = await supabase.from('comments').update({ content: editCommentText }).eq('id', commentId)
    if (!error) { setEditingCommentId(null); setEditCommentText(''); await fetchPosts(true) }
    else alert('Error editing: ' + error.message)
  }
  const handleCancelEdit = () => { setEditingCommentId(null); setEditCommentText('') }

  const handleEditPost = (postId: string, currentContent: string) => { setEditingPostId(postId); setEditPostContent(currentContent) }
  const handleSavePostEdit = async (postId: string) => {
    if (!editPostContent.trim()) return
    const { error } = await supabase.from('posts').update({ content: editPostContent }).eq('id', postId)
    if (!error) { setEditingPostId(null); setEditPostContent(''); await fetchPosts(true) }
    else alert('Error editing: ' + error.message)
  }
  const handleCancelPostEdit = () => { setEditingPostId(null); setEditPostContent('') }

  const handleBookmark = async (postId: string) => {
    if (!user) return
    if (bookmarks.has(postId)) {
      await supabase.from('bookmarks').delete().eq('post_id', postId).eq('user_id', user.id)
      setBookmarks(prev => { const next = new Set(prev); next.delete(postId); return next })
    } else {
      await supabase.from('bookmarks').insert({ post_id: postId, user_id: user.id })
      setBookmarks(prev => new Set(prev).add(postId))
    }
  }

  const handleShare = async (post: any) => {
    const shareData = { title: 'Post from Molios Empire', text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''), url: window.location.href }
    if (navigator.share) { try { await navigator.share(shareData) } catch (err) { console.log('Error sharing:', err) } }
    else { navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`); alert(language === 'ar' ? 'تم نسخ رابط المنشور!' : 'Post link copied!') }
  }

  // 🚀 تعزيز المنشور
  const handleBoost = (post: any) => {
    setBoostingPost(post)
    setShowBoostModal(true)
  }

  const confirmBoost = async (plan: string) => {
    if (!user || !boostingPost) return
    setBoosting(true)
    try {
      const res = await fetch('/api/boosts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, postId: boostingPost.id, plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'فشل إنشاء الدفع')
        setBoosting(false)
      }
    } catch (e) {
      alert('فشل إنشاء الدفع')
      setBoosting(false)
    }
  }

  if (!user) return null

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) || post.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) || post.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const isBlocked = blockedUsers.has(post.profiles?.id)
    let matchesHashtag = true
    if (selectedHashtag) {
      const postHashtags = post.post_hashtags?.map((ph: any) => ph.hashtags?.name) || []
      matchesHashtag = postHashtags.includes(selectedHashtag)
    }
    return matchesSearch && !isBlocked && matchesHashtag
  }).sort((a, b) => {
    const aB = a.boosted_until && new Date(a.boosted_until) > new Date() ? 1 : 0
    const bB = b.boosted_until && new Date(b.boosted_until) > new Date() ? 1 : 0
    if (aB !== bB) return bB - aB
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-900'
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500'
  const inputBg = darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-200 text-gray-900'

  const getNotificationText = (n: any) => {
    const actorName = n.actor?.username || 'User'
    if (n.type === 'like') return `<b>${actorName}</b> liked your post`
    if (n.type === 'comment') return `<b>${actorName}</b> commented on your post`
    if (n.type === 'comment_like') return `<b>${actorName}</b> liked your comment`
    if (n.type === 'follow') return `<b>${actorName}</b> started following you`
    return 'New Notification'
  }

  const getReactionSummary = (reactions: any[]) => {
    if (!reactions || reactions.length === 0) return null
    const counts: {[key: string]: number} = {}
    reactions.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1 })
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    const topEmojis = sorted.slice(0, 3).map(([type]) => REACTIONS[type as keyof typeof REACTIONS].emoji)
    return { topEmojis, totalCount: reactions.length, sorted }
  }

  const renderContentWithHashtags = (content: string) => {
    const parts = content.split(/(#[\w\u0600-\u06FF]+)/g)
    return parts.map((part, idx) => {
      if (part.startsWith('#')) return <span key={idx} className="text-blue-500 hover:text-blue-600 cursor-pointer font-medium" onClick={() => setSelectedHashtag(part.substring(1).toLowerCase())}>{part}</span>
      return part
    })
  }

  const getPollResults = (poll: any) => {
    if (!poll?.poll_options) return { totalVotes: 0, options: [] }
    const options = poll.poll_options.map((opt: any) => ({
      ...opt,
      votes: opt.poll_votes?.length || 0,
      userVoted: opt.poll_votes?.some((v: any) => v.user_id === user.id) || false
    }))
    const totalVotes = options.reduce((sum: number, opt: any) => sum + opt.votes, 0)
    const userVoted = options.some((opt: any) => opt.userVoted)
    const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date()
    return { totalVotes, options, userVoted, isExpired }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`p-4 rounded-lg shadow-lg border animate-slide-in max-w-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {toast.type === 'like' && <span className="text-2xl">👍</span>}
                {toast.type === 'comment' && <span className="text-2xl">💬</span>}
                {toast.type === 'comment_like' && <span className="text-2xl">❤️</span>}
                {toast.type === 'follow' && <span className="text-2xl">👥</span>}
                {toast.type === 'badge' && <span className="text-2xl">🏆</span>}
              </div>
              <div className="flex-1"><p className={`text-sm ${textPrimary}`}>{toast.message}</p></div>
              <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <header className={`sticky top-0 z-20 border-b px-4 py-3 shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-300`}>
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <h1 className="text-xl font-bold text-blue-600">{t.title}</h1>
          <div className="relative w-full sm:w-64">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 ${textSecondary}`} size={20} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className={`w-full ${language === 'ar' ? 'pr-10' : 'pl-10'} p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${inputBg}`} />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={markNotificationsAsRead} className={`p-2 rounded-lg transition relative ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-80 rounded-xl shadow-xl border z-50 max-h-96 overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`p-3 border-b font-bold text-sm flex justify-between items-center ${darkMode ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-800'}`}>
                    <span>{t.notifications}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setSoundEnabled(!soundEnabled)} className={`text-xs px-2 py-1 rounded ${soundEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>{soundEnabled ? '🔊' : '🔇'}</button>
                      <button onClick={togglePushNotifications} className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${pushEnabled ? 'bg-green-100 text-green-600' : pushPermission === 'denied' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{pushEnabled ? <BellRing size={14} /> : <BellOff size={14} />}</button>
                    </div>
                  </div>
                  {notifications.length === 0 ? <div className="p-4 text-center text-sm text-gray-500">{t.noNotifications}</div> : notifications.map((n) => (
                    <div key={n.id} className={`p-3 border-b text-sm flex gap-3 items-start ${!n.read ? (darkMode ? 'bg-gray-700/50' : 'bg-blue-50/50') : ''} ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      {n.actor?.avatar_url ? <img src={n.actor.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" /> : <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">{n.actor?.username?.[0]?.toUpperCase() || 'U'}</div>}
                      <div><p className={textPrimary} dangerouslySetInnerHTML={{ __html: getNotificationText(n) }} /><p className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'en-US')}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
            
            {/* 🌐 زر تبديل اللغة */}
            <div className="relative">
              <button onClick={() => setShowLangMenu(!showLangMenu)} className={`p-2 rounded-lg transition ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <Globe size={18} />
              </button>
              {showLangMenu && (
                <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-32 rounded-xl shadow-xl border z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <button onClick={() => { setLanguage('ar'); setShowLangMenu(false) }} className={`w-full p-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${language === 'ar' ? 'font-bold text-blue-600' : ''}`}>🇲🇦 العربية</button>
                  <button onClick={() => { setLanguage('en'); setShowLangMenu(false) }} className={`w-full p-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${language === 'en' ? 'font-bold text-blue-600' : ''}`}>🇺🇸 English</button>
                </div>
              )}
            </div>

            <Link href="/messages" className={`flex items-center gap-2 text-sm transition ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}><MessageCircle size={18} /> <span className="hidden sm:inline">{t.messages}</span></Link>
            <Link href="/groups" className={`flex items-center gap-2 text-sm transition ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}><Users size={18} /> <span className="hidden sm:inline">{t.groups}</span></Link>
            <Link href="/profile" className={`flex items-center gap-2 text-sm transition ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}><User size={18} /> <span className="hidden sm:inline">{t.profile}</span></Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        {/* 📊 بانر إحصائيات المجتمع */}
        <div className={`rounded-xl shadow border overflow-hidden ${cardBg} transition-colors duration-300`}>
          <button 
            onClick={() => setShowStats(!showStats)}
            className={`w-full p-3 flex items-center justify-between hover:bg-opacity-80 transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`}>
                <Activity size={18} className="text-white" />
              </div>
              <div className="text-right">
                <h3 className={`font-bold text-sm ${textPrimary}`}>{t.communityStats}</h3>
                <p className="text-xs text-gray-500">{t.appActive}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{formatNumber(communityStats.users)}</p>
                  <p className="text-xs text-gray-500">{t.members}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{formatNumber(communityStats.posts)}</p>
                  <p className="text-xs text-gray-500">{t.postsStat}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-600">{formatNumber(communityStats.reactions)}</p>
                  <p className="text-xs text-gray-500">{t.interactions}</p>
                </div>
              </div>
              <ChevronRight size={20} className={`text-gray-400 transition-transform ${showStats ? (language === 'ar' ? '-rotate-90' : 'rotate-90') : ''}`} />
            </div>
          </button>

          {showStats && (
            <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} p-4 animate-fadeIn`}>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className="text-blue-600" />
                    <span className="text-xs text-gray-500">{t.members}</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{formatNumber(communityStats.users)}</p>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-green-600" />
                    <span className="text-xs text-gray-500">{t.postsStat}</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{formatNumber(communityStats.posts)}</p>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-purple-600" />
                    <span className="text-xs text-gray-500">{t.interactions}</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{formatNumber(communityStats.reactions)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle size={16} className="text-orange-600" />
                    <span className="text-xs text-gray-500">{t.commentsStat}</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{formatNumber(communityStats.comments)}</p>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-pink-900/20' : 'bg-pink-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className="text-pink-600" />
                    <span className="text-xs text-gray-500">{t.groupsStat}</span>
                  </div>
                  <p className="text-2xl font-bold text-pink-600">{formatNumber(communityStats.groups)}</p>
                </div>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-cyan-900/20' : 'bg-cyan-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Send size={16} className="text-cyan-600" />
                    <span className="text-xs text-gray-500">{t.messagesStat}</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-600">{formatNumber(communityStats.messages)}</p>
                </div>
              </div>
              <button 
                onClick={fetchCommunityStats}
                className={`w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                <RefreshCw size={14} /> {t.updateStats}
              </button>
            </div>
          )}
        </div>

        <div className={`p-4 rounded-xl shadow border ${cardBg} transition-colors duration-300`}>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="flex-shrink-0">
              <label className="cursor-pointer">
                <input ref={storyInputRef} type="file" accept="image/*" onChange={handleStoryUpload} className="hidden" />
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-500 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-gray-700 transition">
                  {uploadingStory ? <Loader className="animate-spin text-blue-500" size={24} /> : <Plus className="text-blue-500" size={24} />}
                </div>
                <p className={`text-xs text-center mt-1 ${textSecondary}`}>{t.yourStory}</p>
              </label>
            </div>
            {stories.map((story, idx) => (
              <div key={story.id} className="flex-shrink-0">
                <button onClick={() => { setViewingStory(story); setCurrentStoryIndex(idx) }} className="block">
                  <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                    <img src={story.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${story.profiles?.username}&background=random`} alt={story.profiles?.username} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-800" />
                  </div>
                  <p className={`text-xs text-center mt-1 truncate max-w-[64px] ${textPrimary}`}>{story.profiles?.username}</p>
                </button>
              </div>
            ))}
          </div>
        </div>

        {suggestedUsers.length > 0 && (
          <div className={`p-4 rounded-xl shadow border ${cardBg} transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-bold text-sm ${textPrimary} flex items-center gap-2`}><UserPlus size={16} className="text-blue-500" /> {t.suggestedForYou}</h3>
              <button onClick={() => fetchSuggestedUsers(user.id)} className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"><RefreshCw size={12} /> {t.refresh}</button>
            </div>
            <div className="space-y-3">
              {suggestedUsers.map((sUser: any) => (
                <div key={sUser.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sUser.avatar_url ? <img src={sUser.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">{sUser.username?.[0]?.toUpperCase() || 'U'}</div>}
                    <div>
                      <p className={`text-sm font-semibold ${textPrimary}`}>{sUser.full_name || sUser.username}</p>
                      <p className="text-xs text-gray-500">@{sUser.username}</p>
                    </div>
                  </div>
                  <button onClick={() => handleFollow(sUser.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${following.has(sUser.id) ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    {following.has(sUser.id) ? <><Check size={12} className="inline mr-1" /> {t.following}</> : t.follow}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {trendingHashtags.length > 0 && (
          <div className={`p-4 rounded-xl shadow border ${cardBg} transition-colors duration-300`}>
            <div className="flex items-center gap-2 mb-3"><Hash size={18} className="text-blue-500" /><h3 className={`font-bold ${textPrimary}`}>{t.trendingHashtags}</h3></div>
            <div className="flex flex-wrap gap-2">
              {selectedHashtag && <button onClick={() => setSelectedHashtag(null)} className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center gap-1"><X size={14} /> {t.cancelFilter}</button>}
              {trendingHashtags.map((tag) => (
                <button key={tag.id} onClick={() => setSelectedHashtag(tag.name)} className={`px-3 py-1 rounded-full text-sm transition ${selectedHashtag === tag.name ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400'}`}>#{tag.name} <span className="text-xs opacity-75">({tag.count})</span></button>
              ))}
            </div>
          </div>
        )}

        <div className={`p-4 rounded-xl shadow border ${cardBg} transition-colors duration-300`}>
          <form onSubmit={handlePost} className="space-y-3">
            <textarea value={content} onChange={e => { setContent(e.target.value); localStorage.setItem('post_draft', e.target.value) }} placeholder={t.whatsOnYourMind} className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`} rows={3} />
            
            {showPollCreator && (
              <div className={`p-3 rounded-lg border-2 border-dashed ${darkMode ? 'border-purple-500 bg-purple-900/10' : 'border-purple-400 bg-purple-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-bold text-sm flex items-center gap-2 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    <BarChart3 size={16} /> {t.createPoll}
                  </h4>
                  <button type="button" onClick={() => setShowPollCreator(false)} className="text-gray-500 hover:text-gray-700"><X size={16} /></button>
                </div>
                <input type="text" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder={t.pollQuestion} className={`w-full p-2 mb-2 border rounded-lg text-sm ${inputBg}`} />
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" value={opt} onChange={(e) => { const newOpts = [...pollOptions]; newOpts[idx] = e.target.value; setPollOptions(newOpts) }} placeholder={`${t.option} ${idx + 1}`} className={`flex-1 p-2 border rounded-lg text-sm ${inputBg}`} />
                    {pollOptions.length > 2 && (<button type="button" onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700"><X size={16} /></button>)}
                  </div>
                ))}
                {pollOptions.length < 4 && (<button type="button" onClick={() => setPollOptions([...pollOptions, ''])} className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"><Plus size={14} /> {t.addOption}</button>)}
                <div className="mt-2">
                  <label className="text-xs text-gray-500">{t.duration}</label>
                  <select value={pollDuration} onChange={(e) => setPollDuration(Number(e.target.value))} className={`ml-2 p-1 border rounded text-sm ${inputBg}`}>
                    <option value={1}>1 {t.hour}</option>
                    <option value={6}>6 {t.hours}</option>
                    <option value={24}>24 {t.hours}</option>
                    <option value={72}>3 {t.days}</option>
                    <option value={168}>7 {t.days}</option>
                  </select>
                </div>
              </div>
            )}

            {imageFile && (
              <div className="relative w-fit">
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="max-h-48 rounded-lg border border-gray-200" />
                <button type="button" onClick={() => { setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X size={16} /></button>
              </div>
            )}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${darkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-50'}`}><ImageIcon size={20} /> <span className="text-sm hidden sm:inline">{t.image}</span></label>
                <button type="button" onClick={() => setShowPollCreator(!showPollCreator)} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${showPollCreator ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : darkMode ? 'text-purple-400 hover:bg-gray-700' : 'text-purple-600 hover:bg-purple-50'}`}>
                  <BarChart3 size={20} /> <span className="text-sm hidden sm:inline">{t.poll}</span>
                </button>
              </div>
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition"><Send size={18} /> {loading ? t.publishing : t.publish}</button>
            </div>
          </form>
        </div>

        {filteredPosts.length === 0 ? (
          <p className={`text-center p-6 rounded-xl shadow border ${cardBg} ${textSecondary}`}>
            {searchQuery ? t.noSearchResults : selectedHashtag ? `${t.noHashtagPosts}${selectedHashtag}` : t.noPosts}
          </p>
        ) : (
          <>
            {filteredPosts.map(post => {
              const myReaction = post.reactions?.find((r: any) => r.user_id === user.id)
              const summary = getReactionSummary(post.reactions)
              const poll = post.polls?.[0]
              const pollResults = poll ? getPollResults(poll) : null
              
              return (
                <div key={post.id} id={`post-${post.id}`} className={`p-4 rounded-xl shadow border ${cardBg} transition-colors duration-300`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">{post.profiles?.username?.[0]?.toUpperCase() || 'U'}</div>}
                      <span className={`font-bold ${textPrimary}`}>{post.profiles?.full_name || post.profiles?.username}</span>
                      {post.boosted_until && new Date(post.boosted_until) > new Date() && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">⭐ مميز</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {post.user_id === user.id && (<>
                        <button onClick={() => handleEditPost(post.id, post.content)} className="text-gray-400 hover:text-blue-600 transition p-1" title={t.editPost}><Pencil size={16} /></button>
                        <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-600 transition p-1" title={t.deletePost}><Trash2 size={18} /></button>
                      </>)}
                      {post.user_id !== user.id && (<>
                        <button onClick={() => handleFollow(post.profiles.id)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition ${following.has(post.profiles.id) ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{following.has(post.profiles.id) ? <><Check size={16} /> {t.following}</> : <><UserPlus size={16} /> {t.follow}</>}</button>
                        <button onClick={() => handleBlock(post.profiles.id)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition ${blockedUsers.has(post.profiles.id) ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`} title={blockedUsers.has(post.profiles.id) ? 'Unblock' : 'Block'}><Ban size={16} /></button>
                      </>)}
                    </div>
                  </div>
                  
                  {editingPostId === post.id ? (
                    <div className="space-y-2 mb-3">
                      <textarea value={editPostContent} onChange={(e) => setEditPostContent(e.target.value)} className={`w-full p-3 border rounded-lg ${inputBg}`} rows={3} autoFocus />
                      <div className="flex gap-2">
                        <button onClick={() => handleSavePostEdit(post.id)} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"><Save size={14} /> {t.save}</button>
                        <button onClick={handleCancelPostEdit} className="flex items-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition"><X size={14} /> {t.cancel}</button>
                      </div>
                    </div>
                  ) : (
                    <p className={`${textPrimary} mb-3 whitespace-pre-wrap`}>{renderContentWithHashtags(post.content)}</p>
                  )}
                  
                  {post.image_url && <img src={post.image_url} alt="Post" className="w-full rounded-lg mb-3 max-h-96 object-cover border border-gray-200" />}
                  
                  {pollResults && (
                    <div className={`mb-3 p-4 rounded-lg border-2 ${darkMode ? 'border-purple-500/30 bg-purple-900/10' : 'border-purple-200 bg-purple-50/50'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 size={18} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                        <h4 className={`font-bold ${textPrimary}`}>{poll.question}</h4>
                      </div>
                      <div className="space-y-2">
                        {pollResults.options.map((opt: any) => {
                          const percentage = pollResults.totalVotes > 0 ? (opt.votes / pollResults.totalVotes) * 100 : 0
                          const showResults = pollResults.userVoted || pollResults.isExpired
                          return (
                            <button key={opt.id} onClick={() => !showResults && !pollResults.isExpired && handleVote(poll.id, opt.id)} disabled={showResults || pollResults.isExpired} className={`w-full text-left p-3 rounded-lg border-2 transition relative overflow-hidden ${opt.userVoted ? darkMode ? 'border-purple-500 bg-purple-900/30' : 'border-purple-500 bg-purple-100' : showResults ? darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50' : darkMode ? 'border-gray-600 hover:border-purple-500 hover:bg-gray-700' : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'} ${showResults || pollResults.isExpired ? 'cursor-default' : 'cursor-pointer'}`}>
                              {showResults && (<div className={`absolute top-0 left-0 h-full transition-all ${opt.userVoted ? darkMode ? 'bg-purple-500/30' : 'bg-purple-200' : darkMode ? 'bg-gray-600/50' : 'bg-gray-200'}`} style={{ width: `${percentage}%` }} />)}
                              <div className="relative flex items-center justify-between">
                                <span className={`font-medium text-sm ${textPrimary}`}>{opt.userVoted && '✓ '}{opt.option_text}</span>
                                {showResults && (<span className={`text-sm font-bold ${textPrimary}`}>{percentage.toFixed(1)}% ({opt.votes})</span>)}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Vote size={12} /> {pollResults.totalVotes} {t.votes}</span>
                        {pollResults.isExpired ? (<span className="text-red-500 font-medium">{t.ended}</span>) : poll.expires_at ? (<span>{t.endsIn} {new Date(poll.expires_at).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'en-US')} {new Date(poll.expires_at).toLocaleTimeString(language === 'ar' ? 'ar-MA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>) : null}
                      </div>
                    </div>
                  )}
                  
                  {summary && summary.totalCount > 0 && (
                    <div className={`flex items-center gap-2 mb-2 text-sm ${textSecondary}`}>
                      <div className="flex -space-x-1">{summary.topEmojis.map((emoji, idx) => <span key={idx} className="text-base">{emoji}</span>)}</div>
                      <span>{summary.totalCount}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-2 border-t border-b py-2 relative">
                    <div className="relative flex-1">
                      <button onMouseEnter={() => setShowReactionPicker(post.id)} onMouseLeave={() => setShowReactionPicker(null)} onClick={() => handleReaction(post.id, post.user_id, myReaction?.type || 'like')} className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition ${myReaction ? `${REACTIONS[myReaction.type as keyof typeof REACTIONS].color} font-medium` : `${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
                        {myReaction ? (<><span className="text-xl">{REACTIONS[myReaction.type as keyof typeof REACTIONS].emoji}</span><span className="text-sm">{t[myReaction.type as keyof typeof t]}</span></>) : (<><ThumbsUp size={18} /><span className="text-sm">{t.interact}</span></>)}
                      </button>
                      {showReactionPicker === post.id && (
                        <div className={`absolute bottom-full left-0 mb-2 flex gap-1 p-2 rounded-full shadow-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                          {Object.entries(REACTIONS).map(([type, data]) => (<button key={type} onClick={() => handleReaction(post.id, post.user_id, type)} onMouseEnter={() => setShowReactionPicker(post.id)} className="text-2xl hover:scale-125 transition-transform p-1" title={t[type as keyof typeof t]}>{data.emoji}</button>))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`}><MessageCircle size={18} /> <span className="text-sm">{post.comments?.length || 0} {t.comments}</span></button>
                    <button onClick={() => handleShare(post)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`}><Share2 size={18} /> <span className="text-sm hidden sm:inline">{t.share}</span></button>
                    <button onClick={() => handleBookmark(post.id)} className={`flex items-center justify-center p-2 rounded-lg transition ${bookmarks.has(post.id) ? 'text-yellow-500' : `${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`}`} title={bookmarks.has(post.id) ? t.unbookmark : t.bookmark}><Bookmark size={18} className={bookmarks.has(post.id) ? 'fill-yellow-500' : ''} /></button>
                    <button onClick={() => handleBoost(post)} className={`flex items-center justify-center p-2 rounded-lg transition ${post.boosted_until && new Date(post.boosted_until) > new Date() ? 'text-orange-500' : `${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`}`} title="تعزيز المنشور"><Rocket size={18} className={post.boosted_until && new Date(post.boosted_until) > new Date() ? 'fill-orange-400' : ''} /></button>
                  </div>

                  {showComments[post.id] && (
                    <div className={`mt-4 space-y-3 border-t pt-3 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      {post.comments?.map((comment: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                          <div className={`p-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className="flex items-start gap-2">
                              {comment.profiles?.avatar_url ? <img src={comment.profiles.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full object-cover" /> : <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">{comment.profiles?.username?.[0]?.toUpperCase() || 'U'}</div>}
                              <div className="flex-1">
                                {editingCommentId === comment.id ? (
                                  <div className="space-y-2">
                                    <input type="text" value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className={`w-full p-2 border rounded-lg text-sm ${inputBg}`} autoFocus />
                                    <div className="flex gap-2">
                                      <button onClick={() => handleSaveEdit(comment.id)} className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition"><Save size={12} /> {t.save}</button>
                                      <button onClick={handleCancelEdit} className="flex items-center gap-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-500 transition"><X size={12} /> {t.cancel}</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1"><span className={`font-bold ${textPrimary}`}>{comment.profiles?.username}: </span><span className={textPrimary}>{comment.content}</span></div>
                                      {comment.user_id === user.id && (
                                        <div className="flex gap-1 flex-shrink-0">
                                          <button onClick={() => handleEditComment(comment.id, comment.content)} className="text-blue-500 hover:text-blue-700 transition p-1" title="Edit Comment"><Pencil size={14} /></button>
                                          <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 hover:text-red-700 transition p-1" title="Delete Comment"><Trash2 size={14} /></button>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      <button onClick={() => handleCommentLike(comment.id, comment.user_id, post.id)} className={`flex items-center gap-1 text-xs transition ${comment.comment_likes?.some((l: any) => l.user_id === user.id) ? 'text-red-500' : `${textSecondary} hover:text-red-500`}`}><Heart size={12} className={comment.comment_likes?.some((l: any) => l.user_id === user.id) ? 'fill-red-500' : ''} /><span>{comment.comment_likes?.length || 0}</span></button>
                                      <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500 transition"><Reply size={12} /> {t.reply}</button>
                                      {comment.comment_replies?.length > 0 && (<button onClick={() => setShowReplies({ ...showReplies, [comment.id]: !showReplies[comment.id] })} className="text-xs text-blue-500 hover:text-blue-600 transition">{showReplies[comment.id] ? t.hide : `${t.showReplies} ${comment.comment_replies.length} ${t.reply}`}</button>)}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {showReplies[comment.id] && comment.comment_replies?.length > 0 && (
                            <div className="ml-8 space-y-2">
                              {comment.comment_replies.map((reply: any) => (
                                <div key={reply.id} className={`p-2 rounded-lg text-sm ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                                  <div className="flex items-start gap-2">
                                    {reply.profiles?.avatar_url ? <img src={reply.profiles.avatar_url} alt="Avatar" className="w-5 h-5 rounded-full object-cover" /> : <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">{reply.profiles?.username?.[0]?.toUpperCase() || 'U'}</div>}
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1"><span className={`font-bold ${textPrimary} text-xs`}>{reply.profiles?.username}: </span><span className={`${textPrimary} text-xs`}>{reply.content}</span></div>
                                        {reply.user_id === user.id && (<button onClick={() => handleDeleteReply(reply.id)} className="text-red-500 hover:text-red-700 transition p-1" title="Delete Reply"><Trash2 size={10} /></button>)}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">{new Date(reply.created_at).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'en-US')}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {replyingTo === comment.id && (
                            <div className="ml-8 flex gap-2">
                              <input type="text" value={replyTexts[comment.id] || ''} onChange={(e) => setReplyTexts({ ...replyTexts, [comment.id]: e.target.value })} placeholder={t.replyText} className={`flex-1 p-2 border rounded-lg text-sm ${inputBg}`} onKeyPress={(e) => { if (e.key === 'Enter') handleReply(comment.id, comment.user_id, post.id) }} autoFocus />
                              <button onClick={() => handleReply(comment.id, comment.user_id, post.id)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition">{t.reply}</button>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input type="text" value={commentTexts[post.id] || ''} onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })} placeholder={t.writeComment} className={`flex-1 p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${inputBg}`} onKeyPress={(e) => { if (e.key === 'Enter') handleComment(post.id, post.user_id) }} />
                        <button onClick={() => handleComment(post.id, post.user_id)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition">{t.send}</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={observerRef} className="flex justify-center py-4">
              {loadingMore && (<div className="flex items-center gap-2 text-gray-500"><Loader className="animate-spin" size={20} /><span>{t.loadingMore}</span></div>)}
              {!hasMore && posts.length > 0 && <p className="text-gray-400 text-sm">{t.endOfFeed}</p>}
            </div>
          </>
        )}
      </div>

      {viewingStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button onClick={() => setViewingStory(null)} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"><X size={32} /></button>
          <div className="relative max-w-2xl w-full h-full flex items-center justify-center">
            <img src={viewingStory.image_url} alt="Story" className="max-h-full max-w-full object-contain" />
            <div className="absolute top-4 left-4 flex items-center gap-2 text-white">
              <img src={viewingStory.profiles?.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white" />
              <span className="font-bold">{viewingStory.profiles?.username}</span>
              <span className="text-sm opacity-75">{new Date(viewingStory.created_at).toLocaleTimeString(language === 'ar' ? 'ar-MA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {currentStoryIndex > 0 && (<button onClick={() => { setCurrentStoryIndex(currentStoryIndex - 1); setViewingStory(stories[currentStoryIndex - 1]) }} className="absolute left-4 text-white hover:text-gray-300"><ChevronLeft size={48} /></button>)}
            {currentStoryIndex < stories.length - 1 && (<button onClick={() => { setCurrentStoryIndex(currentStoryIndex + 1); setViewingStory(stories[currentStoryIndex + 1]) }} className="absolute right-4 text-white hover:text-gray-300"><ChevronRight size={48} /></button>)}
          </div>
        </div>
      )}

      {/* 🚀 modal تعزيز المنشور */}
      {showBoostModal && boostingPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl shadow-xl w-full max-w-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${textPrimary}`}>
                <Rocket className="text-orange-500" size={20} /> تعزيز المنشور
              </h2>
              <button onClick={() => { setShowBoostModal(false); setBoostingPost(null) }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className={`text-sm mb-4 ${textSecondary}`}>
              منشورك كايبان فـ الأول لـ {''} مدة التعزيز. اختر الخطة:
            </p>
            <div className="space-y-2">
              {[
                { plan: '24h', label: '24 ساعة', amount: 10 },
                { plan: '72h', label: '72 ساعة', amount: 30 },
                { plan: '7d', label: '7 أيام', amount: 50 },
              ].map(p => (
                <button
                  key={p.plan}
                  disabled={boosting}
                  onClick={() => confirmBoost(p.plan)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} disabled:opacity-50`}
                >
                  <span className={`font-medium ${textPrimary}`}>⭐ {p.label}</span>
                  <span className="font-bold text-orange-500">{p.amount} MAD</span>
                </button>
              ))}
            </div>
            <button onClick={() => { setShowBoostModal(false); setBoostingPost(null) }} className={`w-full mt-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  )
}