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
        const result = await getUserById(
          "2e2d9669-e45d-4b19-bf4f-e3ddb1ccc764"
        );
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
