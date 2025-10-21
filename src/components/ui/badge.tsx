import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * ЗАФИКСИРОВАННЫЙ КОМПОНЕНТ - НЕ МЕНЯТЬ TAILWIND КЛАССЫ!
 * Можно менять только логику (props, handlers, state)
 */

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-mb-turquoise/30 bg-mb-turquoise/10 text-mb-turquoise hover:bg-mb-turquoise/20",
        secondary: "border-mb-gray/30 bg-mb-gray/10 text-mb-gray hover:bg-mb-gray/20",
        destructive: "border-mb-red/30 bg-mb-red/10 text-mb-red hover:bg-mb-red/20",
        gold: "border-mb-gold/30 bg-mb-gold/10 text-mb-gold hover:bg-mb-gold/20 shadow-glow-gold",
        outline: "border-mb-white/20 bg-transparent text-mb-white hover:bg-mb-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }