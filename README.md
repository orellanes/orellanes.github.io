# NurseTrack Clinical v3.0 — Stable21

Official web entry: `index.html` → secure login → cloud wrapper → `app-clean-v3.html`.

## Current architecture

- Frontend: static web app hosted from this repository.
- Authentication and database: Supabase project `NurseTrack-Clinical-Secure`.
- Database access: Row Level Security (RLS) enabled on all public tables.
- Membership: unique membership/renewal/payment numbering, plan management, renewals, payments, status history, alerts and automatic daily expiration refresh.
- Emergency access: `admin-emergency.html`, authorized dynamically by the active Superadministrator role.
- Password recovery: `reset-password.html`.
- Appointment reminders: current device SMS/email fallback remains available; `api/send-reminder.js` is prepared for authenticated Telnyx SMS and Resend email when deployed on Vercel.
- PayPal readiness: `module-v3-paypal-readiness.js` is loaded with the Membership module. It reads the real NurseTrack membership balance, displays PayPal activation status, and keeps checkout disabled until a secure server backend exists.
- PayPal public config: `api/paypal-config.js` exposes only the browser-safe PayPal client ID, environment and currency when deployed on Vercel. It never exposes the PayPal client secret.

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

## Vercel environment variables for PayPal

Configure these only in Vercel Project Settings. Never commit secret values to GitHub:

- `PAYPAL_ENV=sandbox` while testing; change to `live` only after validation.
- `PAYPAL_CLIENT_ID` (browser-safe identifier).
- `PAYPAL_CLIENT_SECRET` (server-side secret only; never expose it in frontend code).
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `APP_ORIGIN=https://orellanes.github.io`

### Planned secure PayPal payment flow

1. User selects an existing NurseTrack membership.
2. Server validates the authenticated Supabase session and company access.
3. Server reads the outstanding membership balance from Supabase; the browser does not choose the charge amount.
4. Server creates a PayPal order in USD for that exact balance.
5. Buyer approves checkout in PayPal.
6. Server captures the order and verifies PayPal reports a completed capture.
7. NurseTrack records the payment through its existing membership payment function, using `PayPal` as the method and the PayPal capture ID as the transaction reference.
8. Supabase recalculates the membership balance/payment status; when balance reaches zero, the membership payment state becomes paid.

The order-creation/capture backend is intentionally **not active yet**. It requires a connected Vercel project and server-side credentials, and real payment execution must not occur from static GitHub Pages or expose secrets in browser code.

## Release rule

Stable21 is the synchronized release identifier used by the official entry, login, cloud wrapper, recovery flow, emergency access, lazy module loader and diagnostics. When changing runtime JavaScript, bump the release identifier consistently to prevent stale iPhone/browser cache.

## Testing and production safety

Use PayPal Sandbox and fictitious/test data while validating payment flows. Do not enter real PHI or accept production membership payments until the hosting, agreements, access controls, logging, backup, security, payment handling and compliance posture required for the intended clinical use have been formally reviewed and approved.
