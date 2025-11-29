import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { getConversationsForUser, getConversationMessages, sendChatMessage, getOrCreateConversation, Conversation, ChatMessage, getUsers } from '../lib/api'

export default function Messages() {
  const [activeTab, setActiveTab] = useState<'messages'>('messages')
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined)
  useEffect(() => {
    const infoStr = localStorage.getItem('user_info')
    if (infoStr) { try { const obj = JSON.parse(infoStr); if (obj?.id) setCurrentUserId(obj.id) } catch { } }
    if (!currentUserId) {
      const token = localStorage.getItem('auth_token')
      if (token && token.split('.').length === 3) { try { const payload = JSON.parse(atob(token.split('.')[1])); setCurrentUserId(payload.sub || payload.id) } catch { } }
    }
  }, [])

  // Conversations & chat
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Load conversations
  useEffect(() => { if (currentUserId) getConversationsForUser(currentUserId).then(setConversations).catch(() => setConversations([])) }, [currentUserId])
  // Load users cho dropdown tạo hội thoại
  useEffect(() => { getUsers().then(list => setUsers(list.filter(u => u.id !== currentUserId))).catch(() => setUsers([])) }, [currentUserId])
  // Auto scroll
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSelectConversation = async (c: Conversation) => {
    setSelectedConversation(c)
    setMessages([])
    const list = await getConversationMessages(c.id).catch(() => [])
    // Sắp xếp theo thời gian tăng dần để hiển thị như chat
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    setMessages(list)
  }

  const handleStartConversation = async (otherUserId: string) => {
    if (!currentUserId) return
    const convo = await getOrCreateConversation(currentUserId, otherUserId).catch(() => null)
    if (!convo) return
    if (!conversations.find(c => c.id === convo.id)) setConversations(prev => [convo, ...prev])
    handleSelectConversation(convo)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return
    const recipientId = currentUserId === selectedConversation.participant1Id ? selectedConversation.participant2Id : selectedConversation.participant1Id
    try {
      await sendChatMessage({ conversationId: selectedConversation.id, senderId: currentUserId, recipientId, content: newMessage.trim() })
      setNewMessage('')
      const updated = await getConversationMessages(selectedConversation.id).catch(() => messages)
      updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      setMessages(updated)
    } catch (err) { console.error(err) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tin nhắn</h1>
        <p className="text-gray-600 mt-2">Trao đổi tin nhắn với người dùng</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button onClick={() => setActiveTab('messages')} className={'group inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition ' + (activeTab === 'messages' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}><MessageSquare className="mr-2 h-4 w-4" /> Chat</button>
        </nav>
      </div>

      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-4">
            <div className="card">
              <h3 className="text-sm font-semibold mb-3">Cuộc hội thoại</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {(conversations || []).map(c => (
                  <button key={c.id} onClick={() => handleSelectConversation(c)} className={'w-full text-left border rounded-lg px-3 py-2 hover:bg-gray-50 ' + (selectedConversation?.id === c.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200')}>
                    <p className="text-sm font-medium truncate">{c.lastMessagePreview || 'Chưa có tin nhắn'}</p>
                    <p className="text-xs text-gray-500">{new Date(c.lastMessageAt).toLocaleString('vi-VN')}</p>
                  </button>
                ))}
                {(!conversations || conversations.length === 0) && <p className="text-sm text-gray-500">Không có hội thoại.</p>}
              </div>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold mb-2">Tạo hội thoại mới</h3>
              <StartConversationForm users={users} currentUserId={currentUserId} onStart={handleStartConversation} />
            </div>
          </div>
          <div className="md:col-span-8 flex flex-col card">
            <h3 className="text-sm font-semibold mb-3">{selectedConversation ? 'Tin nhắn' : 'Chọn một cuộc hội thoại'}</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {/* Hiển thị theo ngày với separator */}
              {(() => {
                const items: JSX.Element[] = []
                let lastDay = ''
                for (const m of (messages || [])) {
                  const d = new Date(m.createdAt)
                  const dayKey = d.toLocaleDateString('vi-VN')
                  if (dayKey !== lastDay) {
                    lastDay = dayKey
                    items.push(
                      <div key={'sep-' + dayKey} className="text-center text-xs text-gray-500 my-2">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">{dayKey}</span>
                      </div>
                    )
                  }
                  // Xác định phía hiển thị: mình hay đối phương
                  let isMe = false
                  if (currentUserId) {
                    if (m.senderId) isMe = m.senderId === currentUserId
                    else if (m.recipientId) isMe = m.recipientId !== currentUserId
                    else if (selectedConversation) {
                      // fallback: nếu không có sender/recipient, coi participant1 là đối phương khi currentUser là participant2
                      isMe = selectedConversation.participant2Id === currentUserId
                    }
                  }
                  items.push(
                    <div key={m.id} className={'rounded-lg px-3 py-2 text-sm max-w-[70%] ' + (isMe ? 'ml-auto bg-primary-600 text-white' : 'bg-gray-200 text-gray-800')}>
                      {m.content}
                      <div className={"text-[10px] mt-1 opacity-70 " + (isMe ? 'text-white' : 'text-gray-700')}>
                        {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )
                }
                return items
              })()}
              <div ref={messagesEndRef} />
              {selectedConversation && (!messages || messages.length === 0) && <p className="text-xs text-gray-500">Chưa có tin nhắn.</p>}
            </div>
            {selectedConversation && (
              <form onSubmit={handleSendMessage} className="mt-4 flex gap-3">
                <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 border rounded-lg px-3 py-2" />
                <button type="submit" disabled={!newMessage.trim()} className="btn-primary flex items-center gap-2 disabled:opacity-50"><Send className="w-4 h-4" />Gửi</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StartConversationForm({ users, currentUserId, onStart }: { users: any[]; currentUserId?: string; onStart: (otherId: string) => void }) {
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  if (!currentUserId) return <p className="text-xs text-gray-500">Bạn cần đăng nhập để tạo hội thoại.</p>
  const filtered = (users || [])
    .filter(u => (u.fullName || u.phone || '').toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => String(a.role).localeCompare(String(b.role)))
  const byRole: Record<string, any[]> = filtered.reduce((acc, u) => { (acc[u.role] ||= []).push(u); return acc }, {})
  return (
    <form onSubmit={e => { e.preventDefault(); if (selectedId) onStart(selectedId) }} className="space-y-3">
      <input value={query} onChange={e => { setQuery(e.target.value); setSelectedId('') }} placeholder="Tìm tên / số điện thoại..." className="w-full border rounded-lg px-3 py-2 text-sm" />
      <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
        <option value="">-- Chọn người dùng --</option>
        {Object.entries(byRole).map(([role, list]) => (
          <optgroup key={role} label={String(role).toUpperCase()}>
            {list.map(u => (<option key={u.id} value={u.id}>{(u.fullName || u.phone || u.id) + (u.role ? ` (${u.role})` : '')}</option>))}
          </optgroup>
        ))}
      </select>
      {filtered.length === 0 && <p className="text-xs text-gray-500">Không tìm thấy người dùng phù hợp.</p>}
      <button type="submit" disabled={!selectedId} className="btn-primary w-full text-sm disabled:opacity-50">Tạo hội thoại</button>
    </form>
  )
}