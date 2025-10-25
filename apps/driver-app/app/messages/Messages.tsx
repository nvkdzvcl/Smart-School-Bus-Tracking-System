import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { MobileNav } from "../../components/MobileNav"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { Input } from "../../components/ui/Input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs"

interface Message {
  id: number
  type: "broadcast" | "direct" | "system"
  sender: string
  subject: string
  content: string
  timestamp: string
  read: boolean
  priority?: "high" | "normal"
}

interface Conversation {
  id: number
  name: string
  role: string
  lastMessage: string
  timestamp: string
  unread: number
  avatar?: string
}

const quickReplies = ["Đã hiểu", "Trễ 5 phút", "Đã đến điểm dừng", "Đang trên đường", "Cần hỗ trợ"]

export default function MessagesPage() {
  const navigate = useNavigate()
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [messageInput, setMessageInput] = useState("")

  const [conversations] = useState<Conversation[]>([
    {
      id: 1,
      name: "Ban Quản lý",
      role: "Quản lý",
      lastMessage: "Vui lòng kiểm tra tuyến đường mới",
      timestamp: "10:30",
      unread: 2,
    },
    {
      id: 2,
      name: "Phụ huynh Nguyễn Văn A",
      role: "Phụ huynh",
      lastMessage: "Con tôi có thể đi muộn 10 phút được không?",
      timestamp: "09:15",
      unread: 1,
    },
    {
      id: 3,
      name: "Hỗ trợ kỹ thuật",
      role: "Hỗ trợ",
      lastMessage: "Chúng tôi đã nhận được yêu cầu của bạn",
      timestamp: "Hôm qua",
      unread: 0,
    },
  ])

  const [messages] = useState<Message[]>([
    {
      id: 1,
      type: "broadcast",
      sender: "Ban Quản lý",
      subject: "Thông báo: Cập nhật tuyến đường",
      content: "Tuyến A có thay đổi nhỏ từ ngày mai. Vui lòng kiểm tra bản đồ mới trong phần Lộ trình.",
      timestamp: "2025-01-13 10:30",
      read: false,
      priority: "high",
    },
    {
      id: 2,
      type: "system",
      sender: "Hệ thống",
      subject: "Nhắc nhở: Ca làm việc sắp bắt đầu",
      content: "Ca sáng của bạn sẽ bắt đầu trong 30 phút. Vui lòng chuẩn bị sẵn sàng.",
      timestamp: "2025-01-13 06:00",
      read: true,
      priority: "normal",
    },
    {
      id: 3,
      type: "direct",
      sender: "Phụ huynh Nguyễn Văn A",
      subject: "Yêu cầu đón muộn",
      content: "Xin chào thầy, con tôi có thể đi muộn 10 phút được không? Cảm ơn thầy.",
      timestamp: "2025-01-13 09:15",
      read: false,
      priority: "normal",
    },
    {
      id: 4,
      type: "broadcast",
      sender: "Ban Quản lý",
      subject: "Thông báo: Bảo trì hệ thống",
      content: "Hệ thống sẽ bảo trì vào 23:00 - 01:00 đêm nay. Vui lòng hoàn thành báo cáo trước thời gian này.",
      timestamp: "2025-01-12 15:00",
      read: true,
      priority: "normal",
    },
  ])

  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated")
    if (!authenticated) {
      navigate("/")
    }
  }, [navigate])

  const handleSendMessage = () => {
    if (!messageInput.trim()) return
    alert(`Tin nhắn đã gửi: ${messageInput}`)
    setMessageInput("")
  }

  const handleQuickReply = (reply: string) => {
    alert(`Phản hồi nhanh: ${reply}`)
  }

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="text-foreground hover:bg-muted"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Tin nhắn</h1>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} tin nhắn chưa đọc` : "Không có tin nhắn mới"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 rounded-lg overflow-hidden border border-border/50">
            <TabsTrigger value="notifications" className="relative rounded-lg">
              Thông báo
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="conversations" className="relative rounded-lg">
              Hội thoại
              {conversations.reduce((acc, c) => acc + c.unread, 0) > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs rounded-full">
                  {conversations.reduce((acc, c) => acc + c.unread, 0)}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-3 mt-0">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={`border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors ${!message.read ? "bg-gradient-to-br from-card to-primary/5" : ""
                  }`}
              >
                <CardContent className="p-4 px-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === "broadcast"
                        ? "bg-primary/20 text-primary"
                        : message.type === "system"
                          ? "bg-accent/20 text-accent"
                          : "bg-secondary text-secondary-foreground"
                        }`}
                    >
                      {message.type === "broadcast" ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                          />
                        </svg>
                      ) : message.type === "system" ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground text-sm">{message.sender}</h3>
                            {!message.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                          </div>
                          <p className="text-sm font-medium text-foreground">{message.subject}</p>
                        </div>
                        {message.priority === "high" && (
                          <Badge className="bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 flex-shrink-0">
                            Quan trọng
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{message.content}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        {message.type === "direct" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedConversation(message.id)
                            }}
                          >
                            Trả lời
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-3 mt-0">
            {selectedConversation ? (
              <Card className="border-border/50 rounded-lg overflow-hidden">
                <CardContent className="p-0">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border/50 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedConversation(null)}
                      className="text-foreground hover:bg-muted"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-lg font-semibold text-secondary-foreground">Q</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Ban Quản lý</h3>
                      <p className="text-xs text-muted-foreground">Quản lý</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="p-4 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                    <div className="flex justify-start">
                      <div className="max-w-[80%] bg-muted rounded-lg p-3">
                        <p className="text-sm text-foreground">Vui lòng kiểm tra tuyến đường mới</p>
                        <span className="text-xs text-muted-foreground mt-1 block">10:30</span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-[80%] bg-primary rounded-lg p-3">
                        <p className="text-sm text-primary-foreground">Đã hiểu, cảm ơn</p>
                        <span className="text-xs text-primary-foreground/70 mt-1 block">10:32</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Replies */}
                  <div className="p-3 border-t border-border/50 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Phản hồi nhanh:</p>
                    <div className="flex gap-2 flex-wrap">
                      {quickReplies.map((reply) => (
                        <Button
                          key={reply}
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickReply(reply)}
                          className="h-7 text-xs border-border text-foreground hover:bg-muted bg-transparent rounded-lg p-4"
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-border/50 flex gap-2">
                    <Input
                      type="text"
                      placeholder="Nhập tin nhắn..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 bg-background border-border text-foreground rounded-lg"
                    />
                    <Button
                      onClick={handleSendMessage}
                      size="icon"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-secondary-foreground">
                          {conversation.name.charAt(0)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-foreground">{conversation.name}</h3>
                          <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate flex-1">{conversation.lastMessage}</p>
                          {conversation.unread > 0 && (
                            <Badge className="ml-2 bg-destructive text-destructive-foreground">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{conversation.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  )
}
