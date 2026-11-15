'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Plus, Users, UserPlus, UserMinus, X, Image as ImageIcon, Send, Trash2, Settings, Globe, Lock } from 'lucide-react'
import Link from 'next/link'

export default function Groups() {
  const [user, setUser] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [myGroups, setMyGroups] = useState<any[]>([])
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [groupPosts, setGroupPosts] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [newContent, setNewContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [newGroupPrivate, setNewGroupPrivate] = useState(false)
  const [view, setView] = useState<'list' | 'my' | 'group'>('list')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const postsEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }
      setUser(user)
      await fetchGroups()
      await fetchMyGroups(user.id)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel('realtime-groups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => fetchGroups())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, () => {
        fetchMyGroups(user.id)
        if (selectedGroup) fetchMembers(selectedGroup.id)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_posts' }, () => {
        if (selectedGroup) fetchGroupPosts(selectedGroup.id)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user?.id, selectedGroup])

  const fetchGroups = async () => {
    const { data } = await supabase.from('groups').select(`*, creator:creator_id(username, avatar_url)`).order('created_at', { ascending: false })
    if (data) setGroups(data)
  }

  const fetchMyGroups = async (userId: string) => {
    const { data } = await supabase
      .from('group_members')
      .select(`*, groups:group_id(*, creator:creator_id(username, avatar_url))`)
      .eq('user_id', userId)
    if (data) setMyGroups(data.map((m: any) => m.groups))
  }

  const fetchMembers = async (groupId: string) => {
    const { data } = await supabase
      .from('group_members')
      .select(`*, profiles:user_id(id, username, avatar_url, full_name)`)
      .eq('group_id', groupId)
    if (data) setMembers(data)
  }

  const fetchGroupPosts = async (groupId: string) => {
    const { data } = await supabase
      .from('group_posts')
      .select(`*, profiles:user_id(id, username, avatar_url, full_name)`)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
    if (data) setGroupPosts(data)
  }

  const openGroup = async (group: any) => {
    setSelectedGroup(group)
    setView('group')
    await fetchMembers(group.id)
    await fetchGroupPosts(group.id)
  }

  const createGroup = async () => {
    if (!newGroupName.trim() || !user) return
    setLoading(true)
    try {
      const { data: newGroup, error } = await supabase
        .from('groups')
        .insert({ name: newGroupName, description: newGroupDesc, creator_id: user.id, is_private: newGroupPrivate })
        .select()
        .single()
      if (error) throw error
      
      await supabase.from('group_members').insert({ group_id: newGroup.id, user_id: user.id, role: 'admin' })
      
      setNewGroupName(''); setNewGroupDesc(''); setNewGroupPrivate(false)
      setShowCreateModal(false)
      await fetchGroups()
      await fetchMyGroups(user.id)
    } catch (err: any) { alert('خطأ: ' + err.message) }
    finally { setLoading(false) }
  }

  const joinGroup = async (groupId: string) => {
    if (!user) return
    await supabase.from('group_members').insert({ group_id: groupId, user_id: user.id })
    await fetchMyGroups(user.id)
    if (selectedGroup?.id === groupId) await fetchMembers(groupId)
  }

  const leaveGroup = async (groupId: string) => {
    if (!user) return
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', user.id)
    await fetchMyGroups(user.id)
    if (selectedGroup?.id === groupId) {
      await fetchMembers(groupId)
      setView('list')
      setSelectedGroup(null)
    }
  }

  const handlePost = async (e: any) => {
    e.preventDefault()
    if (!newContent.trim() || !selectedGroup || !user) return
    setLoading(true)
    let imageUrl = null
    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `group-${selectedGroup.id}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('posts').upload(fileName, imageFile)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(fileName)
        imageUrl = publicUrl
      }
      await supabase.from('group_posts').insert({ group_id: selectedGroup.id, user_id: user.id, content: newContent, image_url: imageUrl })
      setNewContent(''); setImageFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchGroupPosts(selectedGroup.id)
    } catch (err: any) { alert('خطأ: ' + err.message) }
    finally { setLoading(false) }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('واش متأكد؟')) return
    await supabase.from('group_posts').delete().eq('id', postId)
    if (selectedGroup) await fetchGroupPosts(selectedGroup.id)
  }

  const isMember = (groupId: string) => myGroups.some(g => g.id === groupId)
  const isAdmin = selectedGroup ? members.some(m => m.user_id === user?.id && m.role === 'admin') : false

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 border-b px-4 py-3 shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
              <ArrowLeft size={20} /> رجوع
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">المجموعات</h1>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            <Plus size={18} /> مجموعة جديدة
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {view === 'group' && selectedGroup ? (
          <>
            <button onClick={() => { setView('list'); setSelectedGroup(null) }} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 mb-4">
              <ArrowLeft size={18} /> رجوع للمجموعات
            </button>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {selectedGroup.is_private ? <Lock size={20} /> : <Globe size={20} />}
                    {selectedGroup.name}
                  </h2>
                  {selectedGroup.description && <p className="text-gray-600 dark:text-gray-300 mt-2">{selectedGroup.description}</p>}
                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                    <Users size={14} /> {members.length} عضو
                  </p>
                </div>
                {isMember(selectedGroup.id) ? (
                  <button onClick={() => leaveGroup(selectedGroup.id)} className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition text-sm">
                    <UserMinus size={16} /> مغادرة
                  </button>
                ) : (
                  <button onClick={() => joinGroup(selectedGroup.id)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                    <UserPlus size={16} /> انضمام
                  </button>
                )}
              </div>
            </div>

            {isMember(selectedGroup.id) && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-4">
                <form onSubmit={handlePost} className="space-y-3">
                  <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="شارك شي حاجة مع المجموعة..." className="w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" rows={3} />
                  {imageFile && (
                    <div className="relative w-fit">
                      <img src={URL.createObjectURL(imageFile)} alt="Preview" className="max-h-40 rounded-lg" />
                      <button type="button" onClick={() => { setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={14} /></button>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" id="group-image" />
                    <label htmlFor="group-image" className="flex items-center gap-2 text-blue-600 cursor-pointer hover:text-blue-700 text-sm">
                      <ImageIcon size={18} /> أضف صورة
                    </label>
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm">
                      <Send size={16} /> {loading ? 'جاري النشر...' : 'انشر'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {groupPosts.length === 0 ? (
                <p className="text-center text-gray-500 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">مازال ما كاين حتى منشور فـ هاد المجموعة</p>
              ) : (
                groupPosts.map((post: any) => (
                  <div key={post.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">{post.profiles?.username?.[0]?.toUpperCase() || 'U'}</div>}
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{post.profiles?.full_name || post.profiles?.username}</span>
                      </div>
                      {post.user_id === user.id && (
                        <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                      )}
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 mb-2 whitespace-pre-wrap">{post.content}</p>
                    {post.image_url && <img src={post.image_url} alt="" className="w-full rounded-lg max-h-96 object-cover mb-2" />}
                    <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString('ar-MA')}</p>
                  </div>
                ))
              )}
              <div ref={postsEndRef} />
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setView('list')} className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>كل المجموعات</button>
              <button onClick={() => setView('my')} className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${view === 'my' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>مجموعاتي ({myGroups.length})</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(view === 'list' ? groups : myGroups).map((group: any) => (
                <div key={group.id} onClick={() => openGroup(group)} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow cursor-pointer hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {group.is_private ? <Lock size={14} /> : <Globe size={14} />}
                      {group.name}
                    </h3>
                    {isMember(group.id) && <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">عضو</span>}
                  </div>
                  {group.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{group.description}</p>}
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Users size={12} /> {group.creator?.username}</p>
                </div>
              ))}
            </div>

            {(view === 'list' ? groups : myGroups).length === 0 && (
              <p className="text-center text-gray-500 bg-white dark:bg-gray-800 p-8 rounded-xl shadow">
                {view === 'list' ? 'مازال ما كاين حتى مجموعة' : 'مازال ما انضميتي حتى مجموعة'}
              </p>
            )}
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">مجموعة جديدة</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="اسم المجموعة" className="w-full p-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              <textarea value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} placeholder="وصف المجموعة (اختياري)" rows={3} className="w-full p-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newGroupPrivate} onChange={(e) => setNewGroupPrivate(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm text-gray-700 dark:text-gray-300">مجموعة خاصة</span>
              </label>
              <div className="flex gap-2">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm">إلغاء</button>
                <button onClick={createGroup} disabled={loading || !newGroupName.trim()} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm">{loading ? 'جاري الإنشاء...' : 'إنشاء'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}