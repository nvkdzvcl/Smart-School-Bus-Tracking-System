import React from "react"
import { cn } from "../../lib/utils"

interface AvatarProps {
  className?: string
  children: React.ReactNode
}

interface AvatarImageProps {
  src: string
  alt: string
  className?: string
}

interface AvatarFallbackProps {
  className?: string
  children: React.ReactNode
}

export const Avatar: React.FC<AvatarProps> = ({ className, children }) => {
  return <div className={cn("relative flex items-center justify-center rounded-full bg-muted", className)}>{children}</div>
}

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt, className }) => {
  return <img src={src} alt={alt} className={cn("h-full w-full rounded-full object-cover", className)} />
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className, children }) => {
  return <div className={cn("absolute inset-0 flex items-center justify-center text-sm font-medium", className)}>{children}</div>
}