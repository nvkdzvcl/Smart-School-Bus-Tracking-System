import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function SkeletonStudentInfoCard() {
  return (
    <Card className="rounded-xl shadow-md border border-gray-100 animate-pulse">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-indigo-700">
          Thông tin học sinh
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tên học sinh */}
        <div className="space-y-2">
          <div className="h-6 w-2/3 bg-gray-200 rounded" />
          <div className="h-5 w-1/3 bg-gray-200 rounded" />
        </div>

        {/* Các dòng thông tin */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 bg-gray-200 rounded-md" />
      <div className="flex-1 space-y-1">
        <div className="h-4 w-1/4 bg-gray-200 rounded" />
        <div className="h-5 w-2/3 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
