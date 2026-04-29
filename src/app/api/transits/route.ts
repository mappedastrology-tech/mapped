import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

export const runtime = "edge";

const execFileAsync = promisify(execFile);

/**
 * POST /api/transits
 *
 * Calculate current transits to a natal chart.
 * Input: { natalPlanets, natalHouses, transitDate, latitude?, longitude? }
 * Output: { transitDate, transitPlanets, transitAspects }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { natalPlanets, transitDate } = body;
    if (!natalPlanets || !transitDate) {
      return NextResponse.json(
        { error: "Missing natal planets or transit date." },
        { status: 400 }
      );
    }

    const scriptPath = path.join(process.cwd(), "scripts", "calculate_transits.py");

    const { stdout, stderr } = await execFileAsync("python3", [
      scriptPath,
      JSON.stringify(body),
    ], {
      timeout: 30000,
    });

    if (stderr) {
      console.warn("Transit calc stderr:", stderr);
    }

    const transitData = JSON.parse(stdout);
    return NextResponse.json(transitData);
  } catch (error) {
    console.error("Transit calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate transits." },
      { status: 500 }
    );
  }
}
