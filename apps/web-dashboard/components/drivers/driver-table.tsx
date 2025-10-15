import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Search, Plus, MoreVertical, Edit, Trash2, AlertCircle, Star } from "lucide-react"
import { mockDrivers } from "../../lib/mock-data"
import { driverStatusLabels, driverStatusColors } from "../../lib/utils/status"
import { isExpiringSoon, isExpired, formatDate } from "../../lib/utils/date"
import { cn } from "../../lib/utils"

interface DriverTableProps {
  onEdit: (driverId: string) => void
  onCreate: () => void
}

export const DriverTable: React.FC<DriverTableProps> = ({ onEdit, onCreate }) => {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDrivers = mockDrivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery),
  )

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Danh sách tài xế ({filteredDrivers.length})</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm tên, SĐT, bằng lái..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 h-9"
              />
            </div>
            <Button size="sm" onClick={onCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm tài xế
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tài xế</TableHead>
                <TableHead>Bằng lái</TableHead>
                <TableHead>Hạng</TableHead>
                <TableHead>Hết hạn</TableHead>
                <TableHead>Điểm tín nhiệm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[50px]"><span className="sr-only">Thao tác</span></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredDrivers.map((driver) => {
                const licenseExpiring = isExpiringSoon(driver.licenseExpiry)
                const licenseExpired = isExpired(driver.licenseExpiry)

                return (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {driver.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{driver.name}</p>
                          <p className="text-xs text-muted-foreground">{driver.phone}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs">{driver.licenseNumber}</TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {driver.licenseClass}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{formatDate(driver.licenseExpiry)}</span>
                        {(licenseExpiring || licenseExpired) && (
                          <AlertCircle
                            className={cn("h-4 w-4", licenseExpired ? "text-destructive" : "text-secondary")}
                          />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-secondary text-secondary" />
                        <span className="font-medium">{driver.trustScore}/100</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", driverStatusColors[driver.status])}>
                        {driverStatusLabels[driver.status]}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(driver.id)}>
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
