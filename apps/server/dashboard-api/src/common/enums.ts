export enum UserRole {
    MANAGER = 'manager',
    DRIVER = 'driver',
    PARENT = 'parent',
}

export enum BusStatus {
    ACTIVE = 'active',
    MAINTENANCE = 'maintenance',
    INACTIVE = 'inactive',
}

export enum TripType {
    PICKUP = 'pickup',
    DROPOFF = 'dropoff',
}

export enum DayPart {
    MORNING = 'morning',
    AFTERNOON = 'afternoon',
}

export enum TripStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum AttendanceStatus {
    PENDING = 'pending',
    ATTENDED = 'attended',
    ABSENT = 'absent',
}

export enum NotificationType {
    ALERT = 'alert',
    ARRIVAL = 'arrival',
    MESSAGE = 'message',
    INCIDENT = 'incident',
}

export enum ReportType {
    STUDENT_ABSENT = 'student_absent',
    INCIDENT_TRAFFIC = 'incident_traffic',
    INCIDENT_VEHICLE = 'incident_vehicle',
    INCIDENT_ACCIDENT = 'incident_accident',
    COMPLAINT = 'complaint',
    OTHER = 'other',
}

export enum ReportStatus {
    PENDING = 'pending',
    RESOLVED = 'resolved',
}
