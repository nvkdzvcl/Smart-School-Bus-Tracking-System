import React, { Suspense } from "react";
import { Outlet } from "react-router-dom"; // <-- BƯỚC 1: IMPORT OUTLET

// BƯỚC 2: Bỏ 'children' ra khỏi props
function RootLayout() {
  const bodyClassName = "font-sans";

  return (
    <div className={bodyClassName}>
      {/* BƯỚC 3: Thay thế {children} bằng <Outlet /> */}
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </div>
  );
}

export default RootLayout;