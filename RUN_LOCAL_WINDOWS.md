# Run Desi Occasions locally on Windows (v12)

## One-command setup + run
Open PowerShell in the project folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

This will:
- run `npm install`
- create `.env.local` from `.env.local.example` if missing
- validate required env vars (Supabase)
- start the dev server

Open:
- http://localhost:3000

## Supabase setup (required for full flow)
### Database
Run `supabase/schema.sql` in Supabase SQL editor.

### Storage
Create a Storage bucket: `vendor-media`
- Public read: ON
- Upload: authenticated users (recommended)

## Test flows
### Customer (no login)
- `/vendors` filter by Occasion + Food
- open a vendor profile and view packages/gallery/menu

### Vendor (login)
- `/auth` sign up
- `/vendor/dashboard` upload photos + PDF menu
- set dietary + occasions + packages
