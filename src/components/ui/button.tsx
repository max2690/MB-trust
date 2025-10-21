import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * ЗАФИКСИРОВАННЫЙ КОМПОНЕНТ - НЕ МЕНЯТЬ TAILWIND КЛАССЫ!
 * Можно менять только логику (props, handlers, state)
 */

const buttonVariants = cva(
  "mb-button inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-mb-turquoise to-mb-turquoise/80 text-mb-black hover:from-mb-turquoise/90 hover:to-mb-turquoise/70 shadow-glow hover:shadow-glow",
        destructive: "bg-gradient-to-r from-mb-red to-mb-red/80 text-mb-white hover:from-mb-red/90 hover:to-mb-red/70 shadow-glow-red hover:shadow-glow-red",
        outline: "border-2 border-mb-turquoise/30 bg-transparent text-mb-turquoise hover:bg-mb-turquoise/10 hover:border-mb-turquoise/50 shadow-glow hover:shadow-glow",
        secondary: "bg-gradient-to-r from-mb-gray/20 to-mb-gray/10 text-mb-white hover:from-mb-gray/30 hover:to-mb-gray/20 border border-mb-gray/20",
        ghost: "text-mb-white hover:bg-mb-turquoise/10 hover:text-mb-turquoise",
        gold: "bg-gradient-to-r from-mb-gold to-mb-gold/80 text-mb-black hover:from-mb-gold/90 hover:to-mb-gold/70 shadow-glow-gold hover:shadow-glow-gold",
        link: "text-mb-turquoise underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-14 rounded-xl px-8 text-lg font-bold",
        xl: "h-16 rounded-2xl px-10 text-xl font-bold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }