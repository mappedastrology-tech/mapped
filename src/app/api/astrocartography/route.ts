import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

export const runtime = "edge";

const execFileAsync = promisify(execFile);

/**
 * POST /api/astrocartography
 *
 * Calculates astrocartography planetary lines for a birth chart.
 * Requires: birthYear, birthMonth, birthDay, birthHourUtc, birthLat, birthLng
 * Optional: targetLat, targetLng (to find lines near a specific location), radius (degrees)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthYear, birthMonth, birthDay, birthHourUtc, birthLat, birthLng, targetLat, targetLng, radius } = body;

    if (!birthYear || !birthMonth || !birthDay || birthHourUtc === undefined) {
      return NextResponse.json(
        { error: "Birth date and time (UTC) are required." },
        { status: 400 }
      );
    }

    const scriptPath = path.join(process.cwd(), "scripts", "calculate_astrocartography.py");

    const inputData: Record<string, unknown> = {
      birthYear,
      birthMonth,
      birthDay,
      birthHourUtc,
      birthLat: birthLat || 0,
      birthLng: birthLng || 0,
    };

    if (targetLat !== undefined && targetLng !== undefined) {
      inputData.targetLat = targetLat;
      inputData.targetLng = targetLng;
      if (radius) inputData.radius = radius;
    }

    const { stdout, stderr } = await execFileAsync("python3", [
      scriptPath,
      JSON.stringify(inputData),
    ], {
      timeout: 120000, // astrocartography calculation can take a minute
      maxBuffer: 1024 * 1024 * 5, // 5MB — lots of line data
    });

    if (stderr) {
      console.warn("Astrocartography stderr:", stderr);
    }

    const result = JSON.parse(stdout);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Astrocartography calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate astrocartography." },
      { status: 500 }
    );
  }
}
