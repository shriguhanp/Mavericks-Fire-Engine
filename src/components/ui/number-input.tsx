import * as React from "react"
import { cn } from "../../lib/utils"

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label: string;
  prefix?: string;
  suffix?: string;
  value?: number | string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function NumberInput({
  className,
  label,
  prefix,
  suffix,
  ...props
}: NumberInputProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <label className="text-sm font-medium text-slate-600 dark:text-white/70">{label}</label>}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-4 text-slate-400 dark:text-white/40 font-medium">{prefix}</span>
        )}
        <input
          type="number"
          className={cn(
            "w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-2 text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all focus:bg-slate-50 dark:focus:bg-white/10",
            prefix && "pl-9",
            suffix && "pr-9"
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-4 text-slate-400 dark:text-white/40 font-medium">{suffix}</span>
        )}
      </div>
    </div>
  )
}
