// Core entity types for SSB 1.0

export type VehicleStatus = "active" | "maintenance" | "offline" | "idle"
export type DriverStatus = "active" | "on-leave" | "suspended" | "inactive"
export type RouteStatus = "scheduled" | "in-progress" | "completed" | "cancelled" | "delayed"
export type IncidentSeverity = "minor" | "major" | "critical"
export type IncidentStatus = "open" | "in-progress" | "resolved" | "closed"
export type ShiftType = "morning" | "afternoon" | "evening" | "field-trip"
export type UserRole = "admin" | "dispatcher" | "route-manager" | "hr" | "support"

export interface Vehicle {
  id: string
  plateNumber: string
  capacity: number
  gpsDeviceId: string
  imei: string
  status: VehicleStatus
  inspectionExpiry: string
  insuranceExpiry: string
  fuelLevel?: number
  lastMaintenance?: string
  nextMaintenance?: string
  currentLocation?: {
    lat: number
    lng: number
    speed: number
    heading: number
    timestamp: string
  }
}

export interface Driver {
  id: string
  name: string
  licenseNumber: string
  licenseClass: string
  licenseExpiry: string
  phone: string
  email: string
  status: DriverStatus
  trustScore: number
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  violations: number
  avatar?: string
}

export interface Student {
  id: string
  code: string
  name: string
  grade: string
  school: string
  defaultPickupStopId: string
  defaultDropoffStopId: string
  defaultRouteId: string
  notes?: string
  allergies?: string
  avatar?: string
}

export interface Guardian {
  id: string
  name: string
  relationship: string
  phone: string
  email: string
  language: "vi" | "en"
  studentIds: string[]
  notificationEnabled: boolean
  deviceToken?: string
}

export interface Stop {
  id: string
  name: string
  lat: number
  lng: number
  geofenceRadius: number
  capacity?: number
  studentIds: string[]
  address: string
}

export interface Route {
  id: string
  name: string
  code: string
  shiftType: ShiftType
  status: RouteStatus
  stops: {
    stopId: string
    sequence: number
    estimatedTime: string
    bufferMinutes: number
  }[]
  estimatedDuration: number
  distance: number
  version: number
  isActive: boolean
}

export interface Assignment {
  id: string
  routeId: string
  vehicleId: string
  driverId: string
  date: string
  shiftType: ShiftType
  status: "assigned" | "confirmed" | "cancelled"
  notes?: string
  createdBy: string
  createdAt: string
}

export interface AttendanceLog {
  id: string
  studentId: string
  routeId: string
  stopId: string
  type: "pickup" | "dropoff"
  timestamp: string
  location: {
    lat: number
    lng: number
  }
  confirmedBy: string
  method: "qr" | "rfid" | "nfc" | "manual"
  status: "present" | "absent" | "late"
}

export interface Incident {
  id: string
  routeId: string
  vehicleId: string
  driverId: string
  type: "delay" | "route-deviation" | "breakdown" | "accident" | "other"
  severity: IncidentSeverity
  status: IncidentStatus
  description: string
  location: {
    lat: number
    lng: number
  }
  reportedAt: string
  reportedBy: string
  assignedTo?: string
  resolvedAt?: string
  timeline: {
    timestamp: string
    action: string
    user: string
  }[]
  attachments?: string[]
}

export interface Message {
  id: string
  type: "broadcast" | "route" | "class" | "individual"
  recipients: string[]
  subject: string
  body: string
  channel: "app" | "email" | "sms"
  sentAt: string
  sentBy: string
  deliveryStatus: {
    sent: number
    delivered: number
    read: number
    failed: number
  }
  templateId?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: string[]
  avatar?: string
  lastLogin?: string
}

export interface DashboardKPI {
  activeRoutes: number
  activeVehicles: number
  totalVehicles: number
  studentsPickedUp: number
  totalStudents: number
  openIncidents: number
  onTimePerformance: number
}
