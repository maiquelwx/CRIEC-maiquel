import * as React from "react"

import { cn } from "@/lib/utils"

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  helperText?: string
  labelClassName?: string
  containerClassName?: string
}

function Select({
  label,
  helperText,
  labelClassName,
  containerClassName,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label ? (
        <label
          className={cn(
            "flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-slate-500",
            labelClassName
          )}
        >
          {label}
        </label>
      ) : null}
      <select
        className={cn(
          "w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-input/70",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
}

export { Select, type SelectProps }
