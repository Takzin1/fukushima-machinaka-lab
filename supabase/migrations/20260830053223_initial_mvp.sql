-- FUKUSHIMA MACHINAKA LAB MVP
-- Reproducible schema, least-privilege grants, and Row Level Security policies.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create type public.user_role as enum ('shop_owner', 'student', 'admin');
create type public.wish_status as enum ('draft', 'submitted', 'reviewing', 'challenge_created', 'closed');
create type public.challenge_status as enum ('draft', 'published', 'closed', 'archived');
create type public.application_status as enum ('applied', 'reviewing', 'interview', 'matched', 'not_selected', 'withdrawn');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'student',
  display_name text not null check (char_length(display_name) between 2 and 80),
  email text not null,
  university text check (university is null or char_length(university) <= 120),
  faculty text check (faculty is null or char_length(faculty) <= 120),
  grade text check (grade is null or char_length(grade) <= 40),
  bio text check (bio is null or char_length(bio) <= 1200),
  skills text[] not null default '{}',
  privacy_agreed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  shop_name text not null check (char_length(shop_name) between 2 and 120),
  contact_name text not null check (char_length(contact_name) between 2 and 80),
  contact_email text not null check (char_length(contact_email) <= 254),
  industry text not null check (char_length(industry) <= 80),
  website_url text check (website_url is null or char_length(website_url) <= 500),
  sns_url text check (sns_url is null or char_length(sns_url) <= 500),
  address text check (address is null or char_length(address) <= 240),
  problem text not null check (char_length(problem) between 20 and 2000),
  desired_outcome text not null check (char_length(desired_outcome) between 10 and 1200),
  experiment_idea text check (experiment_idea is null or char_length(experiment_idea) <= 1200),
  preferred_period text check (preferred_period is null or char_length(preferred_period) <= 120),
  notes text check (notes is null or char_length(notes) <= 1200),
  status public.wish_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  wish_id uuid references public.wishes(id) on delete set null,
  title text not null check (char_length(title) between 8 and 160),
  summary text not null check (char_length(summary) between 20 and 500),
  background text not null check (char_length(background) between 20 and 1600),
  problem text not null check (char_length(problem) between 20 and 1600),
  desired_outcome text not null check (char_length(desired_outcome) between 10 and 1200),
  shop_display_name text not null check (char_length(shop_display_name) between 2 and 120),
  category text not null check (char_length(category) <= 80),
  skills text[] not null default '{}',
  period text check (period is null or char_length(period) <= 120),
  workload text check (workload is null or char_length(workload) <= 120),
  area text not null check (char_length(area) between 2 and 160),
  capacity integer not null default 1 check (capacity between 1 and 50),
  deadline date,
  status public.challenge_status not null default 'draft',
  is_sample boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_at_required check (status <> 'published' or published_at is not null)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  motivation text not null check (char_length(motivation) between 20 and 1600),
  interest_reason text not null check (char_length(interest_reason) between 10 and 1200),
  skills_experience text not null check (char_length(skills_experience) between 10 and 1200),
  availability text not null check (char_length(availability) between 2 and 240),
  notes text check (notes is null or char_length(notes) <= 1000),
  status public.application_status not null default 'applied',
  privacy_agreed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (challenge_id, student_id)
);

create index wishes_owner_id_idx on public.wishes(owner_id);
create index wishes_status_created_at_idx on public.wishes(status, created_at desc);
create index challenges_status_published_at_idx on public.challenges(status, published_at desc);
create index challenges_wish_id_idx on public.challenges(wish_id);
create index applications_student_id_created_at_idx on public.applications(student_id, created_at desc);
create index applications_challenge_id_status_idx on public.applications(challenge_id, status);

create function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger wishes_set_updated_at before update on public.wishes
for each row execute function private.set_updated_at();
create trigger challenges_set_updated_at before update on public.challenges
for each row execute function private.set_updated_at();
create trigger applications_set_updated_at before update on public.applications
for each row execute function private.set_updated_at();

create function private.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where auth.uid() is not null and p.id = auth.uid()
$$;

