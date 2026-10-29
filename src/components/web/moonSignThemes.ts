/**
 * One sentence on what the day's Moon sign brings, for the desktop sky banners.
 *
 * useLiveSky's `moonSignTheme` used to be filled with the *Sun* season's theme,
 * so a banner headed "The Moon in Aries" went on to describe Scorpio season.
 * Short, reflective, and about mood rather than events — see safety.md.
 */
export const MOON_SIGN_THEMES: Record<string, string> = {
  Aries: "The Moon in Aries brings a quick, restless spark — good for starting, less good for waiting.",
  Taurus: "The Moon in Taurus slows things down. Comfort, good food and steady progress feel right.",
  Gemini: "The Moon in Gemini sets the mind buzzing — conversations, messages and small curiosities.",
  Cancer: "The Moon in Cancer turns attention toward home and the people who feel like it.",
  Leo: "The Moon in Leo warms things up — a day to be seen, make something, or celebrate someone.",
  Virgo: "The Moon in Virgo favors tidying, lists and the quiet satisfaction of small things done well.",
  Libra: "The Moon in Libra looks for balance and good company — a gentle day for repair and beauty.",
  Scorpio: "The Moon in Scorpio turns attention inward — honest, private, and deep.",
  Sagittarius: "The Moon in Sagittarius wants room to roam — big ideas, open roads, a looser grip.",
  Capricorn: "The Moon in Capricorn steadies the mood — practical, patient, and quietly ambitious.",
  Aquarius: "The Moon in Aquarius brings a little distance and a fresh angle on familiar things.",
  Pisces: "The Moon in Pisces softens the edges — dreamy, intuitive, and tender with yourself.",
};

export function moonSignTheme(sign: string): string {
  return MOON_SIGN_THEMES[sign] ?? `The Moon is in ${sign}.`;
}
