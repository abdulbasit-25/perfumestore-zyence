import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[0.12em] uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-olive text-accent-foreground",
        secondary: "border-border bg-secondary text-secondary-foreground",
        success: "border-transparent bg-[color:var(--success)]/12 text-[color:var(--success)]",
        warning:
          "border-transparent bg-[color:var(--warning)]/20 text-[color:var(--warning-foreground)]",
        destructive: "border-transparent bg-destructive/10 text-destructive",
        outline: "border-border bg-background text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
