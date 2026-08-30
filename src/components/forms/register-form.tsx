"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "@/actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/forms/form-parts";
import { initialFormState } from "@/types/domain";

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initialFormState);
  return (
    <form action={action} className="grid gap-5">
      <FormMessage state={state} />
      <Field label="利用区分" name="role" required error={state.fieldErrors?.role}>
        <select id="role" name="role" defaultValue="student" required>
          <option value="student">学生・大学院生</option>
          <option value="shop_owner">商店主・地域事業者</option>
        </select>
      </Field>
      <Field label="氏名・表示名" name="displayName" required error={state.fieldErrors?.displayName}>
        <input id="displayName" name="displayName" autoComplete="name" maxLength={80} required />
      </Field>
      <Field label="メールアドレス" name="email" required error={state.fieldErrors?.email}>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="パスワード" name="password" required hint="10文字以上・英字と数字を含めてください。" error={state.fieldErrors?.password}>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required />
      </Field>
      <div className="grid gap-5 rounded-2xl bg-[#f3f5f4] p-4 sm:grid-cols-3">
        <Field label="大学名（学生のみ）" name="university" error={state.fieldErrors?.university}><input id="university" name="university" maxLength={120} /></Field>
        <Field label="学部・研究科" name="faculty" error={state.fieldErrors?.faculty}><input id="faculty" name="faculty" maxLength={120} /></Field>
        <Field label="学年" name="grade" error={state.fieldErrors?.grade}><input id="grade" name="grade" maxLength={40} /></Field>
      </div>
      <label className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 font-medium">
        <input name="privacyAgreed" type="checkbox" required className="mt-1 size-4" />
        <span className="text-sm leading-6"><Link href="/privacy" target="_blank" className="font-bold text-student underline">プライバシーポリシー</Link>と<Link href="/terms" target="_blank" className="font-bold text-student underline">利用規約</Link>に同意します。</span>
      </label>
      {state.fieldErrors?.privacyAgreed ? <p role="alert" className="text-sm text-[#b42318]">{state.fieldErrors.privacyAgreed[0]}</p> : null}
      <SubmitButton label="アカウントを作成" pendingLabel="登録中…" />
    </form>
  );
}
