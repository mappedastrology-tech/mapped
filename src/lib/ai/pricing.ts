/**
 * What a Claude call actually costs, in micro-dollars.
 *
 * Money is counted in millionths of a dollar rather than cents or floats:
 * a single Haiku token costs $0.000001, so cents would round almost every
 * call to zero, and floats would drift once you add up thousands of them.
 * Integer micros add exactly.
 *
 * Rates are Anthropic's published per-million-token prices (2026-06), stated
 * here in micros per million tokens so the arithmetic stays whole:
 *   $3.00 / MTok  ->  3_000_000 micros / MTok
 *
 * When a model is retired and src/lib/aiModel.ts is updated, add its
 * replacement here too — an unpriced model bills at UNKNOWN_MODEL_RATE rather
 * than at zero, so a missed entry shows up as an overcharge in someone's
 * budget instead of silently letting spend run free.
 */

export interface TokenUsage {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

interface ModelRate {
  /** Micros per million input tokens. */
  input: number;
  /** Micros per million output tokens. */
  output: number;
}

const MILLION = 1_000_000;

/**
 * Keyed by model-id prefix, so dated snapshots (claude-haiku-4-5-20251001)
 * match the family rate without needing an entry per snapshot.
 */
const RATES: ReadonlyArray<readonly [string, ModelRate]> = [
  ["claude-opus-4-8", { input: 5_000_000, output: 25_000_000 }],
  ["claude-opus-4-7", { input: 5_000_000, output: 25_000_000 }],
  ["claude-opus-4-6", { input: 5_000_000, output: 25_000_000 }],
  ["claude-sonnet-4-6", { input: 3_000_000, output: 15_000_000 }],
  ["claude-sonnet-5", { input: 2_000_000, output: 10_000_000 }],
  ["claude-haiku-4-5", { input: 1_000_000, output: 5_000_000 }],
];

/** Priced as the most expensive thing we use, so an unknown model can't be cheap. */
const UNKNOWN_MODEL_RATE: ModelRate = { input: 5_000_000, output: 25_000_000 };

/** Cache reads bill at a tenth of the input rate; cache writes at 1.25x. */
const CACHE_READ_MULTIPLIER = 0.1;
const CACHE_WRITE_MULTIPLIER = 1.25;

export function rateFor(model: string): ModelRate {
  for (const [prefix, rate] of RATES) {
    if (model.startsWith(prefix)) return rate;
  }
  return UNKNOWN_MODEL_RATE;
}

/**
 * Cost of one call, in micro-dollars, rounded up.
 *
 * Rounding up rather than to nearest means a very cheap call still registers
 * as non-zero. Otherwise a tight loop of tiny requests would count as free
 * usage forever, which is exactly the shape of an abusive client.
 */
export function costMicros(model: string, usage: TokenUsage | null | undefined): number {
  if (!usage) return 0;
  const rate = rateFor(model);
  const input = usage.input_tokens ?? 0;
  const output = usage.output_tokens ?? 0;
  const cacheRead = usage.cache_read_input_tokens ?? 0;
  const cacheWrite = usage.cache_creation_input_tokens ?? 0;

  const micros =
    (input * rate.input +
      output * rate.output +
      cacheRead * rate.input * CACHE_READ_MULTIPLIER +
      cacheWrite * rate.input * CACHE_WRITE_MULTIPLIER) /
    MILLION;

  return micros > 0 ? Math.ceil(micros) : 0;
}

/** For logs and admin views only — never shown to a subscriber. */
export function formatMicros(micros: number): string {
  return `$${(micros / MILLION).toFixed(4)}`;
}
