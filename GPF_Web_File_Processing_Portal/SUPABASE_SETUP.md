# Supabase Auth Setup

## 1. Client configuration

Create `.env.local` (next to `package.json`) with the project URL and publishable key.
Both the Vite (`VITE_`) and the Next.js (`NEXT_PUBLIC_`) names are read, so either style works:

```
VITE_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_PUBLISHABLE_KEY"

NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_PUBLISHABLE_KEY"
```

`vite.config.ts` lists `envPrefix: ['VITE_', 'NEXT_PUBLIC_']` so both prefixes reach the browser.
The older `VITE_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` names are accepted as a fallback.

## 2. Provision the backend (required once)

> **Live deployment checklist** — if the sign-in screen shows
> “উপজেলা account যাচাই করা যায়নি। আবার চেষ্টা করুন।”, “এই ইমেইলের জন্য অনুমোদিত
> উপজেলা প্রোফাইল পাওয়া যায়নি।” or “উপজেলা ID সেবা এখনো চালু হয়নি।”, then this step has
> **not** been run against the live project. Confirm it with
> `POST {VITE_SUPABASE_URL}/rest/v1/rpc/is_upazila_available` — a `404` means
> `supabase/schema.sql` was never applied, and
> `POST {VITE_SUPABASE_URL}/functions/v1/sign-in-by-upazila` — a `404` means the
> edge function was never deployed. Run the command below once per environment.

The portal talks to two Supabase pieces that must exist before sign-in works: the
`public.profiles` table (with its RLS policies and triggers) and the `sign-in-by-upazila`
edge function. Both are created by one command:

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_..."   # https://supabase.com/dashboard/account/tokens
npm run supabase:setup
```

The script applies `supabase/schema.sql` and deploys the edge function. It only needs a
personal access token, never a database password, and is safe to re-run.

### Manual alternative

1. Open the project's **SQL Editor** and run `supabase/schema.sql`.
2. Deploy the function with the CLI: `supabase functions deploy sign-in-by-upazila --project-ref <ref>`
   (the function ships with `verify_jwt = false`, matching `supabase/config.toml`).

## 3. Sign in

The sign-in form accepts **either a upazila ID or a verified email**:

* **Upazila ID** (for example `Bea002`) — resolved to its verified email by the
  `sign-in-by-upazila` edge function, which uses the service-role key on the server.
* **Email** — signed in directly through `supabase.auth.signInWithPassword`.

### Offline demo fallback

Supabase is always tried first. If the backend is not reachable yet (function not
deployed, schema not applied), an identifier that matches the built-in directory in
`src/data/mockData.ts` still signs in with a local **demo session**, so the portal can be
demonstrated before provisioning. The user card then shows a `ডেমো (অফলাইন) সেশন` badge
instead of `সক্রিয় সাইন-ইন সেশন`, and the session is remembered in `localStorage`.

Run `npm run supabase:setup` to remove this fallback for real accounts: once the backend
answers normally, Supabase credentials decide the sign-in and the demo path is skipped.

## 4. Invite a user

Provision accounts from Supabase Auth; public self-registration is not enabled for
admin-created accounts. Invite the user's verified email in the Supabase dashboard, then
create the matching profile row in SQL Editor, replacing the example values:

```sql
insert into public.profiles (
  user_id,
  email,
  upazila_code,
  upazila_name_bn,
  district_name_bn,
  role
)
select
  id,
  email,
  'Bea002',
  'বিয়ানীবাজার',
  'সিলেট',
  'upazila_user'
from auth.users
where email = 'verified-user@example.com';
```

Users can also create their own upazila account from the sign-in screen
(`AccountRegistrationModal`). The `create_upazila_profile_for_signup` trigger writes the
profile, and the unique index on `upazila_code` guarantees one account per upazila.

The user's email is verified by Supabase Auth. Regular users can read only their own
profile; super admins can read the profile directory for account management. The
service-role key must never be placed in `.env.local` or any `VITE_`/`NEXT_PUBLIC_` variable.

## 5. First sign-in and recovery

After accepting the invite, Supabase returns the user to the app with a verified session.
Accounts marked `password_setup_required` are prompted to set a password and confirm the
recovery email. If they enter a different personal email, Supabase sends a confirmation
link before that address becomes the recovery email. Forgot-password sends a recovery code
to the verified Auth email; Supabase validates the code before accepting a new password.
