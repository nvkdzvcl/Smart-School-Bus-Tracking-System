export interface IParent {
  id: string;
  fullName?: string;
  phone: string;
  email: string;
  students: IStudent[];
}

export interface IStudent {
  id: string;
  fullName: string;
  parentId: string;
  pickupStopId: string;
  dropoffStopId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface IAttendanceRecord {
  id: string;
  date: string;
  status: "attended" | "absent" | "pending";
}

export interface IStop {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | "alert"
  | "info"
  | "message"
  | "system"
  | "reminder"
  | "arrival";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  title?: string;
}

export interface CreateMessageDto {
  content: string;
  senderId: string;
  recipientId: string;
  conversationId: string;
}

export interface Participant {
  id: string;
  fullName: string;
  // Thêm avatar nếu có, nếu không thì dùng fallback
  // avatarUrl?: string;
}

export interface Conversation {
  id: string;
  lastMessagePreview: string;
  lastMessageAt: string; // Đây là ISO string
  participant1: Participant;
  participant2: Participant;
  // TODO: API của bạn cần trả về unreadCount
  // unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string; // Quan trọng: Khi JSON gửi về, 'Date' (từ backend) sẽ trở thành 'string'
}
