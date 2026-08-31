# NurseTrack Clinical v3.0 — Stable25

Official web entry: `index.html` → secure login → cloud wrapper → `app-clean-v3.html`.

## Current architecture

- Frontend: static web app hosted from this repository.
- Authentication and database: Supabase project `NurseTrack-Clinical-Secure`.
- Database access: Row Level Security (RLS) enabled on all public tables.
- PWA: `manifest.webmanifest`, `nursetrack-icon.svg`, and `service-worker.js` support installed/standalone access while keeping runtime requests network-first/no-store to reduce stale-version problems.
- Editable login cover: `module-v3-login-cover-admin.js` is available only to an active Superadministrator. It can change institution/system name, subtitle, address, phone, email, optional logo URL, footer text, contact visibility, and version visibility. Settings are stored in `nursetrack_v3_login_cover`, mirrored through NurseTrack Cloud Mirror, and applied by `login-preview.html`.
- Clinical Center: `module-v3-clinical-hub.js` provides one central NurseTrack screen linking the Clinical Catalog, Laboratory Orders, Regular Prescriptions/eRx readiness, and Behavioral Health/Substance modules.
- Membership: unique membership/renewal/payment numbering, plan management, renewals, payments, status history, alerts and automatic daily expiration refresh.
- Membership status security: `nursetrack_change_membership_status` now requires active Superadministrator, Company Administrator for the membership company, or Membership Manager for the membership company. Clinical/read-only users cannot suspend/reactivate/cancel memberships. Status history is recorded once by the update trigger; the RPC updates that entry with the user-supplied reason instead of inserting a duplicate.
- Emergency access: `admin-emergency.html`, authorized dynamically by the active Superadministrator role.
- Password recovery: `reset-password.html`.
- Assisted recovery: `module-v3-admin-recovery.js`, visible only to Superadministrator. It can request a recovery email with documented reason/audit. Sensitive admin actions remain blocked until a server-side admin endpoint exists.
- Clinical catalog: `module-v3-clinical-catalog.js` centralizes diagnoses, laboratory tests, CPT/HCPCS services, lab-to-diagnosis/service-to-diagnosis crosswalks, optional laboratory profiles and future eRx settings.
- Laboratory orders: `module-v3-lab-orders.js` uses a generic laboratory catalog, supports optional receiving-lab header, diagnosis/medical-necessity suggestion, mandatory provider confirmation/edit, saved orders and printing.
- Behavioral coding: `module-v3-behavioral-crosswalk.js` connects behavioral/addiction documentation to the central catalog so CPT/HCPCS codes can display a brief explanation and optional diagnosis suggestion requiring professional confirmation.
- Regular prescriptions: `module-v3-erx-readiness.js` prepares non-controlled prescriptions for future certified e-prescribing integration. Controlled prescriptions remain print/external only.
- Backend settings: `module-v3-backend-settings.js` is Superadministrator-only and stores only the public Vercel base URL. `module-v3-backend-cloud-bridge.js` synchronizes that configuration through NurseTrack cloud storage.
- Appointment reminders: `visit-agenda.js` attempts authenticated secure sending through `Vercel → api/send-reminder.js → Telnyx/Resend` when the backend is configured, and keeps the device SMS/mail client as fallback.
- PayPal readiness: `module-v3-paypal-readiness.js` reads membership balance and keeps checkout disabled until a secure server backend exists.
- Backend health: `api/health.js` reports Stable25 plus whether PayPal/Telnyx environment configuration is present, without returning credential values.
- Vercel configuration: `vercel.json` applies serverless settings to `api/*.js` routes and security/no-store headers.

## Login cover administration

- Only Superadministrator can see **Editar Portada**.
- Editable fields: institution/system name, subtitle, address, phone, email, optional logo URL and footer/notice text.
- Superadministrator can choose whether contact information and the NurseTrack version badge are visible.
- Changes are included in cloud synchronization.
- On a device that has never synchronized NurseTrack before, the default cover may appear until that device has authenticated and completed its first cloud sync; subsequent logins use the synchronized cover settings.

## Clinical catalog rules

- External laboratory/vendor names are not displayed by default.
- Superadministrator may add receiving laboratory profiles and explicitly enable the header on printed orders.
- Crosswalks are suggestions, not diagnoses. A provider must confirm or change the suggested diagnosis before a laboratory order is saved/printed.
- CPT/HCPCS and diagnosis records are editable and may be marked pending validation, active or inactive.
- The public laboratory directory located during development is dated 2023; it must not be represented as a 2026-validated code list until a newer official source is obtained.

## Behavioral health/substance coding starter references

Stable25 includes editable reference entries for CPT 90832/90834/90837 and 99408/99409 plus HCPCS G0396/G0397/H0049/H0050. These remain reference seeds and payer/provider rules must be validated before production billing.

## Telnyx status — 2026-08-31

- Messaging Profile: created for NurseTrack.
- Sender number: assigned and active in the profile.
- Allowed destinations: North America enabled for the intended Puerto Rico/US +1 workflow.
- 10DLC Brand: resubmitted and currently `Registration pending` after previously showing `Registration failed`.
- Do not create a duplicate Brand or Campaign while the Brand remains pending.
- After Brand approval: create/approve the 10DLC Campaign, associate the sender number, configure Vercel secrets, then perform a fictitious SMS test through NurseTrack.

## Vercel environment variables for reminders

Configure these only in Vercel Project Settings. Never commit their values to GitHub:

- `APP_ORIGIN=https://orellanes.github.io`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `TELNYX_API_KEY`
- `TELNYX_FROM_NUMBER`
- `TELNYX_MESSAGING_PROFILE_ID` (optional)
- `RESEND_API_KEY` (optional)
- `REMINDER_FROM_EMAIL` (optional)

## Vercel environment variables for PayPal

- `PAYPAL_ENV=sandbox`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET` (server-side only)
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `APP_ORIGIN=https://orellanes.github.io`

## Future eRx backend configuration

A certified e-prescribing vendor/network must be selected before transmission is enabled. Client/API secrets, callbacks and webhooks belong only in the backend. Stable25 intentionally does not send prescriptions electronically. Non-controlled prescriptions can be prepared/printed; controlled prescriptions are print/external only.

## Vercel deployment status — 2026-08-31

The connected Vercel team is active on Hobby, but there is currently no persistent project returned by the Vercel Projects API. An earlier deployment attempt produced a temporary deployment URL but did not leave a retrievable persistent project. Do not configure NurseTrack with an unverified/temporary URL. The next deployment must create or import a persistent Vercel project, then `/api/health` must be verified before the base URL is saved in NurseTrack.

## Release rule

Stable25 is the synchronized release identifier used by the official entry, login, cloud wrapper, recovery flow, emergency access, lazy module loader, diagnostics, and backend health. Runtime changes that require cache invalidation should be versioned consistently.

## Testing and production safety

Use fictitious/test data, PayPal Sandbox and non-production vendor credentials while validating workflows. Do not use real PHI, production payments, or production e-prescribing until hosting, agreements, credentials, access controls, logging, backups, security, billing and clinical/compliance requirements have been formally reviewed and approved.
