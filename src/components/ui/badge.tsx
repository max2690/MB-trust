/** @cursor NO_LAYOUT_CHANGES */
import { cn } from "@/lib/cn";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "gold" | "outline" | "destructive";
};

export function Badge({ variant = "default", className, ...props }: Props) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors";
  
  const variants = {
    default: "bg-mb-turquoise text-mb-black",
    gold: "bg-mb-gold text-mb-black",
    outline: "border border-mb-turquoise/20 text-mb-turquoise",
    destructive: "bg-mb-red text-mb-white"
  } as const;
  
  return (
    <div className={cn(base, variants[variant], className)} {...props} />
  );
}