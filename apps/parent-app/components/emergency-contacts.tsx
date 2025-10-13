"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, UserPlus } from "lucide-react"

const contacts = [
  { name: "Mother - Nguyen Thi B", phone: "+84 987 654 321", relation: "Primary" },
  { name: "Father - Nguyen Van C", phone: "+84 912 345 678", relation: "Secondary" },
  { name: "Grandmother", phone: "+84 908 765 432", relation: "Emergency" },
]

export function EmergencyContacts() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Emergency Contacts</CardTitle>
          <Button variant="ghost" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {contacts.map((contact, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">{contact.name}</p>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{contact.phone}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
