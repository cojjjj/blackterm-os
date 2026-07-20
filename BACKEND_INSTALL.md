# BLACKTERM OS — Unified Backend Installation

This build consolidates observer authentication, cloud profiles, achievements, live presence, NOC statistics, transmissions, missions, and Command Intelligence behind one Supabase schema.

## 1. Replace your current project

Back up your existing folder, then use this integrated project as the new working copy.

Keep your private `.env` file. It must remain beside `package.json` and contain:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```

Never use a `service_role` or `sb_secret_` key in the frontend.

## 2. Enable anonymous authentication

In Supabase:

```text
Authentication → Settings → Allow anonymous sign-ins → ON → Save changes
```

## 3. Run the unified SQL

Open this file:

```text
supabase/BLACKTERM_BACKEND_SETUP.sql
```

Paste the entire file into Supabase SQL Editor and click **Run**.

This one script is idempotent and replaces the need to run migrations 001–005 manually.

## 4. Install and start

```powershell
npm install
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue
npm run dev
```

Hard-refresh the browser with `Ctrl + Shift + R`.

## 5. Expected behavior

On first visit BLACKTERM will:

1. Create or restore an anonymous Supabase session.
2. Atomically create or load the observer profile.
3. Unlock `FIRST_CONNECTION` when possible.
4. Start a presence heartbeat without blocking the OS boot.
5. Track the current application, visits, and time online.
6. Populate the NOC with real observer and transmission data.
7. Assign a daily mission through Command Intelligence.

Open a private/incognito window to create a second observer and verify the active observer count increases.

## Important reliability change

A presence, achievement, realtime, or mission error no longer prevents BLACKTERM from opening. Core identity errors still appear in the boot overlay, while secondary backend errors appear inside the relevant application.

## Production deployment

Add both Vite environment variables in Vercel under:

```text
Project → Settings → Environment Variables
```

Redeploy after saving them.
