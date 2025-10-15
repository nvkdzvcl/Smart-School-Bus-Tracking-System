import React, { createContext, useContext, useMemo, useState } from "react";

interface SelectContextValue {
  value?: string;
  setValue: (v: string) => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value, defaultValue, onValueChange, children }) => {
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const ctx = useMemo<SelectContextValue>(
    () => ({
      value: current,
      setValue: (v: string) => {
        if (!isControlled) setInternal(v);
        onValueChange?.(v);
      },
    }),
    [current, isControlled, onValueChange]
  );

  return <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>;
};

// Replace empty interface with type alias
export type SelectTriggerProps = React.HTMLAttributes<HTMLDivElement>;
export const SelectTrigger: React.FC<SelectTriggerProps> = ({ className = "", children, ...props }) => {
  return (
    <div role="button" tabIndex={0} className={className} {...props}>
      {children}
    </div>
  );
};

export interface SelectValueProps {
  placeholder?: string;
}
export const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const ctx = useContext(SelectContext);
  return <span>{ctx?.value ?? placeholder ?? ""}</span>;
};

// Replace empty interface with type alias
export type SelectContentProps = React.HTMLAttributes<HTMLDivElement>;
export const SelectContent: React.FC<SelectContentProps> = ({ className = "", children, ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export interface SelectItemProps extends React.LiHTMLAttributes<HTMLDivElement> {
  value: string;
}
export const SelectItem: React.FC<SelectItemProps> = ({ value, className = "", children, onClick, ...props }) => {
  const ctx = useContext(SelectContext);
  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    ctx?.setValue(value);
    onClick?.(e);
  };
  return (
    <div role="option" data-value={value} className={className} onClick={handleClick} {...props}>
      {children}
    </div>
  );
};