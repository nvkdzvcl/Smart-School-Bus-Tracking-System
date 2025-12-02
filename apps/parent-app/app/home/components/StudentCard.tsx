import { ChevronRight } from "lucide-react";

type StudentCardProps = {
  id: string;
  fullName: string;
  status: string;
  statusText: string;
  getAvatarLabel: (name: string | null | undefined) => string;
  // --- THÊM 2 PROPS MỚI ---
  onClick?: () => void;      // Hàm xử lý khi click
  isSelected?: boolean;      // Trạng thái đang chọn
};

export default function StudentCard({
  id,
  fullName,
  status,
  statusText,
  getAvatarLabel,
  onClick,
  isSelected = false,
}: StudentCardProps) {
  return (
    <div
      key={id}
      onClick={onClick} // Gắn sự kiện click
      className={`
        p-4 rounded-xl border shadow-sm flex items-center gap-4 cursor-pointer transition-all duration-200 relative overflow-hidden
        ${
          isSelected
            ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500" // Style khi được chọn (Nền xanh nhạt, viền xanh đậm)
            : "bg-white border-slate-100 hover:border-blue-300 hover:shadow-md" // Style bình thường
        }
      `}
    >
      {/* Thanh màu trang trí bên trái khi chọn */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
      )}

      {/* Avatar */}
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 shadow-sm transition-colors
        ${isSelected ? "bg-white border-blue-200" : "bg-gray-200 border-white"}
      `}>
        <span className={`font-bold text-xl ${isSelected ? "text-blue-600" : "text-gray-500"}`}>
          {getAvatarLabel(fullName)}
        </span>
      </div>

      <div className="flex-1 min-w-0"> {/* min-w-0 giúp text truncate hoạt động */}
        <h3 className={`font-bold truncate ${isSelected ? "text-blue-900" : "text-slate-800"}`}>
            {fullName}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {/* Badge trạng thái */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
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

          <span className="text-xs text-slate-500 truncate max-w-[150px]">
             • {statusText}
          </span>
        </div>
      </div>

      {/* Icon Chevron chỉ hiện khi hover hoặc active để gợi ý click */}
      <ChevronRight className={`w-5 h-5 ${isSelected ? "text-blue-500" : "text-gray-300"}`} />
    </div>
  );
}