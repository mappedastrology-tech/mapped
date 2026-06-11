# Deploying Mapped

## Today: Vercel (current setup)

Live site: https://mapped-olive.vercel.app

```bash
cd ~/Documents/mapped
npm run deploy
```

`npm run deploy` automatically runs the safety gate first (`npm run check` = ESLint + TypeScript). If either fails, the deploy is blocked — fix the errors, then deploy again. **Don't use `npx vercel --prod --force` directly; it skips the gate.**

Useful commands:

```bash
npm run check      # run the gate without deploying
npm run lint       # ESLint only (react-hooks rules catch crash bugs)
npm run typecheck  # TypeScript only
```

### Environment variables (set in Vercel dashboard → Project → Settings → Environment Variables)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (sensitive)
- `ANTHROPIC_API_KEY` (sensitive)

### Cron

`vercel.json` schedules `/api/cron/notifications` daily at 14:00 UTC. This is Vercel-specific — see the Netlify section for its replacement.

---

## At launch: Netlify migration plan

Netlify supports Next.js 16 with zero config via its OpenNext adapter — no code changes needed for the app itself.

### Step 1: Connect the repo

1. Sign up / log in at https://app.netlify.com
2. **Add new site → Import an existing project** → connect GitHub → pick `mappedastrology-tech/mapped`
3. Netlify auto-detects Next.js. Build command: `npm run build`. No publish directory override needed.

### Step 2: Environment variables

Site configuration → Environment variables → add the same four vars listed above. Mark `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` as secret.

### Step 3: Replace the Vercel cron

Netlify ignores `vercel.json`. Recreate the daily notifications job as a Netlify Scheduled Function:

Create `netlify/functions/notifications-cron.mts`:

```ts
import type { Config } from "@netlify/functions";

export default async () => {
  await fetch(`${process.env.URL}/api/cron/notifications`);
};

export const config: Config = {
  schedule: "0 14 * * *", // daily 14:00 UTC — same as vercel.json
};
```

Note: scheduled functions have a 30-second execution limit and only run on the published deploy (not previews).

### Step 4: Deploy flow on Netlify

Netlify deploys automatically on every push to `main`:

```bash
npm run check                  # gate locally first
git add -A && git commit -m "your change"
git push
```

The GitHub Actions CI (`.github/workflows/ci.yml`) runs the same lint + typecheck on every push, so broken code is flagged even if you skip the local check.

### Step 5: Custom domain

Netlify → Domain management → add your launch domain. Netlify provisions HTTPS automatically.

### Step 6: Post-migration checklist

- [ ] Update Supabase Auth → URL Configuration → Site URL + redirect URLs to the new domain
- [ ] Verify the notifications cron fired (Netlify → Logs → Functions)
- [ ] Update the uptime monitor (Claude scheduled task `mapped-uptime-monitor`) to ping the new domain instead of mapped-olive.vercel.app
- [ ] Test sign-in, onboarding, chart, tarot, push notifications on the new domain
- [ ] Keep the Vercel deployment up for a few days as fallback, then delete the project
- [ ] Delete `vercel.json` and `wrangler.toml` (old Cloudflare remnant) once Netlify is confirmed stable

---

## Supabase notes

- Free-tier NANO instance can return 503s under load. If the site loads but data doesn't: Supabase dashboard → Settings → General → **Restart project**, or wait 10–15 min.
- Before launch with real users, upgrade to Supabase Pro ($25/mo) — free-tier outages and the 2-emails/hour auth limit will hurt real users.
- An hourly uptime monitor (Claude scheduled task) checks both the site and the Supabase API and emails contacttaylorsometimes@gmail.com if either is down.

## API cost guard

Anthropic console → Settings → Billing → Usage limits: set a monthly cap.
