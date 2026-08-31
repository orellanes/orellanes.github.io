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
- PayPal: `api/paypal-config.js` exposes only the browser-safe client ID/environment configuration. The intended checkout architecture is server-side order creation and capture, using the authenticated Supabase user session, with the amount derived from the NurseTrack membership balance and the completed PayPal capture ID stored as the payment reference.

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
- `PAYPAL_CLIENT_ID` (browser-safe identifier, supplied to the PayPal SDK through the config endpoint).
- `PAYPAL_CLIENT_SECRET` (server-side secret only; never expose it in frontend code).
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `APP_ORIGIN=https://orellanes.github.io`

### Intended PayPal payment flow

1. User selects an existing NurseTrack membership.
2. Server validates the authenticated Supabase session and company access.
3. Server reads the outstanding membership balance from Supabase; the browser does not choose the charge amount.
4. Server creates a PayPal Orders v2 order in USD for that exact balance.
5. Buyer approves the PayPal checkout.
6. Server captures the order and verifies PayPal reports the capture as completed.
7. NurseTrack records the payment through its existing membership payment function, using `PayPal` as the method and the PayPal capture ID as the transaction reference.
8. Supabase recalculates the membership balance/payment status; when balance reaches zero, the membership payment state becomes paid.

## Release rule

Stable20 is the synchronized release identifier used by the official entry, login, cloud wrapper, recovery flow, lazy module loader and diagnostics. When changing runtime JavaScript, bump the release identifier consistently to prevent stale iPhone/browser cache.

## Testing and production safety

Use PayPal Sandbox and fictitious/test data while validating payment flows. Do not enter real PHI or accept production membership payments until the hosting, agreements, access controls, logging, backup, security, payment handling and compliance posture required for the intended clinical use have been formally reviewed and approved.
