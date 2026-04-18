# PropDesk Pro — Setup & Deployment Guide

## What's in this project

```
propdeskpro/
├── app/
│   ├── layout.tsx              ← Root layout with Clerk auth
│   ├── dashboard/
│   │   ├── layout.tsx          ← Dashboard sidebar + nav
│   │   ├── page.tsx            ← Overview page with stats
│   │   ├── challenge/          ← Challenge tracker page
│   │   ├── risk/               ← Position size calculator
│   │   ├── journal/            ← Trade journal
│   │   ├── stacker/            ← Multi-account stacker
│   │   └── simulator/          ← Monte Carlo simulator
│   └── api/
│       ├── trades/route.ts     ← GET/POST trades
│       ├── accounts/route.ts   ← GET/POST funded accounts
│       └── stripe/webhook/     ← Stripe payments
├── lib/
│   └── db.ts                   ← Prisma client singleton
├── prisma/
│   └── schema.prisma           ← DB schema (User, Trade, FundedAccount, Challenge)
├── public/
│   └── index.html              ← Landing page (deploy this immediately)
├── .env.example                ← Copy to .env.local
├── vercel.json                 ← Vercel deployment config
└── package.json
```

---

## Step 1 — Deploy the landing page (TODAY, 10 minutes)

The landing page is a single HTML file. No build step needed.

1. Create a free account at https://vercel.com
2. Create a new project → "Deploy from template" → Static Site
3. Upload `public/index.html`
4. Set your domain (e.g. propdeskpro.com)
5. **Live in 2 minutes.**

---

## Step 2 — Set up services (1 hour)

### Clerk (auth) — https://clerk.com
1. Create app → "Next.js"
2. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
3. Set redirect URLs to `/dashboard`

### Supabase (database) — https://supabase.com
1. Create new project
2. Go to: Settings → Database → Connection String
3. Copy "Transaction pooler" URL → `DATABASE_URL`
4. Copy "Session pooler" URL → `DIRECT_URL`

### Stripe (payments) — https://stripe.com
1. Create a product: "PropDesk Pro" at $29/month
2. Copy the Price ID → `STRIPE_PRO_PRICE_ID`
3. Copy Secret Key → `STRIPE_SECRET_KEY`
4. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`
5. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

---

## Step 3 — Local development

```bash
# Clone / open project
cd propdeskpro

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
# Fill in all values from Step 2

# Push DB schema to Supabase
npx prisma db push

# Start dev server
npm run dev
# → http://localhost:3000
```

---

## Step 4 — Deploy to Vercel (production)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# Project → Settings → Environment Variables
# Add all keys from .env.example
```

Or connect GitHub repo to Vercel for automatic deploys on push.

---

## Step 5 — Add affiliate links

Sign up for these affiliate programs and replace links in the landing page:

| Firm       | Program URL                        | Payout          |
|------------|------------------------------------|-----------------|
| FTMO       | https://ftmo.com/affiliate         | ~$100/referral  |
| Topstep    | https://topstep.com/affiliates     | ~$50/referral   |
| MyFundedFX | https://myfundedfx.com/affiliates  | ~$75/referral   |
| The5%ers   | https://the5ers.com/affiliates     | ~$50/referral   |

Replace `href="/sign-up"` on CTA buttons with your affiliate links where appropriate.

---

## Monthly costs at launch

| Service     | Cost           |
|-------------|----------------|
| Vercel      | Free           |
| Supabase    | Free (500MB)   |
| Clerk       | Free (10K MAU) |
| Stripe      | 2.9% + 30¢     |
| Domain      | ~$10/year      |
| **Total**   | **~$0/month**  |

You only pay once you're earning. Stripe takes their cut automatically.

---

## First 50 users strategy

1. Post on Reddit: r/Forex, r/Daytrading, r/FuturesTrading
   - Title: "I built a free Monte Carlo simulator to test your strategy before paying for FTMO"
   - Link to the challenge simulator as a free tool

2. Post on Twitter/X with a screenshot of a simulation result
   - Tag @FTMO_com, @Topsteptrader

3. Share in Discord servers: TopTradersLive, Topstep community, FTMO Discord

4. Product Hunt launch (Tuesday–Thursday mornings are best)

5. Write a blog post: "How I calculated my FTMO pass probability before spending $556"
   - Targets the keyword "FTMO challenge tips" — high intent, low competition

---

## Tech stack summary

- **Framework**: Next.js 14 (App Router)
- **Auth**: Clerk (social login, email, magic link)
- **Database**: Supabase (PostgreSQL) + Prisma ORM
- **Payments**: Stripe (subscriptions)
- **Hosting**: Vercel (auto-deploy from GitHub)
- **Fonts**: DM Mono + Syne (already on landing page)
- **Charts**: Chart.js + react-chartjs-2

---

## Need help?

The core dashboard tools are already built in `PropDesk_Pro_Dashboard.html`.
The Next.js app wraps those tools with:
- User accounts (each person's trades saved to DB)
- Cloud sync across devices
- Stripe billing for Pro users
- SEO and landing page for organic traffic

Build the landing page + auth first. Add DB features one by one.
