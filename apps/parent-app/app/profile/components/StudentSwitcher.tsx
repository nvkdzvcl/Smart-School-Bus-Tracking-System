import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import type { IStudent } from "@/types/data-types";
import { Users } from "lucide-react";

interface StudentSwitcherProps {
  students: IStudent[];
  selectedId: string;
  onSelect: (studentId: string) => void;
}

export default function StudentSwitcher({
  students,
  selectedId,
  onSelect,
}: StudentSwitcherProps) {
  return (
    <div className="bg-gradient-to-tr from-indigo-50 to-white p-5 rounded-xl shadow-md border border-indigo-100">
      {/* Label + icon */}
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-indigo-600" />
        <label
          htmlFor="student-select"
          className="text-sm font-semibold text-gray-700"
        >
          Xem hồ sơ của học sinh
        </label>
      </div>

      {/* Select box */}
      <Select value={selectedId} onValueChange={onSelect}>
        <SelectTrigger
          id="student-select"
          className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <SelectValue placeholder="Chọn học sinh..." />
        </SelectTrigger>
        <SelectContent className="rounded-lg shadow-lg border border-gray-200">
          {students.map((student) => (
            <SelectItem
              key={student.id}
              value={student.id}
              className="px-3 py-2 hover:bg-indigo-50 cursor-pointer rounded-md"
            >
              <div className="flex flex-col text-left">
                <span className="font-medium text-gray-900">
                  {student.fullName}
                </span>
                <span className="text-xs text-gray-500">
                  Mã học sinh: {student.id.slice(0, 8)}...
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
