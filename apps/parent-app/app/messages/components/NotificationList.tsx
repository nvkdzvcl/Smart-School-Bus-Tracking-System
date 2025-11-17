import type { Notification, NotificationType } from "@/types/data-types";
import { Card, CardContent } from "@/components/ui/Card"; // Sửa alias
import {
  BellRing,
  AlertTriangle,
  MessageSquare,
  Info,
  CalendarClock,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface NotificationListProps {
  notifications: Notification[];
}

// 1. Định nghĩa TypeSript cho ENUM từ DB

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

// 3. Cập nhật hàm getIcon để xử lý tất cả các type mới
const getIcon = (type: NotificationType) => {
  switch (type) {
    case "alert":
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case "info":
      return <Info className="w-4 h-4 text-blue-500" />; // Icon cho info
    case "message":
      return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
    case "system":
    case "arrival":
      return <BellRing className="w-4 h-4 text-primary" />; // Dùng icon 'arrival' cũ cho 'system'
    case "reminder":
      return <CalendarClock className="w-4 h-4 text-yellow-600" />; // Icon cho reminder
    default:
      return <BellRing className="w-4 h-4 text-muted-foreground" />;
  }
};

export default function NotificationList({
  notifications,
  isLoading,
  error,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 flex justify-center items-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // 5. Xử lý trạng thái Lỗi
  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  // 6. Xử lý không có dữ liệu
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          Không có thông báo nào.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent>
        <div className="py-2">
          {notifications.map((item) => {
            const date = new Date(item.createdAt);
            const timeAgo = formatDistanceToNow(date, {
              addSuffix: true,
              locale: vi,
            });

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-4 border-b last:border-b-0"
              >
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.message}
                  </p>
                  <p className="text-xs text-muted-foreground first-letter:uppercase">{timeAgo}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
