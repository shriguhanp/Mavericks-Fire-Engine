import * as React from "react"
import { cn } from "../../lib/utils"

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  formatValue?: (val: number) => string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Slider({
  className,
  label,
  value,
  min,
  max,
  step = 1,
  formatValue,
  onChange,
  ...props
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-600 dark:text-white/70">{label}</label>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {formatValue ? formatValue(value) : value}
          </span>
        </div>
      )}
      <div className="relative w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full flex items-center">
        <div
          className="absolute h-full bg-blue-500 rounded-full pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
          {...props}
        />
        <div
          className="absolute h-4 w-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] pointer-events-none z-0 transition-all duration-75"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  )
}
