import { useState, useRef, useEffect, useContext } from "react";
import { Loader2, SendHorizonal } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Message } from "@/types/data-types";
import { getMessagesByConversationId } from "@/lib/messageApi"; 
import { UserContext } from "@/context/UserContext";
import { socket } from "@/lib/utils/socket";

interface ChatBoxProps {
  conversationId: string;
  recipientName: string;
  recipientId: string;
}

export default function ChatBox({
  conversationId,
  recipientName,
  recipientId,
}: ChatBoxProps) {
  const { user } = useContext(UserContext)!;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Kết nối Socket và Lắng nghe tin nhắn mới
  useEffect(() => {
    if (!user) return;

    // Kết nối
    if (!socket.connected) socket.connect();

    // Tham gia vào phòng chat
    socket.emit('join_conversation', { conversationId });

    // Lắng nghe sự kiện 'new_message' từ server gửi xuống
    const handleNewMessage = (newMessage: Message) => {
      // Chỉ thêm nếu tin nhắn thuộc cuộc hội thoại này
      if (newMessage.conversationId === conversationId) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on('new_message', handleNewMessage);

    // Cleanup khi component unmount
    return () => {
      socket.emit('leave_conversation', { conversationId });
      socket.off('new_message', handleNewMessage);
    };
  }, [conversationId, user]);

  // 2. Lấy lịch sử tin nhắn (API HTTP)
  // Socket chỉ nhận tin mới, còn tin cũ vẫn phải load từ DB
  useEffect(() => {
    if (!conversationId) return;
    setIsLoading(true);
    getMessagesByConversationId(conversationId)
      .then((res) => setMessages(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [conversationId]);

  // 3. Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Gửi tin nhắn qua Socket
  const sendMessage = () => {
    if (!input.trim() || !user) return;

    const messageData = {
      content: input,
      conversationId: conversationId,
      senderId: user.id,
      recipientId: recipientId,
    };

    // Gửi sự kiện lên server
    socket.emit('send_message', messageData);
    
    // Xóa ô input (Không cần setMessages thủ công ở đây nữa, 
    // vì server sẽ emit 'new_message' ngược lại cho ta)
    setInput("");
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="border rounded-lg bg-card shadow-sm flex flex-col" style={{ height: "60vh" }}>
      {/* Header Tên */}
      <div className="p-4 border-b text-center font-semibold text-sm">
        {recipientName}
      </div>

      {/* List Tin nhắn */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => {
            const isMe = user && msg.senderId === user.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-lg text-sm shadow-sm ${
                    isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary text-secondary-foreground rounded-bl-none"
                  }`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 text-right ${isMe ? "text-blue-200" : "text-muted-foreground"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2 p-4 border-t bg-background rounded-b-lg">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1"
          placeholder={`Nhắn tin...`}
        />
        <Button onClick={sendMessage}>
          <SendHorizonal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}