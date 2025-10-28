/** @cursor NO_LAYOUT_CHANGES */
import { cn } from "@/lib/cn";
import * as React from "react";

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-12 w-full rounded-xl border border-mb-border bg-mb-input px-4 py-3 text-base text-mb-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mb-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-mb-black disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-12 w-full rounded-xl border border-mb-border bg-mb-input px-4 py-3 text-base text-mb-white items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  )
);
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = React.forwardRef<HTMLSpanElement, { placeholder?: string; className?: string }>(
  ({ placeholder, className, ...props }, ref) => (
    <span ref={ref} className={cn("text-mb-white", className)} {...props}>
      {placeholder}
    </span>
  )
);
SelectValue.displayName = "SelectValue";

export const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("absolute z-50 min-w-[8rem] overflow-hidden rounded-xl border border-mb-border bg-mb-card shadow-lg p-1", className)}
      {...props}
    />
  )
);
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef<HTMLDivElement, { value: string; children: React.ReactNode; className?: string }>(
  ({ value, children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 px-2 text-sm text-mb-white outline-none hover:bg-mb-card/50 focus:bg-mb-card/50", className)}
      {...props}
    >
      {children}
    </div>
  )
);
SelectItem.displayName = "SelectItem";