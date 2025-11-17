import { useContext, useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import NotificationList from "./components/NotificationList";
import ConversationList from "./components/ConversationList";
import ConversationView from "./components/ConversationView";
import { getNotificationsByUserId } from "@/lib/notificationApi";
import { UserContext } from "@/context/UserContext";
import type { Conversation, Notification } from "@/types/data-types";
import { getConversationsByUserId } from "@/lib/conversationApi";

export default function MessagesPage() {
  // State này quản lý việc người dùng đang xem
  // 'list' (danh sách) hay 'chat' (một cuộc trò chuyện cụ thể)
  const [currentView, setCurrentView] = useState<"list" | "chat">("list");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState<string | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isConvoLoading, setConvoLoading] = useState(true);
  const [convoError, setConvoError] = useState<string | null>(null);

  const { user } = useContext(UserContext)!;

  useEffect(() => {
    if (!user) {
      setNotifLoading(false);
      setConvoLoading(false);
      return;
    }

    // Tải Notifications (giống như cũ)
    const fetchNotifications = async () => {
      try {
        setNotifLoading(true);
        const data = await getNotificationsByUserId(user.id);
        setNotifications(data.data);
      } catch {
        setNotifError("Không thể tải thông báo.");
      } finally {
        setNotifLoading(false);
      }
    };

    // Tải Conversations (MỚI)
    const fetchConversations = async () => {
      try {
        setConvoLoading(true);
        const data = await getConversationsByUserId(user.id);
        setConversations(data.data);
      } catch {
        setConvoError("Không thể tải tin nhắn.");
      } finally {
        setConvoLoading(false);
      }
    };

    fetchNotifications();
    fetchConversations(); // <-- Gọi hàm mới
  }, [user]); // Chạy lại khi có user

  // Hàm này được gọi bởi ConversationList khi người dùng bấm vào 1 tin nhắn
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setCurrentView("chat");
  };

  // Hàm này được gọi bởi ConversationView để quay lại
  const handleBackToList = () => {
    setSelectedConversationId(null);
    setCurrentView("list");
  };

  const selectedConvo =
    currentView === "chat" && selectedConversationId
      ? conversations.find((convo) => convo.id === selectedConversationId)
      : undefined;

  const recipient =
    selectedConvo && user
      ? selectedConvo.participant1.id === user.id
        ? selectedConvo.participant2
        : selectedConvo.participant1
      : null;

  const recipientName = recipient?.fullName ?? "";
  const recipientId = recipient?.id ?? null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* TopBar sẽ thay đổi tiêu đề và nút Back tùy theo view */}
      <TopBar
        title="Messages"
        showBack
        showNotifications
        notificationCount={2}
      />

      <main className="max-w-2xl mx-auto space-y-6 p-4">
        {/*
          Sử dụng toán tử 3 ngôi để hiển thị:
          - Hoặc là Danh sách (Thông báo + Hội thoại)
          - Hoặc là một cuộc hội thoại cụ thể
        */}
        {currentView === "list" ? (
          <>
            {/* 1. Phần Thông báo (từ bảng Notifications) */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Thông báo hệ thống</h2>
              <NotificationList
                notifications={notifications}
                isLoading={isNotifLoading}
                error={notifError}
              />
            </section>

            {/* 2. Phần Tin nhắn (từ bảng Messages) */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Tin nhắn trao đổi</h2>
              <ConversationList
                conversations={conversations}
                isLoading={isConvoLoading}
                error={convoError}
                onSelectConversation={handleSelectConversation}
              />
            </section>
          </>
        ) : (
          // 3. Phần Chat chi tiết
          <ConversationView
            conversationId={selectedConversationId!}
            onBack={handleBackToList}
            recipientName={recipientName}
            recipientId={recipientId!}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
