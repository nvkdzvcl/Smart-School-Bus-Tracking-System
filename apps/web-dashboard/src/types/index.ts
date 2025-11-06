export interface Bus {
  id: string
  licensePlate: string
  capacity: number
  status: 'active' | 'maintenance' | 'inactive'
  driver?: string
  route?: string
  lastMaintenance: string
  nextInspection: string
}

export interface BusStop {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  placeId?: string
  formattedAddress?: string
  googleMapsUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface Driver {
  id: string
  name: string
  phone: string
  email: string
  licenseNumber: string
  experience: number
  status: 'active' | 'inactive' | 'on_leave'
  assignedBus?: string
  assignedRoute?: string
}

export interface Student {
  id: string
  name: string
  grade: string
  class: string
  parentName: string
  parentPhone: string
  parentEmail: string
  address: string
  routeId?: string
  routeName?: string
  stopName?: string
  status: 'active' | 'inactive'
}

export interface Stop {
  id: string
  name: string
  address: string
  estimatedTime: string
}

export interface Route {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive'
  stops: Stop[]
  studentCount: number
  estimatedDuration: string
}

export interface Schedule {
  id: string
  routeName: string
  driverName: string
  busLicensePlate: string
  startTime: string
  endTime: string
  date: string
  type: 'morning' | 'afternoon'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  studentsCount: number
}

export interface BusLocation {
  id: string
  licensePlate: string
  route: string
  driver: string
  currentLocation: string
  status: 'moving' | 'stopped' | 'delayed' | 'completed'
  studentsOnBoard: number
  lastUpdate: string
  nextStop: string
  estimatedArrival: string
}