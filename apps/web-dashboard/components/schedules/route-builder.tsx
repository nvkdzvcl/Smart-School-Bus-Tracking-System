import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Separator } from "../../ui/separator"
import { Plus, Trash2, Save, X, MapPin, Clock } from "lucide-react"
import { mockStops } from "../../../lib/mock-data"

interface RouteStop {
  stopId: string
  sequence: number
  estimatedTime: string
  bufferMinutes: number
}

interface RouteBuilderProps {
  onClose: () => void
}

export const RouteBuilder: React.FC<RouteBuilderProps> = ({ onClose }) => {
  const [routeName, setRouteName] = useState("")
  const [routeCode, setRouteCode] = useState("")
  const [shiftType, setShiftType] = useState<string>("")
  const [stops, setStops] = useState<RouteStop[]>([])

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      {
        stopId: "",
        sequence: prev.length + 1,
        estimatedTime: "",
        bufferMinutes: 5,
      },
    ])
  }

  const removeStop = (index: number) => {
    const next = stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, sequence: i + 1 }))
    setStops(next)
  }

  const updateStop = (index: number, field: keyof RouteStop, value: any) => {
    const next = [...stops]
    next[index] = { ...next[index], [field]: value }
    setStops(next)
  }

  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Tạo tuyến mới</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Tên tuyến</Label>
            <Input
              placeholder="Tuyến 01 - Đống Đa"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Mã tuyến</Label>
              <Input
                placeholder="DD-01"
                value={routeCode}
                onChange={(e) => setRouteCode(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Ca</Label>
              <Select value={shiftType} onValueChange={setShiftType}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Chọn ca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Sáng</SelectItem>
                  <SelectItem value="afternoon">Chiều</SelectItem>
                  <SelectItem value="evening">Tối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Stops */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Điểm dừng ({stops.length})</Label>
            <Button size="sm" variant="outline" onClick={addStop} className="h-7 bg-transparent">
              <Plus className="h-3 w-3 mr-1" />
              Thêm điểm
            </Button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {stops.map((stop, index) => {
              const stopData = mockStops.find((s) => s.id === stop.stopId)
              return (
                <div key={index} className="flex items-start gap-2 p-3 rounded-lg border border-border bg-muted/50">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-xs font-medium text-primary mt-1">
                    {index + 1}
                  </div>

                  <div className="flex-1 space-y-2">
                    <Select value={stop.stopId} onValueChange={(v) => updateStop(index, "stopId", v)}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Chọn điểm dừng" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockStops.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {stopData && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{stopData.address}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Giờ dự kiến</Label>
                        <Input
                          type="time"
                          value={stop.estimatedTime}
                          onChange={(e) => updateStop(index, "estimatedTime", e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Buffer (phút)</Label>
                        <Input
                          type="number"
                          value={stop.bufferMinutes}
                          onChange={(e) => updateStop(index, "bufferMinutes", Number.parseInt(e.target.value))}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStop(index)}
                    className="h-6 w-6 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}

            {stops.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Chưa có điểm dừng. Nhấn "Thêm điểm" để bắt đầu.
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Summary */}
        {stops.length > 0 && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <p className="text-xs font-medium">Tóm tắt</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{stops.length} điểm dừng</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>~{stops.length * 15} phút</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1" disabled={!routeName || !routeCode || stops.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Lưu tuyến
          </Button>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
