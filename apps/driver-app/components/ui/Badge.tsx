import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "destructive"
}

export function Badge({ variant = "default", className = "", ...props }: BadgeProps) {
  const base =
    "inline-flex items-center rounded-[var(--radius-sm)] border px-2.5 py-0.5 text-xs font-medium transition-colors"

  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-primary text-primary-foreground border-transparent",
    secondary: "bg-secondary text-secondary-foreground border-transparent",
    outline: "border-border text-foreground bg-transparent",
    success: "bg-accent text-accent-foreground border-transparent",
    destructive: "bg-destructive text-destructive-foreground border-transparent",
  }

  return (
    <div
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
