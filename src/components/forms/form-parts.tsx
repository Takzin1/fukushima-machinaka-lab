"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import type { FormState } from "@/types/domain";

export function Field({
  label,
  name,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const errorId = `${name}-error`;
  return (
    <div className="grid gap-2">
      <label htmlFor={name}>{label}{required ? <span className="ml-1 text-owner">*</span> : null}</label>
      {children}
      {hint && !error?.length ? <p className="text-xs leading-5 text-muted">{hint}</p> : null}
      {error?.length ? <p id={errorId} role="alert" className="text-sm font-medium text-[#b42318]">{error[0]}</p> : null}
    </div>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <div role="status" className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${state.status === "success" ? "border-[#a6d6b9] bg-[#eef9f2] text-[#176237]" : "border-[#edb8b3] bg-[#fff1f0] text-[#9a261e]"}`}>
      {state.message}
    </div>
  );
}

export function SubmitButton({ label, pendingLabel = "送信中…", variant = "admin" }: { label: string; pendingLabel?: string; variant?: "owner" | "student" | "admin" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass(variant, "min-h-13 w-full text-base sm:w-auto sm:min-w-48")}>
      {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}{pending ? pendingLabel : label}
    </button>
  );
}
