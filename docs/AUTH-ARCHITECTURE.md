# AUTH-ARCHITECTURE.md — login, roles and access

_Drafted 1 Sep 2026. Design, not built. Supersedes nothing; extends `SPEC.md` #1–#4
and folds in R13/R14, R17, R30, R35, R36 from the requirements sheet._

## The principle, in one line

**The token proves who you are. The database decides what you may see.**

Today it is the other way round, and that is the change this document is about.

Every RLS policy in `supabase/schema.sql` authorises from a JWT claim:

```
create or replace function jwt_school_id() returns text
$$ select coalesce(auth.jwt() -> 'app_metadata' ->> 'school_id', '') $$;
```

`children`, `records`, `teachers` and the `videos` bucket all read it. That works
for a school, because a teacher does not change school mid-term. It cannot work
for a class. R13/R14 make the class the sharing boundary, and assignments change
during a term — **a claim baked into a token goes stale, and a revoked assignment
keeps working until the token refreshes.** A teacher removed from Class 5 on Monday
would keep reading Class 5's children until their session happened to renew.

So: identity in the token, authorisation in the database, looked up per row.

---

## What exists today

**Works.** Supabase Auth is wired and merged (`feat/cloud-sync`, 6 July, never yet
run on a device). `Cloud.signIn()` maps a typed `loginId` to
`<loginId>@test.local`, and a full email typed instead passes through untouched —
so real school addresses need no code change later. `enrol_child()` is security
definer and stamps `school_id` from the caller's JWT, so the device never chooses
which school a child belongs to. `teachers.active` already exists.

**`PILOT_LOCAL_AUTH` is correctly scoped and easy to misread.** A server that
*rejects* a password is final; the stub verdict fires only when the server is
**unreachable**, so a field session in a no-signal school is not bricked. A
fallback login has no cloud session, so enrolment still refuses. Keep it.

### Three defects, all cheap, all worth fixing before anything below

1. **Signing out does not sign out.** `logOut()` (app.js:869) clears the app's own
   session keys and nothing else — there is no `supabase.auth.signOut()` anywhere
   in the tree. The supabase-js session stays in localStorage, so the app shows a
   login screen while a live cloud session sits behind it. On a shared or handed-on
   phone that is a real exposure, and R36 makes every phone personal and
   unwipeable. Three lines.
2. **The local roster is an authorisation step, and it will lock out real
   teachers.** `verifyCredentials` refuses any `loginId` not present in the
   *seeded, in-code* roster before it ever contacts the server. Provision a teacher
   in Supabase and they cannot sign in on a fresh install until someone ships a new
   build. The school picker should be a convenience, not a gate.
3. **`test.local`.** Fine for a throwaway account, wrong on a form a school sees.
   Rename the domain before real accounts are issued; the mapping code does not
   change.

### Missing entirely

Classes. Assignments. Any notion of a role. `teachers.active` is never consulted by
a policy. `records.research_id` is `not null`, which blocks group records outright,
and `records.teacher_id` references `teachers(id)` while the client holds a
device-local id — it must be resolved server-side from `auth.uid()`, never sent.

---

## The model

### Four roles

| Role | Sees | Can |
|---|---|---|
| `teacher` | children in the classes they are currently assigned to | assess, capture video (with consent), sync records both ways (R11+R13) |
| `head` | every child in their own school | **watch** clips — no download, no delete, no share (R35) |
| `researcher` | across schools, and sees **names** (R17) | download via a logged, short-lived signed URL (C4/R25) |
| `admin` | provisioning | issue logins, reset passwords, switch teachers off |

`researcher` is the one that breaks the current shape: `teachers.school_id` is
`not null`, and a researcher belongs to no single school.

### Schema

```sql
-- classes are per-school editable rows, not an enum (R34). Nursery/LKG/UKG/1-12
-- is a starting default; vocational streams, open schooling and ungraded groups
-- all exist in schools for the blind.
create table classes (
  id         text primary key,
  school_id  text not null references schools(id),
  name       text not null,
  sort_order int not null default 0,
  active     boolean not null default true,
  unique (school_id, name)
);

alter table children add column class_id text references classes(id);

-- The heart of it. Assignments are rows with a lifetime, never a token claim.
create table class_assignments (
  teacher_id  uuid not null references teachers(id) on delete cascade,
  class_id    text not null references classes(id) on delete cascade,
  assigned_on date not null default current_date,
  ended_on    date,                                  -- null = current
  primary key (teacher_id, class_id, assigned_on)
);
create index on class_assignments (teacher_id) where ended_on is null;

-- `teachers` is really "people who can sign in" now. Not renaming it: the name
-- is threaded through enrol_child() and the client. Comment, don't rename.
alter table teachers add column role text not null default 'teacher'
  check (role in ('teacher','head','researcher','admin'));
alter table teachers alter column school_id drop not null;
alter table teachers add constraint school_required_unless_researcher
  check (role = 'researcher' or school_id is not null);
```

### Access helpers

