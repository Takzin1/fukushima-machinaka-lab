# Security Policy

## Reporting

脆弱性、個人情報の誤表示、権限逸脱を発見した場合は、公開Issueへ個人情報や再現用secretを書かず、運営者へ非公開経路で連絡してください。

## Secret handling

- publishable key以外のSupabase keyをブラウザへ渡さない
- service role / secret keyをcommit、PR、Issue、スクリーンショットへ含めない
- VercelとGitHub Actionsの値は各サービスのsecret storeで管理する

## Authorization invariants

- adminは公開登録から取得できない
- Server ActionはUI表示に依存せず、処理内でroleを再検証する
- RLSは全公開schema tableで有効にする
- WISHの連絡先・住所を公開Challenge queryへ含めない
- 学生プロフィールを商店主へ自動公開しない

## Before production

Supabase Database Advisors、依存関係audit、認証付きE2E、法務文面、データ削除手順を確認してください。
