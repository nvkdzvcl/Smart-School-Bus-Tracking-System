"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, MessageSquare, Send, AlertCircle, CheckCircle2, MapPin, X } from "lucide-react"

export default function ParentMessagesPage() {
  const [selectedTab, setSelectedTab] = useState("notifications")
  const [messageInput, setMessageInput] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)

  // Mock data
  const notifications = [
    {
      id: 1,
      type: "arrival",
      title: "Xe sắp đến",
      message: "Xe cách điểm đón 500m - chuẩn bị ra nhé",
      time: "2 phút trước",
      unread: true,
      icon: MapPin,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: 2,
      type: "pickup",
      title: "Đã lên xe",
      message: "Học sinh đã lên xe an toàn lúc 07:15",
      time: "30 phút trước",
      unread: false,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      id: 3,
      type: "delay",
      title: "Xe bị trễ",
      message: "Xe đang gặp kẹt xe, dự kiến trễ 10 phút",
      time: "1 giờ trước",
      unread: false,
      icon: AlertCircle,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      id: 4,
      type: "arrival_school",
      title: "Đã đến trường",
      message: "Học sinh đã đến trường an toàn lúc 07:45",
      time: "2 giờ trước",
      unread: false,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
  ]

  const conversations = [
    {
      id: 1,
      name: "Quản lý trường",
      lastMessage: "Cảm ơn phụ huynh đã phản hồi",
      time: "10:30",
      unread: 0,
      avatar: "Q",
    },
    {
      id: 2,
      name: "Tài xế Trần Văn Bình",
      lastMessage: "Con đã lên xe an toàn",
      time: "07:15",
      unread: 1,
      avatar: "T",
    },
  ]

  const messages = [
    { id: 1, sender: "driver", text: "Chào phụ huynh, con đã lên xe an toàn", time: "07:15" },
    { id: 2, sender: "parent", text: "Cảm ơn anh tài xế", time: "07:16" },
    { id: 3, sender: "driver", text: "Dạ không có gì ạ", time: "07:17" },
  ]

  const quickReplies = ["Cảm ơn", "Đã hiểu", "Con nghỉ hôm nay", "Đón con sớm hơn"]

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Send message logic here
      setMessageInput("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Tin nhắn & Thông báo</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="sticky top-[73px] z-30 bg-card border-b border-border">
            <TabsList className="w-full rounded-none h-12">
              <TabsTrigger value="notifications" className="flex-1 gap-2">
                <Bell className="w-4 h-4" />
                Thông báo
                {notifications.filter((n) => n.unread).length > 0 && (
                  <Badge className="ml-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500">
                    {notifications.filter((n) => n.unread).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex-1 gap-2">
                <MessageSquare className="w-4 h-4" />
                Tin nhắn
                {conversations.reduce((sum, c) => sum + c.unread, 0) > 0 && (
                  <Badge className="ml-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500">
                    {conversations.reduce((sum, c) => sum + c.unread, 0)}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-0 p-4 space-y-3">
            {notifications.map((notification) => {
              const Icon = notification.icon
              return (
                <Card
                  key={notification.id}
                  className={`border-0 shadow-md ${notification.unread ? "ring-2 ring-primary/20" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 ${notification.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-5 h-5 ${notification.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3
                            className={`font-semibold ${notification.unread ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {notification.title}
                          </h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{notification.time}</span>
                        </div>
                        <p className={`text-sm ${notification.unread ? "text-foreground" : "text-muted-foreground"}`}>
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="mt-0">
            {selectedConversation === null ? (
              <div className="p-4 space-y-3">
                {conversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className="border-0 shadow-md cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-primary">{conversation.avatar}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{conversation.name}</h3>
                            <span className="text-xs text-muted-foreground">{conversation.time}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                            {conversation.unread > 0 && (
                              <Badge className="w-5 h-5 p-0 flex items-center justify-center bg-red-500">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col h-[calc(100vh-185px)]">
                {/* Conversation Header */}
                <div className="bg-card border-b border-border p-4">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {conversations.find((c) => c.id === selectedConversation)?.avatar}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {conversations.find((c) => c.id === selectedConversation)?.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">Đang hoạt động</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "parent" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          message.sender === "parent"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${message.sender === "parent" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                        >
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Replies */}
                <div className="px-4 py-2 border-t border-border">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {quickReplies.map((reply, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap bg-transparent"
                        onClick={() => setMessageInput(reply)}
                      >
                        {reply}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border bg-card">
                  <div className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="icon" disabled={!messageInput.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
