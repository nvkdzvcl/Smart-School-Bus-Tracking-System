import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
let driverSocket: Socket | null = null

export function getSocket(): Socket {
    if (socket) return socket
    const WS_URL = (import.meta as any).env?.VITE_DASHBOARD_WS_URL || `${window.location.protocol}//${window.location.hostname}:3001`
    socket = io(WS_URL, { transports: ['websocket'], withCredentials: false })
    return socket
}

export function getDriverSocket(): Socket {
    if (driverSocket) return driverSocket
    const DRIVER_WS_URL = (import.meta as any).env?.VITE_DRIVER_WS_URL || `${window.location.protocol}//${window.location.hostname}:3000`
    driverSocket = io(DRIVER_WS_URL, { transports: ['websocket'], withCredentials: false })
    return driverSocket
}

export default getSocket
