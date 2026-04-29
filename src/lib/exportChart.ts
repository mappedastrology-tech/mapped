/**
 * Chart data export utilities for Mapped.
 * Exports chart data as CSV or XLSX (via SheetJS-compatible CSV).
 */

interface ExportPlanet {
  name: string;
  sign: string;
  position?: number;
  absPosition?: number;
  house?: number | string | null;
  retrograde?: boolean;
}

interface ExportHouse {
  number: number;
  sign: string;
  position?: number;
  absPosition?: number;
}

interface ExportAspect {
  p1Name: string;
  p2Name: string;
  aspect: string;
  orbit?: number;
  orb?: number;
}

interface ExportData {
  /** Chart type label */
  type: string;
  /** Person name */
  name: string;
  /** Optional second person */
  name2?: string;
  /** Big three */
  bigThree?: { sun?: string; moon?: string; rising?: string };
  /** Planets */
  planets?: ExportPlanet[];
  /** Houses */
  houses?: ExportHouse[];
  /** Aspects */
  aspects?: ExportAspect[];
  /** Special points */
  specialPoints?: ExportPlanet[];
  /** Extra metadata rows */
  meta?: Record<string, string>;
}

function escapeCSV(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCSV(data: ExportData): string {
  const rows: string[][] = [];

  // Header
  rows.push(["Mapped — " + data.type]);
  rows.push(["Name", data.name + (data.name2 ? ` & ${data.name2}` : "")]);
  if (data.bigThree) {
    rows.push(["Sun", data.bigThree.sun || ""]);
    rows.push(["Moon", data.bigThree.moon || ""]);
    rows.push(["Rising", data.bigThree.rising || ""]);
  }
  if (data.meta) {
    for (const [key, val] of Object.entries(data.meta)) {
      rows.push([key, val]);
    }
  }
  rows.push([]);

  // Planets
  if (data.planets && data.planets.length > 0) {
    rows.push(["Planet", "Sign", "Degree", "House", "Retrograde"]);
    for (const p of data.planets) {
      rows.push([
        p.name,
        p.sign,
        p.position !== undefined ? p.position.toFixed(2) : "",
        p.house ? String(p.house) : "",
        p.retrograde ? "R" : "",
      ]);
    }
    rows.push([]);
  }

  // Special points
  if (data.specialPoints && data.specialPoints.length > 0) {
    rows.push(["Special Point", "Sign", "Degree", "House"]);
    for (const sp of data.specialPoints) {
      rows.push([
        sp.name,
        sp.sign,
        sp.position !== undefined ? sp.position.toFixed(2) : "",
        sp.house ? String(sp.house) : "",
      ]);
    }
    rows.push([]);
  }

  // Houses
  if (data.houses && data.houses.length > 0) {
    rows.push(["House", "Sign", "Degree"]);
    for (const h of data.houses) {
      rows.push([
        String(h.number),
        h.sign,
        h.position !== undefined ? h.position.toFixed(2) : "",
      ]);
    }
    rows.push([]);
  }

  // Aspects
  if (data.aspects && data.aspects.length > 0) {
    rows.push(["Body 1", "Aspect", "Body 2", "Orb"]);
    for (const a of data.aspects) {
      rows.push([
        a.p1Name,
        a.aspect,
        a.p2Name,
        (a.orbit ?? a.orb) !== undefined ? (a.orbit ?? a.orb)!.toFixed(2) : "",
      ]);
    }
  }

  return rows.map((row) => row.map(escapeCSV).join(",")).join("\n");
}

export function downloadCSV(data: ExportData) {
  const csv = generateCSV(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const safeName = (data.name + (data.name2 ? `-${data.name2}` : ""))
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const filename = `mapped-${data.type}-${safeName}.csv`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
