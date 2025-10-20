// src/components/ui/Button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils/Utils"

type Variant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"
  | "accent"
  | "success"
  | "warning"

type Size = "sm" | "default" | "lg" | "xl" | "icon"

type Button = {
  asChild?: boolean
  variant?: Variant
  size?: Size
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:opacity-50 disabled:pointer-events-none"

const variantClasses: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-input bg-background hover:bg-accent/20 hover:text-accent-foreground",
  ghost: "bg-transparent hover:bg-accent/15 hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  link: "bg-transparent underline-offset-4 hover:underline text-primary",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90",
  success: "bg-success text-success-foreground hover:bg-success/90",
  warning: "bg-warning text-warning-foreground hover:bg-warning/90",
}

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3",
  default: "h-10 px-4",
  lg: "h-12 px-5 text-base rounded-2xl",
  xl: "h-14 px-6 text-base rounded-2xl",
  icon: "h-10 w-10 p-0",
}

const Button = React.forwardRef<HTMLButtonElement, Button>(
  ({ className, variant = "default", size = "default", asChild, ...props }, ref) => {
    const classes = cn(base, variantClasses[variant], sizeClasses[size], className)

    if (asChild) {
      // Dùng Slot, KHÔNG truyền ref để tránh xung đột kiểu
      return <Slot className={classes} {...props} />
    }

    // Mặc định: button với ref đầy đủ kiểu
    return <button ref={ref} className={classes} {...props} />
  }
)
Button.displayName = "Button"

export { Button }
