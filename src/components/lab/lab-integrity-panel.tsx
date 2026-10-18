import type { IntegrityReport } from "@/lib/lab/integrity-engine";

export function LabIntegrityPanel({ report }: { report: IntegrityReport }) {
  return <section className="rounded-3xl border border-line bg-white p-6" aria-labelledby="lab-integrity-title">
    <h2 id="lab-integrity-title" className="text-xl font-black">DATABASE INTEGRITY · 整合性診断</h2>
    <p className="mt-2 text-sm leading-7 text-muted">
      工程・KPI・測定値・監査ログを横断検査します。異なるクエリの結果を組み合わせた診断であり、単一DBトランザクションの証明ではありません。
    </p>
    <p role="status" className="mt-3 rounded-xl border border-line bg-[#fff8e7] p-3 text-sm font-bold">
      {report.level === "blocked" ? "要修正：整合性異常が見つかりました" :
        report.level === "review" ? "要確認：不足・差異が見つかりました" :
        "この取得範囲では整合性異常は見つかりませんでした"}
    </p>
    <p className="mt-3 text-xs text-muted">
      検査範囲：{report.milestoneCount}工程、{report.observationCount}観測。
      工程の記録上の完了：{report.observedMilestonesAllDone ? "はい" : "未達または確認不能"}。
    </p>
    <p className="mt-2 text-xs font-bold text-muted">DB側の同時更新検証が済むまで、診断結果による「LAB完了」の許可は行いません。</p>
    {report.issues.length > 0 && <ul className="mt-4 grid gap-3">
      {report.issues.map((issue, index) => (
        <li key={issue.code + ":" + (issue.subjectId ?? "") + ":" + index}
          className="rounded-xl border border-line p-3 text-sm">
          <span className="font-bold">{issue.severity === "error" ? "異常" : "要確認"} · {issue.code}</span>
          <p className="mt-1 text-xs leading-6 text-muted">{issue.description}</p>
        </li>
      ))}
    </ul>}
  </section>;
}
