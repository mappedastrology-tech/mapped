import { test } from "node:test";
import assert from "node:assert/strict";
import { sendPush } from "../src/lib/push/send";

test("web subscriptions still go through web-push, untouched", async () => {
  const calls: unknown[] = [];
  const webpush = { sendNotification: async (...args: unknown[]) => { calls.push(args); } };
  await sendPush(webpush, { endpoint: "https://web.push.apple.com/abc", keys_p256dh: "p", keys_auth: "a" }, "{}");
  assert.deepEqual(calls, [[{ endpoint: "https://web.push.apple.com/abc", keys: { p256dh: "p", auth: "a" } }, "{}"]]);
});

test("an app token is never sent to web-push", async () => {
  const webpush = { sendNotification: async () => { throw new Error("web-push called for an APNs row"); } };
  delete process.env.APNS_KEY_P8;
  delete process.env.APNS_KEY_ID;
  await assert.rejects(
    sendPush(webpush, { endpoint: "apns:deadbeef", keys_p256dh: "", keys_auth: "" }, "{}"),
    (err: { statusCode?: number }) => {
      // Missing server config must not look like a dead token (404/410), or
      // every sender would delete every app subscription.
      assert.equal(err.statusCode, 501);
      return true;
    },
  );
});