```sql
-- SECURITY DEFINER matters: these read `teachers`, which has RLS of its own.
-- Called from inside a policy on `children`, an invoker-rights function would
-- re-enter RLS and either recurse or silently return nothing. Pin search_path.
create or replace function my_role() returns text
  language sql stable security definer set search_path = public as
$$ select role from teachers where auth_user_id = auth.uid() and active $$;

create or replace function my_school() returns text
  language sql stable security definer set search_path = public as
$$ select school_id from teachers where auth_user_id = auth.uid() and active $$;

create or replace function my_class_ids() returns setof text
  language sql stable security definer set search_path = public as
$$ select a.class_id
     from class_assignments a
     join teachers t on t.id = a.teacher_id
    where t.auth_user_id = auth.uid()
      and t.active
      and a.ended_on is null $$;
```

### The policy

```sql
create policy children_visible on children for select using (
  case my_role()
    when 'researcher' then true
    when 'admin'      then true
    when 'head'       then school_id = my_school()
    when 'teacher'    then class_id in (select my_class_ids())
                          or (class_id is null and school_id = my_school())  -- D9
    else false
  end
);
```

Two properties worth naming, because they are the whole point:

**Switching a teacher off is immediate and total, and it is one boolean.** Every
helper filters on `active`, so a disabled teacher's `my_role()` returns null, the
`case` falls to `else false`, and they read nothing — no token revocation, no
waiting for expiry. `teachers.active` already exists and is currently consulted by
nothing. That is D5's recommended answer (*switch off, do not delete*) implemented
for free, and it keeps `records.teacher_id` and the R25 audit trail pointing at a
name that still exists.

**The `class_id is null` branch is D9, sitting in the open.** Group records have no
class by design (R31). Whether they are visible school-wide (R32) or only to the
teacher who ran them is one line here and it is not decided.

---

## Offline — the part that is actually hard

Assessments run offline forever; only enrolment needs a connected minute
(Architecture A, locked 3 July). But a signed-in teacher on a personal phone, out
of signal for a week, still has to see children's names to work at all.

**On each successful online sign-in, cache a session record:** teacher id, school,
role, current class ids, the roster of children in them, and — critically — a
**server-supplied** timestamp, not the device's.

**Then a degradation clock (D1).** Within the window, full names. Past it, degrade
to **first name only** — never research codes. `OM-XXXX-XXXX` is opaque by design,
so a teacher facing ten children would pick wrong and write a session silently onto
the wrong child. Degrade, do not lock: locking a teacher out mid-assessment in a
school with no signal is a worse failure than a stale cache.

**Only a real server contact resets the clock.** Never device time. Store the
server timestamp alongside the device clock reading at that moment; if the device
clock later moves backwards relative to what was stored, treat the window as
expired rather than extended.

**State the limit honestly:** on a device you do not own, a determined person wins.
The clock is not a security boundary. It is what stops a departing teacher's phone
holding readable children's names indefinitely *by default*, which is the actual
risk R36 creates — nobody is going to root a phone, but a great many people change
jobs and keep the handset.

That is why D1 is not a nice-to-have. With personal phones and no remote wipe, the
offline window is the **only** bound on how long a leaver's device stays readable.

---

## Password change and recovery (SPEC #3)

`supabase.auth.updateUser({ password })` — small. The decision that matters is
recovery, and it is already made: **an admin resets from the dashboard.** Do not
wire email-based reset. Teachers will not reliably have email, and an email-only
reset path becomes a permanent lockout the day someone forgets a password.

---

## How to go about it — build order

Un-backfillable first, which is this project's standing rule.

**Step 0 — this week, no decisions needed.** Fix `logOut()` to call
`supabase.auth.signOut()`. Drop the local-roster precondition. Rename the auth
domain off `test.local`. Fix the two known schema gaps: `records.research_id`
nullable so group records can exist, and `teacher_id` resolved server-side from
`auth.uid()` instead of sent by the client.

**Step 1 — schema.** `classes`, `class_assignments`, `role`, nullable `school_id`.
No client changes yet.

**Step 2 — the helpers and the policies**, replacing `jwt_school_id()` everywhere
including the storage bucket. Prove it with two accounts before any client code
depends on it: a teacher assigned to one class must read that class and nothing
else, and ending the assignment must take effect on the *next query*, not the next
login. That single test is the whole reason this design exists.

**Step 3 — client session cache and the D1 clock.**

**Step 4 — password change.**

**Step 5 — head and researcher read paths.** They share plumbing (a stream that
never hands over the file, a download that goes through a logging function), so
build them together, as the roadmap says.

Steps 1 and 2 land **inside** the sync work, not after it. Retrofitting a sharing
boundary onto a shipped sync layer is the expensive version, and this project has
already written that down once.

---

## What this cannot be finished without

All four open decisions are authorisation decisions. That is not a coincidence —
it is what has been blocking this design without anyone naming it:

| Decision | Where it lands here |
|---|---|
| **D1** — offline window | the degradation clock; the only bound on a leaver's phone |
| **D4a** — records after rollover | whether `ended_on` still grants read, or only `ended_on is null` does |
| **D5** — departing teacher | `teachers.active`, which the helpers already filter on |
| **D9** — group record visibility | the `class_id is null` branch in the policy |

D5 is effectively answered by the design (switch off, one boolean, free). D1, D4a
and D9 are each one line — and none of them can be written by an engineer.
