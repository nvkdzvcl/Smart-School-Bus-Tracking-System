import React, { Suspense } from "react";
import "./globals.css"; // Giữ lại việc import CSS toàn cục

function RootLayout({
  children,
}: {
  children: React.ReactNode; // Định nghĩa type cho children trong React thuần
}) {
  // Thay thế các class font đặc thù bằng class chung nếu cần
  const bodyClassName = "font-sans"; // Giữ lại font-sans, loại bỏ Geist font variables

  return (
    // Trong React thuần, ta thường chỉ render nội dung bên trong <body>
    <div className={bodyClassName}>
      <Suspense fallback={null}>
        {children}
      </Suspense>
      {/* Vercel Analytics đã được loại bỏ */}
    </div>
  );
}

export default RootLayout;