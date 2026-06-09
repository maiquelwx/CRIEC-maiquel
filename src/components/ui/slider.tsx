import * as React from "react"

import { cn } from "@/lib/utils"

type SliderProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  valueLabel?: string
  containerClassName?: string
}

function Slider({
  label,
  valueLabel,
  className,
  containerClassName,
  ...props
}: SliderProps) {
  return (
    <div className={cn("space-y-2", containerClassName)}>
      {(label || valueLabel) && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          {label ? <span>{label}</span> : null}
          {valueLabel ? <span>{valueLabel}</span> : null}
        </div>
      )}
      <input
        type="range"
        className={cn(
          "w-full accent-primary bg-input text-foreground outline-none",
          className
        )}
        {...props}
      />
    </div>
  )
}

export { Slider, type SliderProps }
