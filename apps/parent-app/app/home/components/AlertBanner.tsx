import { AlertTriangle, CalendarClock, Info, X } from "lucide-react";
import type { Notification, NotificationType } from "@/types/data-types";

interface AlertBannerProps {
  alert: Notification;
  onDismiss: (id: string) => void;
}


const getBannerStyles = (type: NotificationType) => {
  switch (type) {
    case "alert":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        subText: "text-red-600",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        icon: <AlertTriangle className="w-4 h-4" />,
      };
    case "reminder":
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-800",
        subText: "text-yellow-600",
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
        icon: <CalendarClock className="w-4 h-4" />,
      };
    case "info":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        subText: "text-blue-600",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        icon: <Info className="w-4 h-4" />,
      };
    default:
      return null; 
  }
};

export default function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  const bannerStyle = getBannerStyles(alert.type);

  if (!bannerStyle) return null;

  return (
    <div
      className={`${bannerStyle.bg} border ${bannerStyle.border} p-3 rounded-lg flex items-start gap-3 relative pr-8`}
    >
      <div
        className={`${bannerStyle.iconBg} p-1.5 rounded-full shrink-0 ${bannerStyle.iconColor}`}
      >
        {bannerStyle.icon}
      </div>
      <div>
        <p className={`text-sm font-medium ${bannerStyle.text}`}>
          {alert.message}
        </p>
        <p className={`text-xs ${bannerStyle.subText} mt-1`}>Vừa xong</p>
      </div>

      <button
        onClick={() => onDismiss(alert.id)}
        className={`absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition ${bannerStyle.text}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}