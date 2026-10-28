/**
 * One send path for every push_subscriptions row, web or app.
 *
 * Web rows go through web-push, as before. Rows whose endpoint starts with
 * "apns:" are iOS app tokens (lib/nativePush.ts) and go straight to APNs over
 * HTTP/2 with token-based auth — no extra dependency.
 *
 * Failures keep web-push's shape: an error with `statusCode`, where 404/410
 * mean "this subscription is gone, delete the row". Every sender already
 * prunes on exactly that, so an uninstalled app cleans itself up the same way
 * an expired browser subscription does.
 *
 * Needs, on the server: APNS_KEY_P8 (the .p8 file's contents), APNS_KEY_ID,
 * and optionally APNS_TEAM_ID / APNS_BUNDLE_ID.
 */

import crypto from "node:crypto";
import http2 from "node:http2";

const APNS_PREFIX = "apns:";
const PRODUCTION_HOST = "api.push.apple.com";
const SANDBOX_HOST = "api.sandbox.push.apple.com";

export interface PushRow {
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
}

interface WebPush {
  sendNotification: (sub: { endpoint: string; keys: { p256dh: string; auth: string } }, payload: string) => Promise<unknown>;
}

class PushError extends Error {
  constructor(message: string, readonly statusCode: number, readonly body?: string) {
    super(message);
  }
}

export async function sendPush(webpush: WebPush, sub: PushRow, payload: string): Promise<void> {
  if (!sub.endpoint.startsWith(APNS_PREFIX)) {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
      payload,
    );
    return;
  }
  await sendApns(sub.endpoint.slice(APNS_PREFIX.length), payload);
}

/* ─── APNs ─── */

let cachedJwt: { token: string; issuedAt: number } | null = null;

/** APNs wants the same token reused for up to an hour, and refreshed after 20 minutes at the earliest. */
function providerToken(): string {
  const keyP8 = process.env.APNS_KEY_P8?.replace(/\\n/g, "\n");
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID || "J25QJL2394";
  if (!keyP8 || !keyId) throw new PushError("APNs is not configured (APNS_KEY_P8, APNS_KEY_ID)", 501);

  const now = Math.floor(Date.now() / 1000);
  if (cachedJwt && now - cachedJwt.issuedAt < 40 * 60) return cachedJwt.token;

  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "ES256", kid: keyId })}.${b64({ iss: teamId, iat: now })}`;
  const signature = crypto
    .sign("sha256", Buffer.from(unsigned), { key: crypto.createPrivateKey(keyP8), dsaEncoding: "ieee-p1363" })
    .toString("base64url");
  cachedJwt = { token: `${unsigned}.${signature}`, issuedAt: now };
  return cachedJwt.token;
}

function apnsBody(payload: string): string {
  let data: { title?: string; body?: string; url?: string; tag?: string } = {};
  try { data = JSON.parse(payload); } catch { data = { body: payload }; }
  return JSON.stringify({
    aps: {
      alert: { title: data.title || "Mapped", body: data.body || "" },
      sound: "default",
      ...(data.tag ? { "thread-id": data.tag } : {}),
    },
    url: data.url || "/home",
  });
}

function post(host: string, deviceToken: string, body: string, tag?: string): Promise<{ status: number; reason?: string }> {
  const jwt = providerToken();
  return new Promise((resolve, reject) => {
    const client = http2.connect(`https://${host}`);
    client.on("error", reject);
    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${deviceToken}`,
      authorization: `bearer ${jwt}`,
      "apns-topic": process.env.APNS_BUNDLE_ID || "com.mappedastrology.app",
      "apns-push-type": "alert",
      "apns-priority": "10",
      ...(tag ? { "apns-collapse-id": tag.slice(0, 64) } : {}),
      "content-type": "application/json",
    });
    let status = 0;
    let text = "";
    req.on("response", (headers) => { status = Number(headers[":status"]); });
    req.setEncoding("utf8");
    req.on("data", (chunk: string) => { text += chunk; });
    req.on("end", () => {
      client.close();
      let reason: string | undefined;
      try { reason = JSON.parse(text).reason; } catch { /* empty body on success */ }
      resolve({ status, reason });
    });
    req.on("error", (err) => { client.close(); reject(err); });
    req.end(body);
  });
}

async function sendApns(deviceToken: string, payload: string): Promise<void> {
  const body = apnsBody(payload);
  let tag: string | undefined;
  try { tag = JSON.parse(payload).tag; } catch { /* plain text payload */ }

  // Builds installed from Xcode get sandbox tokens; TestFlight and the App
  // Store get production ones. Nothing on the device says which, so try
  // production and fall back when APNs says the token belongs to the other.
  let res = await post(PRODUCTION_HOST, deviceToken, body, tag);
  if (res.status === 400 && res.reason === "BadDeviceToken") {
    res = await post(SANDBOX_HOST, deviceToken, body, tag);
  }

  if (res.status === 200) return;
  const gone =
    res.status === 410 ||
    (res.status === 400 && (res.reason === "BadDeviceToken" || res.reason === "DeviceTokenNotForTopic"));
  throw new PushError(`APNs ${res.status} ${res.reason ?? ""}`.trim(), gone ? 410 : res.status, res.reason);
}
