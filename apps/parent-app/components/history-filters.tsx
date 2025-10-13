"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"

export function HistoryFilters() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex-1 bg-transparent">
            <Calendar className="w-4 h-4 mr-2" />
            Last 7 Days
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="icon" className="bg-transparent">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
