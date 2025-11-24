import { ChevronRight } from "lucide-react";

type StudentCardProps = {
  id: string;
  fullName: string;
  status: string;
  statusText: string;
  getAvatarLabel: (name: string | null | undefined) => string;
};

export default function StudentCard({
  id,
  fullName,
  status,
  statusText,
  getAvatarLabel,
}: StudentCardProps) {
  return (
    <div
      key={id}
      className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
        <span className="text-gray-500 font-bold text-xl">
          {getAvatarLabel(fullName)}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-slate-800">{fullName}</h3>

        <div className="mt-2 flex items-center gap-2">
          {/* Badge trạng thái */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              status === "attended"
                ? "bg-green-50 text-green-700 border-green-200"
                : status === "pending"
                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {status === "attended"
              ? "Đã xong"
              : status === "pending"
              ? "Đang chờ"
              : "Vắng mặt"}
          </span>

          {/* Chỉ hiện text nếu KHÔNG PHẢI là đang chờ */}
          {status !== "pending" && (
            <span className="text-xs text-slate-600">• {statusText}</span>
          )}
        </div>
      </div>
    </div>
  );
}
