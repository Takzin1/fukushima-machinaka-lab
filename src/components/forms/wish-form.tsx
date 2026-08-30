"use client";

import { useActionState } from "react";
import { createWishAction } from "@/actions/wishes";
import { Field, FormMessage, SubmitButton } from "@/components/forms/form-parts";
import { initialFormState } from "@/types/domain";

export function WishForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, action] = useActionState(createWishAction, initialFormState);
  return (
    <form action={action} className="grid gap-7">
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="店舗名" name="shopName" required error={state.fieldErrors?.shopName}><input id="shopName" name="shopName" maxLength={120} required /></Field>
        <Field label="担当者名" name="contactName" required error={state.fieldErrors?.contactName}><input id="contactName" name="contactName" autoComplete="name" maxLength={80} required /></Field>
        <Field label="連絡先メール" name="contactEmail" required error={state.fieldErrors?.contactEmail}><input id="contactEmail" name="contactEmail" type="email" defaultValue={defaultEmail} required /></Field>
        <Field label="業種" name="industry" required error={state.fieldErrors?.industry}><input id="industry" name="industry" placeholder="飲食、小売、サービスなど" maxLength={80} required /></Field>
      </div>
      <Field label="困っていること・やってみたいこと" name="problem" required hint="うまく整理できていなくても、そのまま書いてください。" error={state.fieldErrors?.problem}><textarea id="problem" name="problem" minLength={20} maxLength={2000} required /></Field>
      <Field label="実現できたらうれしい状態" name="desiredOutcome" required error={state.fieldErrors?.desiredOutcome}><textarea id="desiredOutcome" name="desiredOutcome" minLength={10} maxLength={1200} required /></Field>
      <Field label="学生と試してみたいこと" name="experimentIdea" error={state.fieldErrors?.experimentIdea}><textarea id="experimentIdea" name="experimentIdea" maxLength={1200} /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="店舗Webサイト" name="websiteUrl" error={state.fieldErrors?.websiteUrl}><input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://" /></Field>
        <Field label="Instagram等SNS" name="snsUrl" error={state.fieldErrors?.snsUrl}><input id="snsUrl" name="snsUrl" type="url" placeholder="https://" /></Field>
        <Field label="希望期間" name="preferredPeriod" error={state.fieldErrors?.preferredPeriod}><input id="preferredPeriod" name="preferredPeriod" placeholder="例：11月中、4週間程度" maxLength={120} /></Field>
        <Field label="店舗住所（非公開）" name="address" hint="運営のみ閲覧します。" error={state.fieldErrors?.address}><input id="address" name="address" autoComplete="street-address" maxLength={240} /></Field>
      </div>
      <Field label="補足" name="notes" error={state.fieldErrors?.notes}><textarea id="notes" name="notes" maxLength={1200} /></Field>
      <SubmitButton label="WISHを送信する" pendingLabel="保存中…" variant="owner" />
    </form>
  );
}
