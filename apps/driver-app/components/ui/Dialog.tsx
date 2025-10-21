// components/ui/Dialog.tsx
import * as React from "react"
import { cn } from "../../lib/utils"

interface DialogContextValue {
  open: boolean
  setOpen: (v: boolean) => void
}
const DialogCtx = React.createContext<DialogContextValue | null>(null)

export function Dialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return <DialogCtx.Provider value={{ open, setOpen }}>{children}</DialogCtx.Provider>
}

/* --- Trigger --- */
interface DialogTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
}
export function DialogTrigger({ asChild, children, ...props }: DialogTriggerProps) {
  const ctx = React.useContext(DialogCtx)
  if (!ctx) throw new Error("DialogTrigger must be used within <Dialog>")
  const Comp: React.ElementType = asChild ? React.Fragment : "button"

  return (
    <Comp
      onClick={() => ctx.setOpen(true)}
      {...(!asChild ? { type: "button" } : {})}
      {...props}
    >
      {children}
    </Comp>
  )
}

/* --- Content --- */
interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export function DialogContent({ className, children, ...props }: DialogContentProps) {
  const ctx = React.useContext(DialogCtx)
  if (!ctx) throw new Error("DialogContent must be used within <Dialog>")
  if (!ctx.open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => ctx.setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-[90%] max-w-md rounded-[var(--radius-lg)] border border-border/40 bg-card p-6 shadow-lg text-card-foreground animate-in fade-in-0 zoom-in-95",
          className
        )}
        {...props}
      >
        {children}
        <button
          onClick={() => ctx.setOpen(false)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

/* --- Header, Title, Description --- */
export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}
