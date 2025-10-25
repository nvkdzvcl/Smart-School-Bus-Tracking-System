// components/ui/Tabs.tsx
import * as React from "react"
import { cn } from "../../lib/utils"

type TabsValue = string

interface TabsContextValue {
  value: TabsValue
  setValue: (v: TabsValue) => void
  baseId: string
  registerTrigger: (el: HTMLButtonElement | null) => void
  triggersRef: React.MutableRefObject<HTMLButtonElement[]>
}

const TabsCtx = React.createContext<TabsContextValue | null>(null)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: TabsValue
  defaultValue?: TabsValue
  onValueChange?: (v: TabsValue) => void
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<TabsValue>(defaultValue ?? "")
  const current = isControlled ? (value as TabsValue) : internal
  const setValue = (v: TabsValue) => {
    if (!isControlled) setInternal(v)
    onValueChange?.(v)
  }

  const baseId = React.useId()
  const triggersRef = React.useRef<HTMLButtonElement[]>([])
  const registerTrigger = (el: HTMLButtonElement | null) => {
    if (!el) return
    const arr = triggersRef.current
    if (!arr.includes(el)) arr.push(el)
  }

  const ctx: TabsContextValue = { value: current, setValue, baseId, registerTrigger, triggersRef }

  return (
    <TabsCtx.Provider value={ctx}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsCtx.Provider>
  )
}

/* -------------------- TabsList -------------------- */

// Replace empty interface with a type alias to satisfy lint rules
export type TabsListProps = React.HTMLAttributes<HTMLDivElement>
export function TabsList({ className, children, ...props }: TabsListProps) {
  const ctx = React.useContext(TabsCtx)
  if (!ctx) throw new Error("TabsList must be used within <Tabs>")

  // Keyboard navigation for roving focus
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const { triggersRef, value, setValue } = ctx
    const items = triggersRef.current
    if (!items.length) return
    const idx = Math.max(0, items.findIndex((b) => b.dataset.value === value))
    const focusAt = (i: number) => items[i]?.focus()
    const selectAt = (i: number) => {
      const v = items[i]?.dataset.value
      if (v) setValue(v)
      focusAt(i)
    }

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown": {
        e.preventDefault()
        selectAt((idx + 1) % items.length)
        break
      }
      case "ArrowLeft":
      case "ArrowUp": {
        e.preventDefault()
        selectAt((idx - 1 + items.length) % items.length)
        break
      }
      case "Home": {
        e.preventDefault()
        selectAt(0)
        break
      }
      case "End": {
        e.preventDefault()
        selectAt(items.length - 1)
        break
      }
    }
  }

  return (
    <div
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-border bg-muted p-1 text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* -------------------- TabsTrigger -------------------- */

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: TabsValue
}
export function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const ctx = React.useContext(TabsCtx)
  if (!ctx) throw new Error("TabsTrigger must be used within <Tabs>")
  const { value: current, setValue, registerTrigger } = ctx
  const isActive = current === value

  return (
    <button
      ref={registerTrigger}
      type="button"
      data-value={value}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => setValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // styles
        "text-muted-foreground",
        isActive
          ? "bg-card text-foreground shadow-sm border border-border"
          : "hover:bg-muted/70",
        className
      )}
      {...props}
    />
  )
}

/* -------------------- TabsContent -------------------- */

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: TabsValue
}
export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const ctx = React.useContext(TabsCtx)
  if (!ctx) throw new Error("TabsContent must be used within <Tabs>")
  const { value: current } = ctx
  const isActive = current === value

  return (
    <div hidden={!isActive} className={cn(isActive ? "animate-in fade-in-0" : "", className)} {...props}>
      {isActive ? children : null}
    </div>
  )
}
