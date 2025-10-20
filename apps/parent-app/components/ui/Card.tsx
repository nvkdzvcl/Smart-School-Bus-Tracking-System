// src/components/ui/Card.tsx
import * as React from "react"
import { cn } from "../../lib/utils/Utils"

// ------------------------------
// Base type aliases
// ------------------------------
type Card = React.ComponentPropsWithoutRef<"div">
type CardHeader = React.ComponentPropsWithoutRef<"div">
type CardContent = React.ComponentPropsWithoutRef<"div">
type CardFooter = React.ComponentPropsWithoutRef<"div">
type CardTitle = React.ComponentPropsWithoutRef<"h3">
type CardDescription = React.ComponentPropsWithoutRef<"p">

// ------------------------------
// Components
// ------------------------------
const Card = React.forwardRef<HTMLDivElement, Card>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, CardHeader>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitle>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescription>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, CardContent>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, CardFooter>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

// ------------------------------
// Exports
// ------------------------------
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
