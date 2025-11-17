import {useEffect, useState, useRef} from "react"
import {useNavigate} from "react-router-dom"
import {Card, CardContent} from "../ui/Card.tsx"
import {Badge} from "lucide-react"
import {io, Socket} from "socket.io-client"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

type MessagesListProps = {
    parentID: string | null
}

interface SocketMessage {
    id: string
    sender_id: string
    recipient_id: string
    content: string
    created_at: string
    sender?: {
        id: string
        full_name: string
    }
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

export default function MessagesList({ parentID }: MessagesListProps) {
    const navigate = useNavigate()

    const [socket, setSocket] = useState<Socket | null>(null)
    const [chatHistory, setChatHistory] = useState<SocketMessage[]>([])
    const chatEndRef = useRef<HTMLDivElement>(null)

    const [error, setError] = useState<string | null>(null)

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

        newSocket.on("messageSent", (sentMessage: SocketMessage) => {
            setChatHistory((prev) => [...prev, sentMessage])
        })

        newSocket.on("history", (history: SocketMessage[]) => {
            setChatHistory(history)
        })

        return () => {
            newSocket.disconnect()
        }
    }, [parentID, navigate]);

    useEffect(() => {
        if (!socket) return
        const handleNewMessage = (receivedMessage: SocketMessage) => {
            setChatHistory((prev) => [...prev, receivedMessage])
        }

        socket.on("newMessage", handleNewMessage)
        return () => {
            socket.off("newMessage", handleNewMessage)
        }
    }, [socket]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({behavior: "smooth"})
    }, [chatHistory]);

    return (
        <>
            {error && (
                <div className="p-4 mb-4 text-center text-sm text-red-500 bg-red-500/10 rounded-lg">
                    <p className="font-semibold">Lỗi!</p>
                    <p>{error}</p>
                </div>
            )}

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
