-- ============================================================================
-- pilot-dashboard-setup.sql — the ~10-minute dashboard prep (TRACKER, 2026-07-06)
-- Run in the SQL editor of project nrnmxgggmqddhbsjtuob (India region), AFTER
-- schema.sql. Prerequisite for flipping CLOUD_SYNC on in store.js.
--
-- ONE step cannot be SQL: creating the test auth user. Do STEP 3a in the
-- dashboard UI first, then run the rest here. Each step is idempotent-ish and
-- commented — run section by section, read the output, don't fire blind.
-- ============================================================================

-- ---- STEP 0. Sanity: tables exist, see what's currently seeded ----------------
select 'schools'  as t, count(*) from schools
union all select 'teachers', count(*) from teachers
union all select 'children', count(*) from children
union all select 'records',  count(*) from records;
select id, name from schools order by id;

-- ---- STEP 1. Re-seed schools to the CANONICAL sch_* IDs -----------------------
-- The live table was seeded with 'saksham-noida' style IDs before the
-- 2026-07-03 mismatch bug was found. App IDs (sch_*) are canonical.
-- Insert-new-first, then delete-old: safe order if any FK rows exist.
begin;
insert into schools (id, name) values
  ('sch_saksham_noida', 'Saksham School, Noida'),
  ('sch_rnks_jaipur',   'Rajasthan Netraheen Kalyan Sangam, Jaipur'),
  ('sch_nab_kullu',     'National Association of Blind, Kullu')
on conflict (id) do nothing;
-- Repoint any strays (should be zero rows this early — the update is a guard):
update teachers set school_id = 'sch_saksham_noida' where school_id = 'saksham-noida';
update teachers set school_id = 'sch_rnks_jaipur'   where school_id = 'rnks-jaipur';
update teachers set school_id = 'sch_nab_kullu'     where school_id = 'nab-kullu';
update children set school_id = 'sch_saksham_noida' where school_id = 'saksham-noida';
update children set school_id = 'sch_rnks_jaipur'   where school_id = 'rnks-jaipur';
update children set school_id = 'sch_nab_kullu'     where school_id = 'nab-kullu';
delete from schools where id not like 'sch\_%' escape '\';
commit;
select id, name from schools order by id;   -- expect exactly the 3 sch_* rows

-- ---- STEP 2. Private storage bucket 'videos' ----------------------------------
-- (Dashboard: Storage → New bucket → name 'videos', Public OFF. Or:)
insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;
select id, public from storage.buckets where id = 'videos';  -- public must be f

-- ---- STEP 3a. TEST TEACHER — dashboard UI, not SQL ----------------------------
-- Authentication → Users → Add user → Create new user:
--   email:    saksham01@test.local     (matches app loginId 'saksham01' +
--                                       CLOUD_AUTH_DOMAIN in store.js)
--   password: (pick one, note it down for the device test)
--   ☑ Auto Confirm User
-- Then continue below.

-- ---- STEP 3b. Stamp school_id into the JWT (app_metadata) ---------------------
-- RLS + enrol_child() key off app_metadata.school_id (see jwt_school_id()).
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                        || '{"school_id": "sch_saksham_noida"}'::jsonb
where email = 'saksham01@test.local';

-- ---- STEP 3c. Linked roster row (enrol_child requires an ACTIVE teacher) ------
insert into teachers (school_id, name, auth_user_id, active)
select 'sch_saksham_noida', 'Teacher 1 (pilot test)', u.id, true
from auth.users u
where u.email = 'saksham01@test.local'
  and not exists (select 1 from teachers t where t.auth_user_id = u.id);

-- ---- STEP 4. Verify -----------------------------------------------------------
select u.email,
       u.raw_app_meta_data ->> 'school_id' as jwt_school_id,   -- sch_saksham_noida
       t.id as teacher_row, t.school_id, t.active               -- row present, active=t
from auth.users u
left join teachers t on t.auth_user_id = u.id
where u.email = 'saksham01@test.local';
-- If jwt_school_id is right and the teacher row is active, the cloud path is
-- testable: sign in on-device as saksham01 (CLOUD_SYNC=true build), save a NEW
-- child, expect a server-minted OM-XXXX-XXXX. Cross-school isolation check:
-- a second user stamped with a DIFFERENT school_id must see zero of these rows.
