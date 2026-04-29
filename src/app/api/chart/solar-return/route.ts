import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

/**
 * POST /api/chart/solar-return
 *
 * Calculates the solar return chart for a given year.
 * The solar return is the exact moment the Sun returns to its natal position.
 *
 * Body: {
 *   natalSunAbsPos: number   — natal Sun's absolute degree (0-360)
 *   birthDate: string         — natal birthday "YYYY-MM-DD"
 *   birthTime: string         — natal birth time "HH:MM"
 *   latitude: number          — location for the return chart
 *   longitude: number         — location for the return chart
 *   year?: number             — target year (defaults to current year)
 *   name?: string
 *   cityName?: string
 *   zodiacSystem?: string
 *   ayanamsa?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { natalSunAbsPos, birthDate, latitude, longitude } = body;
    if (natalSunAbsPos == null || !birthDate || latitude == null || longitude == null) {
      return NextResponse.json(
        { error: "Missing required fields: natalSunAbsPos, birthDate, latitude, longitude" },
        { status: 400 }
      );
    }

    const scriptPath = path.join(process.cwd(), "scripts", "calculate_solar_return.py");

    const { stdout, stderr } = await execFileAsync("python3", [
      scriptPath,
      JSON.stringify(body),
    ], {
      timeout: 60000, // 60s — solar return search can take longer
    });

    if (stderr) {
      console.warn("Solar return Python stderr:", stderr);
    }

    const chartData = JSON.parse(stdout);
    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Solar return calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate solar return chart." },
      { status: 500 }
    );
  }
}
