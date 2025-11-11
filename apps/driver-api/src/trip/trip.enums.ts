// apps/driver-api/src/trip/trip.enums.ts

export enum TripType {
  PICKUP = 'pickup',
  DROPOFF = 'dropoff',
}

export enum TripStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum attendance_status {
  PENDING = 'pending',
  ATTENDED = 'attended',
  ABSENT = 'absent',
}

export enum DayPart {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
}
