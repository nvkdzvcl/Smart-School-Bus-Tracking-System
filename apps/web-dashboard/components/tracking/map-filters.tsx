import React, { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Filter, X } from "lucide-react"
import type { VehicleStatus, ShiftType } from "../../lib/types"

interface MapFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  route?: string
  vehicle?: string
  driver?: string
  shift?: ShiftType
  status?: VehicleStatus
}

export const MapFilters: React.FC<MapFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterState>({})
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof FilterState, value: string | undefined) => {
    // Chọn "all" sẽ xoá filter tương ứng
    const normalized = value === "all" ? undefined : value
    const newFilters = { ...filters, [key]: normalized }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Bộ lọc</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                <X className="h-3 w-3 mr-1" />
                Xóa
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded((v) => !v)} className="h-7 text-xs">
              {isExpanded ? "Thu gọn" : "Mở rộng"}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label className="text-xs">Tuyến</Label>
              <Select value={filters.route} onValueChange={(v) => updateFilter("route", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="r1">DD-01</SelectItem>
                  <SelectItem value="r2">HM-02</SelectItem>
                  <SelectItem value="r3">DD-01-PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Xe</Label>
              <Select value={filters.vehicle} onValueChange={(v) => updateFilter("vehicle", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="v1">29A-12345</SelectItem>
                  <SelectItem value="v2">30B-67890</SelectItem>
                  <SelectItem value="v4">30D-22222</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Tài xế</Label>
              <Select value={filters.driver} onValueChange={(v) => updateFilter("driver", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="d1">Nguyễn Văn An</SelectItem>
                  <SelectItem value="d2">Trần Minh Tuấn</SelectItem>
                  <SelectItem value="d4">Phạm Đức Hải</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Ca</Label>
              <Select value={filters.shift} onValueChange={(v) => updateFilter("shift", v as ShiftType)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="morning">Sáng</SelectItem>
                  <SelectItem value="afternoon">Chiều</SelectItem>
                  <SelectItem value="evening">Tối</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Trạng thái</Label>
              <Select value={filters.status} onValueChange={(v) => updateFilter("status", v as VehicleStatus)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang chạy</SelectItem>
                  <SelectItem value="idle">Chờ</SelectItem>
                  <SelectItem value="offline">Ngoại tuyến</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
