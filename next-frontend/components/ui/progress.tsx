import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorClassName?: string;
}

export function Progress({
  value = 0,
  className,
  indicatorClassName,
  ...props
}: ProgressProps) {
  return (
    <div
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-white/10",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 rounded-full bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-400 transition-all",
          indicatorClassName
        )}
        style={{
          transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)`,
        }}
      />
    </div>
  );
}
