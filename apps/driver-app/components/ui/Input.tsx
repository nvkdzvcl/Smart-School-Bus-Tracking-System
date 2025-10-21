// components/ui/Input.tsx
import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "sm" | "default" | "lg"
  isInvalid?: boolean
}


export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", inputSize = "default", isInvalid = false, ...props }, ref) => {
    const base =
      "flex w-full rounded-[var(--radius-md)] border bg-background text-foreground " +
      "placeholder:text-muted-foreground " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
      "disabled:cursor-not-allowed disabled:opacity-50"

    const sizes: Record<NonNullable<InputProps["inputSize"]>, string> = {
      sm: "h-9 px-3 text-sm",
      default: "h-10 px-3.5 text-sm",
      lg: "h-12 px-4 text-base",
    }

    const normal = "border-input"
    const invalid = "border-destructive focus-visible:ring-destructive"

    return (
      <input
        ref={ref}
        type={type}
        className={cn(base, sizes[inputSize], isInvalid ? invalid : normal, className)}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
