"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, MapPin, Bus, Phone, Edit } from "lucide-react"

export function StudentProfile() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Student Information</CardTitle>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 border-2 border-primary/20">
            <AvatarImage src="/diverse-students-studying.png" alt="Student" />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">AN</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Anh Nguyen</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Grade 5A</Badge>
              <Badge variant="secondary">ID: 2024-0123</Badge>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Pickup/Dropoff Location</p>
              <p className="text-sm font-medium">123 Nguyen Van Linh St., District 7, HCMC</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Bus className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Assigned Bus & Route</p>
              <p className="text-sm font-medium">Bus 51B-12345 - Route 12A</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Regular Driver</p>
              <p className="text-sm font-medium">Mr. Tran Van A</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Support Hotline</p>
              <p className="text-sm font-medium">+84 123 456 789</p>
            </div>
          </div>
        </div>

        {/* Special Notes */}
        <div className="p-3 rounded-lg bg-muted/50 border">
          <p className="text-xs font-medium text-muted-foreground mb-1">Special Notes</p>
          <p className="text-sm">Child may experience motion sickness. Please ensure proper ventilation.</p>
        </div>
      </CardContent>
    </Card>
  )
}
