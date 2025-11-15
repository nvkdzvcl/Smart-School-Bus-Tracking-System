import React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Label } from "../components/ui/Label"
import { Switch } from "../components/ui/Switch"
import { Button } from "../components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select"
import { Separator } from "../components/ui/Separator"

export default function SettingsForm() {
  return (
    <div className="space-y-4">
      {/* Notifications */}
      {/* <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
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
      </Card> */}

      {/* Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 010 20a15.3 15.3 0 010-20" />
            </svg>
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

          {/* <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="large-text">Large Text</Label>
              <p className="text-xs text-muted-foreground">Increase font size for better readability</p>
            </div>
            <Switch id="large-text" />
          </div> */}
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <CardTitle className="text-base">Location</CardTitle>
          </div>
          <CardDescription>Improve ETA accuracy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="location-access">Location Access</Label>
              <p className="text-xs text-muted-foreground">Allow app to access your location</p>
            </div>
            <Switch id="location-access" defaultChecked />
          </div> */}

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
          {/* <Button variant="outline" className="w-full justify-start bg-transparent">
            Privacy Policy
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Terms of Service
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Help & Support
          </Button> */}

          <Separator />

          <Button variant="destructive" className="w-full justify-start">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
