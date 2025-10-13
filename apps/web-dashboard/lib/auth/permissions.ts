// Permission definitions and RBAC logic

export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: "view:dashboard",

  // Vehicles
  VIEW_VEHICLES: "view:vehicles",
  CREATE_VEHICLE: "create:vehicle",
  EDIT_VEHICLE: "edit:vehicle",
  DELETE_VEHICLE: "delete:vehicle",

  // Drivers
  VIEW_DRIVERS: "view:drivers",
  CREATE_DRIVER: "create:driver",
  EDIT_DRIVER: "edit:driver",
  DELETE_DRIVER: "delete:driver",

  // Routes
  VIEW_ROUTES: "view:routes",
  CREATE_ROUTE: "create:route",
  EDIT_ROUTE: "edit:route",
  DELETE_ROUTE: "delete:route",

  // Students
  VIEW_STUDENTS: "view:students",
  CREATE_STUDENT: "create:student",
  EDIT_STUDENT: "edit:student",
  DELETE_STUDENT: "delete:student",
  IMPORT_STUDENTS: "import:students",

  // Assignments
  VIEW_ASSIGNMENTS: "view:assignments",
  CREATE_ASSIGNMENT: "create:assignment",
  EDIT_ASSIGNMENT: "edit:assignment",
  DELETE_ASSIGNMENT: "delete:assignment",

  // Tracking
  VIEW_LIVE_TRACKING: "view:live-tracking",
  VIEW_REPLAY: "view:replay",

  // Incidents
  VIEW_INCIDENTS: "view:incidents",
  CREATE_INCIDENT: "create:incident",
  EDIT_INCIDENT: "edit:incident",
  RESOLVE_INCIDENT: "resolve:incident",

  // Messaging
  VIEW_MESSAGES: "view:messages",
  SEND_MESSAGE: "send:message",
  SEND_BROADCAST: "send:broadcast",

  // Reports
  VIEW_REPORTS: "view:reports",
  EXPORT_REPORTS: "export:reports",

  // Users & Settings
  VIEW_USERS: "view:users",
  CREATE_USER: "create:user",
  EDIT_USER: "edit:user",
  DELETE_USER: "delete:user",
  VIEW_SETTINGS: "view:settings",
  EDIT_SETTINGS: "edit:settings",
  VIEW_AUDIT_LOGS: "view:audit-logs",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// Role definitions with their permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(PERMISSIONS),

  dispatcher: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.VIEW_ROUTES,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_ASSIGNMENTS,
    PERMISSIONS.CREATE_ASSIGNMENT,
    PERMISSIONS.EDIT_ASSIGNMENT,
    PERMISSIONS.VIEW_LIVE_TRACKING,
    PERMISSIONS.VIEW_REPLAY,
    PERMISSIONS.VIEW_INCIDENTS,
    PERMISSIONS.CREATE_INCIDENT,
    PERMISSIONS.EDIT_INCIDENT,
    PERMISSIONS.RESOLVE_INCIDENT,
    PERMISSIONS.VIEW_MESSAGES,
    PERMISSIONS.SEND_MESSAGE,
    PERMISSIONS.VIEW_REPORTS,
  ],

  "route-manager": [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.VIEW_ROUTES,
    PERMISSIONS.CREATE_ROUTE,
    PERMISSIONS.EDIT_ROUTE,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_ASSIGNMENTS,
    PERMISSIONS.CREATE_ASSIGNMENT,
    PERMISSIONS.EDIT_ASSIGNMENT,
    PERMISSIONS.VIEW_LIVE_TRACKING,
    PERMISSIONS.VIEW_INCIDENTS,
    PERMISSIONS.VIEW_REPORTS,
  ],

  hr: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.CREATE_DRIVER,
    PERMISSIONS.EDIT_DRIVER,
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.VIEW_REPORTS,
  ],

  support: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_ROUTES,
    PERMISSIONS.VIEW_LIVE_TRACKING,
    PERMISSIONS.VIEW_INCIDENTS,
    PERMISSIONS.VIEW_MESSAGES,
    PERMISSIONS.SEND_MESSAGE,
  ],
}

export function hasPermission(userPermissions: Permission[], permission: Permission): boolean {
  return userPermissions.includes(permission)
}

export function hasAnyPermission(userPermissions: Permission[], permissions: Permission[]): boolean {
  return permissions.some((p) => userPermissions.includes(p))
}

export function hasAllPermissions(userPermissions: Permission[], permissions: Permission[]): boolean {
  return permissions.every((p) => userPermissions.includes(p))
}
