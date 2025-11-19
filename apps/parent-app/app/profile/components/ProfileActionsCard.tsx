import type { IParent } from "types/data-types";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, Phone, Mail } from "lucide-react";

interface ProfileActionsCardProps {
  parent: IParent;
  onEdit?: () => void; // callback khi bấm nút sửa
}

export default function ProfileActionsCard({ parent, onEdit }: ProfileActionsCardProps) {
  // Lấy chữ cái viết tắt từ tên phụ huynh
  const initials = parent.fullName
    ? parent.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Avatar + thông tin phụ huynh */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
            {initials}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-900">{parent.fullName}</p>
            <div className="flex items-center text-sm text-gray-600 gap-2">
              <Phone className="w-4 h-4 text-indigo-500" />
              <span>{parent.phone}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 gap-2">
              <Mail className="w-4 h-4 text-indigo-500" />
              <span>{parent.email}</span>
            </div>
          </div>
        </div>

        {/* Nút chỉnh sửa */}
        <div className="pt-4 border-t">
          <Button
            variant="default"
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            Chỉnh sửa thông tin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
