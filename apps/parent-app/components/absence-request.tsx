"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Send } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function AbsenceRequest() {
  const [date, setDate] = useState<Date>()
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setDate(undefined)
      setReason("")
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Request Absence</CardTitle>
        <CardDescription>Notify the school if your child will be absent</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="absence-date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="absence-date"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal h-11", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason (Optional)</Label>
          <Textarea
            id="reason"
            placeholder="e.g., Sick, Family event, etc."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>

        <Button onClick={handleSubmit} disabled={!date || isSubmitting} className="w-full" size="lg">
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </CardContent>
    </Card>
  )
}
