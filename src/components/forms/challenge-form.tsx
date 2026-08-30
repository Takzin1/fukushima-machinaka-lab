"use client";

import { useActionState } from "react";
import { createChallengeAction } from "@/actions/admin";
import { Field, FormMessage, SubmitButton } from "@/components/forms/form-parts";
import type { Wish } from "@/types/domain";
import { initialFormState } from "@/types/domain";

export function ChallengeForm({ wish }: { wish: Wish }) {
  const [state, action] = useActionState(createChallengeAction, initialFormState);
  return (
    <form action={action} className="grid gap-6">
      <input type="hidden" name="wishId" value={wish.id} />
      <FormMessage state={state} />
      <Field label="Challengeタイトル" name="title" required error={state.fieldErrors?.title}><input id="title" name="title" maxLength={160} placeholder="動詞で終わる、学生が挑みたくなる問い" required /></Field>
      <Field label="概要" name="summary" required error={state.fieldErrors?.summary}><textarea id="summary" name="summary" minLength={20} maxLength={500} required /></Field>
      <Field label="背景" name="background" required error={state.fieldErrors?.background}><textarea id="background" name="background" minLength={20} maxLength={1600} defaultValue={wish.problem} required /></Field>
      <Field label="解決したい課題" name="problem" required error={state.fieldErrors?.problem}><textarea id="problem" name="problem" minLength={20} maxLength={1600} defaultValue={wish.problem} required /></Field>
      <Field label="期待する成果" name="desiredOutcome" required error={state.fieldErrors?.desiredOutcome}><textarea id="desiredOutcome" name="desiredOutcome" minLength={10} maxLength={1200} defaultValue={wish.desired_outcome} required /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="公開店舗名" name="shopDisplayName" required error={state.fieldErrors?.shopDisplayName}><input id="shopDisplayName" name="shopDisplayName" maxLength={120} defaultValue={wish.shop_name} required /></Field>
        <Field label="カテゴリー" name="category" required error={state.fieldErrors?.category}>
          <select id="category" name="category" defaultValue="マーケティング" required>
            {["マーケティング", "SNS", "デザイン", "IT・DX", "イベント", "商品開発", "建築・空間活用", "まちづくり", "調査・リサーチ"].map((value) => <option key={value}>{value}</option>)}
          </select>
        </Field>
        <Field label="必要・歓迎スキル" name="skills" hint="読点またはカンマ区切り" error={state.fieldErrors?.skills}><input id="skills" name="skills" placeholder="SNS、デザイン、調査" /></Field>
        <Field label="活動地域" name="area" required error={state.fieldErrors?.area}><input id="area" name="area" defaultValue="福島市中心市街地" maxLength={160} required /></Field>
        <Field label="期間" name="period" error={state.fieldErrors?.period}><input id="period" name="period" defaultValue={wish.preferred_period ?? ""} maxLength={120} /></Field>
        <Field label="想定活動量" name="workload" error={state.fieldErrors?.workload}><input id="workload" name="workload" placeholder="週2〜3時間" maxLength={120} /></Field>
        <Field label="募集人数" name="capacity" required error={state.fieldErrors?.capacity}><input id="capacity" name="capacity" type="number" defaultValue={3} min={1} max={50} required /></Field>
        <Field label="応募締切" name="deadline" error={state.fieldErrors?.deadline}><input id="deadline" name="deadline" type="date" /></Field>
        <Field label="公開状態" name="status" required error={state.fieldErrors?.status}>
          <select id="status" name="status" defaultValue="draft"><option value="draft">下書き保存</option><option value="published">すぐ公開</option></select>
        </Field>
      </div>
      <SubmitButton label="Challengeとして保存" pendingLabel="保存中…" variant="admin" />
    </form>
  );
}
