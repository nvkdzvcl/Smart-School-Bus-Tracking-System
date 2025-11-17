import {useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import {Card, CardContent} from "../ui/Card.tsx"
import {Badge} from "lucide-react"
import {io, Socket} from "socket.io-client"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

type NotificationsListProps = {
    parentID: string | null
}

interface Notification {
    id: string
    title: string
    message: string
    type: "alert" | "notification" | "message"
    isRead: boolean
    createdAt: string
}

function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    let time = seconds / 31536000;
    if (time > 1) return Math.floor(time) + " năm trước";

    time = seconds / 25923000;
    if (time > 1) return Math.floor(time) + " tháng trước";

    time = seconds / 86400;
    if (time > 1) return Math.floor(time) + " ngày trước";

    time = seconds / 3600;
    if (time > 1) return Math.floor(time) + " giờ trước";

    time = seconds / 60;
    if (time > 1) return Math.floor(time) + " phút trước";

    return Math.floor(seconds) + " giây trước";
}

// const messages = [
//     {
//         id: 1,
//         type: "alert",
//         icon: AlertTriangle,
//         title: "Bus Delayed",
//         message: "Bus is running 10 minutes late due to traffic on Nguyen Van Linh St.",
//         time: "5 min ago",
//         unread: true,
//         color: "warning",
//     },
//     {
//         id: 2,
//         type: "notification",
//         icon: Bell,
//         title: "Bus Approaching",
//         message: "Bus is 500m away from your pickup point. Please be ready.",
//         time: "15 min ago",
//         unread: true,
//         color: "primary",
//     },
//     {
//         id: 3,
//         type: "message",
//         icon: MessageSquare,
//         title: "Message from School",
//         message: "Reminder: Parent-teacher meeting scheduled for next Friday at 2 PM.",
//         time: "2 hours ago",
//         unread: false,
//         color: "accent",
//     },
//     {
//         id: 4,
//         type: "info",
//         icon: Info,
//         title: "Route Change Notice",
//         message: "Temporary route change tomorrow due to road construction. New pickup time: 7:15 AM.",
//         time: "Yesterday",
//         unread: false,
//         color: "primary",
//     },
// ]

