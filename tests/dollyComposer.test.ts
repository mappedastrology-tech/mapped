/**
 * The Dolly screen's three input behaviours, pinned.
 *
 *   1. Enter writes a new line. It used to send, which meant a phone user —
 *      with no Shift key to hold — could not write a second line at all, and
 *      every attempt fired off half a thought instead.
 *   2. The thread holds still when you scroll up to re-read something, at any
 *      distance. It used to count "two lines from the end" as "at the end" and
 *      haul you back to the bottom on the next streamed token.
 *   3. The bottom nav stands down while the keyboard is up, so it is not
 *      holding sixty points of an already-halved screen.
 *
 * handleKeyDown is EXECUTED here, not pattern-matched. A regex over the source
 * can be satisfied by a comment, and this file has a lot of comments.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

import { nextPin } from "../src/lib/useStickToBottom";
import { takesTyping, measureKeyboard, type KeyboardBaseline } from "../src/lib/useKeyboardOpen";

const DOLLY = "src/app/(tabs)/dolly/page.tsx";

function parse(file: string): ts.SourceFile {
  return ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function findFunction(source: ts.SourceFile, name: string): ts.FunctionDeclaration {
  let found: ts.FunctionDeclaration | undefined;
  const walk = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) found = node;
    ts.forEachChild(node, walk);
  };
  walk(source);
  assert.ok(found, `${name} is not declared in ${source.fileName}`);
  return found;
}

/* ── 1. Enter writes a new line ─────────────────────────────────────────── */

interface Press {
  key: string;
  shiftKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  isComposing?: boolean;
}

/** Runs the real handleKeyDown against a fake event. */
function press(init: Press): { sent: number; prevented: boolean } {
  const decl = findFunction(parse(DOLLY), "handleKeyDown");
  const js = ts.transpileModule(decl.getText(), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.Preserve },
  }).outputText;
  const make = new Function("handleSend", `${js}\nreturn handleKeyDown;`) as (
    handleSend: () => void,
  ) => (e: unknown) => void;

  let sent = 0;
  let prevented = false;
  make(() => { sent += 1; })({
    key: init.key,
    shiftKey: !!init.shiftKey,
    metaKey: !!init.metaKey,
    ctrlKey: !!init.ctrlKey,
    nativeEvent: { isComposing: !!init.isComposing },
    preventDefault() { prevented = true; },
  });
  return { sent, prevented };
}

test("plain Enter does not send, and is left alone so a newline is typed", () => {
  const r = press({ key: "Enter" });
  assert.equal(r.sent, 0, "Enter still sends");
  assert.equal(r.prevented, false, "Enter was preventDefault'd, so no newline is inserted");
});

test("Shift+Enter still writes a newline too", () => {
  const r = press({ key: "Enter", shiftKey: true });
  assert.equal(r.sent, 0);
  assert.equal(r.prevented, false);
});

test("Cmd+Enter and Ctrl+Enter send", () => {
  for (const mod of [{ metaKey: true }, { ctrlKey: true }]) {
    const r = press({ key: "Enter", ...mod });
    assert.equal(r.sent, 1, `${JSON.stringify(mod)} did not send`);
    assert.equal(r.prevented, true, `${JSON.stringify(mod)} left a stray newline behind`);
  }
});

test("an IME's Enter is never a send — it is committing a candidate word", () => {
  for (const mod of [{}, { metaKey: true }, { ctrlKey: true }]) {
    const r = press({ key: "Enter", isComposing: true, ...mod });
    assert.equal(r.sent, 0, `composing + ${JSON.stringify(mod)} sent`);
    assert.equal(r.prevented, false);
  }
});

test("ordinary typing is untouched", () => {
  for (const key of ["a", " ", "Backspace", "ArrowUp", "Tab"]) {
    const r = press({ key });
    assert.equal(r.sent, 0, key);
    assert.equal(r.prevented, false, key);
  }
});

test("the phone keyboard's return key is labelled as a return key", () => {
  const source = parse(DOLLY);
  let textarea: ts.JsxSelfClosingElement | ts.JsxOpeningElement | undefined;
  const walk = (node: ts.Node) => {
    if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node))
      && node.tagName.getText() === "textarea") textarea = node;
    ts.forEachChild(node, walk);
  };
  walk(source);
  assert.ok(textarea, "no <textarea> in the Dolly composer");
  const hint = textarea.attributes.properties.find(
    (a) => ts.isJsxAttribute(a) && a.name.getText() === "enterKeyHint",
  );
  assert.ok(hint, 'the composer has no enterKeyHint, so iOS still offers a "send" key');
  assert.match(hint.getText(), /"enter"/);
});

