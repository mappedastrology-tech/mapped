import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

/**
 * POST /api/composite
 *
 * Calculates the composite (midpoint) chart for two people.
 * The composite chart represents the relationship itself.
 *
 * Body: {
 *   chart1: { planets[], houses[], specialPoints[] }
 *   chart2: { planets[], houses[], specialPoints[] }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { chart1, chart2 } = body;
    if (!chart1?.planets?.length || !chart2?.planets?.length) {
      return NextResponse.json(
        { error: "Both charts must include planets data." },
        { status: 400 }
      );
    }

    const scriptPath = path.join(process.cwd(), "scripts", "calculate_composite.py");

    const { stdout, stderr } = await execFileAsync("python3", [
      scriptPath,
      JSON.stringify(body),
    ], {
      timeout: 30000,
    });

    if (stderr) {
      console.warn("Composite Python stderr:", stderr);
    }

    const chartData = JSON.parse(stdout);
    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Composite calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate composite chart." },
      { status: 500 }
    );
  }
}
