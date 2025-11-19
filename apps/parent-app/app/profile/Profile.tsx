import { useContext, useEffect, useState } from "react";
import Header from "../layout/components/Header.tsx";
import BottomNav from "../layout/components/BottomNav.tsx";
import type { IAttendanceRecord, IStop, IStudent } from "@/types/data-types";
import ProfileActionsCard from "./components/ProfileActionsCard";
import StudentSwitcher from "./components/StudentSwitcher";
import StudentInfoCard from "./components/StudentInfoCard";
import AttendanceCard from "./components/AttendanceCard";
import { UserContext } from "@/context/UserContext";
import { getStopById } from "@/lib/stopApi";
import SkeletonStudentInfoCard from "./components/SkeletonStudentInfoCard";
import { getRecentAttendance } from "@/lib/tripStudent";
import EditParentModal from "./components/EditParentModal";

export default function ProfilePage() {
  const [pickupStop, setPickupStop] = useState<IStop | null>(null);
  const [dropoffStop, setDropoffStop] = useState<IStop | null>(null);
  const { user: profile, setUser: setProfile } = useContext(UserContext)!;
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >(undefined);

  const [attendanceRecords, setAttendanceRecords] = useState<
    IAttendanceRecord[]
  >([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Khi profile có dữ liệu, tự động chọn học sinh đầu tiên
  useEffect(() => {
    if (
      profile &&
      Array.isArray(profile.students) &&
      profile.students.length > 0
    ) {
      setSelectedStudentId(profile.students[0].id);
    }
  }, [profile]);

  // Tìm học sinh đang được chọn
  const selectedStudent: IStudent | undefined = profile?.students?.find(
    (s) => s.id === selectedStudentId
  );

  // Khi selectedStudent thay đổi thì gọi API lấy stop
  useEffect(() => {
    const fetchStops = async () => {
      if (selectedStudent) {
        try {
          const pickup = await getStopById(selectedStudent.pickupStopId);
          const dropoff = await getStopById(selectedStudent.dropoffStopId);
          setPickupStop(pickup.data);
          setDropoffStop(dropoff.data);
        } catch (err) {
          console.error("Lỗi khi lấy stop:", err);
        }
      }
    };
    fetchStops();
  }, [selectedStudent]);

  // Khi selectedStudent thay đổi thì gọi API lấy attendance
  useEffect(() => {
    const fetchAttendance = async () => {
      if (selectedStudentId) {
        try {
          const res = await getRecentAttendance(selectedStudentId, 5);
          setAttendanceRecords(res.data);
        } catch (err) {
          console.error("Lỗi khi lấy attendance:", err);
          setAttendanceRecords([]); // fallback rỗng
        }
      }
    };
    fetchAttendance();
  }, [selectedStudentId]);

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-gray-500 text-lg">Đang tải thông tin phụ huynh...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Hồ Sơ" />
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Thông tin phụ huynh */}
        <ProfileActionsCard parent={profile} onEdit={handleOpenModal} />

        {/* Modal chỉnh sửa */}
        <EditParentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          parent={profile}
          onUpdated={(updated) => {
            setProfile(updated);
            handleCloseModal();
          }}
        />

        {/* Bộ chọn học sinh */}
        {profile.students.length > 1 && (
          <StudentSwitcher
            students={profile.students}
            selectedId={selectedStudentId!}
            onSelect={handleStudentChange}
          />
        )}

        {/* Thông tin học sinh */}
        {selectedStudent ? (
          <>
            {selectedStudent && pickupStop && dropoffStop ? (
              <StudentInfoCard
                student={selectedStudent}
                pickupStop={pickupStop}
                dropoffStop={dropoffStop}
              />
            ) : (
              <SkeletonStudentInfoCard />
            )}
            <AttendanceCard records={attendanceRecords} />
          </>
        ) : (
          <div className="text-center text-gray-500 py-4">
            Tài khoản chưa liên kết với học sinh nào.
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