test("the desktop composer behaves the same way, from the same keys", () => {
  // Desktop and phone are the same person. It was a single-line <input> where
  // Enter sent, so the only question you could ask Dolly on a laptop was one
  // that fitted on one line.
  const source = parse("src/components/web/WebDolly.tsx");
  let el: ts.JsxSelfClosingElement | ts.JsxOpeningElement | undefined;
  const walk = (node: ts.Node) => {
    if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node))
      && node.tagName.getText() === "textarea") el = node;
    ts.forEachChild(node, walk);
  };
  walk(source);
  assert.ok(el, "the desktop composer is not a textarea, so it cannot hold a second line");

  const attr = el.attributes.properties.find(
    (a) => ts.isJsxAttribute(a) && a.name.getText() === "onKeyDown",
  ) as ts.JsxAttribute | undefined;
  assert.ok(attr && ts.isJsxExpression(attr.initializer!) && attr.initializer.expression);

  const js = ts.transpileModule(`const handler = ${attr.initializer.expression!.getText()};`, {
    compilerOptions: { target: ts.ScriptTarget.ES2020 },
  }).outputText;

  const fire = (init: Press) => {
    let sent = 0;
    let prevented = false;
    const handler = new Function("send", `${js}\nreturn handler;`)(() => { sent += 1; }) as (e: unknown) => void;
    handler({
      key: init.key,
      shiftKey: !!init.shiftKey,
      metaKey: !!init.metaKey,
      ctrlKey: !!init.ctrlKey,
      nativeEvent: { isComposing: !!init.isComposing },
      preventDefault() { prevented = true; },
    });
    return { sent, prevented };
  };

  assert.deepEqual(fire({ key: "Enter" }), { sent: 0, prevented: false });
  assert.deepEqual(fire({ key: "Enter", shiftKey: true }), { sent: 0, prevented: false });
  assert.deepEqual(fire({ key: "Enter", metaKey: true }), { sent: 1, prevented: true });
  assert.deepEqual(fire({ key: "Enter", ctrlKey: true }), { sent: 1, prevented: true });
  assert.deepEqual(fire({ key: "Enter", metaKey: true, isComposing: true }), { sent: 0, prevented: false });
});

/* ── 2. The thread holds still when you read ────────────────────────────── */

test("scrolling up unpins at any distance, including two lines from the end", () => {
  // 40px up from the bottom: the old 80px threshold called this "at the
  // bottom" and kept dragging the reader back down.
  assert.equal(nextPin({ prevTop: 1000, top: 960, distance: 40, pinned: true }), false);
  // And a long way up.
  assert.equal(nextPin({ prevTop: 1000, top: 200, distance: 800, pinned: true }), false);
});

test("content growing underneath a pinned reader keeps following", () => {
  // Our own write: scrollTop went DOWN, and we land at the end.
  assert.equal(nextPin({ prevTop: 900, top: 1000, distance: 0, pinned: true }), true);
  // Sub-pixel rounding still counts as the end.
  assert.equal(nextPin({ prevTop: 900, top: 1000, distance: 0.4, pinned: true }), true);
  // iOS rubber-band overscroll goes past it.
  assert.equal(nextPin({ prevTop: 900, top: 1020, distance: -60, pinned: true }), true);
});

test("an unpinned reader is only re-pinned by reaching the end", () => {
  // Scrolling back down, still short of the end: stays unpinned, so the
  // "Latest" button stays offered.
  assert.equal(nextPin({ prevTop: 200, top: 400, distance: 60, pinned: false }), false);
  // All the way down: following resumes.
  assert.equal(nextPin({ prevTop: 400, top: 1000, distance: 0, pinned: false }), true);
});

test("a pinned reader who ends up far from the bottom stops being pinned", () => {
  assert.equal(nextPin({ prevTop: null, top: 100, distance: 900, pinned: true }), false);
});

/* ── 3. The nav stands down while the keyboard is up ────────────────────── */

test("the things that open a keyboard are recognised, and the things that do not are not", () => {
  const el = (tagName: string, extra: Record<string, unknown> = {}) =>
    ({ tagName, isContentEditable: false, ...extra }) as unknown as Element;

  assert.equal(takesTyping(el("TEXTAREA")), true);
  assert.equal(takesTyping(el("INPUT", { type: "text" })), true);
  assert.equal(takesTyping(el("INPUT", { type: "email" })), true);
  assert.equal(takesTyping(el("INPUT", { type: "search" })), true);
  // A picker wheel covers as much of the screen as a keyboard does.
  assert.equal(takesTyping(el("INPUT", { type: "date" })), true);
  assert.equal(takesTyping(el("DIV", { isContentEditable: true })), true);

  assert.equal(takesTyping(null), false);
  assert.equal(takesTyping(el("BUTTON")), false);
  assert.equal(takesTyping(el("DIV")), false);
  assert.equal(takesTyping(el("INPUT", { type: "checkbox" })), false);
  assert.equal(takesTyping(el("INPUT", { type: "radio" })), false);
  assert.equal(takesTyping(el("INPUT", { type: "file" })), false);
  assert.equal(takesTyping(el("INPUT", { type: "submit" })), false);
});

/**
 * Walks a sequence of measurements through the detector, the way a real
 * session would, carrying the baseline forward.
 */
type Step = { width: number; height: number; focused: boolean; native?: boolean | null };

function run(steps: Step[], from?: KeyboardBaseline): boolean[] {
  let baseline: KeyboardBaseline = from ?? { base: steps[0].height, width: steps[0].width };
  return steps.map((step) => {
    const r = measureKeyboard(baseline, step);
    baseline = r.baseline;
    return r.open;
  });
}

test("iOS Safari: the visual viewport shrinks and the layout viewport does not", () => {
  assert.deepEqual(
    run([
      { width: 390, height: 844, focused: false },  // reading
      { width: 390, height: 844, focused: true },   // tapped the composer
      { width: 390, height: 508, focused: true },   // keyboard animated in
      { width: 390, height: 844, focused: false },  // dismissed
    ]),
    [false, false, true, false],
  );
});

test("Android and the native app: the whole viewport shrinks", () => {
  assert.deepEqual(
    run([
      { width: 412, height: 915, focused: false },
      { width: 412, height: 508, focused: true },
      { width: 412, height: 915, focused: false },
    ]),
    [false, true, false],
  );
});

test("Android's back button dismisses the keyboard without moving focus", () => {
  // The hard version: the baseline starts at the SHRUNKEN height, as it does
  // when the session resumes with the keyboard already up. The field never
  // loses focus, so the full height only ever arrives while focused — and if
  // the baseline refuses to grow then, it is stuck at a keyboard's height and
  // every later keyboard reads as no keyboard. The nav would go and never
  // come back.
  assert.deepEqual(
    run(
      [
        { width: 412, height: 915, focused: true },   // back button; still focused
        { width: 412, height: 508, focused: true },   // tapped the field again
      ],
      { base: 508, width: 412 },
    ),
    [false, true],
  );
});

test("a keyboard still animating away after blur is not a keyboard", () => {
  // focusout lands before the viewport finishes growing back, so a
  // measurement arrives at the shrunken height with nothing focused. Deciding
  // on height alone would hold the nav hidden through the whole animation,
  // and on iOS Safari — where blur does not always resize anything — would
  // hold it hidden indefinitely.
  assert.deepEqual(
    run([
      { width: 390, height: 844, focused: false },
      { width: 390, height: 508, focused: true },   // typing
      { width: 390, height: 508, focused: false },  // blurred, keyboard still there
    ]),
    [false, true, false],
  );
});

test("the keyboard cannot raise the bar it is measured against", () => {
  // Three measurements arrive while the keyboard is still up — the composer
  // growing, the viewport settling. None of them may be taken as the new
  // full height, or the keyboard would measure itself as closed.
  const out = run([
    { width: 390, height: 844, focused: false },
    { width: 390, height: 508, focused: true },
    { width: 390, height: 500, focused: true },
    { width: 390, height: 508, focused: true },
  ]);
  assert.deepEqual(out, [false, true, true, true]);
});

test("browser chrome sliding away is not a keyboard", () => {
  // Safari's bottom bar is about 45pt. Nothing under 120 counts.
  assert.deepEqual(
    run([
      { width: 390, height: 844, focused: false },
      { width: 390, height: 799, focused: true },
    ]),
    [false, false],
  );
});

test("rotating starts the baseline again rather than reporting a keyboard", () => {
  assert.deepEqual(
    run([
      { width: 390, height: 844, focused: false },  // portrait
      { width: 844, height: 390, focused: true },   // landscape, much shorter
    ]),
    [false, false],
  );
});

test("the native plugin's answer beats the measurement", () => {
  // Capacitor says the keyboard is up even though nothing has resized yet.
  assert.deepEqual(
    run([
      { width: 390, height: 844, focused: false, native: null },
      { width: 390, height: 844, focused: true, native: true },
      { width: 390, height: 844, focused: true, native: false },
    ]),
    [false, true, false],
  );
});

test("the bottom nav and the floating bug button both get out of the keyboard's way", () => {
  for (const file of ["src/components/BottomNav.tsx", "src/components/BugReportButton.tsx"]) {
    const source = parse(file);
    const text = source.getFullText();
    assert.ok(text.includes("useKeyboardOpen"), `${file} does not ask whether the keyboard is up`);

    // The hiding has to be an INLINE style. Both elements carry Tailwind
    // display classes (`flex`, `lg:hidden`), which win over the UA
    // stylesheet's [hidden] rule — so a `hidden` attribute would read as
    // correct and do nothing at all.
    let hides = false;
    const walk = (node: ts.Node) => {
      if (ts.isJsxAttribute(node) && node.name.getText() === "style") {
        const t = node.getText();
        if (t.includes("keyboardOpen") && t.includes('"none"')) hides = true;
      }
      ts.forEachChild(node, walk);
    };
    walk(source);
    assert.ok(hides, `${file} never sets an inline display:none while the keyboard is up`);
  }
});
