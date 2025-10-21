/** @cursor NO_LAYOUT_CHANGES */
import { cn } from "../../lib/cn";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-mb-border bg-mb-card p-6 shadow-card hover:shadow-glow transition-all duration-300", className)}>
      {children}
    </div>
  );
}

