import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
let driverSocket: Socket | null = null

export function getSocket(): Socket {
    if (socket) return socket
    const WS_URL = (import.meta as any).env?.VITE_DASHBOARD_WS_URL || `${window.location.protocol}//${window.location.hostname}:3001`
    socket = io(WS_URL, {
        transports: ['websocket'],
        withCredentials: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    })
    socket.on('connect_error', (err) => console.warn('Dashboard WS connect error:', err.message))
    return socket
}

export function getDriverSocket(): Socket {
    if (driverSocket) return driverSocket
    const DRIVER_WS_URL = (import.meta as any).env?.VITE_DRIVER_WS_URL
    if (!DRIVER_WS_URL) {
        console.warn('Driver WS disabled: set VITE_DRIVER_WS_URL to enable')
        // Create a no-op socket-like object to avoid null checks
        driverSocket = io('http://invalid.local', { autoConnect: false }) as any
        return driverSocket
    }
    driverSocket = io(DRIVER_WS_URL, {
        transports: ['websocket'],
        withCredentials: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    })
    driverSocket.on('connect_error', (err) => console.warn('Driver WS connect error:', err.message))
    return driverSocket
}

export default getSocket
