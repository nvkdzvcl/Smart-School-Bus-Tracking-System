import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Plus, AlertCircle } from "lucide-react"
import { mockRoutes, mockVehicles, mockDrivers } from "../../../lib/mock-data"

export const AssignmentGrid: React.FC = () => {
  const routes = mockRoutes.filter((r) => r.isActive)

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Phân công hôm nay</CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Thêm phân công
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {routes.map((route) => (
            <div key={route.id} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {route.code}
                    </Badge>
                    <span className="text-sm font-medium">{route.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Xe</p>
                      <Select defaultValue="v1">
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mockVehicles
                            .filter((v) => v.status === "active")
                            .map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.plateNumber}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tài xế</p>
                      <Select defaultValue="d1">
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mockDrivers
                            .filter((d) => d.status === "active")
                            .map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                  Đã xác nhận
                </Badge>
              </div>
            </div>
          ))}

          {/* Unassigned route */}
          <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <Badge variant="outline" className="text-xs">
                    DD-03
                  </Badge>
                  <span className="text-sm font-medium">Tuyến 03 - Cầu Giấy</span>
                </div>

                <p className="text-xs text-muted-foreground mb-3">Chưa phân công xe và tài xế</p>

                <div className="grid grid-cols-2 gap-3">
                  <Select>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Chọn xe" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVehicles
                        .filter((v) => v.status === "active")
                        .map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.plateNumber}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Chọn tài xế" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDrivers
                        .filter((d) => d.status === "active")
                        .map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                Chưa gán
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
