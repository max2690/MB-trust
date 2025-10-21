/** @cursor NO_LAYOUT_CHANGES */
import React from "react";
import { cn } from "@/lib/cn";

export default function LayoutTemplate({ children }: { children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-6 md:px-8 py-20 grid gap-16 md:gap-24")}>{children}</div>;
}
