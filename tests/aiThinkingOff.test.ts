/**
 * Thinking stays off on every AI call.
 *
 * This app has never used extended thinking. On the models it used to run,
 * that was the default: omit `thinking` and none happens. On every current
 * model it is the opposite — omit it and adaptive thinking runs, billing
 * extra output tokens on every call and making Dolly pause before she starts
 * talking.
 *
 * So the models could not be swapped for cheaper ones without pinning this,
 * or the saving would have been handed straight back. A new AI route that
 * forgets the parameter is the same regression, quietly.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

import { THINKING_OFF, CLAUDE_MODEL, FALLBACK_MODEL } from "../src/lib/aiModel";

const API_ROOT = "src/app/api";

/** Anything that asks a model for a message. */
const CREATES_MESSAGE = /messages\.(create|stream)\s*\(/;

function routeFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) routeFiles(p, out);
    else if (entry === "route.ts") out.push(p);
  }
  return out;
}

/** Code with comments removed, so prose about thinking cannot satisfy a check. */
function code(file: string): string {
  return ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { removeComments: true, target: ts.ScriptTarget.ESNext },
  }).outputText;
}

test("thinking is turned off, not left to the model's default", () => {
  assert.deepEqual(THINKING_OFF, { type: "disabled" });
});

test("every route that asks a model for a message turns thinking off", () => {
  const offenders: string[] = [];

  for (const file of routeFiles(API_ROOT)) {
    const src = code(file);
    if (!CREATES_MESSAGE.test(src)) continue;
    // The health check sends a one-token ping and is not a user-facing
    // generation; it is allowed to be minimal.
    if (file.includes("horoscope/health")) continue;
    // Routes that go through createMessageResilient inherit it from there.
    if (/createMessageResilient/.test(src) && !/messages\.(create|stream)\s*\(/.test(
      src.replace(/createMessageResilient/g, ""),
    )) continue;
    if (!/THINKING_OFF/.test(src)) offenders.push(file);
  }

  assert.deepEqual(
    offenders,
    [],
    `these call a model without turning thinking off, so it runs by default:\n${offenders.join("\n")}`,
  );
});

test("the shared helper turns it off for both the primary and the fallback model", () => {
  const src = code("src/lib/aiModel.ts");
  const calls = src.match(/messages\.create\(\{[^}]*\}/g) ?? [];
  assert.equal(calls.length, 2, "expected a primary call and a fallback call");
  for (const call of calls) {
    assert.match(call, /thinking: THINKING_OFF/, `a model call in aiModel.ts leaves thinking to the default: ${call}`);
  }
});

test("the models in use accept `thinking: disabled`", () => {
  // Not every current model does. Claude Sonnet 5.5 rejects it and needs
  // `{type: "between_tools"}` instead, which the pinned SDK has no type for —
  // which is exactly why the default model is Sonnet 5 and not Sonnet 5.5.
  // If someone moves it, this is the reminder.
  const REJECTS_DISABLED = ["claude-sonnet-5-5", "claude-opus-5-5", "claude-fable", "claude-mythos"];
  for (const model of [CLAUDE_MODEL, FALLBACK_MODEL]) {
    for (const bad of REJECTS_DISABLED) {
      assert.ok(
        !model.startsWith(bad),
        `${model} rejects thinking:disabled — switching to it needs a different way to turn thinking off`,
      );
    }
  }
});
