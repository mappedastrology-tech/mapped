// UX audit harness — see scripts/uxaudit/README.md
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// Routes to walk. Signed-in tab pages plus the public funnel.
const ROUTES = [
  ['/', 'landing'],
  ['/home', 'home'],
  ['/almanac', 'almanac'],
  ['/journal', 'journal'],
  ['/tarot', 'tarot'],
  ['/maps', 'maps'],
  ['/dolly', 'dolly'],
  ['/you', 'chart'],
  ['/numerology', 'numerology'],
  ['/human-design', 'human-design'],
  ['/palmistry', 'palmistry'],
  ['/learn', 'ritual'],
  ['/profile', 'profile'],
  ['/library', 'library'],
  ['/account', 'account'],
  ['/onboarding', 'onboarding'],
  ['/chart/new', 'chart-new'],
  ['/privacy', 'privacy'],
  ['/terms', 'terms'],
];

// A signed-in-looking session for the dev auth shim in lib/supabase.ts, plus a
// precomputed chart in sessionStorage so pages that need one can render.
const SEED = `
try {
  localStorage.setItem('mapped:test-auth', JSON.stringify({
    access_token: 'test', token_type: 'bearer', expires_in: 99999,
    refresh_token: 'test',
    user: { id: '11111111-2222-3333-4444-555555555555', email: 'tester@example.com',
            user_metadata: { full_name: 'Ada Testwell' }, app_metadata: {}, aud: 'authenticated' }
  }));
  localStorage.setItem('mapped:numerology-fullname', 'Ada Marie Testwell');
  localStorage.setItem('mapped:theme', 'dark');
  sessionStorage.setItem('chartResult', JSON.stringify({
    name: 'Ada Testwell', birthDate: '1994-11-07', birthTime: '21:42',
    unknownTime: false, latitude: 45.5152, longitude: -122.6784,
    cityName: 'Portland, Oregon', timezone: 'America/Los_Angeles',
    bigThree: { sun: 'Scorpio', moon: 'Aquarius', rising: 'Gemini' },
    planets: [
      { name: 'Sun', sign: 'Scorpio', house: 6, position: 15.2 },
      { name: 'Moon', sign: 'Aquarius', house: 9, position: 3.1 },
      { name: 'Mercury', sign: 'Scorpio', house: 6, position: 28.4 },
      { name: 'Venus', sign: 'Sagittarius', house: 7, position: 9.8 },
      { name: 'Mars', sign: 'Libra', house: 5, position: 21.6 },
      { name: 'Jupiter', sign: 'Scorpio', house: 6, position: 2.0 },
      { name: 'Saturn', sign: 'Pisces', house: 10, position: 12.5 },
      { name: 'Uranus', sign: 'Capricorn', house: 8, position: 24.9 },
      { name: 'Neptune', sign: 'Capricorn', house: 8, position: 20.1 },
      { name: 'Pluto', sign: 'Scorpio', house: 6, position: 27.3 }
    ],
    houses: [], aspects: [], specialPoints: [], midheaven: null
  }));
} catch (e) {}
`;

const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844, mobile: true },
  { name: 'desktop', width: 1440, height: 900, mobile: false },
];

const findings = [];
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });

for (const vp of VIEWPORTS) {
  mkdirSync(`/tmp/uxtest/shots/${vp.name}`, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    userAgent: vp.mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : undefined,
  });
  await ctx.addInitScript(SEED);

  for (const [route, label] of ROUTES) {
    const page = await ctx.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedReqs = [];

    page.on('console', m => {
      if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300));
    });
    page.on('pageerror', e => pageErrors.push(String(e).slice(0, 300)));
    page.on('requestfailed', r => {
      const u = r.url();
      // Supabase / external calls are blocked by the sandbox proxy, not real bugs.
      if (!/supabase|googleapis|gstatic|anthropic/.test(u)) {
        failedReqs.push(`${r.failure()?.errorText || 'failed'} ${u.slice(0, 120)}`);
      }
    });

    let status = 0, navError = null;
    try {
      const resp = await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 25000 });
      status = resp?.status() ?? 0;
      await page.waitForTimeout(1200); // let client render + effects settle
    } catch (e) {
      navError = String(e).slice(0, 200);
    }

    // Layout probes
    const probe = await page.evaluate(() => {
      const de = document.documentElement;
      const overflowX = de.scrollWidth > de.clientWidth + 1;
      // elements poking outside the viewport horizontally
      const bleed = [];
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > window.innerWidth + 2 || r.left < -2)) {
          const tag = el.tagName.toLowerCase();
          const cls = (el.className && typeof el.className === 'string') ? '.' + el.className.split(/\s+/).slice(0,2).join('.') : '';
          bleed.push(`${tag}${cls} [${Math.round(r.left)}..${Math.round(r.right)}]`);
        }
      });
      // tiny tap targets (mobile guidance is ~44px)
      const small = [];
      document.querySelectorAll('button,a,[role=button]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && (r.height < 32 || r.width < 32)) {
          small.push(`${el.tagName.toLowerCase()}"${(el.textContent||'').trim().slice(0,24)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
      });
      // images that failed to load
      const brokenImgs = [...document.querySelectorAll('img')]
        .filter(i => i.complete && i.naturalWidth === 0)
        .map(i => i.getAttribute('src')?.slice(0, 100));
      return {
        overflowX, scrollW: de.scrollWidth, clientW: de.clientWidth,
        bleed: [...new Set(bleed)].slice(0, 6),
        small: [...new Set(small)].slice(0, 8),
        brokenImgs: [...new Set(brokenImgs)].slice(0, 6),
        title: document.title,
        text: (document.body.innerText || '').trim().length,
        h1: document.querySelector('h1')?.textContent?.trim().slice(0, 60) || null,
      };
    }).catch(() => null);

    try {
      await page.screenshot({ path: `/tmp/uxtest/shots/${vp.name}/${label}.png`, fullPage: false });
    } catch {}

    findings.push({ viewport: vp.name, route, label, status, navError, consoleErrors, pageErrors, failedReqs, probe });
    writeFileSync('/tmp/uxtest/findings.json', JSON.stringify(findings, null, 2));
    console.log(`[${vp.name}] ${route} ${status} err:${consoleErrors.length + pageErrors.length}`);
    await page.close();
  }
  await ctx.close();
}

await browser.close();
writeFileSync('/tmp/uxtest/findings.json', JSON.stringify(findings, null, 2));
console.log('routes audited:', findings.length);
