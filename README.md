# NurseTrack Clinical v3.0 — Stable24

Official web entry: `index.html` → secure login → cloud wrapper → `app-clean-v3.html`.

## Current architecture

- Frontend: static web app hosted from this repository.
- Authentication and database: Supabase project `NurseTrack-Clinical-Secure`.
- Database access: Row Level Security (RLS) enabled on all public tables.
- Editable login cover: `module-v3-login-cover-admin.js` is available only to an active Superadministrator. It can change institution/system name, subtitle, address, phone, email, optional logo URL, footer text, contact visibility, and version visibility. Settings are stored in `nursetrack_v3_login_cover`, mirrored through NurseTrack Cloud Mirror, and applied by `login-preview.html`.
- Clinical Center: `module-v3-clinical-hub.js` provides one central NurseTrack screen linking the Clinical Catalog, Laboratory Orders, Regular Prescriptions/eRx readiness, and Behavioral Health/Substance modules.
- Membership: unique membership/renewal/payment numbering, plan management, renewals, payments, status history, alerts and automatic daily expiration refresh.
- Emergency access: `admin-emergency.html`, authorized dynamically by the active Superadministrator role.
- Password recovery: `reset-password.html`.
- Assisted recovery: `module-v3-admin-recovery.js`, visible only to Superadministrator. It can request a recovery email with documented reason/audit. Sensitive admin actions remain blocked until a server-side admin endpoint exists.
- Clinical catalog: `module-v3-clinical-catalog.js` centralizes diagnoses, laboratory tests, CPT/HCPCS services, lab-to-diagnosis/service-to-diagnosis crosswalks, optional laboratory profiles and future eRx settings. Superadministrator can add/deactivate/import/export catalog content.
- Laboratory orders: `module-v3-lab-orders.js` uses a generic laboratory catalog, supports optional receiving-lab header, diagnosis/medical-necessity suggestion, mandatory provider confirmation/edit, saved orders and printing.
- Behavioral coding: `module-v3-behavioral-crosswalk.js` connects the existing addiction/behavioral template to the central catalog so CPT/HCPCS codes can display a brief explanation and an optional diagnosis suggestion requiring professional confirmation.
- Regular prescriptions: `module-v3-erx-readiness.js` prepares non-controlled prescriptions for a future certified e-prescribing integration. Controlled prescriptions are forced to a print/external workflow. eRx activation is Superadministrator-controlled and remains non-transmitting until a validated backend/vendor exists.
- Appointment reminders: current device SMS/email fallback remains available; `api/send-reminder.js` is prepared for authenticated Telnyx SMS and Resend email when deployed on Vercel.
- PayPal readiness: `module-v3-paypal-readiness.js` reads the real NurseTrack membership balance and keeps checkout disabled until a secure server backend exists.
- PayPal public config: `api/paypal-config.js` exposes only the browser-safe PayPal client ID, environment and currency when deployed on Vercel. It never exposes the PayPal client secret.
- Backend health: `api/health.js` reports service/version and whether PayPal/Telnyx configuration is present, without returning credential values.
- Vercel configuration: `vercel.json` applies serverless settings to `api/*.js` routes and security/no-store headers.

## Login cover administration

- Only Superadministrator can see the **Editar Portada** module.
- Editable fields: institution/system name, subtitle, address, phone, email, optional logo URL and footer/notice text.
- Superadministrator can choose whether contact information and the NurseTrack version badge are visible.
- Changes are applied to the login screen and are included in Cloud Mirror synchronization.
- On a device that has never synchronized NurseTrack before, the default cover may appear until that device has authenticated and completed its first Cloud Mirror sync; subsequent logins use the synchronized cover settings.

## Clinical catalog rules

- External laboratory/vendor names are not displayed by default.
- Superadministrator may add one or more receiving laboratory profiles and explicitly enable the header on printed orders.
- Crosswalks are suggestions, not diagnoses. A provider must confirm or change the suggested diagnosis before a laboratory order is saved/printed.
- CPT/HCPCS and diagnosis records are editable and may be marked pending validation, active or inactive; historical documents should preserve the values used when created.
- The public laboratory directory located during development is dated 2023; it must not be represented as a 2026-validated code list until a newer official source is obtained.

## Behavioral health/substance coding starter references

Stable24 includes editable reference entries for commonly used behavioral/SBIRT service codes such as CPT 90832/90834/90837 and 99408/99409 plus HCPCS G0396/G0397/H0049/H0050. These remain catalog references and payer/provider rules must be validated before production billing.

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

- `PAYPAL_ENV=sandbox` while testing; change to `live` only after validation.
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET` (server-side only)
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `APP_ORIGIN=https://orellanes.github.io`

## Future eRx backend configuration

A certified e-prescribing vendor/network must be selected before transmission is enabled. Client/API secrets, callbacks and webhooks belong only in Vercel/backend secrets. Stable24 intentionally does not send prescriptions electronically. Non-controlled prescriptions can be prepared/printed; controlled prescriptions are print/external only.

## Deployment status — 2026-08-31

The connected Vercel Hobby account returned `402 payment_required` after reaching its API deployment quota. The repository is deployment-ready for the next attempt after the quota resets or the account capacity changes.

## Release rule

Stable24 is the synchronized release identifier used by the official entry, login, cloud wrapper, recovery flow, emergency access, lazy module loader and diagnostics. When runtime JavaScript changes, bump the identifier consistently to avoid stale iPhone/browser cache.

## Testing and production safety

Use fictitious/test data, PayPal Sandbox and non-production vendor credentials while validating workflows. Do not use real PHI, production payments, or production e-prescribing until hosting, agreements, credentials, access controls, logging, backups, security, billing and clinical/compliance requirements have been formally reviewed and approved.