revoke all on function private.current_user_role() from public;
grant execute on function private.current_user_role() to authenticated;

create function private.protect_wish_controlled_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select private.current_user_role()) <> 'admin'::public.user_role
     and (new.owner_id is distinct from old.owner_id or new.status is distinct from old.status) then
    raise insufficient_privilege using message = 'Only LAB operators can change WISH ownership or status.';
  end if;
  return new;
end;
$$;

create trigger wishes_protect_controlled_fields before update on public.wishes
for each row execute function private.protect_wish_controlled_fields();

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role public.user_role;
begin
  if new.raw_user_meta_data -> 'privacy_agreed' is distinct from 'true'::jsonb then
    raise exception 'Privacy policy consent is required.';
  end if;

  requested_role := case new.raw_user_meta_data ->> 'requested_role'
    when 'shop_owner' then 'shop_owner'::public.user_role
    else 'student'::public.user_role
  end;

  insert into public.profiles (
    id, role, display_name, email, university, faculty, grade, privacy_agreed_at
  ) values (
    new.id,
    requested_role,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), '名称未設定'),
    coalesce(new.email, ''),
    nullif(trim(new.raw_user_meta_data ->> 'university'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'faculty'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'grade'), ''),
    now()
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.wishes enable row level security;
alter table public.challenges enable row level security;
alter table public.applications enable row level security;

create policy "profiles_select_self" on public.profiles
for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_select_admin" on public.profiles
for select to authenticated using ((select private.current_user_role()) = 'admin');
create policy "profiles_update_self" on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "wishes_select_owner" on public.wishes
for select to authenticated using ((select auth.uid()) = owner_id);
create policy "wishes_insert_owner" on public.wishes
for insert to authenticated
with check ((select auth.uid()) = owner_id and (select private.current_user_role()) = 'shop_owner');
create policy "wishes_update_owner" on public.wishes
for update to authenticated
using ((select auth.uid()) = owner_id and (select private.current_user_role()) = 'shop_owner')
with check ((select auth.uid()) = owner_id and (select private.current_user_role()) = 'shop_owner');
create policy "wishes_admin_all" on public.wishes
for all to authenticated
using ((select private.current_user_role()) = 'admin')
with check ((select private.current_user_role()) = 'admin');

create policy "challenges_public_published" on public.challenges
for select to anon, authenticated using (status = 'published');
create policy "challenges_owner_linked" on public.challenges
for select to authenticated using (
  exists (
    select 1 from public.wishes w
    where w.id = wish_id and w.owner_id = (select auth.uid())
  )
);
create policy "challenges_admin_all" on public.challenges
for all to authenticated
using ((select private.current_user_role()) = 'admin')
with check ((select private.current_user_role()) = 'admin');

create policy "applications_select_student" on public.applications
for select to authenticated using ((select auth.uid()) = student_id);
create policy "applications_insert_student" on public.applications
for insert to authenticated
with check (
  (select auth.uid()) = student_id
  and (select private.current_user_role()) = 'student'
  and exists (
    select 1 from public.challenges c
    where c.id = challenge_id
      and c.status = 'published'
      and (c.deadline is null or c.deadline >= current_date)
  )
);
create policy "applications_admin_all" on public.applications
for all to authenticated
using ((select private.current_user_role()) = 'admin')
with check ((select private.current_user_role()) = 'admin');

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant select on public.challenges to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, university, faculty, grade, bio, skills, updated_at)
  on public.profiles to authenticated;
grant select, insert on public.wishes to authenticated;
grant update (
  shop_name, contact_name, contact_email, industry, website_url, sns_url,
  address, problem, desired_outcome, experiment_idea, preferred_period, notes, status, updated_at
) on public.wishes to authenticated;
grant insert, update, delete on public.challenges to authenticated;
grant select, insert, update, delete on public.applications to authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

comment on table public.wishes is 'Private shop-owner wishes. Never expose contact fields publicly.';
comment on table public.challenges is 'Admin-edited public challenge records.';
comment on table public.applications is 'Private student applications reviewed by LAB operators.';
