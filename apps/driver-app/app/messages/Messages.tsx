// MessagesPage.tsx
import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { io, Socket } from "socket.io-client"

// Import UI components
import { MobileNav } from "../../components/MobileNav"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { Input } from "../../components/ui/Input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs"

// --- LẤY API URL TỪ .ENV ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"


// 1. Định nghĩa từ điển ngôn ngữ
const TRANSLATIONS = {
  vi: {
    pageTitle: "Tin nhắn",
    unreadMsgCount: "tin nhắn chưa đọc",
    noNewMsg: "Không có tin nhắn mới",
    
    // Tabs
    tabNotifications: "Thông báo",
    tabConversations: "Hội thoại",
    
    // States
    loadingNoti: "Đang tải thông báo...",
    noNoti: "Không có thông báo nào.",
    loadingContacts: "Đang tải danh bạ...",
    noContacts: "Không tìm thấy liên hệ nào.",
    errorTitle: "Lỗi!",
    errorLoad: "Lỗi khi tải dữ liệu",
    
    // Chat UI
    loadingChat: "Đang tải...",
    quickResponseLabel: "Phản hồi nhanh:",
    inputPlaceholder: "Nhập tin nhắn...",
    
    // Quick Replies List
    quickReplies: ["Đã hiểu", "Trễ 5 phút", "Đã đến điểm dừng", "Đang trên đường", "Cần hỗ trợ"],

    // TimeAgo
    yearsAgo: " năm trước",
    monthsAgo: " tháng trước",
    daysAgo: " ngày trước",
    hoursAgo: " giờ trước",
    minsAgo: " phút trước",
    secsAgo: " giây trước",
  },
  en: {
    pageTitle: "Messages",
    unreadMsgCount: "unread messages",
    noNewMsg: "No new messages",
    
    // Tabs
    tabNotifications: "Notifications",
    tabConversations: "Messages",
    
    // States
    loadingNoti: "Loading notifications...",
    noNoti: "No notifications.",
    loadingContacts: "Loading contacts...",
    noContacts: "No contacts found.",
    errorTitle: "Error!",
    errorLoad: "Error loading data",
    
    // Chat UI
    loadingChat: "Loading...",
    quickResponseLabel: "Quick Replies:",
    inputPlaceholder: "Type a message...",
    
    // Quick Replies List
    quickReplies: ["Got it", "5 mins late", "Arrived at stop", "On the way", "Need support"],

    // TimeAgo
    yearsAgo: " years ago",
    monthsAgo: " months ago",
    daysAgo: " days ago",
    hoursAgo: " hours ago",
    minsAgo: " mins ago",
    secsAgo: " secs ago",
  },
};

// 2. Cập nhật util timeAgo
function timeAgo(dateString: string, lang: 'vi' | 'en'): string {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const t = TRANSLATIONS[lang];

  let i = seconds / 31536000; if (i > 1) return Math.floor(i) + t.yearsAgo;
  i = seconds / 2592000; if (i > 1) return Math.floor(i) + t.monthsAgo;
  i = seconds / 86400; if (i > 1) return Math.floor(i) + t.daysAgo;
  i = seconds / 3600; if (i > 1) return Math.floor(i) + t.hoursAgo;
  i = seconds / 60; if (i > 1) return Math.floor(i) + t.minsAgo;
  return Math.floor(seconds) + t.secsAgo;
}

// --- Interface cho Socket.IO (Chat) ---
interface SocketMessage {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  sender?: {
    id: string
    full_name: string
  }
}

// --- Interface cho API /chat-contacts ---
interface ChatContact {
  id: string
  fullName: string
  role: "manager" | "parent"
  conversationId?: string;
}

interface ConversationState extends ChatContact {
  unreadCount: number
  lastMessageTimestamp: string | null
}

// --- Interface cho API /notifications ---
interface Notification {
  id: string
  title: string
  message: string
  type: "alert" | "arrival" | "message" | "incident"
  isRead: boolean
  createdAt: string
}

