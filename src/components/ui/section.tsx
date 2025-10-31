import { cn } from "@/lib/cn";
import * as React from "react";

export default function Section({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("w-full", className)} {...props} />;
}




