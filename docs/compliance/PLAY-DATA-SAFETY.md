# Play Console — Data Safety form answers (draft)

_For the internal/closed testing track and later production. Answers reflect the app AS IT IS TODAY (offline, no sync). Re-do this form before enabling Supabase sync — "data shared/transferred off device" answers change._

## Overview questions

**Does your app collect or share any of the required user data types?** Yes (data is entered by the teacher and stored on device; CSV/video export via the OS share sheet counts as collection).
**Is all of the user data collected by your app encrypted in transit?** Not applicable today (no network transmission). Once sync ships: Yes (HTTPS).
**Do you provide a way for users to request that their data is deleted?** Yes — in-app per-child delete, per-record delete, and full data wipe; plus grievance contact in the privacy policy.
**Target audience:** 18+ (teachers). Do NOT include children in the target-audience declaration — children are data subjects, not users.

## Data types to declare

**Personal info → Name:** Collected. Purpose: app functionality (child roster, assessment attribution). Not shared. Optional: no (required to enrol a child). Note: guardian names collected as part of the consent record.
**Personal info → Other info:** Collected — date of birth, height, weight, dominant hand, consent records.
**Photos and videos → Photos:** Collected, optional — low-resolution child photo for on-device identification.
**Photos and videos → Videos:** Collected, optional — teacher-filmed activity clips, only with recorded guardian consent.
**Health and fitness / Other:** If the reviewer treats disability-related assessment data as health info, declare under "Health info": assessment results relating to orientation-and-mobility skills of visually impaired children. Purpose: app functionality / research.
**App activity, App info, Device IDs, Location, Financial info, Contacts, Messages, Browsing:** Not collected.

## Security practices section

- Data encrypted in transit: N/A today; Yes after sync.
- Data deletion mechanism: Yes.
- Independent security review badge: No (not sought).

## Notes for the reviewer text box

"This app is used exclusively by trained teachers at three partner schools in a closed research pilot for visually impaired children's cane training. Children do not use the app. All child data is entered by teachers with documented parental consent, pseudonymised with random research IDs, and stored in the app's private storage on the device. No advertising, tracking, analytics SDKs, or third-party data sharing."
