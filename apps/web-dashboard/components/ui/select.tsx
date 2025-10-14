import * as React from "react"
import { Select as HeadlessSelect, Listbox } from "@headlessui/react"
import { Check, ChevronUpDown } from "lucide-react"
import clsx from "clsx"

interface SelectProps {
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  className?: string
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  children,
  placeholder = "Select an option",
  className,
}) => {
  return (
    <HeadlessSelect value={value} onChange={onChange}>
      {({ open }) => (
        <div className={clsx("relative", className)}>
          <HeadlessSelect.Button
            className={clsx(
              "relative w-full cursor-default rounded-lg border bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm",
              { "ring-2 ring-blue-500": open }
            )}
          >
            <span className="block truncate">
              {value || placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </HeadlessSelect.Button>

          <HeadlessSelect.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {children}
          </HeadlessSelect.Options>
        </div>
      )}
    </HeadlessSelect>
  )
}

interface SelectTriggerProps {
  className?: string
  children: React.ReactNode
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ className, children }) => {
  return (
    <HeadlessSelect.Button
      className={clsx(
        "relative w-full cursor-default rounded-lg border bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm",
        className
      )}
    >
      {children}
    </HeadlessSelect.Button>
  )
}

interface SelectContentProps {
  children: React.ReactNode
}

export const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  return (
    <HeadlessSelect.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
      {children}
    </HeadlessSelect.Options>
  )
}

interface SelectValueProps {
  placeholder?: string
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  return (
    <HeadlessSelect.Value>
      {({ selectedItem }) => (
        <span className="block truncate"></span>
          {selectedItem || placeholder || "Select an option"}
        </span>
      )}
    </HeadlessSelect.Value>
  )
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  return (
    <Listbox.Option
      value={value}
      className={({ active }) =>
        clsx(
          "relative cursor-default select-none py-2 pl-10 pr-4",
          active ? "bg-blue-100 text-blue-900" : "text-gray-900"
        )
      }
    >
      {({ selected }) => (
        <>
          <span
            className={clsx("block truncate", {
              "font-medium": selected,
              "font-normal": !selected,
            })}
          >
            {children}
          </span>
          {selected ? (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
              <Check className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : null}
        </>
      )}
    </Listbox.Option>
  )
}