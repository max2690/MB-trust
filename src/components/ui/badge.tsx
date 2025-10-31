/** @cursor NO_LAYOUT_CHANGES */
import { cn } from "@/lib/cn";

const badgeVariantAlias: Record<string, "default" | "gold" | "outline" | "destructive"> = {
  default: "default",
  primary: "default",
  secondary: "outline",
  ghost: "outline",
  outline: "outline",
  destructive: "destructive",
  gold: "gold",
};

type Props = React.HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof badgeVariantAlias;
};

export function Badge({ variant = "default", className, ...props }: Props) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors";
  
  const variants = {
    default: "bg-mb-turquoise text-mb-black",
    gold: "bg-mb-gold text-mb-black",
    outline: "border border-mb-turquoise/20 text-mb-turquoise",
    destructive: "bg-mb-red text-mb-white"
  } as const;
  
  const resolvedVariant = badgeVariantAlias[variant] ?? "default";
  return (
    <div className={cn(base, variants[resolvedVariant], className)} {...props} />
  );
}