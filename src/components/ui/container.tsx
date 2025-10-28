/** @cursor NO_LAYOUT_CHANGES */
import { cn } from "@/lib/cn";

export function Container({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8", className)} {...props}>
      {children}
    </div>
  );
}
export default Container;