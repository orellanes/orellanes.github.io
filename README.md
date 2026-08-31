# NurseTrack Clinical v3.0 — Stable20

Official web entry: `index.html` → secure login → cloud wrapper → `app-clean-v3.html`.

## Current architecture

- Frontend: static web app hosted from this repository.
- Authentication and database: Supabase project `NurseTrack-Clinical-Secure`.
- Database access: Row Level Security (RLS) enabled on all public tables.
- Membership: unique membership/renewal/payment numbering, plan management, renewals, payments, status history, alerts and automatic daily expiration refresh.
- Emergency access: `admin-emergency.html`, authorized dynamically by the active Superadministrator role.
- Password recovery: `reset-password.html`.
- Appointment reminders: current device SMS/email fallback remains available; `api/send-reminder.js` is prepared for authenticated Telnyx SMS and Resend email when deployed on Vercel.

## Vercel environment variables for reminders

Configure these only in Vercel Project Settings. Never commit their values to GitHub:

- `APP_ORIGIN=https://orellanes.github.io`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `TELNYX_API_KEY`
- `TELNYX_FROM_NUMBER`
- `TELNYX_MESSAGING_PROFILE_ID` (optional)
- `RESEND_API_KEY` (optional, for email reminders)
- `REMINDER_FROM_EMAIL` (optional, for email reminders)

## Release rule

Stable20 is the synchronized release identifier used by the official entry, login, cloud wrapper, recovery flow, lazy module loader and diagnostics. When changing runtime JavaScript, bump the release identifier consistently to prevent stale iPhone/browser cache.

## Testing and production safety

Use fictitious/test data while validating the application. Do not enter real PHI until the hosting, agreements, access controls, logging, backup, security and compliance posture required for the intended clinical use have been formally reviewed and approved.
