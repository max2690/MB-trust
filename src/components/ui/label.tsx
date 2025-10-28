/** @cursor NO_LAYOUT_CHANGES */
import { cn } from "@/lib/cn";

type Props = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: Props) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-mb-white mb-2 block",
        className
      )}
      {...props}
    />
  );
}