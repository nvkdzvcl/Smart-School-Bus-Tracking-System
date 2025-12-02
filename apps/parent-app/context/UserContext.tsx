import { createContext, useEffect, useState, type ReactNode } from "react";
import { getUserById } from "@/lib/userApi";
import type { IParent } from "@/types/data-types";

// Khai báo kiểu context
interface UserContextType {
  user: IParent | null;
  setUser: (user: IParent) => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IParent | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Lấy user từ localStorage (đã lưu khi login)
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser.id;

        // Gọi API với userId thay vì hardcode
        const result = await getUserById(userId);
        setUser(result.data);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin phụ huynh:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
