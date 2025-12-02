import { useState, useRef, useEffect, useContext } from "react";
import { Loader2, SendHorizonal } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Message } from "@/types/data-types";
import { getMessagesByConversationId } from "@/lib/messageApi";
import { UserContext } from "@/context/UserContext";
import { socket } from "@/lib/utils/socket";

interface ChatBoxProps {
  conversationId: string;      // luôn có
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
  const [isSending, setIsSending] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Load lịch sử tin nhắn
  useEffect(() => {
    if (!conversationId) return;

    setIsLoading(true);
    getMessagesByConversationId(conversationId)
      .then((res) => {
        const data = Array.isArray(res) ? res : res.data;
        setMessages(data || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [conversationId]);

  // 2. Socket join / listen
  useEffect(() => {
    if (!user || !conversationId) return;

    if (!socket.connected) socket.connect();

    socket.emit("join_conversation", { conversationId });

    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.conversationId === conversationId) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.emit("leave_conversation", { conversationId });
      socket.off("new_message", handleNewMessage);
    };
  }, [conversationId, user]);

  // 3. Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Gửi tin nhắn
  const sendMessage = async () => {
    if (!input.trim() || !user || isSending) return;

    const content = input.trim();
    setInput("");
    setIsSending(true);

    const payload = {
      content,
      senderId: user.id,
      recipientId,
      conversationId,
    };

    try {
      // Gửi lên server qua socket, server chịu trách nhiệm save + broadcast
      socket.emit("send_message", payload);
    } catch (e) {
      console.error("Lỗi gửi tin nhắn:", e);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.");
      setInput(content);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="border rounded-lg bg-card shadow-sm flex flex-col"
      style={{ height: "60vh" }}
    >
      <div className="p-4 border-b text-center font-semibold text-sm">
        {recipientName}
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Bắt đầu trò chuyện với {recipientName}.
            </div>
          )}
          {messages.map((msg, index) => {
            const isMe = user && msg.senderId === user.id;

            return (
              <div
                key={msg.id || index}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg text-sm shadow-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-secondary text-secondary-foreground rounded-bl-none"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`text-xs mt-1 text-right ${
                      isMe ? "text-blue-200" : "text-muted-foreground"
                    }`}
                  >
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Đang gửi..."}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex gap-2 p-4 border-t bg-background rounded-b-lg">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1"
          placeholder="Nhắn tin..."
          disabled={isSending}
        />
        <Button onClick={sendMessage} disabled={isSending}>
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <SendHorizonal className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
