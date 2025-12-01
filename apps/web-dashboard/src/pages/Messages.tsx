import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Plus, X, Phone, MoreHorizontal, Paperclip, Search } from 'lucide-react'
import { getConversationsForUser, getConversationMessages, sendChatMessage, getOrCreateConversation, Conversation, ChatMessage, getUsers } from '../lib/api'

export default function Messages() {
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

  // UI state additions
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [conversationSearch, setConversationSearch] = useState('')

  // Load conversations & users
  useEffect(() => { if (currentUserId) getConversationsForUser(currentUserId).then(setConversations).catch(() => setConversations([])) }, [currentUserId])
  useEffect(() => { getUsers().then(list => setUsers(list.filter(u => u.id !== currentUserId))).catch(() => setUsers([])) }, [currentUserId])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  // Thêm: Tự động tải lại tin nhắn mỗi 3 giây khi đang mở hội thoại
  useEffect(() => {
    if (!selectedConversation) return

    const interval = setInterval(async () => {
      try {
        const list = await getConversationMessages(selectedConversation.id)
        // Chỉ cập nhật nếu số lượng tin nhắn thay đổi hoặc có tin mới
        // (Ở đây làm đơn giản là set lại state luôn, React sẽ tự diff)
        list.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        setMessages(list)
      } catch (error) {
        console.error("Lỗi cập nhật tin nhắn:", error)
      }
    }, 3000) // 3000ms = 3 giây

    return () => clearInterval(interval)
  }, [selectedConversation])

  const getDisplayName = (id?: string) => (users.find(u => u.id === id)?.fullName) || (users.find(u => u.id === id)?.phone) || id || 'Người dùng'

  const handleSelectConversation = async (c: Conversation) => {
    setSelectedConversation(c)
    setMessages([])
    const list = await getConversationMessages(c.id).catch(() => [])
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    setMessages(list)
  }

  const handleStartConversation = async (otherUserId: string) => {
    if (!currentUserId) return
    const convo = await getOrCreateConversation(currentUserId, otherUserId).catch(() => null)
    if (!convo) return
    if (!conversations.find(c => c.id === convo.id)) setConversations(prev => [convo, ...prev])
    setShowNewConversation(false)
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

  // Filter conversations by search (by participant name or lastMessagePreview)
  const filteredConversations = useMemo(() => {
    const q = conversationSearch.toLowerCase()
    if (!q) return conversations
    return conversations.filter(c => {
      const otherId = currentUserId === c.participant1Id ? c.participant2Id : c.participant1Id
      const name = getDisplayName(otherId).toLowerCase()
      const preview = (c.lastMessagePreview || '').toLowerCase()
      return name.includes(q) || preview.includes(q)
    })
  }, [conversations, conversationSearch, currentUserId, users])

  // Determine recipient name for chat header
  const chatPartnerId = selectedConversation ? (currentUserId === selectedConversation.participant1Id ? selectedConversation.participant2Id : selectedConversation.participant1Id) : undefined
  const chatPartnerName = getDisplayName(chatPartnerId)

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">{/* adjust height if header differs */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Tin nhắn</h1>
        <p className="text-sm text-gray-600">Trao đổi với người dùng trong hệ thống</p>
      </div>
      <div className="flex flex-1 rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
        {/* Sidebar */}
        <aside className="w-80 flex flex-col border-r border-gray-200">
          <div className="p-3 flex items-center gap-2 border-b bg-gray-50/50">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input value={conversationSearch} onChange={e => setConversationSearch(e.target.value)} placeholder="Tìm kiếm..." className="w-full h-9 pl-8 pr-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <button onClick={() => setShowNewConversation(true)} title="Tạo hội thoại mới" className="h-9 w-9 flex items-center justify-center rounded-md bg-primary-600 hover:bg-primary-700 text-white">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">{/* removed role=list to satisfy a11y */}
            {filteredConversations.map(c => {
              const otherId = currentUserId === c.participant1Id ? c.participant2Id : c.participant1Id
              const otherName = getDisplayName(otherId)
              const active = selectedConversation?.id === c.id
              return (
                <button key={c.id} onClick={() => handleSelectConversation(c)} className={`w-full text-left px-4 py-3 flex flex-col gap-1 border-b border-gray-100 hover:bg-gray-50 focus:bg-gray-100 transition ${active ? 'bg-primary-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate text-gray-900">{otherName}</p>
                    <span className="text-[10px] text-gray-500 ml-2 shrink-0">{new Date(c.lastMessageAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 truncate max-w-[85%]">{c.lastMessagePreview || 'Chưa có tin nhắn'}</p>
                    {/* unread badge placeholder */}
                    {/* <span className="ml-2 bg-red-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-semibold">3</span> */}
                  </div>
                </button>
              )
            })}
            {filteredConversations.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-500">Không tìm thấy hội thoại phù hợp.</p>
            )}
          </div>
          <div className="p-2 text-center text-[10px] text-gray-400 border-t">SSB Dashboard Chat • Beta</div>
        </aside>

        {/* Chat panel */}
        <section className="flex-1 flex flex-col">
          {/* Chat header */}
          {selectedConversation ? (
            <div className="px-4 h-14 flex items-center justify-between border-b bg-gray-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-semibold">
                  {chatPartnerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{chatPartnerName}</p>
                  <p className="text-[11px] text-gray-500">Trực tuyến</p>{/* placeholder status */}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-md hover:bg-gray-200 text-gray-600" title="Gọi"><Phone className="w-4 h-4" /></button>
                <button className="p-2 rounded-md hover:bg-gray-200 text-gray-600" title="Tùy chọn"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
            </div>
          ) : (
            <div className="px-4 h-14 flex items-center border-b bg-gray-50 text-sm text-gray-600">Chọn một cuộc hội thoại hoặc tạo mới.</div>
          )}

          {/* Message list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
            {selectedConversation ? (
              (() => {
                const items: JSX.Element[] = []
                let lastDay = ''

                // Lấy chữ cái đầu của tên đối phương để làm Avatar
                const partnerInitial = chatPartnerName ? chatPartnerName.charAt(0).toUpperCase() : '?'

                for (const m of messages) {
                  const d = new Date(m.createdAt)
                  const dayKey = d.toLocaleDateString('vi-VN')

                  // Hiển thị ngày tháng ngăn cách
                  if (dayKey !== lastDay) {
                    lastDay = dayKey
                    items.push(
                      <div key={'sep-' + dayKey} className="text-center text-xs text-gray-400 my-4 font-medium">
                        <span className="bg-gray-100 px-2 py-1 rounded-full">{dayKey}</span>
                      </div>
                    )
                  }

                  let isMe = false
                  if (currentUserId) isMe = m.senderId === currentUserId

                  items.push(
                    <div key={m.id} className={`flex gap-2 mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>

                      {/* 1. Avatar (Chỉ hiện nếu là tin nhắn đối phương) */}
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 text-xs font-bold mt-1 shadow-sm border border-blue-200">
                          {partnerInitial}
                        </div>
                      )}

                      {/* 2. Bong bóng tin nhắn */}
                      <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm relative shadow-sm break-words
                        ${isMe
                          ? 'bg-blue-600 text-white rounded-tr-none' // Tin mình: Xanh, vuông góc phải trên
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none' // Tin họ: Trắng, vuông góc trái trên
                        }`}>

                        {/* Nội dung tin nhắn */}
                        <div>{m.content}</div>

                        {/* Thời gian */}
                        <div className={`text-[10px] mt-1 text-right leading-none ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                          {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                }

                // Hiển thị thông báo nếu chưa có tin nhắn
                if (messages.length === 0) items.push(
                  <div key="empty" className="flex flex-col items-center justify-center py-10 opacity-50">
                    <p className="text-sm">Chưa có tin nhắn nào.</p>
                  </div>
                )

                items.push(<div ref={messagesEndRef} key="end" />)
                // Bên trong component Messages, trước khi return
                console.log("Dữ liệu tin nhắn nhận từ API:", messages);
                return items
              })()
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">Chưa chọn hội thoại.</div>
            )}
          </div>

          {/* Input bar */}
          {selectedConversation && (
            <form onSubmit={handleSendMessage} className="border-t bg-gray-50 px-4 py-3 flex items-center gap-3">
              <button type="button" className="p-2 rounded-md hover:bg-gray-200 text-gray-600" title="Đính kèm"><Paperclip className="w-4 h-4" /></button>
              <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <button type="submit" disabled={!newMessage.trim()} className="h-10 px-4 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-1"><Send className="w-4 h-4" />Gửi</button>
            </form>
          )}
        </section>
      </div>

      {/* Modal tạo hội thoại mới */}
      {showNewConversation && (
        <NewConversationModal users={users} currentUserId={currentUserId} onStart={handleStartConversation} onClose={() => setShowNewConversation(false)} userSearch={userSearch} setUserSearch={setUserSearch} />
      )}
    </div>
  )
}

