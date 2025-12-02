import { useContext, useEffect, useState } from "react";
import Header from "@/app/layout/components/Header";
import BottomNav from "@/app/layout/components/BottomNav";
import NotificationList from "./components/NotificationList";
import ConversationList from "./components/ConversationList";
import ConversationView from "./components/ConversationView";
import { getNotificationsByUserId } from "@/lib/notificationApi";
import { UserContext } from "@/context/UserContext";
import type { Conversation, Notification } from "@/types/data-types";
import { getConversationsByUserId, getOrCreateConversation } from "@/lib/conversationApi";

export default function MessagesPage() {
  const [currentView, setCurrentView] = useState<"list" | "chat">("list");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

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
    fetchConversations();
  }, [user]);

  // Chọn hội thoại cũ
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setCurrentView("chat");
  };

  // Bắt đầu chat từ ô tìm kiếm (luôn get-or-create trên server)
  const handleStartNewChat = async (partner: { id: string; fullName: string }) => {
    if (!user) return;

    try {
      const res = await getOrCreateConversation(user.id, partner.id);
      const convo: Conversation = res.data;

      // Đảm bảo cuộc hội thoại tồn tại trong state
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === convo.id);
        if (exists) return prev;
        return [convo, ...prev];
      });

      setSelectedConversationId(convo.id);
      setCurrentView("chat");
    } catch (e) {
      console.error(e);
      setConvoError("Không thể tạo cuộc trò chuyện.");
    }
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
    setCurrentView("list");

    // (Optional) reload lại danh sách hội thoại sau khi chat
    if (user) {
      getConversationsByUserId(user.id).then((res) => setConversations(res.data));
    }
  };

  const selectedConvo =
    currentView === "chat" && selectedConversationId
      ? conversations.find((convo) => convo.id === selectedConversationId)
      : undefined;

  let recipientName = "";
  let recipientId = "";

  if (selectedConvo && user) {
    const recipient =
      selectedConvo.participant1.id === user.id
        ? selectedConvo.participant2
        : selectedConvo.participant1;

    recipientName = recipient?.fullName ?? "Người dùng";
    recipientId = recipient?.id ?? "";
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header
        title="Messages"
        showBack={currentView === "chat"}
        showNotifications
        notificationCount={notifications.length}
      />

      <main className="max-w-2xl mx-auto space-y-6 p-4">
        {currentView === "list" ? (
          <>
            <section>
              <h2 className="text-lg font-semibold mb-3">Thông báo hệ thống</h2>
              <NotificationList
                notifications={notifications}
                isLoading={isNotifLoading}
                error={notifError}
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Tin nhắn trao đổi</h2>
              <ConversationList
                conversations={conversations}
                isLoading={isConvoLoading}
                error={convoError}
                onSelectConversation={handleSelectConversation}
                onStartNewChat={handleStartNewChat}
              />
            </section>
          </>
        ) : (
          selectedConvo && (
            <ConversationView
              conversationId={selectedConversationId!}
              onBack={handleBackToList}
              recipientName={recipientName}
              recipientId={recipientId}
            />
          )
        )}
      </main>

      <BottomNav />
    </div>
  );
}
