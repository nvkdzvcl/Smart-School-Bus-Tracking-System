import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "ghost" | "solid" | "outline" | "secondary";
  size?: "icon" | "default" | "sm";
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = "solid", size = "default", className = "", asChild = false, ...props }) => {
  const variantClassMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
    ghost: "btn-ghost",
    solid: "btn-solid",
    outline: "btn-outline",
    secondary: "btn-secondary",
  };
  const sizeClassMap: Record<NonNullable<ButtonProps["size"]>, string> = {
    icon: "btn-icon",
    default: "btn-default",
    sm: "btn-sm",
  };

  const variantClass = variantClassMap[variant];
  const sizeClass = sizeClassMap[size];
  const combinedClassName = `btn ${variantClass} ${sizeClass} ${className}`.trim();

  if (asChild && React.isValidElement(children)) {
    // Render child as the root element with button styles
    const child = children as React.ReactElement<{ className?: string }>;
    const childClassName = `${child.props?.className ? child.props.className + " " : ""}${combinedClassName}`.trim();
    return React.cloneElement(child, { className: childClassName });
  }

  return (
    <button {...props} className={combinedClassName}>
      {children}
    </button>
  );
};