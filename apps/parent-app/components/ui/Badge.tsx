// src/components/ui/Badge.tsx
import * as React from "react"
import { cn } from "../../lib/utils/Utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-[11px] font-medium leading-none",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          {
            // màu badge chính (dùng cho số thông báo)
            "bg-destructive text-destructive-foreground px-1.5 py-[2px]":
              variant === "default",
            // màu badge phụ
            "bg-secondary text-secondary-foreground px-2 py-[2px]":
              variant === "secondary",
            // viền badge
            "border border-border text-foreground px-2 py-[2px]":
              variant === "outline",
            // màu đỏ cảnh báo / lỗi
            "bg-destructive text-white px-1.5 py-[2px]":
              variant === "destructive",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"
