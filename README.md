# Desi Occasions — Next.js + Supabase + WhatsApp + Stripe (Scaffold)

This is a production-grade scaffold for:
- Vendor storefronts (daily meals + occasion packages)
- Vendor dashboard (menu CRUD + gallery upload)
- Order placement + tracking
- WhatsApp notifications (Twilio or WhatsApp Cloud)
- Stripe deposits + subscription scaffolding

## 1) Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 2) Supabase

1. Create a Supabase project.
2. In SQL editor, run: `supabase/schema.sql`.
3. Create Storage bucket: `vendor-gallery` (public for MVP).
4. Set env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

## 3) WhatsApp notifications

### Option A: Twilio WhatsApp (fastest)
Set:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`

### Option B: Meta WhatsApp Cloud API
Set:
- `WHATSAPP_CLOUD_TOKEN`
- `WHATSAPP_CLOUD_PHONE_NUMBER_ID`

Choose provider by setting:
- `WHATSAPP_PROVIDER=twilio` or `WHATSAPP_PROVIDER=cloud`

## 4) Stripe

Set:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Optional subscription support:
- Create a recurring Price in Stripe and set `PRICE_ID_SUBSCRIPTION`.

Webhook endpoint:
- `/api/stripe/webhook`

## Notes

This scaffold keeps write policies open for speed. Before production, restrict RLS policies by authenticated user and vendor ownership.


## v2: Order builder + shared tracking
- Vendor pages now collect customer + delivery details.
- Orders include customer_whatsapp_e164 and delivery_map_url; status updates notify both vendor and customer via /api/whatsapp/send.
- Run supabase/schema.sql (includes ALTER TABLE additions).


## v3: Cart totals, Accept/Decline, Reorder
- Vendor storefront shows subtotal/total and accepts optional delivery fee.
- Orders store delivery_fee_gbp and total_gbp.
- Order page shows vendor-only Accept/Decline buttons (any logged-in session).
- Daily orders support Reorder, pre-filling items and delivery details.


## v4: Capacity limits, confirmation page, and Today's Orders
- Vendors can set optional capacities for breakfast/lunch/dinner in the dashboard.
- Customer selects delivery date; daily orders enforce capacity per date+slot.
- New order confirmation route: /order/confirmation/[id]
- Vendor daily operations: /vendor/dashboard/orders (filter by date + slot, update statuses, WhatsApp notify customers).



## v8: Multi-faith occasion imagery + vendor photos
### Vendor photos (Supabase Storage)
Create a public bucket named `vendor-media` in Supabase Storage.
Recommended policies (authenticated uploads):
- Allow authenticated users to upload to `vendor-media`
- Allow public read access (or use signed URLs if preferred)

New vendor fields:
- `vendors.cover_image_url`
- `vendors.gallery_urls` (text[])

Pages updated:
- Home: multi-faith occasions section (Diwali, Eid, Vaisakhi/Gurpurab, Christmas, Paryushan, Vesak)
- Vendors directory: shows cover thumbnail if present
- Vendor page: hero cover + gallery
- Vendor dashboard: upload cover + gallery via Supabase Storage


### Menu/brochure uploads
Vendors can upload a PDF menu/brochure to the `vendor-media` bucket (stored as `vendors.menu_pdf_url`).


## v10: Occasion filters + dietary filters + packages
New vendor fields:
- vendors.supported_occasions (text[])
- vendors.dietary_tags (text[])
- vendors.packages (jsonb array)
Pages:
- /vendors: filter by occasion + food preference
- /vendor/[slug]: shows support tags + packages
- /vendor/dashboard: manage occasions, dietary tags, packages


## v12: Package occasions dropdown
Vendor packages now support:
- occasions_keys: string[] (keys mapped to friendly labels)
- occasions_other: string (optional free text)
Legacy field `occasions` is still supported for existing data.
