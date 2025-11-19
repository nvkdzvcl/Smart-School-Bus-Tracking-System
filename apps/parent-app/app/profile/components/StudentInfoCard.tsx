import React from "react";
import type { IStop, IStudent } from "@/types/data-types";
import { User, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface StudentInfoCardProps {
  student: IStudent;
  pickupStop: IStop;
  dropoffStop: IStop;
}

export default function StudentInfoCard({
  student,
  pickupStop,
  dropoffStop,
}: StudentInfoCardProps) {
  return (
    <Card className="rounded-xl shadow-md border border-gray-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-indigo-700">
          Thông tin học sinh
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tiêu đề hồ sơ */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">
            {student.fullName}
          </h3>
        </div>

        {/* Chi tiết điểm đón/trả */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <InfoRow
            icon={MapPin}
            label="Điểm đón"
            value={`${pickupStop.name} (${pickupStop.address || "Không có địa chỉ"})`}
          />
          <InfoRow
            icon={MapPin}
            label="Điểm trả"
            value={`${dropoffStop.name} (${dropoffStop.address || "Không có địa chỉ"})`}
          />
          <InfoRow
            icon={User}
            label="Ngày tạo"
            value={new Date(student.createdAt).toLocaleDateString("vi-VN")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Component phụ để hiển thị dòng thông tin
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md">
        <Icon className="w-4 h-4 text-indigo-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
