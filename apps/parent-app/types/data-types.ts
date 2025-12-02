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
  conversationId?: string;
}

export interface Participant {
  id: string;
  fullName: string;
  phone?: string;
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

export type TripSession = "morning" | "afternoon";
export type TripType = "pickup" | "dropoff";
export type TripStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";
export type AttendanceStatus = "pending" | "attended" | "absent";
export interface Stop {
  id: string;
  name: string;
  address: string;
  latitude: string | number; // API thường trả về string cho Decimal, cần parse nếu muốn dùng map
  longitude: string | number;
}

export interface Bus {
  id: string;
  licensePlate: string;
  capacity: number;
  // status...
}

export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  avatar?: string; // Nếu có
}

// 3. Interface Chuyến đi (Trip)
export interface Trip {
  id: string;
  tripDate: string; // YYYY-MM-DD
  session: TripSession;
  type: TripType;
  status: TripStatus;
  actualStartTime: string | null; // ISO String
  actualEndTime: string | null; // ISO String

  // Quan hệ (được join trong service)
  bus?: Bus;
  driver?: Driver;
  routeId?: string;
}

// 4. Interface Bảng trung gian (TripStudent)
// Đây là cái kết nối Học sinh với Chuyến đi
export interface TripStudent {
  status: AttendanceStatus; // Trạng thái điểm danh
  attendedAt: string | null; // Thời gian lên/xuống xe thực tế
  trip: Trip; // Chi tiết chuyến đi
}

// 5. === INTERFACE CHÍNH: STUDENT ===
export interface Student {
  id: string;
  fullName: string;
  parentId: string;

  // Điểm đón/trả mặc định (nếu có)
  pickupStopId?: string;
  dropoffStopId?: string;
  pickupStop?: Stop;
  dropoffStop?: Stop;

  // Danh sách các chuyến đi (của ngày hôm nay)
  // Mảng này sẽ chứa các object TripStudent, bên trong có Trip
  tripStudents: TripStudent[];

  createdAt: string;
  updatedAt: string;
}

export type DayPart = "morning" | "afternoon";

export type ParentScheduleResponse = {
  date: string;
  session: DayPart;
  trips: ParentTrip[];
};

export type ParentTrip = {
  tripId: string;
  type: TripType;
  status: TripStatus;
  route: { id: string; name: string };
  bus: { id: string; licensePlate: string };
  driver: { id: string; fullName: string; phone?: string };
  times: {
    scheduledStart?: string | null;
    actualStart?: string | null;
    scheduledEnd?: string | null;
    actualEnd?: string | null;
  };
  live?: {
    lastLocation?: {
      latitude: number;
      longitude: number;
      timestamp: string;
    } | null;
    etaToMyStop?: string | null;
  };
  myChildren: ParentTripChild[];
  notifications: ParentTripNotification[];
};

export type ParentTripChild = {
  studentId: string;
  fullName: string;
  stop: {
    type: TripType;
    id: string;
    name: string;
    address?: string | null;
    latitude: number;
    longitude: number;
  };
  attendance: {
    status: AttendanceStatus;
    attendedAt?: string | null;
  };
};

export type ParentTripNotification = {
  id: string;
  type: NotificationType;
  title?: string | null;
  message: string;
  createdAt: string;
  isRead: boolean;
};

export type UserRole = 'manager' | 'driver' | 'parent';

// 2. Interface User chuẩn
export interface User {
  id: string;
  fullName: string;       // Map từ 'full_name' trong DB
  phone: string;          // Bắt buộc (Unique)
  email?: string;         // Có thể null
  role: UserRole;
  
  // Các trường bổ sung (Optional)
  avatarUrl?: string;     // URL ảnh đại diện (thường ghép thêm ở backend hoặc lấy từ UI)
  licenseNumber?: string; // Chỉ dành cho Driver
  fcmToken?: string;      // Token để bắn thông báo
  
  // Quan hệ (Relations - Tùy API có trả về không)
  students?: any[];       // Danh sách học sinh (nếu là Parent)

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}