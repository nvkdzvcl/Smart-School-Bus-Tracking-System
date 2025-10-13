"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Globe, MapPin, LogOut } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function SettingsForm() {
  return (
    <div className="space-y-4">
      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Notifications</CardTitle>
          </div>
          <CardDescription>Manage how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive alerts on your device</p>
            </div>
            <Switch id="push-notifications" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound">Sound</Label>
              <p className="text-xs text-muted-foreground">Play sound for notifications</p>
            </div>
            <Switch id="sound" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vibration">Vibration</Label>
              <p className="text-xs text-muted-foreground">Vibrate for important alerts</p>
            </div>
            <Switch id="vibration" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="eta-alerts">ETA Alerts</Label>
              <p className="text-xs text-muted-foreground">Notify when bus is approaching</p>
            </div>
            <Switch id="eta-alerts" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Preferences</CardTitle>
          </div>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Use dark theme</p>
            </div>
            <Switch id="dark-mode" />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="large-text">Large Text</Label>
              <p className="text-xs text-muted-foreground">Increase font size for better readability</p>
            </div>
            <Switch id="large-text" />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Location</CardTitle>
          </div>
          <CardDescription>Improve ETA accuracy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="location-access">Location Access</Label>
              <p className="text-xs text-muted-foreground">Allow app to access your location</p>
            </div>
            <Switch id="location-access" defaultChecked />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Home Address</Label>
            <p className="text-sm">123 Nguyen Van Linh St., District 7, HCMC</p>
            <Button variant="outline" size="sm" className="bg-transparent">
              Update Address
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Privacy Policy
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Terms of Service
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Help & Support
          </Button>

          <Separator />

          <Button variant="destructive" className="w-full justify-start">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
