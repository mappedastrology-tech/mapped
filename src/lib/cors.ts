/**
 * CORS for the native apps.
 *
 * On the web the pages and the API share an origin, so no CORS is involved. The
 * Capacitor apps serve their pages from capacitor://localhost (iOS) and
 * https://localhost or http://localhost (Android), and call this API across
 * origins (see src/lib/apiBase.ts). Without these headers WebKit blocks every
 * one of those calls — Dolly, horoscopes, the birth-city search — and the app
 * looks broken while the website works.
 *
 * This lives per route, not in middleware/proxy or next.config headers, because
 * both of those break the static export the apps are built from (AGENTS.md).
 *
 * Only the app origins are allowed. Auth is a bearer token, never a cookie, so
 * no credentials mode is needed and an allowed origin gains nothing without a
 * valid session.
 */

const APP_ORIGINS = new Set([
  "capacitor://localhost",
  "https://localhost",
  "http://localhost",
]);

function corsHeaders(req: Request): Record<string, string> | null {
  const origin = req.headers.get("origin");
  if (!origin || !APP_ORIGINS.has(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/** The preflight answer. Export it from a route as `OPTIONS`. */
export function corsPreflight(req: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(req) ?? {} });
}

/** Wrap a route handler so its responses carry CORS headers for the apps. */
export function withCors<R extends Request, A extends unknown[]>(
  handler: (req: R, ...rest: A) => Response | Promise<Response>,
) {
  return async (req: R, ...rest: A): Promise<Response> => {
    const res = await handler(req, ...rest);
    const headers = corsHeaders(req);
    if (!headers) return res;
    try {
      for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
      return res;
    } catch {
      // Some responses have immutable headers; copy into a fresh one.
      const copy = new Response(res.body, res);
      for (const [k, v] of Object.entries(headers)) copy.headers.set(k, v);
      return copy;
    }
  };
}
