"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/forms/form-parts";
import { initialFormState } from "@/types/domain";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialFormState);
  return (
    <form action={action} className="grid gap-5">
      <FormMessage state={state} />
      <Field label="メールアドレス" name="email" required error={state.fieldErrors?.email}>
        <input id="email" name="email" type="email" autoComplete="email" required aria-describedby={state.fieldErrors?.email ? "email-error" : undefined} />
      </Field>
      <Field label="パスワード" name="password" required error={state.fieldErrors?.password}>
        <input id="password" name="password" type="password" autoComplete="current-password" minLength={8} required aria-describedby={state.fieldErrors?.password ? "password-error" : undefined} />
      </Field>
      <SubmitButton label="ログイン" pendingLabel="確認中…" />
    </form>
  );
}
