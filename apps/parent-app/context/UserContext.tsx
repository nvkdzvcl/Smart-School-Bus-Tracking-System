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
          "c6e5d576-e7cd-40d3-8ac8-abb5551ef7d5"
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
