"use client";

import { motion, type HTMLMotionProps } from "motion/react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};

export function AnimatedTableRow({
  className,
  ...props
}: HTMLMotionProps<"tr">) {
  return (
    <motion.tr
      layout="position"
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/50",
        className,
      )}
      {...props}
    />
  );
}
