'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Send, MessageCircle, Plus, X, Users } from 'lucide-react'
import Link from 'next/link'

export default function Messages() {
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  
  // حالات المودال
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [searchUser, setSearchUser] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }
      setUser(user)
      fetchConversations(user.id)
      fetchAllUsers(user.id)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('realtime-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        if (selectedConversation) {
          fetchMessages(selectedConversation.id)
        }
        fetchConversations(user.id)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        fetchConversations(user.id)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async (userId: string) => {
    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1_profile:participant_1(username, avatar_url, full_name),
        participant_2_profile:participant_2(username, avatar_url, full_name)
      `)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false })
    
    if (data) setConversations(data)
  }

  const fetchAllUsers = async (currentUserId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .neq('id', currentUserId)
    
    if (data) setAllUsers(data)
  }

  const fetchMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(username, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    
    if (data) setMessages(data)
  }

  const startConversation = async (otherUserId: string) => {
    if (!user) return
    
    // Check if conversation exists
    const { data: existing } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1_profile:participant_1(username, avatar_url, full_name),
        participant_2_profile:participant_2(username, avatar_url, full_name)
      `)
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
      .single()
    
    let conversation: any
    
    if (existing) {
      conversation = existing
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ participant_1: user.id, participant_2: otherUserId })
        .select(`
          *,
          participant_1_profile:participant_1(username, avatar_url, full_name),
          participant_2_profile:participant_2(username, avatar_url, full_name)
        `)
        .single()
      
      conversation = newConv
    }
    
    setSelectedConversation(conversation)
    fetchMessages(conversation.id)
    fetchConversations(user.id)
    setShowNewChatModal(false)
  }

  const sendMessage = async (e: any) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || !user) return
    
    setLoading(true)
    try {
      await supabase.from('messages').insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content: newMessage
      })
      
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation.id)
      
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOtherParticipant = (conv: any) => {
    if (!user) return null
    return conv.participant_1 === user.id ? conv.participant_2_profile : conv.participant_1_profile
  }

  const filteredUsers = allUsers.filter(u => 
    u.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchUser.toLowerCase())
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 border-b px-4 py-3 shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
              <ArrowLeft size={20} /> رجوع
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">الرسائل</h1>
          </div>
          
          <button 
            onClick={() => setShowNewChatModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            <Plus size={18} /> محادثة جديدة
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 flex gap-4 h-[calc(100vh-100px)]">
        {/* قائمة المحادثات */}
        <div className="w-1/3 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 overflow-y-auto">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle size={18} /> المحادثات
          </div>
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p>ما كاين حتى محادثة</p>
              <button 
                onClick={() => setShowNewChatModal(true)}
                className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                + ابدأ محادثة جديدة
              </button>
            </div>
          ) : (
            conversations.map(conv => {
              const other = getOtherParticipant(conv)
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv)
                    fetchMessages(conv.id)
                  }}
                  className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                    selectedConversation?.id === conv.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {other?.avatar_url ? (
                      <img src={other.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {other?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {other?.full_name || other?.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {new Date(conv.last_message_at).toLocaleDateString('ar-MA')}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* منطقة الرسائل */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 flex flex-col">
          {selectedConversation ? (
            <>
              {/* رأس المحادثة */}
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                {(() => {
                  const other = getOtherParticipant(selectedConversation)
                  return other?.avatar_url ? (
                    <img src={other.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {other?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )
                })()}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {(() => {
                      const other = getOtherParticipant(selectedConversation)
                      return other?.full_name || other?.username
                    })()}
                  </p>
                </div>
              </div>

              {/* الرسائل */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                    ابدأ المحادثة بإرسال رسالة 👋
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender_id === user.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* إدخال الرسالة */}
              <form onSubmit={sendMessage} className="p-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالة..."
                  className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>اختار محادثة أو ابدأ واحدة جديدة</p>
                <button 
                  onClick={() => setShowNewChatModal(true)}
                  className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  + محادثة جديدة
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal لاختيار مستخدم */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">محادثة جديدة</h2>
              <button onClick={() => setShowNewChatModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="ابحث عن مستخدم..."
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredUsers.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">ما لقينا حتى مستخدم</p>
                ) : (
                  filteredUsers.map(u => (
                    <div
                      key={u.id}
                      onClick={() => startConversation(u.id)}
                      className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 transition"
                    >
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {u.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {u.full_name || u.username}
                        </p>
                        <p className="text-xs text-gray-500">@{u.username}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}