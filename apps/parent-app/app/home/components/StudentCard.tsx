import {useState} from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/Avatar.tsx"
import { Card, CardContent } from "../../../components/ui/Card.tsx"
import { Badge } from "../../../components/ui/Badge.tsx"

export default function StudentCard() {
    const [avatarImageSource, setAvatarImageSource] = useState("/diverse-students-studying.png");
    const [studentID, setStudentID] = useState("3123560000")
    const [studentName, setStudentName] = useState("Nguyen Van A")

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 space-y-5">
          <Avatar className="w-16 h-16 border-2 border-primary/20 mt-5">
            <AvatarImage src={avatarImageSource} alt="Student" />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">AN</AvatarFallback>
          </Avatar>


          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-lg font-semibold truncate">{studentName}</p>
              <Badge variant="secondary" className="text-xs">
                Grade 5A
              </Badge>
            </div>
              <p className="text-sm text-muted-foreground">Student ID: {studentID}</p>
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
