/** @cursor NO_LAYOUT_CHANGES */
import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary" | "outline" | "gold" | "destructive";
  size?: "sm" | "default" | "lg" | "xl";
};

export function Button({ variant = "primary", size = "default", className, ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mb-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-mb-black disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-mb-turquoise text-mb-black hover:bg-mb-turquoise/90 shadow-glow",
    outline: "border border-mb-turquoise/20 text-mb-turquoise hover:bg-mb-turquoise/10",
    gold: "bg-mb-gold text-mb-black hover:bg-mb-gold/90 shadow-glow",
    destructive: "bg-mb-red text-mb-white hover:bg-mb-red/90"
  } as const;
  
  const sizes = {
    sm: "h-9 px-3 text-sm",
    default: "h-10 px-4 py-2",
    lg: "h-11 px-8 text-lg",
    xl: "h-12 px-10 text-xl"
  } as const;
  
  return (
    <button 
      className={cn(base, variants[variant], sizes[size], className)} 
      {...props} 
    />
  );
}