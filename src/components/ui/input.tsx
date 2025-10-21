import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * ЗАФИКСИРОВАННЫЙ КОМПОНЕНТ - НЕ МЕНЯТЬ TAILWIND КЛАССЫ!
 * Можно менять только логику (props, handlers, state)
 */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "mb-input flex h-12 w-full rounded-xl border border-mb-gray/20 px-4 py-3 text-base text-mb-white placeholder:text-mb-gray/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mb-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-mb-black disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }