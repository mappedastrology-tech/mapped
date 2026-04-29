import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

// promisify turns the callback-based execFile into something we can "await"
const execFileAsync = promisify(execFile);

/**
 * POST /api/chart/calculate
 *
 * This API route receives birth data from the form and calls the Python
 * script to calculate the chart. Think of it as the middleman:
 *
 *   Browser form → this API route → Python/Kerykeion → chart data → back to browser
 *
 * Why a separate Python script? Because Kerykeion is a Python library
 * (there's no good JavaScript astrology calculator), so we run it as
 * a subprocess.
 */
export async function POST(request: NextRequest) {
  try {
    // Read the birth data from the request body
    const body = await request.json();

    // Validate that we have all required fields
    const { name, birthDate, birthTime, latitude, longitude } = body;
    if (!name || !birthDate || !birthTime || latitude == null || longitude == null) {
      return NextResponse.json(
        { error: "Missing required birth data fields." },
        { status: 400 }
      );
    }

    // Path to our Python script
    const scriptPath = path.join(process.cwd(), "scripts", "calculate_chart.py");

    // Call the Python script with the birth data as a JSON string argument.
    // execFile runs it as a separate process and captures what it prints.
    const { stdout, stderr } = await execFileAsync("python3", [
      scriptPath,
      JSON.stringify(body),
    ], {
      timeout: 30000, // 30 second timeout — charts usually calculate in <2 seconds
    });

    // If Python printed errors, log them (but don't crash — the chart might still work)
    if (stderr) {
      console.warn("Python stderr:", stderr);
    }

    // Parse the JSON output from the Python script
    const chartData = JSON.parse(stdout);

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Chart calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate chart. Please try again." },
      { status: 500 }
    );
  }
}
