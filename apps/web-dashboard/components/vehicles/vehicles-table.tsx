import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Search, Plus, MoreVertical, Edit, Trash2, AlertCircle } from "lucide-react"
import { mockVehicles } from "../../lib/mock-data"
import { vehicleStatusLabels, vehicleStatusColors } from "../../lib/utils/status"
import { isExpiringSoon, isExpired, formatDate } from "../../lib/utils/date"
import { cn } from "../../lib/utils"

interface VehicleTableProps {
  onEdit: (vehicleId: string) => void
  onCreate: () => void
}

export const VehicleTable: React.FC<VehicleTableProps> = ({ onEdit, onCreate }) => {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredVehicles = mockVehicles.filter(
    (v) =>
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.gpsDeviceId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Danh sách xe ({filteredVehicles.length})</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm biển số, GPS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 h-9"
              />
            </div>
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm xe
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Biển số</TableHead>
                <TableHead>Sức chứa</TableHead>
                <TableHead>GPS Device</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Kiểm định</TableHead>
                <TableHead>Bảo hiểm</TableHead>
                <TableHead className="w-[50px]">&nbsp;</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredVehicles.map((vehicle) => {
                const inspectionExpiring = isExpiringSoon(vehicle.inspectionExpiry)
                const inspectionExpired = isExpired(vehicle.inspectionExpiry)
                const insuranceExpiring = isExpiringSoon(vehicle.insuranceExpiry)
                const insuranceExpired = isExpired(vehicle.insuranceExpiry)

                return (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.plateNumber}</TableCell>
                    <TableCell>{vehicle.capacity} chỗ</TableCell>
                    <TableCell className="font-mono text-xs">{vehicle.gpsDeviceId}</TableCell>

                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", vehicleStatusColors[vehicle.status])}>
                        {vehicleStatusLabels[vehicle.status]}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{formatDate(vehicle.inspectionExpiry)}</span>
                        {(inspectionExpiring || inspectionExpired) && (
                          <AlertCircle
                            className={cn("h-4 w-4", inspectionExpired ? "text-destructive" : "text-secondary")}
                          />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{formatDate(vehicle.insuranceExpiry)}</span>
                        {(insuranceExpiring || insuranceExpired) && (
                          <AlertCircle
                            className={cn("h-4 w-4", insuranceExpired ? "text-destructive" : "text-secondary")}
                          />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(vehicle.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
