# Deploying Mapped to Cloudflare Pages

## What you need

- A GitHub account (free)
- A Cloudflare account (free) — sign up at https://dash.cloudflare.com
- Your environment variables (from `.env.local`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ANTHROPIC_API_KEY`

## Step 1: Push to GitHub

Open your terminal, `cd` into the `mapped` folder, and run:

```bash
git init
git add -A
git commit -m "Initial commit"
```

Then create a repo on GitHub (https://github.com/new) — name it `mapped`, keep it private. Then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/mapped.git
git branch -M main
git push -u origin main
```

## Step 2: Connect Cloudflare Pages

1. Go to https://dash.cloudflare.com → **Workers & Pages** → **Create**
2. Click **Pages** tab → **Connect to Git**
3. Authorize GitHub and select your `mapped` repo
4. Configure the build:
   - **Framework preset**: None
   - **Build command**: `npm run pages:build`
   - **Build output directory**: `.vercel/output/static`
   - **Node.js version**: Set environment variable `NODE_VERSION` = `20`
5. Add your environment variables (click "Add variable" for each):
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key (encrypt this one)
   - `ANTHROPIC_API_KEY` = your Anthropic API key (encrypt this one)
   - `NODE_VERSION` = `20`
6. Click **Save and Deploy**

It'll take 2-3 minutes to build. You'll get a URL like `mapped-abc.pages.dev`.

## Step 3: Add to your phone home screen

1. Open `https://mapped-abc.pages.dev` in Safari (iPhone) or Chrome (Android)
2. **iPhone**: Tap the share button (box with arrow) → "Add to Home Screen"
3. **Android**: Tap the three-dot menu → "Add to Home Screen" or "Install app"

It'll appear as an app icon and open full-screen without browser chrome.

## Step 4: Set up Supabase tables (if not done)

Run the SQL in `supabase/ritual_completions_schema.sql` in your Supabase SQL editor to create the completion sync tables.

## Step 5: Set an API budget (important!)

Go to https://console.anthropic.com → **Settings** → **Billing** → **Usage limits**. Set a monthly spending limit you're comfortable with (e.g., $10/month). This is your safety net.

## Custom domain (optional)

In Cloudflare Pages settings → **Custom domains** → add your domain. If you bought a domain through Cloudflare, it connects instantly. Otherwise point your DNS CNAME to `mapped-abc.pages.dev`.

## Updating the app

Just push to GitHub:
```bash
git add -A
git commit -m "your change"
git push
```
Cloudflare auto-deploys on every push to `main`.

## Rate limits

The app has built-in rate limiting to protect your API costs:
- Dolly chat: 30 messages/day per user
- Horoscope: 5 per hour (normally cached, so rarely hits)
- Chart interpretation: 3 per hour
- Journal prompts: 10 per hour

## Cost estimate (just you)

- Cloudflare Pages: **$0** (free tier)
- Supabase: **$0** (free tier, up to 500MB + 50k auth users)
- Anthropic API: **$1-3/month** for personal use
- **Total: ~$2/month**
