import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { MobileNav } from "../../components/MobileNav"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { Input } from "../../components/ui/Input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs"

interface Student {
  id: number
  name: string
  grade: string
  pickupLocation: string
  dropoffLocation: string
  status: "not-picked" | "picked-up" | "dropped-off"
  pickupTime?: string
  dropoffTime?: string
  photo?: string
}

export default function StudentsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [shift, setShift] = useState<"morning" | "afternoon">("morning")

  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "Nguyễn Văn An", grade: "Lớp 3A", pickupLocation: "123 Đường Lê Lợi, Quận 1", dropoffLocation: "Trường Tiểu học ABC", status: "not-picked" },
    { id: 2, name: "Trần Thị Bình", grade: "Lớp 4B", pickupLocation: "456 Đường Nguyễn Huệ, Quận 1", dropoffLocation: "Trường Tiểu học ABC", status: "not-picked" },
    { id: 3, name: "Lê Văn Cường", grade: "Lớp 5C", pickupLocation: "789 Đường Pasteur, Quận 1", dropoffLocation: "Trường Tiểu học ABC", status: "not-picked" },
    { id: 4, name: "Phạm Thị Dung", grade: "Lớp 2A", pickupLocation: "321 Đường Hai Bà Trưng, Quận 1", dropoffLocation: "Trường Tiểu học ABC", status: "not-picked" },
    { id: 5, name: "Hoàng Văn Em", grade: "Lớp 3B", pickupLocation: "654 Đường Trần Hưng Đạo, Quận 1", dropoffLocation: "Trường Tiểu học ABC", status: "not-picked" },
  ])

  // Auth guard
  useEffect(() => {
    const authenticated = localStorage.getItem("driver_authenticated")
    if (!authenticated) navigate("/")
  }, [navigate])

  const handleCheckIn = (studentId: number) => {
    setStudents(students.map((s) =>
      s.id === studentId
        ? { ...s, status: "picked-up", pickupTime: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) }
        : s,
    ))
  }

  const handleCheckOut = (studentId: number) => {
    setStudents(students.map((s) =>
      s.id === studentId
        ? { ...s, status: "dropped-off", dropoffTime: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) }
        : s,
    ))
  }

  const handleUndoCheckIn = (studentId: number) => {
    setStudents(students.map((s) =>
      s.id === studentId
        ? { ...s, status: "not-picked", pickupTime: undefined }
        : s,
    ))
  }

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const stats = {
    total: students.length,
    pickedUp: students.filter((s) => s.status === "picked-up").length,
    droppedOff: students.filter((s) => s.status === "dropped-off").length,
    remaining: students.filter((s) => s.status === "not-picked").length,
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="text-foreground hover:bg-muted"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Danh sách học sinh</h1>
                <p className="text-xs text-muted-foreground">Tuyến A - Quận 1</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              type="text"
              placeholder="Tìm kiếm học sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border text-foreground rounded-lg"
            />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="border-border/ rounded-lg">
            <CardContent className="px-5 pt-5 p-3 text-center">
              <div className="text-xl font-bold text-foreground">{stats.total}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Tổng</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 rounded-lg">
            <CardContent className="px-5 pt-5 p-3 text-center">
              <div className="text-xl font-bold text-primary">{stats.pickedUp}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Đã đón</div>
            </CardContent>
          </Card>
          <Card className="border-border/ rounded-lg">
            <CardContent className="px-5 pt-5 p-3 text-center">
              <div className="text-xl font-bold text-accent">{stats.droppedOff}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Đã trả</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 rounded-lg">
            <CardContent className="px-5 pt-5 p-3 text-center">
              <div className="text-xl font-bold text-muted-foreground">{stats.remaining}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Còn lại</div>
            </CardContent>
          </Card>
        </div>

        {/* Shift Selector */}
        <Tabs value={shift} onValueChange={(v) => setShift(v as "morning" | "afternoon")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-lg">
            <TabsTrigger className="rounded-lg" value="morning">Ca sáng</TabsTrigger>
            <TabsTrigger className="rounded-lg" value="afternoon">Ca chiều</TabsTrigger>
          </TabsList>

          <TabsContent value="morning" className="space-y-3 mt-4">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="border-border/50 rounded-lg">
                <CardContent className="p-4 px-5 pt-5">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold text-secondary-foreground">{student.name.charAt(0)}</span>
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-05">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">{student.grade}</p>
                        </div>
                        <Badge
                          className={
                            (
                              student.status === "picked-up"
                                ? "bg-primary text-primary-foreground"
                                : student.status === "dropped-off"
                                  ? "bg-accent text-accent-foreground"
                                  : "bg-muted text-muted-foreground"
                            ) + " rounded-full px-3 py-0.5"
                          }
                        >
                          {student.status === "picked-up" ? "Đã đón" : student.status === "dropped-off" ? "Đã trả" : "Chưa đón"}
                        </Badge>
                      </div>

                      <div className="space-y-1 mb-3">
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="flex-1">{student.pickupLocation}</span>
                        </div>
                        {student.pickupTime && (
                          <div className="flex items-center gap-2 text-xs text-primary">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Đón lúc: {student.pickupTime}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 px-4 pt-4">
                        {student.status === "not-picked" && (
                          <Button onClick={() => handleCheckIn(student.id)} size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                            <svg className="w-4 h-4 mr-1 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Đã đón
                          </Button>
                        )}

                        {student.status === "picked-up" && (
                          <>
                            <Button
                              onClick={() => handleUndoCheckIn(student.id)}
                              size="sm"
                              variant="outline"
                              className="flex-1 border-border text-foreground hover:bg-muted bg-transparent rounded-lg"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                              Hoàn tác
                            </Button>
                            <Button onClick={() => handleCheckOut(student.id)} size="sm" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Đã trả
                            </Button>
                          </>
                        )}

                        {student.status === "dropped-off" && (
                          <div className="flex-1 text-center py-2 text-sm text-accent">
                            <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Hoàn thành
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="afternoon" className="space-y-3 mt-4">
            <Card className="border-border/50 rounded-lg">
              <CardContent className="p-8 text-center">
                <svg className="w-12 h-12 mx-auto text-muted-foreground mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-muted-foreground">Ca chiều chưa bắt đầu</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div >
  )
}
