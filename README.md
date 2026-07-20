# BLACKTERM Live Backend v1

This patch makes the existing Supabase backend drive the Network Operations Center.

## What changes

- Presence heartbeat starts globally when BLACKTERM authenticates
- Heartbeat refreshes every 30 seconds
- Observers appear online without opening the NOC first
- Secure database RPC validates the current authenticated observer
- NOC counters come from real `observers`, visits, transmissions, and presence rows
- Realtime is enabled for presence and transmissions
- Backend errors now include the actual Supabase message

## Install

1. Copy these files into the existing project:

```text
src/context/ObserverNetworkContext.tsx
src/services/networkOperationsService.ts
```

2. Replace the existing versions when prompted.

3. Run this migration in Supabase SQL Editor:

```text
supabase/migrations/005_live_backend.sql
```

4. Restart Vite and clear its module cache:

```powershell
Ctrl + C
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue
npm run dev
```

5. Hard-refresh the browser with `Ctrl + Shift + R`.

## Expected result

After the Observer Network boot completes:

- Active Observers should show at least `1`
- Total Observers should show the number of observer rows
- Network Connections should show the sum of observer visits
- Live Presence should show the current Observer ID
- Seeded transmissions should appear in the NOC

Open a private/incognito browser window to create a second anonymous observer and watch the live count increase.
