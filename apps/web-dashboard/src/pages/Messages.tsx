import { useState } from 'react'
import { Send } from 'lucide-react'

interface Message {
  id: string
  content: string
  timestamp: string
}

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
      setMessages([...messages, message])
      setNewMessage('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tin nhắn</h1>
        <p className="text-gray-600 mt-2">Gửi tin nhắn thông báo cho tài xế và nhân viên</p>
      </div>

      {/* Message Input */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gửi tin nhắn mới</h3>
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung tin nhắn
            </label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập nội dung tin nhắn..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
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
                <p className="text-gray-900 mb-2">{message.content}</p>
                <p className="text-xs text-gray-500">Đã gửi lúc {message.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}