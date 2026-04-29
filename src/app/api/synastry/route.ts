import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

export const runtime = "edge";

const execFileAsync = promisify(execFile);

/**
 * POST /api/synastry
 *
 * Receives two chart objects and calculates synastry (compatibility).
 * Each chart needs: planets[], specialPoints[], bigThree{}
 * Optional: context ("family" | "partner" | "friend") for relationship-aware themes.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chart1, chart2, context } = body;

    if (!chart1?.planets || !chart2?.planets) {
      return NextResponse.json(
        { error: "Both charts must include planets data." },
        { status: 400 }
      );
    }

    const scriptPath = path.join(process.cwd(), "scripts", "calculate_synastry.py");

    const { stdout, stderr } = await execFileAsync("python3", [
      scriptPath,
      JSON.stringify({ chart1, chart2, context: context || "friend" }),
    ], {
      timeout: 30000,
    });

    if (stderr) {
      console.warn("Synastry stderr:", stderr);
    }

    const synastryData = JSON.parse(stdout);
    return NextResponse.json(synastryData);
  } catch (error) {
    console.error("Synastry calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate synastry." },
      { status: 500 }
    );
  }
}
