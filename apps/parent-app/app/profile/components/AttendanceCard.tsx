import type { IAttendanceRecord } from "@/types/data-types";
import { CheckCircle2, XCircle, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface AttendanceCardProps {
  records: IAttendanceRecord[];
}

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function AttendanceCard({ records }: AttendanceCardProps) {
  {
    console.log(records);
  }
  return (
    <Card className="rounded-xl shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-indigo-700">
          Lịch sử điểm danh gần đây
        </CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có dữ liệu điểm danh.</p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <AttendanceItem key={record.id} record={record} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AttendanceItem({ record }: { record: IAttendanceRecord }) {
  const statusIconMap = {
    attended: {
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      bg: "bg-green-100",
    },
    absent: {
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      bg: "bg-red-100",
    },
    pending: {
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      bg: "bg-yellow-100",
    },
  };

  const { icon, bg } = statusIconMap[record.status] || statusIconMap.pending;

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
      {/* Icon trạng thái */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bg}`}
      >
        {icon}
      </div>

      {/* Nội dung */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span className="font-medium text-gray-900">
            {formatDate(record.date)}
          </span>
        </div>
        <StatusBadge label="Trạng thái" status={record.status} />
      </div>
    </div>
  );
}

function StatusBadge({ label, status }: { label: string; status: string }) {
  const variants = {
    attended: "bg-green-100 text-green-800 border border-green-200",
    absent: "bg-red-100 text-red-800 border border-red-200",
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  };
  const statusText = {
    attended: "Đã điểm danh",
    absent: "Vắng",
    pending: "Chưa điểm danh",
  };

  return (
    <Badge
      variant="secondary"
      className={`text-xs px-2 py-1 rounded-md ${
        variants[status as keyof typeof variants] || variants.pending
      }`}
    >
      {label}: {statusText[status as keyof typeof statusText] || "N/A"}
    </Badge>
  );
}
