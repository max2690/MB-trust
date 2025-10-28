/** @cursor NO_LAYOUT_CHANGES */
import { cn } from "@/lib/cn";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-mb-border bg-mb-input px-4 py-3 text-base text-mb-white placeholder:text-mb-gray/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mb-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-mb-black disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
        className
      )}
      {...props}
    />
  );
}