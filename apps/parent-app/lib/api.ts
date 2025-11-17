import axios from "axios";
import type { IStudent, IParent, IAttendanceRecord } from "@/types/data-types"; // Import types từ package chung

// Lấy base URL từ biến môi trường
// Khi build production, nó sẽ tự động dùng URL production
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Tạo một instance của Axios với cấu hình sẵn.
 * Chúng ta sẽ dùng 'apiClient' này ở mọi nơi trong app thay vì 'axios'
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Cấu hình "Interceptors" (Bộ can thiệp)
 * Đây là phần "ma thuật" giúp tự động đính kèm token
 */
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (hoặc cookie, context...)
    // (Bạn sẽ lưu token ở đây sau khi người dùng đăng nhập)
    const token = localStorage.getItem("auth_token");

    if (token) {
      // Nếu có token, đính kèm vào header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Xử lý lỗi request
    return Promise.reject(error);
  }
);

/**
 * Interceptor để xử lý lỗi response toàn cục
 */
apiClient.interceptors.response.use(
  (response) => {
    // Bất kỳ status code nào trong 2xx đều vào đây
    return response;
  },
  (error) => {
    // Bất kỳ status code nào ngoài 2xx đều vào đây
    if (error.response && error.response.status === 401) {
      // Xử lý lỗi 401 (Unauthorized - Token hết hạn hoặc không hợp lệ)
      console.error("Unauthorized! Logging out...");
      // Xóa token
      localStorage.removeItem("auth_token");
      // Chuyển hướng người dùng về trang đăng nhập
      window.location.href = "/login";
    }

    // Trả về lỗi để các hàm .catch() ở component có thể xử lý tiếp
    return Promise.reject(error);
  }
);

export default apiClient;

// --- Định nghĩa các hàm gọi API ---
// (Cách làm này giúp gom tất cả API vào một chỗ, rất dễ quản lý)

export const api = {
  // --- Profile ---
  getProfile: () =>
    apiClient.get<{ parent: IParent; students: IStudent[] }>("/profile/me"),

  // --- Students ---
  getStudentDetails: (studentId: string) =>
    apiClient.get<IStudent>(`/students/${studentId}`),
  getStudentAttendance: (studentId: string) =>
    apiClient.get<{ records: IAttendanceRecord[] }>(
      `/students/${studentId}/attendance`
    ),

  // --- Auth ---
  // login: (data: any) => apiClient.post('/auth/login', data),
};
