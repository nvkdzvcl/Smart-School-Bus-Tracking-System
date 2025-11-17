import { useState, useRef, useEffect, useContext } from "react";
import { Loader2, SendHorizonal } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Message } from "@/types/data-types";
import { createMessage, getMessagesByConversationId } from "@/lib/messageApi";
import { UserContext } from "@/context/UserContext";

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
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ... (Tất cả logic: scrollToBottom, useEffect, sendMessage, isLoading, error... giữ nguyên)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!conversationId || !user) {
      setIsLoading(false);
      return;
    }
    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getMessagesByConversationId(conversationId);
        setMessages(response.data);
      } catch (err) {
        console.error("Lỗi tải tin nhắn:", err);
        setError("Không thể tải tin nhắn. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [conversationId, user]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const tempMessage: Message = {
      id: "temp-" + Date.now(),
      senderId: user.id,
      content: input,
      createdAt: new Date().toISOString(),
      conversationId: conversationId,
      recipientId: recipientId,
      isRead: false,
    };
    setMessages((prev) => [...prev, tempMessage]);
    setInput("");
    try {
      await createMessage({
        content: input,
        conversationId: conversationId,
        senderId: user.id,
        recipientId: recipientId,
      });
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8" style={{ height: "60vh" }}>
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div
        className="flex justify-center items-center p-8 text-destructive"
        style={{ height: "60vh" }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      className="border rounded-lg bg-card shadow-sm flex flex-col"
      style={{ height: "60vh" }}
    >
      {/* --- SỬA 1: THÊM HEADER HIỂN THỊ TÊN --- */}
      <div className="p-4 border-b">
        <p className="text-sm font-semibold text-center text-foreground">
          {recipientName}
        </p>
      </div>
      {/* --- KẾT THÚC SỬA 1 --- */}

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => {
            const isMe = user && msg.senderId === user.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg text-sm shadow-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-secondary text-secondary-foreground rounded-bl-none"
                  }`}
                >
                  {/* --- SỬA 2: XÓA TÊN RA KHỎI VÒNG LẶP ---
                  {!isMe && (
                    <p className="text-xs font-semibold text-foreground mb-1">
                      {recipientName}
                    </p>
                  )}
                  --- KẾT THÚC SỬA 2 --- */}

                  <p>{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isMe ? "text-blue-200" : "text-muted-foreground"
                    } text-right`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Khung nhập (giữ nguyên) */}
      <div className="flex gap-2 p-4 border-t bg-background rounded-b-lg">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1"
          placeholder={`Nhắn tin tới ${recipientName}...`}
          disabled={!user}
        />
        <Button onClick={sendMessage} disabled={!user}>
          <SendHorizonal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
