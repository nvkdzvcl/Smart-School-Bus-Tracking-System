# SSB 1.0 Web Dashboard

Giao diện web dashboard cho hệ thống Smart School Bus Tracking System (SSB 1.0).

## Tính năng chính

### 🏠 Tổng quan (Dashboard)
- Thống kê tổng quan hệ thống
- Biểu đồ chuyến đi trong tuần
- Cảnh báo gần đây
- Danh sách xe đang hoạt động

### 🚌 Quản lý Xe buýt
- Xem danh sách tất cả xe buýt
- Thêm, sửa, xóa thông tin xe
- Theo dõi trạng thái xe (hoạt động, bảo trì, không hoạt động)
- Lịch bảo trì và kiểm định
- Phân công tài xế và tuyến đường

### 👨‍💼 Quản lý Tài xế
- Thêm, sửa, xóa thông tin tài xế
- Quản lý thông tin liên hệ và bằng lái
- Theo dõi trạng thái làm việc
- Phân công xe buýt và tuyến đường

### 🎓 Quản lý Học sinh
- Thêm thông tin học sinh và phụ huynh
- Chọn tuyến đường và điểm dừng cho học sinh
- Quản lý trạng thái học sinh
- Lọc theo khối, lớp, trạng thái

### 🛣️ Quản lý Tuyến đường
- Tạo và chỉnh sửa tuyến đường
- Thêm điểm dừng cho tuyến đường
- Xem danh sách học sinh thuộc tuyến đường
- Quản lý thời gian dự kiến tại mỗi điểm dừng

### 📍 Theo dõi Thời gian thực
- Giám sát vị trí xe buýt theo thời gian thực
- Bản đồ tích hợp (iframe Google Maps)
- Trạng thái chi tiết từng xe
- Cảnh báo và thông báo

### 📅 Quản lý Lịch trình
- Chỉ định tài xế, xe buýt cho tuyến đường
- Thiết lập thời gian bắt đầu và kết thúc
- Quản lý ca sáng và ca chiều
- Theo dõi trạng thái thực hiện

## Công nghệ sử dụng

- **React 18** - Framework frontend
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons
- **Recharts** - Charts và biểu đồ
- **Vite** - Build tool

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

## Cấu trúc thư mục

```
src/
├── components/          # Shared components
│   ├── Header.tsx      # Header component
│   ├── Layout.tsx      # Main layout
│   └── Sidebar.tsx     # Navigation sidebar
├── pages/              # Page components
│   ├── Dashboard.tsx           # Tổng quan
│   ├── BusManagement.tsx       # Quản lý xe buýt
│   ├── DriverManagement.tsx    # Quản lý tài xế
│   ├── StudentManagement.tsx   # Quản lý học sinh
│   ├── RouteManagement.tsx     # Quản lý tuyến đường
│   ├── RealTimeTracking.tsx    # Theo dõi thời gian thực
│   └── ScheduleManagement.tsx  # Quản lý lịch trình
├── lib/                # Utilities
│   └── utils.ts        # Helper functions
├── types/              # TypeScript types
│   └── index.ts        # Type definitions
├── App.tsx             # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Tính năng nổi bật

### Responsive Design
- Tối ưu cho desktop, tablet và mobile
- Grid layout linh hoạt
- Navigation sidebar có thể thu gọn

### Real-time Features
- Cập nhật vị trí xe buýt theo thời gian thực
- Thông báo và cảnh báo tức thời
- Tự động refresh dữ liệu

### User Experience
- Interface thân thiện, dễ sử dụng
- Tìm kiếm và lọc dữ liệu mạnh mẽ
- Modal forms cho các thao tác CRUD
- Loading states và error handling

### Data Visualization
- Biểu đồ thống kê trực quan
- Dashboard tổng quan chi tiết
- Status indicators và progress tracking

## Tích hợp API

Dashboard được thiết kế để dễ dàng tích hợp với backend API:

- Tất cả dữ liệu hiện tại là mock data
- Cấu trúc types TypeScript sẵn sàng cho API integration
- Async/await patterns đã được chuẩn bị
- Error handling và loading states

## Triển khai

```bash
# Build production
npm run build

# Deploy dist/ folder to web server
```

## Hỗ trợ

Để được hỗ trợ, vui lòng liên hệ team phát triển SSB 1.0.