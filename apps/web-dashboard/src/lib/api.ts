// Unified API service (buses + bus stops)

export interface Bus {
    id?: string
    licensePlate: string
    capacity: number
    status?: 'active' | 'maintenance' | 'inactive' // lowercase match DB enum
    createdAt?: string
    updatedAt?: string
    gpsDeviceId?: string;
    insuranceExpiry?: string; // ISO date YYYY-MM-DD hoặc ISO full
}

export interface BusStop {
    id?: string
    name: string
    address: string
    latitude: number
    longitude: number
    placeId?: string
    formattedAddress?: string
    googleMapsUrl?: string
}

export interface Driver {
    id?: string
    fullName: string
    phone: string
    email?: string
    licenseNumber?: string
    licenseClass?: string
    licenseExpiry?: string // ISO date string
    // --- THÊM DÒNG NÀY ---
    status?: 'active' | 'inactive' | 'locked'
    // ---------------------
    createdAt?: string
    updatedAt?: string
}

export interface Student {
    id: string
    fullName: string
    class?: string
    status: 'active' | 'inactive'
    parent?: { id: string; fullName: string; phone: string }
    route?: { id: string; name: string }
    pickupStop?: { id: string; name: string }
    dropoffStop?: { id: string; name: string }
    createdAt?: string
    updatedAt?: string
}

export interface Trip {
    id: string;
    route: { id: string; name: string };
    bus: { id: string; licensePlate: string };
    driver: { id: string; fullName: string };
    tripDate: string; // YYYY-MM-DD
    session: 'morning' | 'afternoon';
    type: 'pickup' | 'dropoff';
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    actualStartTime?: string;
    actualEndTime?: string;
    plannedStartTime?: string; // mapped from scheduled_start_time
    // Có thể thêm các trường khác như studentCount...
}

export interface TripAlert {
    time: string;
    type: 'delay' | 'pickup_complete' | 'dropoff_complete' | 'trip_complete';
    message: string;
    licensePlate?: string;
}

// Driver report (incident) entity for dashboard
export interface Report {
    id: string;
    title: string;
    content: string;
    type: 'incident_traffic' | 'student_absent' | 'incident_vehicle' | 'incident_accident' | 'complaint' | 'other' | string;
    status: 'pending' | 'in_progress' | 'resolved' | 'rejected' | string;
    createdAt: string;
    imageUrl?: string;
    // Optional enrichments depending on backend
    senderId?: string;
    tripId?: string;
    studentId?: string;
}

export type ReportDetail = Report & {
    sender?: { id: string; fullName: string };
    trip?: { id: string; route?: { name?: string }; bus?: { licensePlate?: string } };
    student?: { id: string; fullName: string };
}

export interface Conversation {
    id: string
    participant1Id: string
    participant2Id: string
    lastMessagePreview?: string
    lastMessageAt: string
    participant1?: { id: string; fullName: string }
    participant2?: { id: string; fullName: string }
}

export interface ChatMessage {
    id: string
    conversationId: string
    senderId?: string
    recipientId?: string
    content: string
    isRead: boolean
    createdAt: string
}

const API_BASE = (import.meta as any).env?.VITE_DASHBOARD_API_URL || `${window.location.protocol}//${window.location.hostname}:3001/api`

function authHeaders(): HeadersInit {
    // Support multiple token keys used across different apps: auth_token (standardized), token (legacy), access_token (some flows)
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response, fallbackMsg: string): Promise<T> {
    if (res.ok) {
        if (res.status === 204) return undefined as any
        return res.json()
    }
    let message = fallbackMsg
    try { message = (await res.text()) || fallbackMsg } catch { }
    throw new Error(message)
}

// Bus APIs
export const getAllBuses = async (): Promise<Bus[]> => {
    const res = await fetch(`${API_BASE}/buses`, { headers: { ...authHeaders() } })
    return handleResponse<Bus[]>(res, 'Failed to fetch buses')
}

export const createBus = async (bus: Omit<Bus, 'id'>): Promise<Bus> => {
    const res = await fetch(`${API_BASE}/buses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(bus)
    })
    return handleResponse<Bus>(res, 'Failed to create bus')
}

export const updateBus = async (id: string, bus: Partial<Bus>): Promise<Bus> => {
    const res = await fetch(`${API_BASE}/buses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(bus)
    })
    return handleResponse<Bus>(res, 'Failed to update bus')
}

export const deleteBus = async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/buses/${id}`, { method: 'DELETE', headers: { ...authHeaders() } })
    await handleResponse(res, 'Failed to delete bus')
}

// Bus Stop APIs (placeholder if backend endpoints exist)
export const getAllBusStops = async (): Promise<BusStop[]> => {
    try {
        const res = await fetch(`${API_BASE}/bus-stops`, { headers: { ...authHeaders() } })
        return await handleResponse<BusStop[]>(res, 'Failed to fetch bus stops')
    } catch (e) {
        console.error('Error fetching bus stops:', e)
        return []
    }
}

export const createBusStop = async (stop: Omit<BusStop, 'id'>): Promise<BusStop> => {
    const res = await fetch(`${API_BASE}/bus-stops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(stop)
    })
    return handleResponse<BusStop>(res, 'Failed to create bus stop')
}

