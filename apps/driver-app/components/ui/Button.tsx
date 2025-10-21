import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-[var(--radius-md)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      default:
        "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary:
        "bg-muted text-foreground hover:bg-muted/80",
      outline:
        "border border-border text-foreground bg-transparent hover:bg-muted/50",
      ghost:
        "text-foreground hover:bg-muted/20",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    }

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10",
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
