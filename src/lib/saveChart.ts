import { supabase } from "./supabase";

/**
 * Save a chart to Supabase.
 *
 * This takes the full chart data (from the Python calculation) plus
 * any interpretations from Claude, and stores it in the "charts" table
 * linked to the user's account.
 *
 * Returns the saved chart's ID, or throws an error.
 */

interface ChartData {
  name: string;
  birthDate: string;
  birthTime: string;
  unknownTime?: boolean;
  cityName?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  zodiacSystem?: string;
  ayanamsa?: string;
  bigThree: { sun: string; moon: string; rising: string };
  planets: unknown[];
  houses: unknown[];
  aspects: unknown[];
  specialPoints?: unknown[];
  midheaven?: unknown | null;
}

interface Interpretations {
  sun: string;
  moon: string;
  rising: string;
}

export async function saveChart(
  userId: string,
  chartData: ChartData,
  interpretations?: Interpretations | null
): Promise<string> {
  const { data, error } = await supabase
    .from("charts")
    .insert({
      user_id: userId,
      name: chartData.name,
      birth_date: chartData.birthDate,
      birth_time: chartData.birthTime,
      unknown_time: chartData.unknownTime || false,
      city_name: chartData.cityName || null,
      latitude: chartData.latitude,
      longitude: chartData.longitude,
      timezone: chartData.timezone || null,
      big_three: chartData.bigThree,
      planets: chartData.planets,
      houses: chartData.houses,
      aspects: chartData.aspects,
      special_points: chartData.specialPoints || null,
      midheaven: chartData.midheaven || null,
      zodiac_system: chartData.zodiacSystem || "tropical",
      ayanamsa: chartData.ayanamsa || "lahiri",
      interpretations: interpretations || null,
      chart_version: 2,
    })
    .select("id")
    .single();

  if (error) {
    // PostgrestError fields aren't enumerable, so logging `error` directly
    // prints `{}`. Build a string with the useful parts instead.
    // Use console.warn (not console.error) so Next.js's dev overlay doesn't
    // pop up — the caller's try/catch already surfaces the message in the UI.
    const parts = [
      error.message,
      error.code ? `[${error.code}]` : null,
      error.details ? `— ${error.details}` : null,
      error.hint ? `(${error.hint})` : null,
    ].filter(Boolean);
    const human = parts.join(" ") || "Failed to save chart. Please try again.";
    if (process.env.NODE_ENV !== "production") {
      console.warn("[saveChart]", human);
    }
    throw new Error(error.message || error.details || error.hint || human);
  }

  return data.id;
}

/**
 * Update (replace) a user's existing chart.
 * Deletes all old charts for the user and inserts the new one.
 */
export async function updateChart(
  userId: string,
  chartData: ChartData,
  interpretations?: Interpretations | null
): Promise<string> {
  // Delete old charts for this user
  await supabase
    .from("charts")
    .delete()
    .eq("user_id", userId);

  // Insert the new one
  return saveChart(userId, chartData, interpretations);
}
