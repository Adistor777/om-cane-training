# DPDP Compliance Map — O&M Cane Training

_For legal-team review. Maps each DPDP Act 2023 / DPDP Rules 2025 obligation to the concrete control in the app. Rules notified 13 Nov 2025 (G.S.R. 846(E)); registration/consent obligations phase in by 13 May 2027. Penalty ceiling for children's-data failures: ₹200 crore._

_Status legend: ✅ implemented · 🟡 implemented, needs legal sign-off · 🔴 open._

## §5–6 + Rule 3 — Notice and consent

- 🟡 **Privacy policy** drafted (`PRIVACY-POLICY.md`) covering data items, purpose, rights, grievance, retention. Needs: fiduciary legal entity, grievance officer, effective date, Hindi version, hosting URL (required for Play Store).
- 🟡 **Guardian consent form** drafted (`GUARDIAN-CONSENT-FORM.pdf`) — paper form matching the app's "Signed paper form" consent method. Assessment consent and video consent are **separate signature blocks** (consent must be specific; video is optional and refusable without affecting participation).

## §9 + Rule 10 — Children's data, verifiable parental consent

- ✅ **Verifiable consent record in-app:** per-child `videoConsentBy` (guardian name), `videoConsentRelation` (Mother/Father/Legal guardian), `videoConsentMethod`, `videoConsentOn`. A bare tick cannot be saved — name and relation are required.
- ✅ **Video hard-gated:** capture UI locked and `commitPendingVideo()` refuses (fail-closed) for any child without consent on file. Enforcement is at the write chokepoint, not just the UI.
- 🟡 **Identity due diligence:** Rule 10 expects the fiduciary to verify the parent's identity/relationship (e.g. government ID sighted by the school when the paper form is signed). The form includes an ID-sighted line for the school to complete. Legal to confirm this satisfies due diligence for an offline school-mediated pilot (DigiLocker integration is impractical here).
- ✅ **§9(3) prohibitions:** no tracking, no behavioural monitoring, no advertising anywhere in the app.
- 🟡 **Rule 11 note:** Rule 11 (guardians of persons with disability) applies to adults with lawful guardians; our subjects are children, so Rule 10 is the operative path. Legal to confirm.
- 🔴 **Exemption question for legal:** the Rules exempt certain processing by educational institutions from parts of §9. Confirm whether the pilot qualifies — the app takes consent regardless, so this affects paperwork, not the build.

## §6(6) + §12 — Withdrawal and erasure

- ✅ **Withdrawal flow:** unticking consent stamps `videoConsentWithdrawnOn` while preserving the original grant record (audit trail is never wiped). Future capture blocked immediately.
- ✅ **Erasure on withdrawal:** if stored clips exist, the teacher is prompted to delete them; deletion removes files and strips record pointers.
- ✅ **Erasure completeness:** per-record delete, per-child delete, and full device wipe all delete video **files**, not just database pointers — no orphaned children's data on disk.
- ✅ **Consent state visible:** child-detail screen shows on-file / withdrawn / absent status with dates.

## §8 — Security safeguards, minimisation

- ✅ **Pseudonymisation:** random `researchId` minted at enrolment keys all records, video filenames, and exports. Default CSV export omits name and DOB; guardian identity (PII) exports only on the explicit key sheet.
- ✅ **Consent coverage auditable:** every export row carries consent status / granted / withdrawn dates, so researchers can prove no video row lacks consent.
- ✅ Exported temp files deleted from OS cache after sharing; photos stored low-resolution; app data in private storage.
- 🔴 **Cloud phase (Supabase):** India-region project, RLS per school, JWT claims — roadmap items 4–6. Re-review this map before sync ships.

## Play Store (roadmap item 8)

- 🟡 **Target audience: 18+ (teachers).** Children never operate the app, so the Families / Designed-for-Families programme should not be triggered. Data Safety form must still disclose the children's data the app handles — answers drafted in `PLAY-DATA-SAFETY.md`.
- 🔴 Privacy policy must be hosted at a public URL before the Play listing.

## Open items for humans

1. Legal: fiduciary entity, grievance officer, effective date, exemption question, Rule 10 due-diligence sign-off.
2. Content team: Hindi translation of the consent form (text supplied in `GUARDIAN-CONSENT-FORM-HINDI.md`) and privacy policy.
3. Aditya: host the privacy policy; run `npx cap sync android` on the Mac (sandbox sync failed on EPERM); emulator-verify the consent flow; commit.
