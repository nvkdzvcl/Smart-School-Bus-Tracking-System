import React, { useContext } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns"; // <-- 2. Import hàm date-fns
import { vi } from "date-fns/locale";
import type { Conversation } from "@/types/data-types";
import { UserContext } from "@/context/UserContext";


interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export default function ConversationList({
  conversations,
  isLoading,
  error,
  onSelectConversation,
}: ConversationListProps) {
  // 4. Lấy user hiện tại
  const { user } = useContext(UserContext)!;

  if (isLoading) { /* ... */ }
  if (error) { /* ... */ }
  if (!user) { // Thêm kiểm tra user
    return <p>Đang tải user...</p>;
  }
  if (conversations.length === 0) { /* ... */ }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-0">
          {conversations.map((convo) => {
            
            // 5. === LOGIC QUAN TRỌNG ===
            // Xác định ai là "người kia" (recipient)
            const recipient =
              convo.participant1.id === user.id
                ? convo.participant2  
                : convo.participant1;

            // 6. Format lại thời gian
            const timeAgo = formatDistanceToNow(new Date(convo.lastMessageAt), {
              addSuffix: true,
              locale: vi,
            });
            // Viết hoa chữ cái đầu
            const timestamp = timeAgo.charAt(0).toUpperCase() + timeAgo.slice(1);

            // 7. Lấy unreadCount (Giả lập vì API chưa có)
            const unreadCount = 0; // Thay bằng convo.unreadCount khi có

            return (
              <button
                key={convo.id}
                onClick={() => onSelectConversation(convo.id)}
                className="flex items-center gap-3 p-4 border-b last:border-b-0 w-full text-left hover:bg-muted/ ৫০"
              >
                <Avatar className="w-10 h-10 border">
                  {/* <AvatarImage src={recipient.avatarUrl} /> */}
                  <AvatarFallback>{recipient.fullName.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold truncate text-foreground">
                      {recipient.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground shrink-0 ml-2">
                      {timestamp}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {convo.lastMessagePreview}
                    </p>
                    {unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center shrink-0 ml-2">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}