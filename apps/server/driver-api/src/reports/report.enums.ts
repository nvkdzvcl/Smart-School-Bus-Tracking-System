// apps/driver-api/src/reports/report.enums.ts

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