import { useMemo, useState } from 'react'
import { Send, Bell, MessageSquare } from 'lucide-react'

interface Message {
  id: string
  content: string
  timestamp: string
  recipient?: string
}

interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'alert' | 'arrival' | 'message' | 'incident'
  timestamp: string
}

export default function Messages() {
  // Tabs: 'notifications' | 'messages'
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications')

  // --- Notifications state ---
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Nhắc nhở an toàn',
      message: 'Vui lòng kiểm tra hệ thống phanh trước khi xuất phát.',
      type: 'alert',
      timestamp: new Date().toLocaleString('vi-VN'),
    },
  ])
  const [notifTitle, setNotifTitle] = useState('')
  const [notifMessage, setNotifMessage] = useState('')
  const [notifType, setNotifType] = useState<NotificationItem['type']>('alert')

  const canSendNotification = useMemo(
    () => notifTitle.trim().length > 0 && notifMessage.trim().length > 0,
    [notifTitle, notifMessage]
  )

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSendNotification) return
    const newItem: NotificationItem = {
      id: Date.now().toString(),
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      type: notifType,
      timestamp: new Date().toLocaleString('vi-VN'),
    }
    setNotifications((prev) => [newItem, ...prev])
    setNotifTitle('')
    setNotifMessage('')
    setNotifType('alert')
  }

  // --- Messages state (existing) ---
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [recipient, setRecipient] = useState('Tất cả tài xế')

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        recipient,
      }
      setMessages((prev) => [...prev, message])
      setNewMessage('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tin nhắn</h1>
        <p className="text-gray-600 mt-2">Quản lý thông báo và trao đổi tin nhắn với tài xế/nhân viên</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('notifications')}
            className={
              'group inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition ' +
              (activeTab === 'notifications'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')
            }
          >
            <Bell className="mr-2 h-4 w-4" /> Thông báo
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={
              'group inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition ' +
              (activeTab === 'messages'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')
            }
          >
            <MessageSquare className="mr-2 h-4 w-4" /> Tin nhắn
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Compose notification */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo thông báo mới</h3>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="Nhập tiêu đề thông báo"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại</label>
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value as NotificationItem['type'])}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="alert">Khẩn cấp</option>
                    <option value="arrival">Điểm danh/Đến nơi</option>
                    <option value="message">Tin nhắn hệ thống</option>
                    <option value="incident">Sự cố</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Nhập nội dung thông báo..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!canSendNotification}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi thông báo</span>
                </button>
              </div>
            </form>
          </div>

          {/* Notification list */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông báo đã gửi</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{n.title}</h4>
                      <p className="text-gray-700 mt-1">{n.message}</p>
                    </div>
                    <span
                      className={
                        'ml-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                        (n.type === 'alert'
                          ? 'bg-red-100 text-red-800'
                          : n.type === 'incident'
                            ? 'bg-amber-100 text-amber-800'
                            : n.type === 'arrival'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800')
                      }
                    >
                      {n.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Gửi lúc {n.timestamp}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-gray-500">Chưa có thông báo nào.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-6">
          {/* Message Input */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gửi tin nhắn mới</h3>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Người nhận</label>
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option>Tất cả tài xế</option>
                    <option>Tất cả nhân viên</option>
                    <option>Tất cả phụ huynh</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung tin nhắn</label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập nội dung tin nhắn..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi tin nhắn</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sent Messages History */}
          {messages.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tin nhắn đã gửi</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500">Người nhận: {message.recipient}</p>
                      <p className="text-xs text-gray-500">{message.timestamp}</p>
                    </div>
                    <p className="text-gray-900">{message.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}