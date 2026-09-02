# Security Policy

## Reporting

脆弱性、個人情報の誤表示、権限逸脱を発見した場合は、公開Issueへ個人情報や再現用secretを書かず、運営者へ非公開経路で連絡してください。

## Secret handling

- `NEXT_PUBLIC_FIREBASE_API_KEY`はFirebase client識別用の公開値として扱い、Authorized domainsとAPI制限を併用する
- `FIREBASE_ADMIN_CLIENT_EMAIL`と`FIREBASE_ADMIN_PRIVATE_KEY`はサーバー専用とし、ブラウザへ渡さない
- service account key、session Cookie、テスト用passwordをcommit、PR、Issue、ログ、スクリーンショットへ含めない
- VercelとGitHub Actionsの値は各サービスのsecret storeで管理する
- 秘密鍵は用途を限定し、不要になった鍵を失効・削除する

## Authentication and session invariants

- 未確認メールのユーザーへsessionを発行しない
- session CookieはHttpOnly、Secure（本番）、SameSite=Lax、5日以内に失効
- session検証時に失効・無効化状態も確認する
- logout時にsession Cookieを失効させる

## Authorization invariants

- adminは公開登録から取得できない
- Server ActionはUI表示に依存せず、処理内でroleを再検証する
- Admin SDKのSQL Connect呼び出しにも利用者をimpersonateし、connector authorizationを必ず評価する
- WISHのowner IDとApplicationのstudent IDはリクエスト値ではなく`auth.uid`から設定する
- WISHの連絡先・住所を公開Challenge queryへ含めない
- 学生プロフィールを商店主へ自動公開しない
- role lookup、公開状態、締切、重複、status更新をDB transaction／constraintでも検証する

## Before production

- SQL Connect schemaとconnectorのcompile／deploy結果を確認
- 公開、shop owner、student、adminそれぞれの正負両方の権限テストを実施
- Firebase AuthのAuthorized domains、メールテンプレート、送信元を確認
- service accountへ最小権限を設定し、鍵ローテーション手順を用意
- 依存関係audit、認証付きE2E、法務文面、データ保存期間・削除手順、バックアップ／復旧を確認
