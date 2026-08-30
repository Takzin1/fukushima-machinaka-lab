"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createApplicationAction } from "@/actions/applications";
import { Field, FormMessage, SubmitButton } from "@/components/forms/form-parts";
import { initialFormState } from "@/types/domain";

export function ApplicationForm({ challengeId }: { challengeId: string }) {
  const [state, action] = useActionState(createApplicationAction, initialFormState);
  return (
    <form action={action} className="grid gap-6">
      <input type="hidden" name="challengeId" value={challengeId} />
      <FormMessage state={state} />
      <Field label="応募理由" name="motivation" required error={state.fieldErrors?.motivation}><textarea id="motivation" name="motivation" minLength={20} maxLength={1600} required /></Field>
      <Field label="興味を持った理由" name="interestReason" required error={state.fieldErrors?.interestReason}><textarea id="interestReason" name="interestReason" minLength={10} maxLength={1200} required /></Field>
      <Field label="活かせそうな経験・スキル" name="skillsExperience" required error={state.fieldErrors?.skillsExperience}><textarea id="skillsExperience" name="skillsExperience" minLength={10} maxLength={1200} required /></Field>
      <Field label="参加可能期間" name="availability" required error={state.fieldErrors?.availability}><input id="availability" name="availability" placeholder="例：10月〜12月、平日夕方と土曜" maxLength={240} required /></Field>
      <Field label="自由記述" name="notes" error={state.fieldErrors?.notes}><textarea id="notes" name="notes" maxLength={1000} /></Field>
      <label className="flex items-start gap-3 rounded-2xl border border-line bg-[#f7f9f8] p-4 font-medium"><input name="privacyAgreed" type="checkbox" required className="mt-1 size-4" /><span className="text-sm leading-6">応募内容の取り扱いについて<Link href="/privacy" target="_blank" className="font-bold text-student underline">プライバシーポリシー</Link>に同意します。個人情報は運営が管理し、商店主へ自動公開されません。</span></label>
      {state.fieldErrors?.privacyAgreed ? <p role="alert" className="text-sm text-[#b42318]">{state.fieldErrors.privacyAgreed[0]}</p> : null}
      <SubmitButton label="このChallengeに応募する" pendingLabel="応募中…" variant="student" />
    </form>
  );
}
