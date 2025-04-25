import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageHeader({ className, children, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-6 gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