export default function MessagesPage() {
  const navigate = useNavigate()
  
  // 3. Khởi tạo Language State
  const [language] = useState<'vi' | 'en'>(() => {
    const saved = localStorage.getItem("language");
    return saved === 'en' ? 'en' : 'vi';
  });
  const t = TRANSLATIONS[language];

  const [messageInput, setMessageInput] = useState("")

  // Socket state
  const [socket, setSocket] = useState<Socket | null>(null)
  const [driverId, setDriverId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<SocketMessage[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Conversations & notifications
  const [conversations, setConversations] = useState<ConversationState[]>([])
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [isLoadingContacts, setIsLoadingContacts] = useState(true)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)

  const [error, setError] = useState<string | null>(null)

  // 1. Auth check
  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated")
    const token = localStorage.getItem("access_token")
    const myId = localStorage.getItem("driver_id")

    if (!authenticated || !token || !myId) {
      console.error("Chưa đăng nhập hoặc thiếu thông tin")
      navigate("/")
    } else {
      setDriverId(myId)
    }
  }, [navigate])

  // 2. Fetch contacts + notifications
  useEffect(() => {
    if (!driverId) return
    const token = localStorage.getItem("access_token")
    if (!token) return

    const fetchAllData = async () => {
      setIsLoadingContacts(true)
      setIsLoadingNotifications(true)
      setError(null)

      try {
        const [contactsRes, notificationsRes] = await Promise.all([
          fetch(`${API_URL}/profile/chat-contacts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }),
        ])

        if (!contactsRes.ok) throw new Error("Không thể tải danh bạ")
        const contactsData: ConversationState[] = await contactsRes.json()
        setConversations(contactsData)

        if (!notificationsRes.ok) throw new Error("Không thể tải thông báo")
        const notificationsData: Notification[] = await notificationsRes.json()
        setNotifications(notificationsData)
      } catch (err: any) {
        setError(err?.message || t.errorLoad)
        console.error(err)
      } finally {
        setIsLoadingContacts(false)
        setIsLoadingNotifications(false)
      }
    }

    fetchAllData()
  }, [driverId]) // language ko cần vào deps vì chỉ load lần đầu

  // 3. Init socket
  useEffect(() => {
    if (!driverId) return
    const token = localStorage.getItem("access_token")
    if (!token) return

    const newSocket = io(API_URL + "/chat", {
      auth: { token },
    })
    setSocket(newSocket)

    newSocket.on("connect", () => console.log("Socket.IO: Đã kết nối!", newSocket.id))
    newSocket.on("error", (err: any) => {
      console.error("Socket.IO: Lỗi:", err)
      if (typeof err === "string" && err.includes("hết hạn")) navigate("/")
    })

    newSocket.on("messageSent", (sentMessage: SocketMessage) => {
      setChatHistory((prev) => [...prev, sentMessage])
    })

    newSocket.on("history", (history: SocketMessage[]) => {
      setChatHistory(history)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [driverId, navigate])

  // 3.5 Listen newMessage
  useEffect(() => {
    if (!socket) return
    const handleNewMessage = (receivedMessage: SocketMessage) => {
      if (receivedMessage.sender_id === selectedContactId) {
        setChatHistory((prev) => [...prev, receivedMessage])
      }
      else {
        setConversations(prevConvos =>
          prevConvos.map(convo =>
            convo.id === receivedMessage.sender_id
              ? { ...convo, unreadCount: (convo.unreadCount || 0) + 1 }
              : convo
          )
        );
      }

    }
    socket.on("newMessage", handleNewMessage)
    return () => {
      socket.off("newMessage", handleNewMessage)
    }
  }, [socket, selectedContactId])

  // 4. Load history when select contact
  useEffect(() => {
    if (socket && selectedContactId) {
      socket.emit("getHistory", { otherUserId: selectedContactId })
    } else {
      setChatHistory([])
    }
  }, [socket, selectedContactId])

  // 5. Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  // Send message
  const handleSendMessage = () => {
    if (!socket || !messageInput.trim() || !selectedContactId) {
      return
    }
  const currentConversation = conversations.find(c => c.id === selectedContactId);
    socket.emit("sendMessage", {
      recipientId: selectedContactId,
      content: messageInput,
      conversationId: currentConversation?.conversationId
    })

    setMessageInput("")
  }

  const handleQuickReply = (reply: string) => {
    if (!socket || !selectedContactId) return
    const currentConversation = conversations.find(c => c.id === selectedContactId);
    socket.emit("sendMessage", {
      recipientId: selectedContactId,
      content: reply,
      conversationId: currentConversation?.conversationId
    })
  }

const handleNotificationClick = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification?.isRead) return;

    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );

    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `API Error ${response.status}`);
      }

    } catch (err) {
      console.error("Lỗi khi đánh dấu đã đọc:", err);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: false } : n
        )
      );
    }
  }

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length
  const unreadChatCount = conversations.reduce((acc, convo) => acc + (convo.unreadCount || 0), 0)

  const getSelectedContact = () => conversations.find((c) => c.id === selectedContactId)

  return (
    <div className="min-h-screen bg-background pb-20">
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
                <h1 className="text-lg font-semibold text-foreground">{t.pageTitle}</h1>
                <p className="text-xs text-muted-foreground">
                  {unreadNotifCount + unreadChatCount > 0
                    ? `${unreadNotifCount + unreadChatCount} ${t.unreadMsgCount}`
                    : t.noNewMsg}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <Tabs defaultValue="conversations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 rounded-lg overflow-hidden border border-border/50">
            <TabsTrigger value="notifications" className="relative rounded-lg">
              {t.tabNotifications}
              {unreadNotifCount > 0 && (
                <Badge className="mr-1 absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs rounded-full">
                  {unreadNotifCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="conversations" className="relative rounded-lg">
              {t.tabConversations}
              {unreadChatCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs rounded-full">
                  {unreadChatCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {error && (
            <div className="p-4 mb-4 text-center text-sm text-red-500 bg-red-500/10 rounded-lg">
              <p className="font-semibold">{t.errorTitle}</p>
              <p>{error}</p>
            </div>
          )}

          <TabsContent value="notifications" className="space-y-3 mt-0">
            {isLoadingNotifications ? (
              <p className="text-muted-foreground text-center">{t.loadingNoti}</p>
            ) : notifications.length === 0 ? (
              <p className="text-muted-foreground text-center">{t.noNoti}</p>
            ) : (
              notifications.map((n, index) => (
                <Card
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id)}
                  style={{ 
      animationDelay: `${index * 75}ms`, 
      animationFillMode: 'both' 
    }}
                  className={`animate-in fade-in slide-in-from-bottom-3 duration-500 border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors ${
                    !n.isRead ? "bg-gradient-to-br from-card to-primary/5" : ""
                  }`}
                >
                  <CardContent className="p-4 px-4 pt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/20 text-primary">
                        {n.type === "alert" ? "!" : n.type === "arrival" ? "B" : "M"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground text-sm">{n.title}</h3>
                              {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{n.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(n.createdAt, language)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="conversations" className="space-y-3 mt-0">
            {selectedContactId ? (
              <Card className="border-border/50 rounded-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-border/50 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedContactId(null)
                        setChatHistory([])
                      }}
                      className="text-foreground hover:bg-muted"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold text-secondary-foreground">
                        {getSelectedContact()?.fullName?.charAt(0) ?? "?"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{getSelectedContact()?.fullName ?? t.loadingChat}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{getSelectedContact()?.role}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                    {chatHistory.map((msg, index) => (
                      <div
                        key={msg.id}
                        style={{ 
      animationDelay: `${index * 30}ms`, 
      animationFillMode: 'both' 
    }}
                        className={`animate-in zoom-in-95 fade-in slide-in-from-bottom-2 duration-300 flex ${msg.sender_id === driverId ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.sender_id === driverId ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <span
                            className={`text-xs mt-1 block ${
                              msg.sender_id === driverId ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString(language === 'vi' ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-3 border-t border-border/50 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">{t.quickResponseLabel}</p>
                    <div className="flex gap-2 flex-wrap">
                      {/* Render Quick Replies từ từ điển */}
                      {t.quickReplies.map((reply) => (
                        <Button
                          key={reply}
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickReply(reply)}
                          className="h-7 text-xs border-border text-foreground hover:bg-muted bg-transparent rounded-lg p-2"
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border-t border-border/50 flex gap-2">
                    <Input
                      type="text"
                      placeholder={t.inputPlaceholder}
                      value={messageInput}
                      onChange={(e) => setMessageInput((e.target as HTMLInputElement).value)}
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
              <>
                {isLoadingContacts && <p className="text-muted-foreground text-center">{t.loadingContacts}</p>}
                {error && (
                  <div className="p-4 text-center text-sm text-red-500 bg-red-500/10 rounded-lg">
                    <p className="font-semibold">{t.errorTitle}</p>
                    <p>{error}</p>
                  </div>
                )}
                {!isLoadingContacts && !error && conversations.length === 0 && (
                  <p className="text-muted-foreground text-center">{t.noContacts}</p>
                )}

                {conversations.map((contact, index) => (
                  <Card
                    key={contact.id}
                    style={{ 
      animationDelay: `${index * 75}ms`, 
      animationFillMode: 'both' 
    }}
                    className="animate-in fade-in slide-in-from-bottom-3 duration-500 border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => {
                      setSelectedContactId(contact.id)
                      
                      if (socket && contact.unreadCount > 0) {
                        socket.emit('markAsRead', { senderId: contact.id });
                      }

                      if (contact.unreadCount > 0) {
                        setConversations(prevConvos =>
                          prevConvos.map(convo =>
                            convo.id === contact.id
                              ? { ...convo, unreadCount: 0 }
                              : convo
                          )
                        );
                      }
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-semibold text-secondary-foreground">
                            {contact.fullName?.charAt(0) ?? "?"}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground truncate">
                              {contact.fullName}
                            </h3>
                          </div>

                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-muted-foreground capitalize truncate">
                              {contact.role}
                            </p>
                            {contact.unreadCount > 0 && (
                              <Badge className="h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs rounded-full flex-shrink-0 ml-2">
                                {contact.unreadCount}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-1">
                                {contact.lastMessageTimestamp && (
                              <span className="text-xs text-muted-foreground">
                                {timeAgo(contact.lastMessageTimestamp, language)}
                              </span>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  )
}