export default function NotificationsList({ parentID }: NotificationsListProps) {
    const navigate = useNavigate()

    const [socket, setSocket] = useState<Socket | null>(null)

    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!parentID) return
        const token = localStorage.getItem("access_token")
        if (!token) return

        const fetchAllData = async () => {
            setIsLoadingNotifications(true)
            setError(null)

            try {
                const [notificationsResponse] = await Promise.all([
                    fetch(`${API_URL}/notifications`, {
                        headers: {Authorization: `Bearer ${token}`},
                        cache: "no-store",
                    }),
                ])

                if (!notificationsResponse.ok) throw new Error("Không thể tải thông báo")
                const notificationsData: Notification[] = await notificationsResponse.json()
                setNotifications(notificationsData)
            } catch (error) {
                setError("Lỗi khi tải thông báo")
                console.error(error)
            } finally {
                setIsLoadingNotifications(false)
            }
        }

        fetchAllData()
    }, [parentID]);

    useEffect(() => {
        if (!parentID) return
        const token = localStorage.getItem("access_token")
        if (!token) return

        const newSocket = io(API_URL + "/chat", {
            auth: {token},
        })

        setSocket(newSocket)

        newSocket.on("connect", () => console.log("Socket.IO: Đã kết nối!", newSocket.id))
        newSocket.on("connected", (data) => console.log("Socket.IO: Server xác nhận", data?.userId))
        newSocket.on("error", (error) => {
            console.error("Socket.IO: Lỗi: ", error)
            if (typeof error === "string" && error.includes("hết hạn")) navigate("/login")
        })

        return () => {
            newSocket.disconnect()
        }
    }, [parentID, navigate]);

    useEffect(() => {
        if (!socket) return
        const handleNewNotification = (receivedNotification: Notification) => {
            setNotifications((prev) => [...prev, receivedNotification])
        }

        socket.on("newNotification", handleNewNotification)
        return () => {
            socket.off("newNotification", handleNewNotification)
        }
    }, [socket]);

    const handleNotificationClick = async (notificationId: string) => {
        const notification = notifications.find((notif) => notif.id === notificationId)

        if (notification?.isRead) {
            console.log("Thông báo đã được đọc.")
            return
        }

        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId ? {...notif, isRead: true} : notif
            )
        );

        const token = localStorage.getItem("access_token")
        try {
            const response = await fetch(
                `${API_URL}/notifications/${notificationId}/read`, {
                    method: 'PATCH',
                    headers: {Authorization: `Bearer ${token}`}
                }
            );

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || `API Error: ${response.status}`)
            }
        } catch (error) {
            console.error("Lỗi khi đánh dấu đã đọc: ", error)

            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? {...notif, isRead: false} : notif
                )
            );
        }
    }

    const unreadNotifCount = notifications.filter((notif) => !notif.isRead).length
    return (
        <>
            {unreadNotifCount > 0 && (
                <Badge
                    className="mr-1 absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs rounded-full">
                    {unreadNotifCount}
                </Badge>
            )}

            {error && (
                <div className="p-4 mb-4 text-center text-sm text-red-500 bg-red-500/10 rounded-lg">
                    <p className="font-semibold">Lỗi!</p>
                    <p>{error}</p>
                </div>
            )}

            <div className="space-y-3 max-w-2xl mx-auto p-4">
                {isLoadingNotifications ? (
                    <p className="text-muted-foreground text-center">Đang tải thông báo...</p>
                ) : notifications.length === 0 ? (
                    <p className="text-muted-foreground text-center">Không có thông báo nào.</p>
                ) : (
                    notifications.map((n) => (
                        <Card
                            key={n.id}
                            onClick={() => handleNotificationClick(n.id)}
                            className={`border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors ${
                                !n.isRead ? "bg-gradient-to-br from-card to-primary/5" : ""
                            }`}
                        >
                            <CardContent className="p-4 px-4 pt-4">
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/20 text-primary">
                                        {n.type === "alert" ? "!" : n.type === "notification" ? "B" : "M"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-foreground text-sm">{n.title}</h3>
                                                    {!n.isRead && <div
                                                        className="w-2 h-2 rounded-full bg-primary flex-shrink-0"/>}
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{n.message}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </>
    )
}

{/*// /!*<div className="divide-y divide-border">*!/*/}
{/*// <div className="space-y-3 max-w-2xl mx-auto p-4">*/}
{/*// {messages.map((message) => {*/}
{/*//         const Icon = message.icon*/}
{/*//         const bgColor =*/}
{/*//             message.color === "warning" ? "bg-warning/10" : message.color === "accent" ? "bg-accent/10" : "bg-primary/10"*/}
{/*//         const textColor =*/}
{/*//             message.color === "warning" ? "text-warning" : message.color === "accent" ? "text-accent" : "text-primary"*/}
{/*//*/}
{/*//         return (*/}
{/*//             // <Card key={message.id} className="rounded-none border-0 border-b last:border-b-0">*/}
{/*//             <Card key={message.id}>*/}
{/*//                 <CardContent className={`p-4 ${message.unread ? "bg-muted/30" : ""}`}>*/}
{/*//                     <div className="flex items-center gap-3">*/}
{/*//                         <div*/}
{/*//                             className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center shrink-0`}>*/}
{/*//                             <Icon className={`w-5 h-5 ${textColor}`}/>*/}
{/*//                         </div>*/}
{/*//*/}
{/*//                         <div className="flex-1 min-w-0">*/}
{/*//                             <div className="flex items-center justify-between gap-2 mb-1">*/}
{/*//                                 <h4 className="text-sm font-semibold">{message.title}</h4>*/}
{/*//                                 <div className="flex items-center gap-2 shrink-0">*/}
{/*//                                     {message.unread && <div className="w-2 h-2 rounded-full bg-primary"/>}*/}
{/*//                                     <span className="text-xs text-muted-foreground">{message.time}</span>*/}
{/*//                                 </div>*/}
{/*//                             </div>*/}
{/*//                             <p className="text-sm text-muted-foreground leading-relaxed">{message.message}</p>*/}
{/*//                         </div>*/}
{/*//                     </div>*/}
{/*//                 </CardContent>*/}
{/*//             </Card>*/}
{/*//         )*/}
{/*//     })}*/}
{/*// </div>*/}