export const updateBusStop = async (id: string, stop: Partial<BusStop>): Promise<BusStop> => {
    const res = await fetch(`${API_BASE}/bus-stops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(stop)
    })
    return handleResponse<BusStop>(res, 'Failed to update bus stop')
}

export const deleteBusStop = async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/bus-stops/${id}`, { method: 'DELETE', headers: { ...authHeaders() } })
    await handleResponse(res, 'Failed to delete bus stop')
}

// Driver APIs
export const getDrivers = async (): Promise<Driver[]> => {
    const res = await fetch(`${API_BASE}/drivers`, { headers: { ...authHeaders() } })
    return handleResponse<Driver[]>(res, 'Failed to fetch drivers')
}

export const createDriver = async (driver: Partial<Driver> & { fullName: string; phone: string; licenseNumber: string; password: string }): Promise<Driver> => {
    const res = await fetch(`${API_BASE}/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(driver)
    })
    return handleResponse<Driver>(res, 'Failed to create driver')
}

export const updateDriver = async (id: string, driver: Partial<Driver>): Promise<Driver> => {
    const res = await fetch(`${API_BASE}/drivers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(driver)
    })
    return handleResponse<Driver>(res, 'Failed to update driver')
}

export const deleteDriver = async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/drivers/${id}`, { method: 'DELETE', headers: { ...authHeaders() } })
    await handleResponse(res, 'Failed to delete driver')
}

// Student APIs
export const getStudents = async (): Promise<Student[]> => {
    const res = await fetch(`${API_BASE}/students`, { headers: { ...authHeaders() } })
    return handleResponse<Student[]>(res, 'Failed to fetch students')
}

export const createStudent = async (data: { fullName: string; parentId?: string; pickupStopId?: string; dropoffStopId?: string; class?: string; status?: 'active' | 'inactive'; routeId?: string }) => {
    const res = await fetch(`${API_BASE}/students`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) })
    return handleResponse<Student>(res, 'Failed to create student')
}

export const updateStudent = async (id: string, data: Partial<{ fullName: string; parentId?: string; pickupStopId?: string; dropoffStopId?: string; class?: string; status?: 'active' | 'inactive'; routeId?: string }>) => {
    const res = await fetch(`${API_BASE}/students/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) })
    return handleResponse<Student>(res, 'Failed to update student')
}

export const deleteStudent = async (id: string) => {
    const res = await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE', headers: { ...authHeaders() } })
    await handleResponse(res, 'Failed to delete student')
}

// Helpers (giả sử backend có endpoints; nếu không có /users?role=parent sẽ lọc sau)
export const getParents = async (): Promise<{ id: string; fullName: string; phone: string }[]> => {
    const res = await fetch(`${API_BASE}/users`, { headers: { ...authHeaders() } })
    const users = await handleResponse<any[]>(res, 'Failed to fetch users')
    return users.filter(u => u.role === 'parent').map(u => ({ id: u.id, fullName: u.fullName, phone: u.phone }))
}

export const getRoutes = async (): Promise<{ id: string; name: string }[]> => {
    try {
        const res = await fetch(`${API_BASE}/routes`, { headers: { ...authHeaders() } })
        return await handleResponse(res, 'Failed to fetch routes')
    } catch { return [] }
}

export const getStops = async (): Promise<{ id: string; name: string }[]> => {
    try {
        const res = await fetch(`${API_BASE}/stops`, { headers: { ...authHeaders() } })
        return await handleResponse(res, 'Failed to fetch stops')
    } catch { return [] }
}

export const createStop = async (data: { name: string; address?: string; latitude: number; longitude: number }) => {
    const res = await fetch(`${API_BASE}/stops`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) })
    return handleResponse<{ id: string; name: string }>(res, 'Failed to create stop')
}

