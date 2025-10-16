import * as React from "react";
import { cn } from "../../lib/Utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "secondary";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", 
          variant === "default" && "bg-primary text-primary-foreground",
          variant === "outline" && "border border-border text-foreground",
          variant === "secondary" && "bg-secondary text-secondary-foreground",
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };