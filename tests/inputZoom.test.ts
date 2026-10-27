/**
 * Typable fields never sit under 16px.
 *
 * The bug this pins: iOS Safari zooms the whole page in when a field smaller
 * than 16px takes focus, and it does not zoom back out. CitySearch was set to
 * `text-sm` while every other field on the chart form was 16px, so a new user
 * filled in their name, date and time normally and then the page lurched in
 * the moment they tapped the city box — in the middle of signup, on the first
 * screen of the app.
 *
 * The JSX is parsed with TypeScript's own parser rather than matched with a
 * regex: an arrow function in a handler puts a `>` inside the tag, and a
 * hand-rolled scanner silently swallows whole neighbouring elements.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

/** Tailwind text sizes below 16px. `text-base` is 16px and is the floor. */
const TOO_SMALL = /\b(text-xs|text-sm|text-\[(?:[0-9]|1[0-5])px\])\b/;

/** Fields you cannot type into are unaffected by the zoom. */
const NOT_TYPABLE = new Set(["hidden", "checkbox", "radio", "file", "submit", "button", "range", "color"]);

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) sourceFiles(p, out);
    else if (p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

/** The literal text of an attribute, or "" when it is a non-literal expression. */
function attrText(attrs: ts.JsxAttributes, name: string): string {
  for (const a of attrs.properties) {
    if (!ts.isJsxAttribute(a) || a.name.getText() !== name) continue;
    const v = a.initializer;
    if (!v) return "";
    if (ts.isStringLiteral(v)) return v.text;
    if (ts.isJsxExpression(v) && v.expression) {
      // Covers className={`... ${x} ...`} and className={"..."}.
      return v.expression.getText();
    }
  }
  return "";
}

test("typable fields are at least 16px, so iOS does not zoom the page", () => {
  const offenders: string[] = [];

  for (const file of sourceFiles("src")) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    const visit = (node: ts.Node): void => {
      const tag = ts.isJsxSelfClosingElement(node)
        ? node
        : ts.isJsxOpeningElement(node)
          ? node
          : undefined;

      if (tag) {
        const name = tag.tagName.getText();
        if (name === "input" || name === "textarea") {
          const type = attrText(tag.attributes, "type");
          if (!NOT_TYPABLE.has(type)) {
            const className = attrText(tag.attributes, "className");
            const style = attrText(tag.attributes, "style");
            const small = className.match(TOO_SMALL)?.[1];
            // An explicit inline fontSize of 16px or more overrides the class.
            const overridden = /fontSize:\s*(?:16|1[7-9]|[2-9]\d)/.test(style);

            if (small && !overridden) {
              const label =
                attrText(tag.attributes, "placeholder") ||
                attrText(tag.attributes, "aria-label") ||
                attrText(tag.attributes, "name") ||
                "(unnamed)";
              const line = source.getLineAndCharacterOfPosition(tag.getStart()).line + 1;
              offenders.push(`${file}:${line} — "${label}" uses ${small}`);
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }

  assert.deepEqual(
    offenders.sort(),
    [],
    `Typable fields under 16px zoom iOS Safari and leave it zoomed:\n  ${offenders.join("\n  ")}`,
  );
});
