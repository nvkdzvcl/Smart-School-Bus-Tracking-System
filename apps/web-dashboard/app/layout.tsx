import React, { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "../lib/auth/context";

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div lang="vi" className="dark font-sans">
      <Suspense fallback={null}>
        <AuthProvider>{children}</AuthProvider>
      </Suspense>
    </div>
  );
};

export default RootLayout;
