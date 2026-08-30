import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "owner" | "student" | "admin" | "outline" | "ghost";

export function buttonClass(variant: Variant = "admin", className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition duration-150 disabled:cursor-not-allowed disabled:opacity-50",
    variant === "owner" && "bg-owner text-white hover:bg-[#cb5520]",
    variant === "student" && "bg-student text-white hover:bg-[#194fc4]",
    variant === "admin" && "bg-admin text-white hover:bg-[#111b20]",
    variant === "outline" && "border border-line bg-white text-foreground hover:border-[#aeb9b6] hover:bg-[#f5f7f6]",
    variant === "ghost" && "text-foreground hover:bg-[#edf0ef]",
    className,
  );
}

export function ButtonLink({ href, children, variant, className, ...props }: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href">) {
  return <Link href={href} className={buttonClass(variant, className)} {...props}>{children}</Link>;
}
