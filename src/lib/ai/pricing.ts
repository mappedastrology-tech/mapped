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
  /**
   * Cache writes split by how long the entry lives. They are billed at
   * different rates, so the total alone cannot be priced correctly.
   */
  cache_creation?: {
    ephemeral_5m_input_tokens?: number | null;
    ephemeral_1h_input_tokens?: number | null;
  } | null;
}

interface ModelRate {
  /** Micros per million input tokens. */
  input: number;
  /** Micros per million output tokens. */
  output: number;
  /**
   * Cache reads as a fraction of the input rate. A tenth on most models, but
   * a twentieth on the newest ones, where the read price did not fall with
   * the input price. Left out means a tenth.
   */
  cacheRead?: number;
}

const MILLION = 1_000_000;

/**
 * Keyed by model-id prefix, so dated snapshots (claude-haiku-4-5-20251001)
 * match the family rate without needing an entry per snapshot.
 *
 * LONGEST PREFIX FIRST. The lookup returns the first prefix that matches, and
 * "claude-sonnet-5" is a prefix of "claude-sonnet-5-5" — so a list in the
 * wrong order would quietly bill one model at another's rate. The pairs that
 * matter are marked; a test pins the ordering.
 */
const RATES: ReadonlyArray<readonly [string, ModelRate]> = [
  ["claude-opus-5-5", { input: 4_000_000, output: 20_000_000, cacheRead: 0.05 }], // before opus-5
  ["claude-opus-5", { input: 5_000_000, output: 25_000_000 }],
  ["claude-opus-4-8", { input: 5_000_000, output: 25_000_000 }],
  ["claude-opus-4-7", { input: 5_000_000, output: 25_000_000 }],
  ["claude-opus-4-6", { input: 5_000_000, output: 25_000_000 }],
  ["claude-sonnet-5-5", { input: 2_000_000, output: 10_000_000, cacheRead: 0.05 }], // before sonnet-5
  ["claude-sonnet-5", { input: 2_000_000, output: 10_000_000 }],
  ["claude-sonnet-4-6", { input: 3_000_000, output: 15_000_000 }],
  ["claude-haiku-5-5", { input: 100_000, output: 500_000 }],
  ["claude-haiku-4-5", { input: 1_000_000, output: 5_000_000 }],
];

/** Priced as the most expensive thing we use, so an unknown model can't be cheap. */
const UNKNOWN_MODEL_RATE: ModelRate = { input: 5_000_000, output: 25_000_000 };

/** Cache reads bill at a tenth of the input rate unless the model says otherwise. */
const CACHE_READ_MULTIPLIER = 0.1;
/** A five-minute cache entry costs 1.25x the input rate to write; an hour's costs 2x. */
const CACHE_WRITE_5M = 1.25;
const CACHE_WRITE_1H = 2.0;

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

  /*
   * Cache writes, split by how long the entry lives.
   *
   * This app asks for one-hour entries (lib/ai/promptCache.ts), which cost 2x
   * the input rate to write rather than 1.25x. Billing every write at the
   * cheaper rate would under-count spend against the monthly ceiling, which is
   * the one thing standing between a heavy user and an open-ended bill.
   *
   * When the split is absent — an older response shape, or a provider that
   * does not report it — the total is billed at the HIGHER rate. Same
   * reasoning as UNKNOWN_MODEL_RATE above: a gap in our knowledge should show
   * up as someone reaching their ceiling slightly early, never as spend
   * running free.
   */
  const split = usage.cache_creation;
  const write5m = split?.ephemeral_5m_input_tokens ?? 0;
  const write1h = split?.ephemeral_1h_input_tokens ?? 0;
  const writeCost = split && (write5m > 0 || write1h > 0)
    ? write5m * rate.input * CACHE_WRITE_5M + write1h * rate.input * CACHE_WRITE_1H
    : (usage.cache_creation_input_tokens ?? 0) * rate.input * CACHE_WRITE_1H;

  const micros =
    (input * rate.input +
      output * rate.output +
      cacheRead * rate.input * (rate.cacheRead ?? CACHE_READ_MULTIPLIER) +
      writeCost) /
    MILLION;

  return micros > 0 ? Math.ceil(micros) : 0;
}

/** For logs and admin views only — never shown to a subscriber. */
export function formatMicros(micros: number): string {
  return `$${(micros / MILLION).toFixed(4)}`;
}
