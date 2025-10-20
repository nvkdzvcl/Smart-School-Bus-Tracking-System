import * as React from "react"
import { cn } from "../../lib/utils/Utils"

type TabsContextValue = {
  value: string | undefined
  setValue: (val: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value: valueProp, onValueChange, children, ...props }, ref) => {
    const isControlled = valueProp !== undefined
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string | undefined>(defaultValue)

    const value = isControlled ? valueProp : uncontrolledValue

    const setValue = React.useCallback(
      (v: string) => {
        if (!isControlled) setUncontrolledValue(v)
        onValueChange?.(v)
      },
      [isControlled, onValueChange]
    )

    return (
      <div ref={ref} className={cn("flex flex-col", className)} {...props}>
        <TabsContext.Provider value={{ value, setValue }}>{children}</TabsContext.Provider>
      </div>
    )
  }
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-2 rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
)
TabsList.displayName = "TabsList"

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, ...props }, ref) => {
    const ctx = React.useContext(TabsContext)
    const selected = ctx?.value === value
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={selected}
        data-state={selected ? "active" : "inactive"}
        disabled={disabled}
        onClick={() => ctx?.setValue(value)}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-sm transition-colors",
          selected ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground",
          disabled && "opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const ctx = React.useContext(TabsContext)
    const selected = ctx?.value === value
    if (!selected) return null
    return (
      <div
        ref={ref}
        role="tabpanel"
        className={cn("mt-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
