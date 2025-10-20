import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Label } from "../components/ui/Label"
import { Textarea } from "../components/ui/Textarea"
import { Calendar } from "../components/ui/Calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/Popover"
import { format } from "date-fns"
import { cn } from "../lib/utils/Utils"

export default function AbsenceRequest() {
  const [date, setDate] = useState<Date>()
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setDate(undefined)
      setReason("")
      alert("Absence request submitted successfully!")
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
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
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
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </CardContent>
    </Card>
  )
}
