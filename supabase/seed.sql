-- Development-only sample data. Run via `supabase db reset` locally.
-- Never run this file automatically against the production database.

insert into public.challenges (
  id, wish_id, title, summary, background, problem, desired_outcome,
  shop_display_name, category, skills, period, workload, area, capacity,
  deadline, status, is_sample, published_at
) values
(
  '11111111-1111-4111-8111-111111111111', null,
  '老舗喫茶店に20代の新規顧客を呼べ。',
  '学生目線で、店の魅力を再発見し、小さな集客実験を設計します。',
  '長く地域に愛されてきた一方、若い世代との接点が減っています。',
  '既存の魅力が若い世代へ十分に届いていません。',
  '学生と店主が、実行可能な集客施策を1つ試せている状態。',
  'すずらん通りの喫茶店（SAMPLE）', 'マーケティング',
  array['SNS', '写真', '企画'], '4週間', '週2〜3時間',
  '福島市・すずらん通り', 3, '2026-10-15', 'published', true, now()
),
(
  '22222222-2222-4222-8222-222222222222', null,
  '空いている商店街2Fの新しい使い方を考えよ。',
  '遊休空間を、学生と地域が交わる小さな実験室へ変える提案づくり。',
  '駅前には使われていない上階スペースが残っています。',
  '用途と運営者が決まらず、空間が地域資源として生かされていません。',
  '現地条件に合う利用案と、1日実証の計画ができている状態。',
  'パセオ470周辺の地域事業者（SAMPLE）', '建築・空間活用',
  array['建築', 'デザイン', '事業企画'], '6週間', '週3時間程度',
  '福島市・パセオ470周辺', 4, '2026-10-31', 'published', true, now()
),
(
  '33333333-3333-4333-8333-333333333333', null,
  '夜のすずらん通りを、昼にも歩きたくなる街へ。',
  '昼間の回遊を増やすため、観察と聞き取りから実験案をつくります。',
  '時間帯によって通りの人流と体験価値に差があります。',
  '昼に歩く理由や、複数店舗を巡るきっかけが不足しています。',
  '商店主と学生が合意した回遊実験を1回実施できる状態。',
  'すずらん通り有志（SAMPLE）', 'まちづくり',
  array['フィールドワーク', '調査', 'イベント'], '8週間', '隔週フィールドワーク',
  '福島市・すずらん通り', 5, '2026-11-10', 'published', true, now()
)
on conflict (id) do nothing;
