import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar"
import { Card, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"

export default function StudentCard() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarImage src="/diverse-students-studying.png" alt="Student" />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">AN</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold truncate">Anh Nguyen</h2>
              <Badge variant="secondary" className="text-xs">
                Grade 5A
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Student ID: 2024-0123</p>
          </div>

          {/* <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="6 9 12 15 18 9" />
            </svg>
            <ChevronDown className="w-4 h-4" />
          </Button> */}
        </div>
      </CardContent>
    </Card>
  )
}
