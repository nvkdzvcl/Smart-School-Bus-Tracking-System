// Status utility functions and mappings

import type { VehicleStatus, DriverStatus, RouteStatus, IncidentSeverity } from "../Types"

export const vehicleStatusLabels: Record<VehicleStatus, string> = {
  active: "Đang hoạt động",
  maintenance: "Bảo dưỡng",
  offline: "Ngoại tuyến",
  idle: "Chờ",
}

export const vehicleStatusColors: Record<VehicleStatus, string> = {
  active: "text-green-500",
  maintenance: "text-orange-500",
  offline: "text-red-500",
  idle: "text-gray-500",
}

export const driverStatusLabels: Record<DriverStatus, string> = {
  active: "Đang làm việc",
  "on-leave": "Nghỉ phép",
  suspended: "Tạm ngưng",
  inactive: "Không hoạt động",
}

export const driverStatusColors: Record<DriverStatus, string> = {
  active: "text-green-500",
  "on-leave": "text-blue-500",
  suspended: "text-red-500",
  inactive: "text-gray-500",
}

export const routeStatusLabels: Record<RouteStatus, string> = {
  scheduled: "Đã lên lịch",
  "in-progress": "Đang chạy",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  delayed: "Trễ",
}

export const routeStatusColors: Record<RouteStatus, string> = {
  scheduled: "text-blue-500",
  "in-progress": "text-green-500",
  completed: "text-gray-500",
  cancelled: "text-red-500",
  delayed: "text-orange-500",
}

export const incidentSeverityLabels: Record<IncidentSeverity, string> = {
  minor: "Nhỏ",
  major: "Lớn",
  critical: "Nghiêm trọng",
}

export const incidentSeverityColors: Record<IncidentSeverity, string> = {
  minor: "text-yellow-500",
  major: "text-orange-500",
  critical: "text-red-500",
}
