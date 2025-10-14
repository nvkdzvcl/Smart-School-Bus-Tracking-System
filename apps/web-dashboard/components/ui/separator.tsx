import React from "react"

interface SeparatorProps {
  className?: string
}

export const Separator: React.FC<SeparatorProps> = ({ className }) => {
  return <div className={`border-t border-border ${className || ""}`} />
}