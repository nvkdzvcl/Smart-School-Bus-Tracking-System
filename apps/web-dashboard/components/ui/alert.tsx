import React from "react";

interface AlertProps {
  children: React.ReactNode;
  variant?: "default" | "destructive";
}

export const Alert: React.FC<AlertProps> = ({ children, variant = "default" }) => {
  return <div className={`alert alert-${variant}`}>{children}</div>;
};

export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <p className="alert-description">{children}</p>;
};