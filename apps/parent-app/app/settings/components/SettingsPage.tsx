import React from "react";
import { Button } from "../../../components/ui/Button.tsx";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role"); // nếu có lưu role
    navigate("/"); // về trang /
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <Button
        variant="destructive"
        className="px-6 py-3 text-base"
        onClick={handleSignOut}
      >
        <svg
          className="w-4 h-4 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign Out
      </Button>
    </div>
  );
}
