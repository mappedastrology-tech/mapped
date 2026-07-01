/**
 * Daily-application copy — "how to actually use this number" — aggregated with a
 * single accessor. Mirrors the position keys used by the meanings database, plus
 * the live cycle positions (personalMonth, personalDay) and karmicDebt.
 */

import { LIFE_PATH_APP, EXPRESSION_APP } from "./numerologyApplications.core";
import {
  SOUL_URGE_APP,
  PERSONALITY_APP,
  BIRTHDAY_APP,
  MATURITY_APP,
} from "./numerologyApplications.inner";
import {
  PERSONAL_YEAR_APP,
  PERSONAL_MONTH_APP,
  PERSONAL_DAY_APP,
  PINNACLE_APP,
  CHALLENGE_APP,
} from "./numerologyApplications.cycles";
import {
  KARMIC_DEBT_APP,
  KARMIC_LESSON_APP,
  HIDDEN_PASSION_APP,
  BALANCE_APP,
  SUBCONSCIOUS_SELF_APP,
  BRIDGE_APP,
} from "./numerologyApplications.karmic";

const APP_MAP = {
  lifePath: LIFE_PATH_APP,
  expression: EXPRESSION_APP,
  soulUrge: SOUL_URGE_APP,
  personality: PERSONALITY_APP,
  birthday: BIRTHDAY_APP,
  maturity: MATURITY_APP,
  personalYear: PERSONAL_YEAR_APP,
  personalMonth: PERSONAL_MONTH_APP,
  personalDay: PERSONAL_DAY_APP,
  pinnacle: PINNACLE_APP,
  challenge: CHALLENGE_APP,
  karmicDebt: KARMIC_DEBT_APP,
  karmicLesson: KARMIC_LESSON_APP,
  hiddenPassion: HIDDEN_PASSION_APP,
  balance: BALANCE_APP,
  subconsciousSelf: SUBCONSCIOUS_SELF_APP,
  bridge: BRIDGE_APP,
} as const;

export type ApplicationKey = keyof typeof APP_MAP;

/** Practical "in daily life" copy for a number in a given position; "" if absent. */
export function getApplication(position: ApplicationKey, n: number): string {
  return APP_MAP[position][n] ?? "";
}
