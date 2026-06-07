# D's Designs — Setup Guide

This walks you through **everything** to take the site from the code on your
machine to a live store. Follow the steps in order. Nothing here requires
coding — it's copy, paste and click.

The site **already runs without any of this** on built-in sample data — see
[Step 1](#1-run-it-locally-right-now). Supabase, Razorpay and email are only
needed to go fully live (real products, logins, payments, order emails).

---

## 1. Run it locally right now

You need [Node.js](https://nodejs.org) 18+ installed (you have v26 ✓).

```powershell
cd C:\Users\sreedhar\Desktop\baskets
npm install        # only needed the first time
npm run dev
```

Open **http://localhost:3000**. You'll see the full site with sample products,
all 9 categories, cart and a working Cash-on-Delivery checkout (orders aren't
saved yet — that needs Supabase below).

To stop the server, press `Ctrl + C` in the terminal.

---

## 2. Create your Supabase project (database + logins + image storage)

1. Go to **https://supabase.com** → sign in → **New project**.
2. Name it `dsdesigns`, choose a region near you (e.g. **Mumbai**), set a strong
   database password (save it somewhere).
3. Wait ~2 minutes for it to finish provisioning.

### 2a. Run the SQL
1. In your project: left sidebar → **SQL Editor** → **New query**.
2. Open the file [`supabase/schema.sql`](supabase/schema.sql) in this project,
   **copy everything**, paste it into the editor, click **Run**.
3. You should see "Success. No rows returned." This created all tables, security
   rules, the image storage bucket, and your 9 categories.

### 2b. Get your API keys
Left sidebar → **Project Settings** → **API**. Copy these three values:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key (click *reveal*) → `SUPABASE_SERVICE_ROLE_KEY`
  ⚠️ The service_role key is secret — never share it or put it in the browser.

Paste them into your `.env.local` file (see [Step 6](#6-fill-in-envlocal)).

---

## 3. Make yourself the admin

1. Start the site (`npm run dev`) with your Supabase keys in `.env.local`.
2. Go to **http://localhost:3000/signup** and create an account with your email.
3. Back in Supabase → **SQL Editor** → run this (use the email you signed up with):

   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
   ```
4. Now visit **http://localhost:3000/admin** — you can add products (with images
   and prices), manage orders, edit reviews, paste Instagram links, and set
   shipping fees.

---

## 4. Razorpay (online UPI / card payments) — optional

Cash on Delivery works without this. Add Razorpay when you want online payments.

1. Sign up at **https://razorpay.com** and complete KYC (needed for live mode).
2. Dashboard → **Settings → API Keys → Generate Key**. Copy:
   - **Key Id** → `RAZORPAY_KEY_ID` **and** `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - **Key Secret** → `RAZORPAY_KEY_SECRET`
   - Use **Test Mode** keys (`rzp_test_…`) first to try it with test cards.
3. **Webhook** (so payments are confirmed even if the customer closes the tab):
   - Dashboard → **Settings → Webhooks → Add New Webhook**.
   - URL: `https://YOUR-SITE-URL/api/webhooks/razorpay`
     (use your Vercel URL once deployed; for local testing you can skip this).
   - Select events: `payment.captured`, `payment.failed`, `order.paid`.
   - Set a **secret** → put the same value in `RAZORPAY_WEBHOOK_SECRET`.

---

## 5. Order confirmation emails (Resend) — optional

Sends an automatic confirmation to the customer and an alert to you on every
order. Without this, orders still appear in your admin dashboard.

1. Sign up at **https://resend.com** (free tier ~3,000 emails/month).
2. **API Keys → Create API Key** → copy it → `RESEND_API_KEY`.
3. `ORDER_FROM_EMAIL`:
   - To test immediately, use `onboarding@resend.dev`.
   - To send from your own address, add & verify your domain in Resend, then use
     e.g. `orders@yourdomain.com`.
4. `OWNER_ALERT_EMAIL` — the email **you** want new-order alerts sent to.

> WhatsApp confirmations need no setup — every order page and email already
> includes a tap-to-WhatsApp button to **9344773028**.

---

## 6. Fill in `.env.local`

Open `.env.local` in the project root and paste your values. It starts blank
(so the site runs on sample data). Filled in, it looks like:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://abcdxyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx

RESEND_API_KEY=re_xxxx
ORDER_FROM_EMAIL=onboarding@resend.dev
OWNER_ALERT_EMAIL=you@example.com

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

After editing `.env.local`, **stop and restart** `npm run dev` for changes to apply.

---

## 7. Add your real products

In **/admin → Products → New product**:
- Enter name, pick a category, set the **price in ₹** and stock.
- **Upload photos** (drag your basket images in — they go to Supabase Storage).
- Tick **Featured** to show it on the home page. Save.

Your 9 categories are already created. The sample products only appear until you
add real ones (real DB products replace the samples automatically).

In **/admin → Settings** you can set the shipping fee, free-shipping threshold,
contact details, Instagram URL and the announcement bar.

In **/admin → Instagram**, paste links to your posts (e.g.
`https://www.instagram.com/p/XXXX/`) to fill the Happy Customers page.

---

## 8. Deploy to the web (Vercel)

1. Push the code to GitHub (see [Step 9](#9-push-to-github)).
2. Go to **https://vercel.com** → sign in with GitHub → **Add New → Project** →
   import `Sreedhar616/baskets`.
3. **Environment Variables**: add every line from your `.env.local` (set
   `NEXT_PUBLIC_SITE_URL` to your Vercel URL, e.g. `https://baskets.vercel.app`).
   Use **live** Razorpay keys here when you're ready to take real payments.
4. Click **Deploy**. You'll get a public link to share with anyone.
5. In Supabase → **Authentication → URL Configuration**, add your Vercel URL to
   **Site URL** and **Redirect URLs**, or logins will fail in production.
6. Add the production webhook URL in Razorpay (Step 4.3) using your Vercel domain.

---

## 9. Push to GitHub

```powershell
cd C:\Users\sreedhar\Desktop\baskets
git init
git add .
git commit -m "D's Designs e-commerce site"
git branch -M main
git remote add origin https://github.com/Sreedhar616/baskets.git
git push -u origin main
```

If prompted, sign in to GitHub. Your secrets in `.env.local` are **not** pushed
(they're gitignored) — only `.env.example` is, which is safe.

---

## Quick reference

| What | Where |
|------|-------|
| Run locally | `npm run dev` → http://localhost:3000 |
| Admin dashboard | http://localhost:3000/admin |
| All SQL to run | [`supabase/schema.sql`](supabase/schema.sql) |
| Your secrets | `.env.local` (never commit) |
| Contact phone used in site | 9344773028 |
| Instagram | https://www.instagram.com/designsofds |
| WhatsApp catalogue | https://wa.me/c/919344773028 |

Need help on any step? Re-read the section above — each key tells you exactly
where to paste it.
