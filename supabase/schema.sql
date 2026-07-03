-- ============================================================================
-- O&M Cane Training — Supabase schema (draft, pre-project)
-- Written 2026-07-03 against the R&D confirmations:
--   (1) Architecture A: server-assigned child ID at enrolment (online-only
--       enrolment; assessments stay offline)  (2) video IS required
--   (3) multi-device-per-child: yes           (4) analysis: longitudinal + cross-child
-- Run in the SQL editor of a NEW India-region project. Review before running.
--
-- DECISION (flagged, reversible until first real enrolment): child name + DOB
-- ARE stored server-side, behind RLS, because a second device must render the
-- child-picker (name/photo) to select the child. Pseudonymisation continues to
-- apply to research EXTRACTS (research_id only), not the operational DB.
-- If legal rejects this, the fallback is name-encrypted-at-rest with a
-- school-held key — costlier, decide before enrolment goes live.
-- ============================================================================

-- ---------- schools: stable human-readable IDs (match seedSchools in-app) ----
create table schools (
  id         text primary key,          -- e.g. 'saksham-noida', 'rnks-jaipur', 'nab-kullu'
  name       text not null,
  created_at timestamptz not null default now()
);

-- ---------- teachers: roster, linked to Supabase auth users --------------------
create table teachers (
  id           uuid primary key default gen_random_uuid(),
  school_id    text not null references schools(id),
  name         text not null,
  auth_user_id uuid unique references auth.users(id),  -- set when login issued
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ---------- children: THE cross-device identity (Architecture A) ---------------
-- research_id is server-minted at enrolment and is the join key everywhere:
-- records, video filenames, exports. Devices cache the row locally.
create table children (
  research_id  text primary key,                 -- 'OM-XXXX-XXXX', minted below
  school_id    text not null references schools(id),
  name         text not null,                    -- operational, RLS-protected (see DECISION)
  dob          date,
  height_cm    numeric,
  weight_kg    numeric,
  dominant_hand text,
  filled_by    text,
  -- consent envelope (mirrors the in-app fields, synced on enrol/edit)
  video_consent              boolean not null default false,
  video_consent_by           text,
  video_consent_relation     text,
  video_consent_method       text,
  video_consent_on           timestamptz,
  video_consent_withdrawn_on timestamptz,
  created_by   uuid references teachers(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Server-side pseudonym mint: unambiguous alphabet (no 0/O/1/I), retry on the
-- (unlikely) collision. Called by the enrolment RPC, never by the client.
create or replace function mint_research_id() returns text
language plpgsql as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  candidate text;
begin
  loop
    candidate := 'OM-' ||
      array_to_string(array(select substr(alphabet, 1+floor(random()*length(alphabet))::int, 1) from generate_series(1,4)), '') || '-' ||
      array_to_string(array(select substr(alphabet, 1+floor(random()*length(alphabet))::int, 1) from generate_series(1,4)), '');
    exit when not exists (select 1 from children where research_id = candidate);
  end loop;
  return candidate;
end $$;

-- Enrolment RPC — the ONE online step (Architecture A). The app calls this at
-- Save-child; on success it stores the returned research_id locally and the
-- child works offline everywhere afterwards.
create or replace function enrol_child(
  p_name text, p_dob date, p_height numeric, p_weight numeric,
  p_hand text, p_filled_by text,
  p_consent boolean, p_consent_by text, p_consent_relation text, p_consent_method text
) returns text
language plpgsql security definer as $$
declare
  v_teacher teachers%rowtype;
  v_rid text;
begin
  select * into v_teacher from teachers where auth_user_id = auth.uid() and active;
  if v_teacher.id is null then raise exception 'not an active roster teacher'; end if;
  v_rid := mint_research_id();
  insert into children (research_id, school_id, name, dob, height_cm, weight_kg,
    dominant_hand, filled_by, video_consent, video_consent_by,
    video_consent_relation, video_consent_method, video_consent_on, created_by)
  values (v_rid, v_teacher.school_id, p_name, p_dob, p_height, p_weight,
    p_hand, p_filled_by, p_consent, p_consent_by,
    p_consent_relation, p_consent_method,
    case when p_consent then now() end, v_teacher.id);
  return v_rid;
end $$;

-- ---------- records: one row per saved assessment ------------------------------
create table records (
  id             uuid primary key,               -- client-generated (offline save)
  research_id    text not null references children(research_id),
  school_id      text not null references schools(id),
  teacher_id     uuid references teachers(id),
  device_op_id   text,                           -- per-device op_ id (legacy attribution)
  activity_id    text not null,
  when_iso       timestamptz not null,
  schema_version int not null,
  values         jsonb not null default '{}',
  video_path     text,                           -- storage path in the 'videos' bucket
  created_at     timestamptz not null default now()
);
create index on records (research_id, when_iso);   -- longitudinal
create index on records (activity_id, when_iso);   -- cross-child

-- ---------- storage: private bucket for consent-gated clips --------------------
-- Create bucket 'videos' (PRIVATE) in the dashboard. Path convention:
--   {school_id}/{research_id}_{timestamp}.{ext}   ← school_id first, for policy
-- Bucket policies (storage.objects) mirror the table RLS below.

-- ---------- Row-Level Security: school isolation --------------------------------
-- JWT carries school_id via app_metadata (set when creating each teacher's
-- auth user: app_metadata: { school_id: 'rnks-jaipur' }).
create or replace function jwt_school_id() returns text
language sql stable as
$$ select coalesce(auth.jwt() -> 'app_metadata' ->> 'school_id', '') $$;

alter table schools  enable row level security;
alter table teachers enable row level security;
alter table children enable row level security;
alter table records  enable row level security;

create policy schools_read  on schools  for select using (true);
create policy teachers_own_school on teachers for select using (school_id = jwt_school_id());
create policy children_own_school on children for all
  using (school_id = jwt_school_id()) with check (school_id = jwt_school_id());
create policy records_own_school  on records  for all
  using (school_id = jwt_school_id()) with check (school_id = jwt_school_id());

-- storage.objects policies for bucket 'videos' (uses the path convention):
create policy videos_rw on storage.objects for all
  using (bucket_id = 'videos' and (storage.foldername(name))[1] = jwt_school_id())
  with check (bucket_id = 'videos' and (storage.foldername(name))[1] = jwt_school_id());

-- ---------- seed ---------------------------------------------------------------
insert into schools (id, name) values
  ('saksham-noida', 'Saksham School, Noida'),
  ('rnks-jaipur',   'Rajasthan Netraheen Kalyan Sangam, Jaipur'),
  ('nab-kullu',     'National Association of Blind, Kullu');
-- teachers: insert once Mansi sends real names; create auth users with
-- app_metadata.school_id, then update teachers.auth_user_id.