function NewConversationModal({ users, currentUserId, onStart, onClose, userSearch, setUserSearch }: { users: any[]; currentUserId?: string; onStart: (id: string) => void; onClose: () => void; userSearch: string; setUserSearch: (v: string) => void }) {
  const [selectedId, setSelectedId] = useState('')
  if (!currentUserId) return null
  const filtered = users.filter(u => (u.fullName || u.phone || '').toLowerCase().includes(userSearch.toLowerCase()))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Tạo hội thoại mới</h2>
          <button onClick={onClose} aria-label="Đóng" title="Đóng" className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input value={userSearch} onChange={e => { setUserSearch(e.target.value); setSelectedId('') }} placeholder="Tìm theo tên / số điện thoại..." className="w-full h-9 pl-8 pr-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 border rounded-md">
          {filtered.length === 0 && <p className="p-3 text-xs text-gray-500">Không tìm thấy người dùng.</p>}
          <ul>
            {filtered.map(u => (
              <li key={u.id}>
                <button onClick={() => setSelectedId(u.id)} className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between border-b last:border-b-0 ${selectedId === u.id ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                  <span className="truncate">{u.fullName || u.phone || u.id}</span>
                  <span className="text-[10px] text-gray-500 ml-2">{u.role}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} type="button" className="flex-1 h-9 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50">Hủy</button>
          <button onClick={() => selectedId && onStart(selectedId)} disabled={!selectedId} className="flex-1 h-9 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium disabled:opacity-50">Bắt đầu</button>
        </div>
      </div>
    </div>
  )
}