export const createRoute = async (data: { name: string; stopIds?: string[] }) => {
    const res = await fetch(`${API_BASE}/routes`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) })
    return handleResponse<any>(res, 'Failed to create route')
}
export const updateRoute = async (id: string, data: { name?: string; stopIds?: string[] }) => {
    const res = await fetch(`${API_BASE}/routes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) })
    return handleResponse<any>(res, 'Failed to update route')
}
export const deleteRoute = async (id: string) => {
    const res = await fetch(`${API_BASE}/routes/${id}`, { method: 'DELETE', headers: { ...authHeaders() } })
    await handleResponse(res, 'Failed to delete route')
}

// Trip APIs
export const getTrips = async (): Promise<Trip[]> => {
    try {
        const res = await fetch(`${API_BASE}/trips`, { headers: { ...authHeaders() } })
        return await handleResponse<Trip[]>(res, 'Failed to fetch trips')
    } catch { return [] }
}

export const getTripAlerts = async (): Promise<TripAlert[]> => {
    try {
        const res = await fetch(`${API_BASE}/trips/alerts`, { headers: { ...authHeaders() } })
        if (!res.ok) {
            // Nuốt lỗi và trả về danh sách rỗng
            return []
        }
        return await handleResponse<TripAlert[]>(res, 'Failed to fetch trip alerts')
    } catch {
        return []
    }
}

// Reports APIs (driver-submitted incidents)
export const getReports = async (): Promise<Report[]> => {
    try {
        const res = await fetch(`${API_BASE}/reports`, { headers: { ...authHeaders() } })
        return await handleResponse<Report[]>(res, 'Failed to fetch reports')
    } catch {
        return []
    }
}

export const getReportById = async (id: string): Promise<ReportDetail> => {
    const res = await fetch(`${API_BASE}/reports/${id}`, { headers: { ...authHeaders() } })
    return handleResponse<ReportDetail>(res, 'Failed to fetch report')
}

export const updateReport = async (id: string, data: Partial<Pick<Report, 'title' | 'content' | 'status'>>): Promise<ReportDetail> => {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data)
    })
    return handleResponse<ReportDetail>(res, 'Failed to update report')
}

// Hàm cập nhật chuyến đi (cho nút Chỉnh sửa)
export const updateTrip = async (id: string, data: Partial<Trip> & { startTime?: string }): Promise<Trip> => {
    const body: any = { ...data }
    if (data.startTime && data.tripDate) {
        // Convert HH:mm (local) -> ISO time (assume local day) for plannedStartTime
        const iso = new Date(`${data.tripDate}T${data.startTime}:00`).toISOString()
        body.plannedStartTime = iso
        delete body.startTime
    }
    const res = await fetch(`${API_BASE}/trips/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body)
    })
    return handleResponse<Trip>(res, 'Failed to update trip')
}

// Hàm xóa chuyến đi (cho nút Xóa)
export const deleteTrip = async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() }
    })
    await handleResponse(res, 'Failed to delete trip')
}
export const createTrip = async (data: { routeId?: string; busId?: string; driverId?: string; tripDate: string; session: 'morning' | 'afternoon'; type: 'pickup' | 'dropoff'; startTime?: string }) => {
    const body: any = { ...data }
    if (data.startTime && data.tripDate) {
        body.plannedStartTime = new Date(`${data.tripDate}T${data.startTime}:00`).toISOString()
        delete body.startTime
    }
    const res = await fetch(`${API_BASE}/trips`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) })
    return handleResponse<any>(res, 'Failed to create trip')
}

// Messages APIs
export const listNotifications = async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/messages/notifications`, { headers: { ...authHeaders() } })
    return handleResponse<any[]>(res, 'Failed to fetch notifications')
}

export const sendNotification = async (data: { title: string; content: string; priority: 'normal' | 'important' | 'urgent'; targetGroup: 'all' | 'drivers' | 'parents'; senderId?: string }) => {
    const res = await fetch(`${API_BASE}/messages/notification`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) })
    return handleResponse<any>(res, 'Failed to send notification')
}

export const getConversationsForUser = async (userId: string): Promise<Conversation[]> => {
    const res = await fetch(`${API_BASE}/conversations/user/${userId}`, { headers: { ...authHeaders() } })
    return handleResponse<Conversation[]>(res, 'Failed to fetch conversations')
}

export const getOrCreateConversation = async (userAId: string, userBId: string): Promise<Conversation> => {
    const res = await fetch(`${API_BASE}/conversations/get-or-create`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ userAId, userBId }) })
    return handleResponse<Conversation>(res, 'Failed to get or create conversation')
}

export const getConversationMessages = async (conversationId: string): Promise<ChatMessage[]> => {
    const res = await fetch(`${API_BASE}/messages/conversation/${conversationId}`, { headers: { ...authHeaders() } })
    return handleResponse<ChatMessage[]>(res, 'Failed to fetch messages')
}

export const sendChatMessage = async (data: { conversationId: string; senderId: string; recipientId: string; content: string }): Promise<ChatMessage> => {
    const res = await fetch(`${API_BASE}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) })
    return handleResponse<ChatMessage>(res, 'Failed to send message')
}

export const markMessageRead = async (id: string) => {
    const res = await fetch(`${API_BASE}/messages/${id}/read`, { method: 'PATCH', headers: { ...authHeaders() } })
    return handleResponse<any>(res, 'Failed to mark message read')
}

export const markConversationRead = async (conversationId: string, userId: string) => {
    const res = await fetch(`${API_BASE}/messages/conversation/${conversationId}/read/${userId}`, { method: 'PATCH', headers: { ...authHeaders() } })
    return handleResponse<any>(res, 'Failed to mark conversation read')
}

export const getUsers = async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/users`, { headers: { ...authHeaders() } })
    return handleResponse<any[]>(res, 'Failed to fetch users')
}
