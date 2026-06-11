/**
 * Fishing Forecast — Solunar-based fishing predictions for the Almanac.
 * Based on John Alden Knight's Solunar Theory (1926): fish and game feed more
 * actively during certain lunar/solar alignment periods.
 *
 * Location-aware: anchors to nearest fishable water body.
 * Supports freshwater (Hill Country lakes) and saltwater (Gulf coast).
 * Tuned for Texas but designed for any US location.
 */

import { getCurrentMoonSign } from "@/lib/astro/currentSky";

// ─── INTERFACES ─────────────────────────────────────────────────────────────

export interface WaterBody {
  name: string;
  type: "lake" | "river" | "reservoir" | "coast" | "bay" | "gulf" | "ocean";
  county: string;
  distanceMi: number;
  isSaltwater: boolean;
}

export interface BiteWindow {
  type: "major" | "minor";
  start: string;       // e.g. "9:54 am"
  end: string;
  label: string;       // e.g. "Moon underfoot"
  description: string; // e.g. "feeding peak"
  direction: "up" | "down" | "right"; // arrow direction for UI
}

export interface BiteBar {
  hour: number;   // 0-23
  label: string;  // "6am", "10am", etc.
  intensity: 0 | 1 | 2 | 3; // 0=none, 1=baseline, 2=minor, 3=major
}

export interface Conditions {
  waterTemp: { value: string; qualifier: string };
  sky: { value: string; qualifier: string };
  wind: { value: string; qualifier: string };
  barometer: { value: string; qualifier: string; trend: "rising" | "falling" | "steady" };
}

export interface SpeciesStatus {
  name: string;
  status: string;  // short: "Spawning, shallow" or "Best after dark"
  tip: string;     // full tip for expanded view
  active: boolean;
}

export interface FishingDayScore {
  dayLabel: string; // "SUN", "MON", etc.
  dayNum: number;
  score: number;    // 0-10 scale
  isToday: boolean;
  isPeak: boolean;
}

export interface FishingLogEntry {
  date: string;
  note: string;
}

export interface FishingWisdom {
  saying: string;
  attribution: string;
}

export interface FishingForecast {
  // Location
  waterBody: WaterBody;

  // Today's summary
  rating: number;       // 0-10 scale
  ratingLabel: string;  // "Good day", "Great day", "Slow day"
  moonPhaseLabel: string;
  moonSign: string;
  moonElement: string;

  // Solunar
  biteIntensity: BiteBar[];   // 24 bars
  biteWindows: BiteWindow[];  // 3-4 windows

  // Conditions
  conditions: Conditions;

  // Species
  species: SpeciesStatus[];

  // Week
  weekScores: FishingDayScore[];
  peakDayNote: string;

  // Log (placeholder entries)
  logEntries: FishingLogEntry[];

  // Wisdom
  wisdom: FishingWisdom;

  // Ocean extras (only if saltwater)
  oceanData?: {
    tide: string;       // "High at 6:42 AM, Low at 12:58 PM"
    swellFt: number;
    swellDirection: string;
    waterClarity: string;
    surfTemp: string;
  };
}

// Keep old interface for backward compat during transition
export interface FishingPeriod {
  type: "major" | "minor";
  start: string;
  end: string;
  label: string;
}

export interface SpeciesTip {
  name: string;
  tip: string;
  active: boolean;
}

// ─── SOLUNAR CALCULATION ─────────────────────────────────────────────────────

function getMoonTransit(date: Date): number {
  const J2000 = new Date(2000, 0, 1).getTime();
  const daysSince = (date.getTime() - J2000) / 86400000;
  const synodicPeriod = 29.530588;
  const phaseDay = (daysSince % synodicPeriod + synodicPeriod) % synodicPeriod;
  const transitHour = (12 + (phaseDay * 0.8)) % 24;
  return transitHour;
}

function getMoonPhaseDay(date: Date): number {
  const J2000 = new Date(2000, 0, 1).getTime();
  const daysSince = (date.getTime() - J2000) / 86400000;
  const synodicPeriod = 29.530588;
  return (daysSince % synodicPeriod + synodicPeriod) % synodicPeriod;
}

function formatHour(h: number): string {
  const hour = Math.floor(((h % 24) + 24) % 24);
  const min = Math.round((h % 1) * 60);
  const period = hour >= 12 ? "pm" : "am";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${min.toString().padStart(2, "0")} ${period}`;
}

function getMoonPhaseName(phaseDay: number): string {
  if (phaseDay < 1.5) return "New Moon";
  if (phaseDay < 7.4) return "Waxing Crescent";
  if (phaseDay < 8.5) return "First Quarter";
  if (phaseDay < 14) return "Waxing Gibbous";
  if (phaseDay < 15.5) return "Full Moon";
  if (phaseDay < 22) return "Waning Gibbous";
  if (phaseDay < 23.5) return "Third Quarter";
  return "Waning Crescent";
}

// Simplified name for the summary card
function getPhaseShortName(phaseDay: number): string {
  if (phaseDay < 1.5 || phaseDay > 28) return "New Moon";
  if (phaseDay > 13.5 && phaseDay < 15.5) return "Full Moon";
  if (phaseDay > 6.5 && phaseDay < 8.5) return "First Quarter";
  if (phaseDay > 21 && phaseDay < 23.5) return "Third Quarter";
  if (phaseDay < 14) return "Waxing Moon";
  return "Waning Moon";
}

// ─── WATER BODY LOOKUP ──────────────────────────────────────────────────────

/**
 * ZIP-prefix → nearest fishable water body mapping.
 * Uses 3-digit ZIP prefixes for broad regional coverage across the US.
 * Each entry: [name, type, county/region, distanceMi, isSaltwater]
 */
type WBTuple = [string, WaterBody["type"], string, number, boolean];

const ZIP_WATER_BODIES: Record<string, WBTuple> = {
  // ── Northeast ──
  "010": ["Quabbin Reservoir", "reservoir", "Hampshire County, MA", 12, false],
  "011": ["Connecticut River", "river", "Hampden County, MA", 6, false],
  "012": ["Deerfield River", "river", "Franklin County, MA", 8, false],
  "013": ["Quabbin Reservoir", "reservoir", "Worcester County, MA", 15, false],
  "014": ["Wachusett Reservoir", "reservoir", "Worcester County, MA", 10, false],
  "015": ["Lake Quinsigamond", "lake", "Worcester County, MA", 5, false],
  "016": ["Wachusett Reservoir", "reservoir", "Worcester County, MA", 12, false],
  "017": ["Cape Cod Bay", "bay", "Barnstable County, MA", 8, true],
  "018": ["Boston Harbor", "bay", "Suffolk County, MA", 5, true],
  "019": ["Cape Cod Bay", "bay", "Plymouth County, MA", 10, true],
  "020": ["Narragansett Bay", "bay", "Providence County, RI", 8, true],
  "021": ["Boston Harbor", "bay", "Norfolk County, MA", 10, true],
  "022": ["Cape Cod Bay", "bay", "Plymouth County, MA", 6, true],
  "023": ["Buzzards Bay", "bay", "Bristol County, MA", 8, true],
  "024": ["Boston Harbor", "bay", "Middlesex County, MA", 12, true],
  "025": ["Cape Cod Bay", "bay", "Barnstable County, MA", 3, true],
  "026": ["Buzzards Bay", "bay", "Bristol County, MA", 5, true],
  "027": ["Narragansett Bay", "bay", "Providence County, RI", 6, true],
  "028": ["Narragansett Bay", "bay", "Newport County, RI", 4, true],
  "029": ["Block Island Sound", "ocean", "Washington County, RI", 10, true],
  "030": ["Lake Winnipesaukee", "lake", "Belknap County, NH", 15, false],
  "031": ["Merrimack River", "river", "Hillsborough County, NH", 5, false],
  "032": ["Lake Winnipesaukee", "lake", "Carroll County, NH", 10, false],
  "033": ["Lake Sunapee", "lake", "Merrimack County, NH", 12, false],
  "034": ["Connecticut River", "river", "Grafton County, NH", 8, false],
  "035": ["Lake Champlain", "lake", "Chittenden County, VT", 8, false],
  "036": ["Lake Champlain", "lake", "Franklin County, VT", 10, false],
  "037": ["Connecticut River", "river", "Windsor County, VT", 6, false],
  "038": ["Lake Champlain", "lake", "Addison County, VT", 12, false],
  "039": ["Casco Bay", "bay", "Cumberland County, ME", 6, true],
  "040": ["Casco Bay", "bay", "Cumberland County, ME", 5, true],
  "041": ["Casco Bay", "bay", "Cumberland County, ME", 8, true],
  "042": ["Sebago Lake", "lake", "Cumberland County, ME", 10, false],
  "043": ["Penobscot Bay", "bay", "Knox County, ME", 8, true],
  "044": ["Moosehead Lake", "lake", "Piscataquis County, ME", 12, false],
  "045": ["Penobscot River", "river", "Penobscot County, ME", 5, false],
  "046": ["Machias Bay", "bay", "Washington County, ME", 8, true],
  "047": ["Moosehead Lake", "lake", "Piscataquis County, ME", 15, false],
  "048": ["Rangeley Lake", "lake", "Franklin County, ME", 10, false],
  "049": ["Sebago Lake", "lake", "Oxford County, ME", 12, false],
  "050": ["Lake Champlain", "lake", "Chittenden County, VT", 6, false],
  "051": ["Connecticut River", "river", "Windham County, VT", 8, false],
  "052": ["Connecticut River", "river", "Windham County, VT", 10, false],
  "053": ["Connecticut River", "river", "Windham County, VT", 7, false],
  "054": ["Lake Champlain", "lake", "Chittenden County, VT", 5, false],
  "055": ["Lake Champlain", "lake", "Rutland County, VT", 12, false],
  "056": ["Lake Champlain", "lake", "Addison County, VT", 9, false],
  "057": ["Connecticut River", "river", "Windsor County, VT", 6, false],
  "058": ["Connecticut River", "river", "Caledonia County, VT", 8, false],
  "059": ["Lake Memphremagog", "lake", "Orleans County, VT", 10, false],
  "060": ["Long Island Sound", "bay", "Hartford County, CT", 15, true],
  "061": ["Connecticut River", "river", "Hartford County, CT", 5, false],
  "062": ["Long Island Sound", "bay", "Middlesex County, CT", 10, true],
  "063": ["Long Island Sound", "bay", "New London County, CT", 6, true],
  "064": ["Long Island Sound", "bay", "Fairfield County, CT", 8, true],
  "065": ["Long Island Sound", "bay", "New Haven County, CT", 5, true],
  "066": ["Long Island Sound", "bay", "New Haven County, CT", 4, true],
  "067": ["Candlewood Lake", "lake", "Litchfield County, CT", 8, false],
  "068": ["Long Island Sound", "bay", "Fairfield County, CT", 6, true],
  "069": ["Long Island Sound", "bay", "New London County, CT", 5, true],
  // ── New York ──
  "100": ["Hudson River", "river", "New York County, NY", 3, false],
  "101": ["Hudson River", "river", "New York County, NY", 2, false],
  "102": ["Jamaica Bay", "bay", "Queens County, NY", 5, true],
  "103": ["Lower New York Bay", "bay", "Richmond County, NY", 4, true],
  "104": ["Long Island Sound", "bay", "Bronx County, NY", 5, true],
  "105": ["Hudson River", "river", "Westchester County, NY", 5, false],
  "106": ["Hudson River", "river", "Westchester County, NY", 8, false],
  "107": ["Hudson River", "river", "Westchester County, NY", 6, false],
  "108": ["Long Island Sound", "bay", "Westchester County, NY", 4, true],
  "109": ["Croton Reservoir", "reservoir", "Westchester County, NY", 10, false],
  "110": ["Great South Bay", "bay", "Nassau County, NY", 8, true],
  "111": ["Jamaica Bay", "bay", "Queens County, NY", 5, true],
  "112": ["Jamaica Bay", "bay", "Kings County, NY", 6, true],
  "113": ["Jamaica Bay", "bay", "Kings County, NY", 5, true],
  "114": ["Little Neck Bay", "bay", "Queens County, NY", 6, true],
  "115": ["Great South Bay", "bay", "Nassau County, NY", 8, true],
  "116": ["Great South Bay", "bay", "Nassau County, NY", 6, true],
  "117": ["Great South Bay", "bay", "Suffolk County, NY", 5, true],
  "118": ["Peconic Bay", "bay", "Suffolk County, NY", 4, true],
  "119": ["Montauk Point", "ocean", "Suffolk County, NY", 3, true],
  "120": ["Hudson River", "river", "Albany County, NY", 4, false],
  "121": ["Hudson River", "river", "Rensselaer County, NY", 6, false],
  "122": ["Hudson River", "river", "Columbia County, NY", 8, false],
  "123": ["Ashokan Reservoir", "reservoir", "Ulster County, NY", 10, false],
  "124": ["Delaware River", "river", "Sullivan County, NY", 8, false],
  "125": ["Catskill Creek", "river", "Greene County, NY", 10, false],
  "126": ["Pepacton Reservoir", "reservoir", "Delaware County, NY", 12, false],
  "127": ["Saratoga Lake", "lake", "Saratoga County, NY", 8, false],
  "128": ["Sacandaga Lake", "lake", "Fulton County, NY", 10, false],
  "129": ["Great Sacandaga Lake", "lake", "Hamilton County, NY", 12, false],
  "130": ["Oneida Lake", "lake", "Onondaga County, NY", 10, false],
  "131": ["Onondaga Lake", "lake", "Onondaga County, NY", 5, false],
  "132": ["Oneida Lake", "lake", "Oneida County, NY", 8, false],
  "133": ["Oneida Lake", "lake", "Oneida County, NY", 6, false],
  "134": ["Seneca Lake", "lake", "Seneca County, NY", 10, false],
  "135": ["Cayuga Lake", "lake", "Tompkins County, NY", 8, false],
  "136": ["Seneca Lake", "lake", "Schuyler County, NY", 6, false],
  "137": ["Keuka Lake", "lake", "Steuben County, NY", 10, false],
  "140": ["Lake Erie", "lake", "Erie County, NY", 8, false],
  "141": ["Lake Erie", "lake", "Erie County, NY", 6, false],
  "142": ["Lake Ontario", "lake", "Niagara County, NY", 10, false],
  "143": ["Lake Ontario", "lake", "Niagara County, NY", 8, false],
  "144": ["Lake Ontario", "lake", "Monroe County, NY", 6, false],
  "145": ["Lake Ontario", "lake", "Monroe County, NY", 5, false],
  "146": ["Lake Ontario", "lake", "Wayne County, NY", 10, false],
  "147": ["Chautauqua Lake", "lake", "Chautauqua County, NY", 8, false],
  "148": ["Allegany Reservoir", "reservoir", "Cattaraugus County, NY", 12, false],
  "149": ["Lake Ontario", "lake", "Oswego County, NY", 8, false],
  // ── New Jersey ──
  "070": ["Passaic River", "river", "Essex County, NJ", 5, false],
  "071": ["Passaic River", "river", "Passaic County, NJ", 6, false],
  "072": ["Raritan Bay", "bay", "Middlesex County, NJ", 8, true],
  "073": ["Round Valley Reservoir", "reservoir", "Hunterdon County, NJ", 10, false],
  "074": ["Lake Hopatcong", "lake", "Morris County, NJ", 8, false],
  "075": ["Spruce Run Reservoir", "reservoir", "Hunterdon County, NJ", 10, false],
  "076": ["Delaware River", "river", "Mercer County, NJ", 6, false],
  "077": ["Barnegat Bay", "bay", "Ocean County, NJ", 5, true],
  "078": ["Round Valley Reservoir", "reservoir", "Somerset County, NJ", 12, false],
  "079": ["Delaware Water Gap", "river", "Warren County, NJ", 8, false],
  "080": ["Delaware River", "river", "Burlington County, NJ", 8, false],
  "081": ["Great Egg Harbor Bay", "bay", "Atlantic County, NJ", 6, true],
  "082": ["Delaware Bay", "bay", "Cumberland County, NJ", 8, true],
  "083": ["Delaware Bay", "bay", "Cape May County, NJ", 5, true],
  "084": ["Delaware River", "river", "Gloucester County, NJ", 6, false],
  "085": ["Delaware River", "river", "Mercer County, NJ", 5, false],
  "086": ["Delaware River", "river", "Burlington County, NJ", 10, false],
  "087": ["Delaware Bay", "bay", "Salem County, NJ", 8, true],
  "088": ["Barnegat Bay", "bay", "Ocean County, NJ", 6, true],
  "089": ["Barnegat Bay", "bay", "Monmouth County, NJ", 8, true],
  // ── Pennsylvania ──
  "150": ["Three Rivers", "river", "Allegheny County, PA", 5, false],
  "151": ["Three Rivers", "river", "Allegheny County, PA", 6, false],
  "152": ["Three Rivers", "river", "Allegheny County, PA", 8, false],
  "153": ["Allegheny River", "river", "Butler County, PA", 10, false],
  "154": ["Pymatuning Reservoir", "reservoir", "Crawford County, PA", 8, false],
  "155": ["Allegheny River", "river", "Indiana County, PA", 10, false],
  "156": ["Raystown Lake", "lake", "Huntingdon County, PA", 12, false],
  "157": ["Allegheny Reservoir", "reservoir", "Warren County, PA", 10, false],
  "158": ["Lake Erie", "lake", "Erie County, PA", 6, false],
  "159": ["Susquehanna River", "river", "Lycoming County, PA", 8, false],
  "160": ["Allegheny River", "river", "Armstrong County, PA", 8, false],
  "161": ["Raystown Lake", "lake", "Blair County, PA", 15, false],
  "162": ["Susquehanna River", "river", "Centre County, PA", 10, false],
  "170": ["Susquehanna River", "river", "Lancaster County, PA", 6, false],
  "171": ["Susquehanna River", "river", "York County, PA", 8, false],
  "172": ["Susquehanna River", "river", "Dauphin County, PA", 5, false],
  "175": ["Lake Wallenpaupack", "lake", "Pike County, PA", 10, false],
  "176": ["Susquehanna River", "river", "Lycoming County, PA", 5, false],
  "180": ["Delaware River", "river", "Lehigh County, PA", 12, false],
  "181": ["Delaware River", "river", "Northampton County, PA", 8, false],
  "182": ["Lake Wallenpaupack", "lake", "Wayne County, PA", 10, false],
  "183": ["Pocono Creek", "river", "Monroe County, PA", 8, false],
  "184": ["Susquehanna River", "river", "Luzerne County, PA", 6, false],
  "185": ["Susquehanna River", "river", "Luzerne County, PA", 5, false],
  "186": ["Susquehanna River", "river", "Lackawanna County, PA", 8, false],
  "189": ["Schuylkill River", "river", "Berks County, PA", 6, false],
  "190": ["Schuylkill River", "river", "Delaware County, PA", 8, false],
  "191": ["Delaware River", "river", "Philadelphia County, PA", 5, false],
  "192": ["Delaware River", "river", "Philadelphia County, PA", 4, false],
  "193": ["Schuylkill River", "river", "Chester County, PA", 10, false],
  "194": ["Delaware River", "river", "Bucks County, PA", 6, false],
  "195": ["Delaware River", "river", "Lehigh County, PA", 10, false],
  "196": ["Marsh Creek Lake", "lake", "Chester County, PA", 8, false],
  // ── Mid-Atlantic / Southeast ──
  "200": ["Chesapeake Bay", "bay", "Washington, DC", 30, true],
  "201": ["Potomac River", "river", "Fairfax County, VA", 8, false],
  "202": ["Potomac River", "river", "Washington, DC", 5, false],
  "203": ["Potomac River", "river", "Washington, DC", 6, false],
  "204": ["Potomac River", "river", "Washington, DC", 4, false],
  "206": ["Chesapeake Bay", "bay", "Anne Arundel County, MD", 10, true],
  "207": ["Chesapeake Bay", "bay", "Anne Arundel County, MD", 8, true],
  "208": ["Chesapeake Bay", "bay", "Prince George's County, MD", 12, true],
  "209": ["Chesapeake Bay", "bay", "Calvert County, MD", 6, true],
  "210": ["Chesapeake Bay", "bay", "Baltimore County, MD", 10, true],
  "211": ["Chesapeake Bay", "bay", "Baltimore County, MD", 8, true],
  "212": ["Chesapeake Bay", "bay", "Baltimore City, MD", 6, true],
  "214": ["Chesapeake Bay", "bay", "Anne Arundel County, MD", 5, true],
  "215": ["Deep Creek Lake", "lake", "Garrett County, MD", 8, false],
  "216": ["Chesapeake Bay", "bay", "Harford County, MD", 10, true],
  "217": ["Potomac River", "river", "Frederick County, MD", 8, false],
  "218": ["Chesapeake Bay", "bay", "Talbot County, MD", 5, true],
  "219": ["Assawoman Bay", "bay", "Worcester County, MD", 3, true],
  "220": ["Potomac River", "river", "Fairfax County, VA", 6, false],
  "221": ["Potomac River", "river", "Fairfax County, VA", 8, false],
  "222": ["Potomac River", "river", "Arlington County, VA", 5, false],
  "223": ["Smith Mountain Lake", "lake", "Bedford County, VA", 15, false],
  "224": ["Rappahannock River", "river", "Stafford County, VA", 8, false],
  "225": ["Lake Anna", "lake", "Louisa County, VA", 10, false],
  "226": ["Shenandoah River", "river", "Augusta County, VA", 8, false],
  "227": ["Claytor Lake", "lake", "Pulaski County, VA", 12, false],
  "228": ["Lake Gaston", "lake", "Brunswick County, VA", 15, false],
  "229": ["Chesapeake Bay", "bay", "Norfolk, VA", 5, true],
  "230": ["James River", "river", "Richmond, VA", 5, false],
  "231": ["Chesapeake Bay", "bay", "Virginia Beach, VA", 4, true],
  "232": ["James River", "river", "Richmond, VA", 6, false],
  "233": ["Chesapeake Bay", "bay", "Norfolk, VA", 6, true],
  "234": ["Chesapeake Bay", "bay", "Hampton, VA", 5, true],
  "235": ["Chesapeake Bay", "bay", "Newport News, VA", 8, true],
  "236": ["Chesapeake Bay", "bay", "Norfolk, VA", 4, true],
  "237": ["Smith Mountain Lake", "lake", "Bedford County, VA", 12, false],
  "238": ["Lake Anna", "lake", "Spotsylvania County, VA", 10, false],
  "239": ["Rappahannock River", "river", "Fredericksburg, VA", 5, false],
  "240": ["New River", "river", "Roanoke County, VA", 8, false],
  "241": ["Smith Mountain Lake", "lake", "Roanoke County, VA", 10, false],
  "242": ["Claytor Lake", "lake", "Pulaski County, VA", 8, false],
  "243": ["South Holston Lake", "lake", "Washington County, VA", 12, false],
  "244": ["Philpott Lake", "lake", "Henry County, VA", 10, false],
  "245": ["Shenandoah River", "river", "Rockingham County, VA", 6, false],
  "246": ["Greenbrier River", "river", "Greenbrier County, WV", 8, false],
  "247": ["New River", "river", "Mercer County, WV", 6, false],
  "248": ["Bluestone Lake", "lake", "Summers County, WV", 10, false],
  "249": ["Kanawha River", "river", "Kanawha County, WV", 8, false],
  "250": ["Kanawha River", "river", "Kanawha County, WV", 5, false],
  "251": ["Kanawha River", "river", "Kanawha County, WV", 6, false],
  "252": ["Summersville Lake", "lake", "Nicholas County, WV", 10, false],
  "253": ["Stonewall Jackson Lake", "lake", "Lewis County, WV", 8, false],
  "254": ["New River", "river", "Raleigh County, WV", 8, false],
  "255": ["Kanawha River", "river", "Cabell County, WV", 5, false],
  "256": ["Ohio River", "river", "Cabell County, WV", 6, false],
  "257": ["Ohio River", "river", "Wood County, WV", 5, false],
  "258": ["Tygart Lake", "lake", "Taylor County, WV", 10, false],
  "259": ["Cheat Lake", "lake", "Monongalia County, WV", 8, false],
  "260": ["Ohio River", "river", "Ohio County, WV", 5, false],
  "261": ["Ohio River", "river", "Wood County, WV", 6, false],
  "262": ["Stonewall Jackson Lake", "lake", "Lewis County, WV", 12, false],
  "263": ["Cheat Lake", "lake", "Monongalia County, WV", 6, false],
  "264": ["Seneca Lake", "lake", "Pocahontas County, WV", 15, false],
  "265": ["Summersville Lake", "lake", "Nicholas County, WV", 8, false],
  "266": ["Spruce Knob Lake", "lake", "Randolph County, WV", 15, false],
  "267": ["Ohio River", "river", "Marshall County, WV", 5, false],
  "268": ["Potomac River", "river", "Hardy County, WV", 8, false],
  // ── Carolinas ──
  "270": ["Falls Lake", "lake", "Wake County, NC", 10, false],
  "271": ["Falls Lake", "lake", "Wake County, NC", 8, false],
  "272": ["Jordan Lake", "lake", "Chatham County, NC", 10, false],
  "273": ["High Rock Lake", "lake", "Davidson County, NC", 12, false],
  "274": ["High Rock Lake", "lake", "Guilford County, NC", 10, false],
  "275": ["Kerr Lake", "lake", "Vance County, NC", 12, false],
  "276": ["Belews Lake", "lake", "Forsyth County, NC", 10, false],
  "277": ["Lake Norman", "lake", "Iredell County, NC", 8, false],
  "278": ["Lake Wylie", "lake", "Mecklenburg County, NC", 10, false],
  "279": ["Lake James", "lake", "Burke County, NC", 12, false],
  "280": ["Pamlico Sound", "bay", "Carteret County, NC", 8, true],
  "281": ["Lake Norman", "lake", "Mecklenburg County, NC", 6, false],
  "282": ["Lake Norman", "lake", "Mecklenburg County, NC", 8, false],
  "283": ["Lake Wylie", "lake", "Gaston County, NC", 10, false],
  "284": ["Atlantic Ocean", "ocean", "New Hanover County, NC", 4, true],
  "285": ["Pamlico Sound", "bay", "Dare County, NC", 5, true],
  "286": ["Lake Mattamuskeet", "lake", "Hyde County, NC", 8, false],
  "287": ["Cape Fear River", "river", "Cumberland County, NC", 6, false],
  "288": ["Atlantic Ocean", "ocean", "New Hanover County, NC", 3, true],
  "289": ["Lake Wateree", "lake", "Kershaw County, SC", 10, false],
  "290": ["Lake Murray", "lake", "Lexington County, SC", 8, false],
  "291": ["Charleston Harbor", "bay", "Charleston County, SC", 5, true],
  "292": ["Lake Murray", "lake", "Richland County, SC", 10, false],
  "293": ["Lake Hartwell", "lake", "Anderson County, SC", 8, false],
  "294": ["Charleston Harbor", "bay", "Charleston County, SC", 4, true],
  "295": ["Lake Marion", "lake", "Orangeburg County, SC", 10, false],
  "296": ["Lake Greenwood", "lake", "Greenwood County, SC", 8, false],
  "297": ["Hilton Head", "ocean", "Beaufort County, SC", 3, true],
  "298": ["Lake Jocassee", "lake", "Oconee County, SC", 10, false],
  "299": ["Port Royal Sound", "bay", "Beaufort County, SC", 5, true],
  // ── Georgia / Florida ──
  "300": ["Lake Lanier", "lake", "Gwinnett County, GA", 10, false],
  "301": ["Lake Lanier", "lake", "Hall County, GA", 8, false],
  "302": ["Lake Lanier", "lake", "Fulton County, GA", 12, false],
  "303": ["Chattahoochee River", "river", "Fulton County, GA", 6, false],
  "304": ["Lake Allatoona", "lake", "Bartow County, GA", 8, false],
  "305": ["Lake Allatoona", "lake", "Cherokee County, GA", 10, false],
  "306": ["Lake Oconee", "lake", "Greene County, GA", 10, false],
  "307": ["Lake Seminole", "lake", "Seminole County, GA", 12, false],
  "308": ["Lake Blackshear", "lake", "Crisp County, GA", 10, false],
  "309": ["Lake Oconee", "lake", "Putnam County, GA", 8, false],
  "310": ["Savannah River", "river", "Chatham County, GA", 5, true],
  "311": ["Savannah River", "river", "Chatham County, GA", 6, true],
  "312": ["Altamaha River", "river", "McIntosh County, GA", 8, false],
  "313": ["St. Simons Sound", "bay", "Glynn County, GA", 5, true],
  "314": ["Lake Lanier", "lake", "Forsyth County, GA", 8, false],
  "315": ["Lake Lanier", "lake", "Gwinnett County, GA", 10, false],
  "316": ["Clarks Hill Lake", "lake", "Columbia County, GA", 8, false],
  "317": ["Lake Sinclair", "lake", "Baldwin County, GA", 10, false],
  "318": ["Lake Seminole", "lake", "Decatur County, GA", 8, false],
  "319": ["Lake Blackshear", "lake", "Crisp County, GA", 12, false],
  "320": ["St. Johns River", "river", "Duval County, FL", 5, false],
  "321": ["St. Johns River", "river", "Duval County, FL", 6, false],
  "322": ["Atlantic Ocean", "ocean", "Duval County, FL", 4, true],
  "323": ["Lake George", "lake", "Volusia County, FL", 8, false],
  "324": ["Atlantic Ocean", "ocean", "Volusia County, FL", 3, true],
  "325": ["Lake Kissimmee", "lake", "Osceola County, FL", 10, false],
  "326": ["Lake Harris", "lake", "Lake County, FL", 8, false],
  "327": ["Lake Toho", "lake", "Osceola County, FL", 6, false],
  "328": ["Atlantic Ocean", "ocean", "Brevard County, FL", 4, true],
  "329": ["Lake Okeechobee", "lake", "Okeechobee County, FL", 10, false],
  "330": ["Biscayne Bay", "bay", "Miami-Dade County, FL", 4, true],
  "331": ["Biscayne Bay", "bay", "Miami-Dade County, FL", 3, true],
  "332": ["Biscayne Bay", "bay", "Miami-Dade County, FL", 5, true],
  "333": ["Atlantic Ocean", "ocean", "Broward County, FL", 3, true],
  "334": ["Atlantic Ocean", "ocean", "Palm Beach County, FL", 4, true],
  "335": ["Lake Okeechobee", "lake", "Palm Beach County, FL", 12, false],
  "336": ["Gulf of Mexico", "gulf", "Sarasota County, FL", 3, true],
  "337": ["Gulf of Mexico", "gulf", "Pinellas County, FL", 2, true],
  "338": ["Gulf of Mexico", "gulf", "Manatee County, FL", 4, true],
  "339": ["Gulf of Mexico", "gulf", "Charlotte County, FL", 5, true],
  "340": ["Florida Keys", "ocean", "Monroe County, FL", 2, true],
  "341": ["Gulf of Mexico", "gulf", "Lee County, FL", 4, true],
  "342": ["Gulf of Mexico", "gulf", "Lee County, FL", 5, true],
  "344": ["Gulf of Mexico", "gulf", "Collier County, FL", 4, true],
  "346": ["Gulf of Mexico", "gulf", "Hillsborough County, FL", 6, true],
  "347": ["Gulf of Mexico", "gulf", "Pinellas County, FL", 3, true],
  "349": ["Gulf of Mexico", "gulf", "Hernando County, FL", 8, true],
  // ── Alabama / Mississippi / Tennessee ──
  "350": ["Lake Guntersville", "lake", "Madison County, AL", 10, false],
  "351": ["Lake Martin", "lake", "Tallapoosa County, AL", 12, false],
  "352": ["Lake Guntersville", "lake", "Marshall County, AL", 8, false],
  "354": ["Wheeler Lake", "lake", "Lawrence County, AL", 8, false],
  "355": ["Smith Lake", "lake", "Winston County, AL", 10, false],
  "356": ["Lake Tuscaloosa", "lake", "Tuscaloosa County, AL", 8, false],
  "357": ["Bankhead Lake", "lake", "Walker County, AL", 10, false],
  "358": ["Weiss Lake", "lake", "Cherokee County, AL", 8, false],
  "359": ["Lake Eufaula", "lake", "Barbour County, AL", 10, false],
  "360": ["Alabama River", "river", "Montgomery County, AL", 8, false],
  "361": ["Mobile Bay", "bay", "Mobile County, AL", 5, true],
  "362": ["Mobile Bay", "bay", "Mobile County, AL", 6, true],
  "363": ["Alabama River", "river", "Dallas County, AL", 10, false],
  "364": ["Perdido Bay", "bay", "Baldwin County, AL", 8, true],
  "365": ["Lake Eufaula", "lake", "Barbour County, AL", 8, false],
  "366": ["Mobile Bay", "bay", "Mobile County, AL", 4, true],
  "367": ["Lake Martin", "lake", "Elmore County, AL", 10, false],
  "368": ["Lake Mitchell", "lake", "Chilton County, AL", 8, false],
  "370": ["Percy Priest Lake", "lake", "Davidson County, TN", 8, false],
  "371": ["Percy Priest Lake", "lake", "Davidson County, TN", 6, false],
  "372": ["Old Hickory Lake", "lake", "Davidson County, TN", 8, false],
  "373": ["Chickamauga Lake", "lake", "Hamilton County, TN", 6, false],
  "374": ["Chickamauga Lake", "lake", "Hamilton County, TN", 8, false],
  "375": ["Center Hill Lake", "lake", "DeKalb County, TN", 10, false],
  "376": ["Dale Hollow Lake", "lake", "Clay County, TN", 10, false],
  "377": ["Watts Bar Lake", "lake", "Meigs County, TN", 8, false],
  "378": ["Douglas Lake", "lake", "Jefferson County, TN", 8, false],
  "379": ["Norris Lake", "lake", "Anderson County, TN", 10, false],
  "380": ["Reelfoot Lake", "lake", "Obion County, TN", 8, false],
  "381": ["Pickwick Lake", "lake", "Hardin County, TN", 10, false],
  "382": ["Kentucky Lake", "lake", "Benton County, TN", 6, false],
  "383": ["Tim's Ford Lake", "lake", "Franklin County, TN", 10, false],
  "384": ["Tims Ford Lake", "lake", "Moore County, TN", 12, false],
  "385": ["Kentucky Lake", "lake", "Decatur County, TN", 8, false],
  "386": ["Sardis Lake", "lake", "Panola County, MS", 10, false],
  "387": ["Ross Barnett Reservoir", "reservoir", "Rankin County, MS", 8, false],
  "388": ["Sardis Lake", "lake", "Lafayette County, MS", 10, false],
  "389": ["Ross Barnett Reservoir", "reservoir", "Hinds County, MS", 6, false],
  "390": ["Ross Barnett Reservoir", "reservoir", "Hinds County, MS", 8, false],
  "391": ["Mississippi River", "river", "Warren County, MS", 5, false],
  "392": ["Gulf of Mexico", "gulf", "Harrison County, MS", 4, true],
  "393": ["Gulf of Mexico", "gulf", "Jackson County, MS", 5, true],
  "394": ["Grenada Lake", "lake", "Grenada County, MS", 8, false],
  "395": ["Arkabutla Lake", "lake", "Tate County, MS", 10, false],
  "396": ["Pickwick Lake", "lake", "Tishomingo County, MS", 8, false],
  "397": ["Mississippi River", "river", "Washington County, MS", 5, false],
  // ── Kentucky ──
  "400": ["Ohio River", "river", "Jefferson County, KY", 5, false],
  "401": ["Ohio River", "river", "Jefferson County, KY", 6, false],
  "402": ["Ohio River", "river", "Jefferson County, KY", 4, false],
  "403": ["Lake Cumberland", "lake", "Pulaski County, KY", 15, false],
  "404": ["Kentucky River", "river", "Fayette County, KY", 6, false],
  "405": ["Kentucky River", "river", "Fayette County, KY", 8, false],
  "406": ["Cave Run Lake", "lake", "Rowan County, KY", 10, false],
  "407": ["Yatesville Lake", "lake", "Lawrence County, KY", 10, false],
  "408": ["Grayson Lake", "lake", "Carter County, KY", 8, false],
  "410": ["Lake Cumberland", "lake", "Russell County, KY", 8, false],
  "411": ["Dale Hollow Lake", "lake", "Clinton County, KY", 10, false],
  "412": ["Green River Lake", "lake", "Taylor County, KY", 10, false],
  "413": ["Kentucky Lake", "lake", "Marshall County, KY", 6, false],
  "414": ["Lake Barkley", "lake", "Lyon County, KY", 8, false],
  "415": ["Barren River Lake", "lake", "Allen County, KY", 10, false],
  "416": ["Nolin River Lake", "lake", "Edmonson County, KY", 10, false],
  "417": ["Rough River Lake", "lake", "Grayson County, KY", 12, false],
  "418": ["Ohio River", "river", "Daviess County, KY", 5, false],
  // ── Ohio ──
  "430": ["Alum Creek Lake", "lake", "Delaware County, OH", 8, false],
  "431": ["Alum Creek Lake", "lake", "Franklin County, OH", 10, false],
  "432": ["Buckeye Lake", "lake", "Licking County, OH", 8, false],
  "433": ["Salt Fork Lake", "lake", "Guernsey County, OH", 10, false],
  "434": ["Senecaville Lake", "lake", "Noble County, OH", 10, false],
  "435": ["Grand Lake St. Marys", "lake", "Mercer County, OH", 8, false],
  "436": ["Grand Lake St. Marys", "lake", "Auglaize County, OH", 10, false],
  "437": ["Indian Lake", "lake", "Logan County, OH", 8, false],
  "438": ["Maumee River", "river", "Lucas County, OH", 5, false],
  "439": ["Lake Erie", "lake", "Lucas County, OH", 6, false],
  "440": ["Lake Erie", "lake", "Cuyahoga County, OH", 5, false],
  "441": ["Lake Erie", "lake", "Cuyahoga County, OH", 6, false],
  "442": ["Lake Erie", "lake", "Lake County, OH", 4, false],
  "443": ["Lake Erie", "lake", "Lorain County, OH", 5, false],
  "444": ["Mosquito Lake", "lake", "Trumbull County, OH", 8, false],
  "445": ["Atwood Lake", "lake", "Tuscarawas County, OH", 10, false],
  "446": ["Lake Erie", "lake", "Erie County, OH", 4, false],
  "447": ["Pymatuning Lake", "lake", "Ashtabula County, OH", 8, false],
  "448": ["Portage Lakes", "lake", "Summit County, OH", 6, false],
  "449": ["Berlin Lake", "lake", "Mahoning County, OH", 8, false],
  "450": ["Caesar Creek Lake", "lake", "Warren County, OH", 10, false],
  "451": ["Caesar Creek Lake", "lake", "Warren County, OH", 8, false],
  "452": ["Ohio River", "river", "Hamilton County, OH", 5, false],
  "453": ["Ohio River", "river", "Montgomery County, OH", 12, false],
  "454": ["Grand Lake St. Marys", "lake", "Mercer County, OH", 10, false],
  "455": ["Indian Lake", "lake", "Champaign County, OH", 10, false],
  "456": ["Paint Creek Lake", "lake", "Highland County, OH", 10, false],
  "457": ["Ohio River", "river", "Scioto County, OH", 6, false],
  "458": ["Ohio River", "river", "Adams County, OH", 8, false],
  // ── Indiana / Michigan ──
  "460": ["Geist Reservoir", "reservoir", "Hamilton County, IN", 8, false],
  "461": ["Eagle Creek Reservoir", "reservoir", "Marion County, IN", 6, false],
  "462": ["Geist Reservoir", "reservoir", "Marion County, IN", 8, false],
  "463": ["Morse Reservoir", "reservoir", "Hamilton County, IN", 6, false],
  "464": ["Lake Monroe", "lake", "Monroe County, IN", 8, false],
  "465": ["Brookville Lake", "lake", "Franklin County, IN", 12, false],
  "466": ["Monroe Lake", "lake", "Monroe County, IN", 6, false],
  "467": ["Patoka Lake", "lake", "Dubois County, IN", 10, false],
  "468": ["Ohio River", "river", "Vanderburgh County, IN", 5, false],
  "469": ["Wabash River", "river", "Tippecanoe County, IN", 6, false],
  "470": ["Ohio River", "river", "Clark County, IN", 5, false],
  "471": ["Lake Shafer", "lake", "White County, IN", 10, false],
  "472": ["Salamonie Lake", "lake", "Huntington County, IN", 10, false],
  "473": ["Mississinewa Lake", "lake", "Miami County, IN", 8, false],
  "474": ["Lake Michigan", "lake", "Lake County, IN", 10, false],
  "475": ["Lake Wawasee", "lake", "Kosciusko County, IN", 8, false],
  "476": ["Lake Michigan", "lake", "St. Joseph County, IN", 12, false],
  "477": ["Brookville Lake", "lake", "Franklin County, IN", 10, false],
  "478": ["Cecil Harden Lake", "lake", "Parke County, IN", 10, false],
  "479": ["Wabash River", "river", "Tippecanoe County, IN", 5, false],
  "480": ["Lake St. Clair", "lake", "Macomb County, MI", 8, false],
  "481": ["Lake St. Clair", "lake", "Macomb County, MI", 6, false],
  "482": ["Detroit River", "river", "Wayne County, MI", 5, false],
  "483": ["Lake Michigan", "lake", "Ottawa County, MI", 8, false],
  "484": ["Saginaw Bay", "bay", "Bay County, MI", 6, false],
  "485": ["Houghton Lake", "lake", "Roscommon County, MI", 8, false],
  "486": ["Lake Huron", "lake", "Iosco County, MI", 6, false],
  "487": ["Lake Michigan", "lake", "Grand Traverse County, MI", 5, false],
  "488": ["Burt Lake", "lake", "Cheboygan County, MI", 6, false],
  "489": ["Lake Michigan", "lake", "Manistee County, MI", 8, false],
  "490": ["Lake Michigan", "lake", "Allegan County, MI", 6, false],
  "491": ["Muskegon Lake", "lake", "Muskegon County, MI", 5, false],
  "492": ["Lake Michigan", "lake", "Kent County, MI", 12, false],
  "493": ["Gun Lake", "lake", "Barry County, MI", 8, false],
  "494": ["Gull Lake", "lake", "Kalamazoo County, MI", 6, false],
  "495": ["Lake Michigan", "lake", "Berrien County, MI", 8, false],
  "496": ["Lake Superior", "lake", "Marquette County, MI", 6, false],
  "497": ["Lake Superior", "lake", "Houghton County, MI", 8, false],
  "498": ["Lake Superior", "lake", "Chippewa County, MI", 10, false],
  "499": ["Lake Superior", "lake", "Gogebic County, MI", 8, false],
  // ── Midwest (WI, MN, IA, IL, MO) ──
  "530": ["Lake Mendota", "lake", "Dane County, WI", 5, false],
  "531": ["Lake Geneva", "lake", "Walworth County, WI", 8, false],
  "532": ["Lake Mendota", "lake", "Dane County, WI", 6, false],
  "534": ["Mississippi River", "river", "La Crosse County, WI", 5, false],
  "535": ["Lake Winnebago", "lake", "Winnebago County, WI", 6, false],
  "537": ["Lake Winnebago", "lake", "Fond du Lac County, WI", 8, false],
  "538": ["Wisconsin River", "river", "Marathon County, WI", 6, false],
  "539": ["Lake Superior", "lake", "Douglas County, WI", 8, false],
  "540": ["Castle Rock Lake", "lake", "Adams County, WI", 8, false],
  "541": ["Wolf River", "river", "Shawano County, WI", 6, false],
  "542": ["Lake Michigan", "lake", "Brown County, WI", 5, false],
  "543": ["Lake Michigan", "lake", "Sheboygan County, WI", 6, false],
  "544": ["Chequamegon Bay", "bay", "Ashland County, WI", 8, false],
  "545": ["Flambeau Flowage", "lake", "Sawyer County, WI", 10, false],
  "546": ["Lac du Flambeau", "lake", "Vilas County, WI", 8, false],
  "547": ["Lake Pepin", "lake", "Pepin County, WI", 8, false],
  "548": ["Big Eau Pleine Reservoir", "reservoir", "Marathon County, WI", 10, false],
  "549": ["Lake Michigan", "lake", "Manitowoc County, WI", 6, false],
  "550": ["Lake Minnetonka", "lake", "Hennepin County, MN", 6, false],
  "551": ["Lake Minnetonka", "lake", "Hennepin County, MN", 8, false],
  "553": ["Mississippi River", "river", "Hennepin County, MN", 5, false],
  "554": ["Mississippi River", "river", "Ramsey County, MN", 6, false],
  "556": ["Lake Superior", "lake", "St. Louis County, MN", 5, false],
  "557": ["Mille Lacs Lake", "lake", "Mille Lacs County, MN", 8, false],
  "558": ["Lake of the Woods", "lake", "Lake of the Woods County, MN", 10, false],
  "559": ["Leech Lake", "lake", "Cass County, MN", 8, false],
  "560": ["Lake Minnetonka", "lake", "Carver County, MN", 10, false],
  "561": ["Lac Qui Parle", "lake", "Lac qui Parle County, MN", 8, false],
  "562": ["Lake Pepin", "river", "Goodhue County, MN", 8, false],
  "563": ["Mille Lacs Lake", "lake", "Mille Lacs County, MN", 6, false],
  "564": ["Lake Winnibigoshish", "lake", "Itasca County, MN", 8, false],
  "565": ["Lake of the Woods", "lake", "Roseau County, MN", 10, false],
  "566": ["Red Lake", "lake", "Beltrami County, MN", 8, false],
  "567": ["Otter Tail Lake", "lake", "Otter Tail County, MN", 6, false],
  "500": ["Saylorville Lake", "lake", "Polk County, IA", 8, false],
  "501": ["Saylorville Lake", "lake", "Polk County, IA", 6, false],
  "502": ["Red Rock Lake", "lake", "Marion County, IA", 10, false],
  "503": ["Rathbun Lake", "lake", "Appanoose County, IA", 12, false],
  "504": ["Mississippi River", "river", "Clinton County, IA", 5, false],
  "505": ["Coralville Lake", "lake", "Johnson County, IA", 8, false],
  "506": ["Mississippi River", "river", "Dubuque County, IA", 5, false],
  "507": ["Spirit Lake", "lake", "Dickinson County, IA", 6, false],
  "508": ["Storm Lake", "lake", "Buena Vista County, IA", 8, false],
  "509": ["Missouri River", "river", "Pottawattamie County, IA", 6, false],
  "510": ["Missouri River", "river", "Pottawattamie County, IA", 5, false],
  "511": ["Missouri River", "river", "Woodbury County, IA", 5, false],
  "512": ["Big Creek Lake", "lake", "Polk County, IA", 8, false],
  "513": ["Saylorville Lake", "lake", "Dallas County, IA", 10, false],
  "514": ["Coralville Lake", "lake", "Johnson County, IA", 6, false],
  "515": ["Brushy Creek Lake", "lake", "Webster County, IA", 10, false],
  "516": ["Missouri River", "river", "Woodbury County, IA", 6, false],
  "520": ["Mississippi River", "river", "Scott County, IA", 5, false],
  "521": ["Mississippi River", "river", "Des Moines County, IA", 6, false],
  "522": ["Mississippi River", "river", "Lee County, IA", 5, false],
  "523": ["Coralville Lake", "lake", "Iowa County, IA", 10, false],
  "524": ["Rathbun Lake", "lake", "Appanoose County, IA", 10, false],
  "525": ["Lake Red Rock", "lake", "Marion County, IA", 8, false],
  "526": ["Mississippi River", "river", "Des Moines County, IA", 5, false],
  "527": ["Lake Red Rock", "lake", "Mahaska County, IA", 12, false],
  "528": ["Lake Red Rock", "lake", "Wapello County, IA", 10, false],
  // ── Illinois ──
  "600": ["Lake Michigan", "lake", "Cook County, IL", 6, false],
  "601": ["Lake Michigan", "lake", "Cook County, IL", 8, false],
  "602": ["Lake Michigan", "lake", "Cook County, IL", 5, false],
  "603": ["Fox Chain O'Lakes", "lake", "Lake County, IL", 8, false],
  "604": ["Fox Chain O'Lakes", "lake", "McHenry County, IL", 10, false],
  "605": ["Lake Michigan", "lake", "Cook County, IL", 6, false],
  "606": ["Lake Michigan", "lake", "Cook County, IL", 4, false],
  "607": ["Lake Michigan", "lake", "Cook County, IL", 5, false],
  "608": ["Lake Michigan", "lake", "Cook County, IL", 6, false],
  "609": ["Kankakee River", "river", "Kankakee County, IL", 8, false],
  "610": ["Illinois River", "river", "Peoria County, IL", 5, false],
  "611": ["Illinois River", "river", "Peoria County, IL", 6, false],
  "612": ["Carlyle Lake", "lake", "Clinton County, IL", 10, false],
  "613": ["Rend Lake", "lake", "Jefferson County, IL", 8, false],
  "614": ["Lake Shelbyville", "lake", "Shelby County, IL", 10, false],
  "615": ["Clinton Lake", "lake", "DeWitt County, IL", 8, false],
  "616": ["Lake of Egypt", "lake", "Williamson County, IL", 8, false],
  "617": ["Mississippi River", "river", "Madison County, IL", 5, false],
  "618": ["Carlyle Lake", "lake", "Clinton County, IL", 8, false],
  "619": ["Rend Lake", "lake", "Franklin County, IL", 6, false],
  "620": ["Mississippi River", "river", "Rock Island County, IL", 5, false],
  "622": ["Mississippi River", "river", "Adams County, IL", 5, false],
  "623": ["Lake Springfield", "lake", "Sangamon County, IL", 6, false],
  "624": ["Clinton Lake", "lake", "DeWitt County, IL", 10, false],
  "625": ["Lake Shelbyville", "lake", "Moultrie County, IL", 8, false],
  // ── Missouri / Kansas / Nebraska ──
  "630": ["Mississippi River", "river", "St. Louis County, MO", 5, false],
  "631": ["Mississippi River", "river", "St. Louis City, MO", 4, false],
  "633": ["Mark Twain Lake", "lake", "Monroe County, MO", 10, false],
  "634": ["Lake of the Ozarks", "lake", "Miller County, MO", 8, false],
  "635": ["Stockton Lake", "lake", "Cedar County, MO", 10, false],
  "636": ["Table Rock Lake", "lake", "Taney County, MO", 8, false],
  "637": ["Table Rock Lake", "lake", "Stone County, MO", 6, false],
  "638": ["Bull Shoals Lake", "lake", "Ozark County, MO", 10, false],
  "639": ["Truman Lake", "lake", "Benton County, MO", 8, false],
  "640": ["Missouri River", "river", "Jackson County, MO", 6, false],
  "641": ["Missouri River", "river", "Jackson County, MO", 5, false],
  "644": ["Smithville Lake", "lake", "Clay County, MO", 8, false],
  "645": ["Pomme de Terre Lake", "lake", "Hickory County, MO", 10, false],
  "646": ["Lake of the Ozarks", "lake", "Camden County, MO", 6, false],
  "647": ["Ozark Lake", "lake", "Christian County, MO", 8, false],
  "648": ["Lake of the Ozarks", "lake", "Morgan County, MO", 10, false],
  "650": ["Longview Lake", "lake", "Jackson County, MO", 8, false],
  "651": ["Missouri River", "river", "Cole County, MO", 5, false],
  "652": ["Mark Twain Lake", "lake", "Ralls County, MO", 10, false],
  "653": ["Pomme de Terre Lake", "lake", "Polk County, MO", 10, false],
  "654": ["Table Rock Lake", "lake", "Taney County, MO", 6, false],
  "655": ["Smithville Lake", "lake", "DeKalb County, MO", 10, false],
  "656": ["Stockton Lake", "lake", "Cedar County, MO", 8, false],
  "660": ["Clinton Lake", "lake", "Douglas County, KS", 8, false],
  "661": ["Clinton Lake", "lake", "Douglas County, KS", 6, false],
  "662": ["Perry Lake", "lake", "Jefferson County, KS", 10, false],
  "664": ["Milford Lake", "lake", "Geary County, KS", 8, false],
  "665": ["Tuttle Creek Lake", "lake", "Riley County, KS", 10, false],
  "666": ["Milford Lake", "lake", "Dickinson County, KS", 8, false],
  "667": ["Glen Elder Reservoir", "reservoir", "Mitchell County, KS", 12, false],
  "668": ["Cheney Reservoir", "reservoir", "Reno County, KS", 8, false],
  "669": ["Cheney Reservoir", "reservoir", "Sedgwick County, KS", 10, false],
  "670": ["El Dorado Lake", "lake", "Butler County, KS", 8, false],
  "671": ["Fall River Lake", "lake", "Greenwood County, KS", 10, false],
  "672": ["John Redmond Reservoir", "reservoir", "Coffey County, KS", 10, false],
  "673": ["Elk City Lake", "lake", "Montgomery County, KS", 8, false],
  "674": ["El Dorado Lake", "lake", "Butler County, KS", 10, false],
  "675": ["Kanopolis Lake", "lake", "Ellsworth County, KS", 12, false],
  "676": ["Cedar Bluff Reservoir", "reservoir", "Trego County, KS", 10, false],
  "677": ["Keith Sebelius Reservoir", "reservoir", "Norton County, KS", 12, false],
  "678": ["Kirwin Reservoir", "reservoir", "Phillips County, KS", 10, false],
  "679": ["Webster Reservoir", "reservoir", "Rooks County, KS", 12, false],
  "680": ["Lake McConaughy", "lake", "Keith County, NE", 12, false],
  "681": ["Lake Ogallala", "lake", "Keith County, NE", 10, false],
  "683": ["Merritt Reservoir", "reservoir", "Cherry County, NE", 10, false],
  "684": ["Lewis and Clark Lake", "lake", "Cedar County, NE", 8, false],
  "685": ["Missouri River", "river", "Dakota County, NE", 5, false],
  "686": ["Branched Oak Lake", "lake", "Lancaster County, NE", 8, false],
  "687": ["Lake McConaughy", "lake", "Keith County, NE", 10, false],
  "688": ["Harlan County Reservoir", "reservoir", "Harlan County, NE", 10, false],
  "689": ["Swanson Reservoir", "reservoir", "Hitchcock County, NE", 12, false],
  "690": ["Branched Oak Lake", "lake", "Lancaster County, NE", 6, false],
  "691": ["Salt Valley Lakes", "lake", "Lancaster County, NE", 8, false],
  "692": ["Missouri River", "river", "Douglas County, NE", 5, false],
  "693": ["Platte River", "river", "Hall County, NE", 5, false],
  // ── Texas ──
  "700": ["Lake Pontchartrain", "lake", "Orleans Parish, LA", 5, false],
  "701": ["Lake Pontchartrain", "lake", "Orleans Parish, LA", 4, false],
  "703": ["Atchafalaya Basin", "bay", "Iberia Parish, LA", 8, true],
  "704": ["Toledo Bend", "lake", "Sabine Parish, LA", 10, false],
  "705": ["Toledo Bend", "lake", "Sabine Parish, LA", 8, false],
  "706": ["Lake Claiborne", "lake", "Claiborne Parish, LA", 10, false],
  "707": ["Calcasieu Lake", "lake", "Calcasieu Parish, LA", 8, true],
  "708": ["Atchafalaya Basin", "bay", "St. Martin Parish, LA", 6, true],
  "710": ["Cross Lake", "lake", "Caddo Parish, LA", 5, false],
  "711": ["Cross Lake", "lake", "Caddo Parish, LA", 6, false],
  "712": ["Lake D'Arbonne", "lake", "Union Parish, LA", 8, false],
  "713": ["Bayou D'Arbonne Lake", "lake", "Union Parish, LA", 10, false],
  "714": ["Grand Isle", "gulf", "Jefferson Parish, LA", 4, true],
  "750": ["Lake Ray Hubbard", "lake", "Dallas County, TX", 8, false],
  "751": ["Lake Ray Hubbard", "lake", "Dallas County, TX", 6, false],
  "752": ["Joe Pool Lake", "lake", "Dallas County, TX", 10, false],
  "753": ["Eagle Mountain Lake", "lake", "Tarrant County, TX", 8, false],
  "754": ["Eagle Mountain Lake", "lake", "Tarrant County, TX", 10, false],
  "755": ["Lewisville Lake", "lake", "Denton County, TX", 6, false],
  "756": ["Lake Whitney", "lake", "Hill County, TX", 10, false],
  "757": ["Possum Kingdom Lake", "lake", "Palo Pinto County, TX", 12, false],
  "758": ["Lake Brownwood", "lake", "Brown County, TX", 10, false],
  "759": ["O.H. Ivie Reservoir", "reservoir", "Coleman County, TX", 12, false],
  "760": ["Eagle Mountain Lake", "lake", "Tarrant County, TX", 6, false],
  "761": ["Lake Waco", "lake", "McLennan County, TX", 8, false],
  "762": ["Lake Texoma", "lake", "Grayson County, TX", 8, false],
  "763": ["Richland-Chambers", "reservoir", "Navarro County, TX", 10, false],
  "764": ["Lake Tawakoni", "lake", "Hunt County, TX", 10, false],
  "765": ["Lake Bob Sandlin", "lake", "Titus County, TX", 8, false],
  "766": ["Caddo Lake", "lake", "Harrison County, TX", 6, false],
  "767": ["Sam Rayburn Reservoir", "reservoir", "Jasper County, TX", 8, false],
  "768": ["Lake Livingston", "lake", "Polk County, TX", 10, false],
  "769": ["Toledo Bend", "lake", "Sabine County, TX", 8, false],
  "770": ["Galveston Bay", "bay", "Galveston County, TX", 6, true],
  "771": ["Galveston Bay", "bay", "Harris County, TX", 10, true],
  "772": ["Galveston Bay", "bay", "Harris County, TX", 8, true],
  "773": ["Lake Conroe", "lake", "Montgomery County, TX", 8, false],
  "774": ["Matagorda Bay", "bay", "Matagorda County, TX", 6, true],
  "775": ["Galveston Bay", "bay", "Galveston County, TX", 4, true],
  "776": ["Matagorda Bay", "bay", "Matagorda County, TX", 8, true],
  "777": ["Lake Conroe", "lake", "Walker County, TX", 10, false],
  "778": ["Lake Houston", "lake", "Harris County, TX", 8, false],
  "779": ["Choke Canyon Reservoir", "reservoir", "Live Oak County, TX", 10, false],
  "780": ["Canyon Lake", "lake", "Comal County, TX", 10, false],
  "781": ["Canyon Lake", "lake", "Comal County, TX", 8, false],
  "782": ["Medina Lake", "lake", "Bandera County, TX", 8, false],
  "783": ["Aransas Bay", "bay", "Aransas County, TX", 5, true],
  "784": ["Laguna Madre", "bay", "Cameron County, TX", 4, true],
  "785": ["Corpus Christi Bay", "bay", "Nueces County, TX", 5, true],
  "786": ["Lake Travis", "lake", "Travis County, TX", 6, false],
  "787": ["Lake Travis", "lake", "Travis County, TX", 5, false],
  "788": ["Lake Buchanan", "lake", "Llano County, TX", 10, false],
  "789": ["Falcon Lake", "lake", "Zapata County, TX", 8, false],
  "790": ["Lake Alan Henry", "lake", "Garza County, TX", 12, false],
  "791": ["Buffalo Springs Lake", "lake", "Lubbock County, TX", 8, false],
  "792": ["Lake Meredith", "lake", "Hutchinson County, TX", 10, false],
  "793": ["Lake Meredith", "lake", "Potter County, TX", 12, false],
  "794": ["Hueco Tanks", "reservoir", "El Paso County, TX", 20, false],
  "795": ["O.C. Fisher Lake", "lake", "Tom Green County, TX", 10, false],
  "796": ["O.H. Ivie Reservoir", "reservoir", "Concho County, TX", 12, false],
  "797": ["Lake Alan Henry", "lake", "Garza County, TX", 10, false],
  "798": ["Amistad Reservoir", "reservoir", "Val Verde County, TX", 8, false],
  "799": ["Balmorhea Lake", "lake", "Reeves County, TX", 15, false],
  // ── Mountain / West ──
  "800": ["Cherry Creek Reservoir", "reservoir", "Arapahoe County, CO", 8, false],
  "801": ["Chatfield Reservoir", "reservoir", "Douglas County, CO", 10, false],
  "802": ["Horsetooth Reservoir", "reservoir", "Larimer County, CO", 8, false],
  "803": ["Boulder Reservoir", "reservoir", "Boulder County, CO", 6, false],
  "804": ["Aurora Reservoir", "reservoir", "Arapahoe County, CO", 10, false],
  "805": ["Pueblo Reservoir", "reservoir", "Pueblo County, CO", 8, false],
  "806": ["John Martin Reservoir", "reservoir", "Bent County, CO", 12, false],
  "807": ["Trinidad Lake", "lake", "Las Animas County, CO", 10, false],
  "808": ["Blue Mesa Reservoir", "reservoir", "Gunnison County, CO", 8, false],
  "809": ["Vallecito Reservoir", "reservoir", "La Plata County, CO", 10, false],
  "810": ["Steamboat Lake", "lake", "Routt County, CO", 10, false],
  "811": ["Lake Granby", "lake", "Grand County, CO", 8, false],
  "812": ["Eleven Mile Reservoir", "reservoir", "Park County, CO", 10, false],
  "813": ["Blue Mesa Reservoir", "reservoir", "Gunnison County, CO", 10, false],
  "814": ["Vail Lake", "lake", "Eagle County, CO", 8, false],
  "815": ["Lake Powell", "lake", "San Juan County, CO", 15, false],
  "816": ["McPhee Reservoir", "reservoir", "Montezuma County, CO", 10, false],
  "820": ["Flaming Gorge Reservoir", "reservoir", "Sweetwater County, WY", 10, false],
  "821": ["Flaming Gorge Reservoir", "reservoir", "Sweetwater County, WY", 8, false],
  "822": ["Keyhole Reservoir", "reservoir", "Crook County, WY", 12, false],
  "823": ["Glendo Reservoir", "reservoir", "Platte County, WY", 10, false],
  "824": ["Boysen Reservoir", "reservoir", "Fremont County, WY", 10, false],
  "825": ["Seminoe Reservoir", "reservoir", "Carbon County, WY", 12, false],
  "826": ["Buffalo Bill Reservoir", "reservoir", "Park County, WY", 8, false],
  "827": ["Yellowstone Lake", "lake", "Park County, WY", 10, false],
  "828": ["Jackson Lake", "lake", "Teton County, WY", 8, false],
  "829": ["Palisades Reservoir", "reservoir", "Lincoln County, WY", 10, false],
  "830": ["Fort Peck Lake", "lake", "Valley County, MT", 10, false],
  "831": ["Fort Peck Lake", "lake", "Garfield County, MT", 12, false],
  "832": ["Flathead Lake", "lake", "Lake County, MT", 6, false],
  "833": ["Canyon Ferry Lake", "lake", "Lewis and Clark County, MT", 8, false],
  "834": ["Holter Lake", "lake", "Lewis and Clark County, MT", 10, false],
  "835": ["Georgetown Lake", "lake", "Deer Lodge County, MT", 8, false],
  "836": ["Yellowtail Reservoir", "reservoir", "Big Horn County, MT", 12, false],
  "837": ["Noxon Rapids Reservoir", "reservoir", "Sanders County, MT", 10, false],
  "838": ["Flathead Lake", "lake", "Flathead County, MT", 8, false],
  "840": ["Utah Lake", "lake", "Utah County, UT", 8, false],
  "841": ["Utah Lake", "lake", "Utah County, UT", 6, false],
  "843": ["Willard Bay", "reservoir", "Box Elder County, UT", 10, false],
  "844": ["Bear Lake", "lake", "Rich County, UT", 10, false],
  "845": ["Flaming Gorge Reservoir", "reservoir", "Daggett County, UT", 8, false],
  "846": ["Strawberry Reservoir", "reservoir", "Wasatch County, UT", 10, false],
  "847": ["Lake Powell", "lake", "San Juan County, UT", 10, false],
  // ── Pacific / Northwest ──
  "850": ["Saguaro Lake", "lake", "Maricopa County, AZ", 10, false],
  "852": ["Saguaro Lake", "lake", "Maricopa County, AZ", 8, false],
  "853": ["Bartlett Lake", "lake", "Maricopa County, AZ", 10, false],
  "855": ["Lake Pleasant", "lake", "Maricopa County, AZ", 8, false],
  "856": ["Roosevelt Lake", "lake", "Gila County, AZ", 12, false],
  "857": ["Lake Havasu", "lake", "Mohave County, AZ", 8, false],
  "859": ["Lake Havasu", "lake", "Mohave County, AZ", 6, false],
  "860": ["Lake Pleasant", "lake", "Yavapai County, AZ", 10, false],
  "863": ["Patagonia Lake", "lake", "Santa Cruz County, AZ", 10, false],
  "864": ["Lake Powell", "lake", "Coconino County, AZ", 10, false],
  "865": ["Show Low Lake", "lake", "Navajo County, AZ", 8, false],
  "870": ["Elephant Butte Lake", "lake", "Sierra County, NM", 10, false],
  "871": ["Elephant Butte Lake", "lake", "Sierra County, NM", 8, false],
  "873": ["Cochiti Lake", "lake", "Sandoval County, NM", 12, false],
  "874": ["Navajo Lake", "lake", "San Juan County, NM", 10, false],
  "875": ["Ute Lake", "lake", "Quay County, NM", 10, false],
  "877": ["Caballo Lake", "lake", "Sierra County, NM", 8, false],
  "878": ["Conchas Lake", "lake", "San Miguel County, NM", 12, false],
  "879": ["Brantley Lake", "lake", "Eddy County, NM", 10, false],
  "880": ["Brantley Lake", "lake", "Eddy County, NM", 12, false],
  "881": ["Sumner Lake", "lake", "De Baca County, NM", 10, false],
  "882": ["Elephant Butte Lake", "lake", "Sierra County, NM", 10, false],
  "890": ["Lake Mead", "lake", "Clark County, NV", 8, false],
  "891": ["Lake Mead", "lake", "Clark County, NV", 6, false],
  "893": ["Lahontan Reservoir", "reservoir", "Churchill County, NV", 10, false],
  "894": ["Pyramid Lake", "lake", "Washoe County, NV", 8, false],
  "895": ["Lake Tahoe", "lake", "Washoe County, NV", 10, false],
  "897": ["Rye Patch Reservoir", "reservoir", "Pershing County, NV", 12, false],
  "898": ["Ruby Lake", "lake", "Elko County, NV", 15, false],
  // ── Pacific Northwest ──
  "970": ["Columbia River", "river", "Multnomah County, OR", 5, false],
  "971": ["Columbia River", "river", "Multnomah County, OR", 6, false],
  "972": ["Willamette River", "river", "Multnomah County, OR", 8, false],
  "973": ["Detroit Lake", "lake", "Marion County, OR", 10, false],
  "974": ["Pacific Ocean", "ocean", "Lincoln County, OR", 5, true],
  "975": ["Wickiup Reservoir", "reservoir", "Deschutes County, OR", 10, false],
  "976": ["Emigrant Lake", "lake", "Jackson County, OR", 8, false],
  "977": ["Upper Klamath Lake", "lake", "Klamath County, OR", 6, false],
  "978": ["John Day River", "river", "Grant County, OR", 10, false],
  "979": ["Wallowa Lake", "lake", "Wallowa County, OR", 10, false],
  "980": ["Puget Sound", "bay", "King County, WA", 5, true],
  "981": ["Puget Sound", "bay", "King County, WA", 6, true],
  "982": ["Lake Washington", "lake", "King County, WA", 5, false],
  "983": ["Puget Sound", "bay", "Pierce County, WA", 6, true],
  "984": ["Puget Sound", "bay", "Thurston County, WA", 8, true],
  "985": ["Pacific Ocean", "ocean", "Grays Harbor County, WA", 5, true],
  "986": ["Columbia River", "river", "Clark County, WA", 6, false],
  "988": ["Banks Lake", "lake", "Grant County, WA", 8, false],
  "989": ["Potholes Reservoir", "reservoir", "Grant County, WA", 10, false],
  "990": ["Lake Coeur d'Alene", "lake", "Kootenai County, ID", 8, false],
  "991": ["Lake Roosevelt", "lake", "Lincoln County, WA", 10, false],
  "992": ["Snake River", "river", "Whitman County, WA", 8, false],
  "993": ["Priest Lake", "lake", "Bonner County, ID", 10, false],
  "994": ["Snake River", "river", "Nez Perce County, ID", 8, false],
  // ── California ──
  "900": ["Pacific Ocean", "ocean", "Los Angeles County, CA", 5, true],
  "901": ["Pacific Ocean", "ocean", "Los Angeles County, CA", 6, true],
  "902": ["Santa Monica Bay", "bay", "Los Angeles County, CA", 4, true],
  "903": ["Pacific Ocean", "ocean", "Los Angeles County, CA", 8, true],
  "904": ["Pacific Ocean", "ocean", "Los Angeles County, CA", 6, true],
  "905": ["Big Bear Lake", "lake", "San Bernardino County, CA", 15, false],
  "906": ["Pacific Ocean", "ocean", "Los Angeles County, CA", 5, true],
  "907": ["Pacific Ocean", "ocean", "Los Angeles County, CA", 6, true],
  "908": ["Lake Arrowhead", "lake", "San Bernardino County, CA", 12, false],
  "910": ["Pacific Ocean", "ocean", "Los Angeles County, CA", 4, true],
  "911": ["Pacific Ocean", "ocean", "Los Angeles County, CA", 5, true],
  "912": ["Castaic Lake", "lake", "Los Angeles County, CA", 10, false],
  "913": ["Pacific Ocean", "ocean", "Ventura County, CA", 6, true],
  "914": ["Lake Casitas", "lake", "Ventura County, CA", 8, false],
  "915": ["Lancaster area — limited fishing", "lake", "Los Angeles County, CA", 20, false],
  "917": ["Lake Perris", "lake", "Riverside County, CA", 8, false],
  "918": ["Lake Elsinore", "lake", "Riverside County, CA", 6, false],
  "919": ["San Diego Bay", "bay", "San Diego County, CA", 4, true],
  "920": ["San Diego Bay", "bay", "San Diego County, CA", 3, true],
  "921": ["San Diego Bay", "bay", "San Diego County, CA", 5, true],
  "922": ["Salton Sea", "lake", "Imperial County, CA", 10, false],
  "923": ["Pacific Ocean", "ocean", "San Bernardino County, CA", 15, true],
  "924": ["Pacific Ocean", "ocean", "San Bernardino County, CA", 20, true],
  "925": ["Diamond Valley Lake", "lake", "Riverside County, CA", 8, false],
  "926": ["Dana Point Harbor", "bay", "Orange County, CA", 4, true],
  "927": ["Newport Bay", "bay", "Orange County, CA", 3, true],
  "928": ["Lake Havasu", "lake", "San Bernardino County, CA", 8, false],
  "930": ["Pacific Ocean", "ocean", "Santa Barbara County, CA", 5, true],
  "931": ["Cachuma Lake", "lake", "Santa Barbara County, CA", 8, false],
  "932": ["Bakersfield — limited fishing", "lake", "Kern County, CA", 15, false],
  "933": ["Buena Vista Lake", "lake", "Kern County, CA", 10, false],
  "934": ["Monterey Bay", "bay", "Monterey County, CA", 4, true],
  "935": ["San Luis Reservoir", "reservoir", "Merced County, CA", 10, false],
  "936": ["Fresno — Pine Flat Lake", "lake", "Fresno County, CA", 12, false],
  "937": ["Millerton Lake", "lake", "Madera County, CA", 10, false],
  "938": ["Don Pedro Reservoir", "reservoir", "Tuolumne County, CA", 10, false],
  "939": ["Half Moon Bay", "bay", "San Mateo County, CA", 5, true],
  "940": ["San Francisco Bay", "bay", "San Francisco County, CA", 3, true],
  "941": ["San Francisco Bay", "bay", "San Francisco County, CA", 4, true],
  "942": ["San Pablo Bay", "bay", "Marin County, CA", 6, true],
  "943": ["Lake Berryessa", "lake", "Napa County, CA", 8, false],
  "944": ["San Pablo Bay", "bay", "Contra Costa County, CA", 6, true],
  "945": ["San Francisco Bay", "bay", "Alameda County, CA", 5, true],
  "946": ["Del Valle Reservoir", "reservoir", "Alameda County, CA", 8, false],
  "947": ["San Pablo Bay", "bay", "Contra Costa County, CA", 8, true],
  "948": ["San Pablo Bay", "bay", "Solano County, CA", 6, true],
  "949": ["Bodega Bay", "bay", "Sonoma County, CA", 5, true],
  "950": ["Pacific Ocean", "ocean", "Santa Cruz County, CA", 5, true],
  "951": ["Folsom Lake", "lake", "Sacramento County, CA", 8, false],
  "952": ["Folsom Lake", "lake", "Sacramento County, CA", 6, false],
  "953": ["Lake Oroville", "lake", "Butte County, CA", 8, false],
  "954": ["Lake Oroville", "lake", "Butte County, CA", 10, false],
  "955": ["Shasta Lake", "lake", "Shasta County, CA", 6, false],
  "956": ["Shasta Lake", "lake", "Shasta County, CA", 8, false],
  "957": ["Eagle Lake", "lake", "Lassen County, CA", 10, false],
  "958": ["Clear Lake", "lake", "Lake County, CA", 6, false],
  "959": ["Pacific Ocean", "ocean", "Humboldt County, CA", 5, true],
  "960": ["Pacific Ocean", "ocean", "Del Norte County, CA", 6, true],
  "961": ["Lake Tahoe", "lake", "El Dorado County, CA", 8, false],
  // ── Alaska / Hawaii ──
  "995": ["Kenai River", "river", "Kenai Peninsula, AK", 5, false],
  "996": ["Cook Inlet", "bay", "Anchorage, AK", 6, true],
  "997": ["Tanana River", "river", "Fairbanks North Star, AK", 8, false],
  "998": ["Inside Passage", "ocean", "Juneau, AK", 5, true],
  "999": ["Ketchikan Harbor", "bay", "Ketchikan, AK", 4, true],
  "967": ["Pacific Ocean", "ocean", "Honolulu County, HI", 3, true],
  "968": ["Pacific Ocean", "ocean", "Honolulu County, HI", 4, true],
  // ── Dakotas ──
  "570": ["Lake Oahe", "lake", "Hughes County, SD", 8, false],
  "571": ["Lake Sharpe", "lake", "Stanley County, SD", 10, false],
  "572": ["Lake Mitchell", "lake", "Davison County, SD", 8, false],
  "573": ["Missouri River", "river", "Yankton County, SD", 6, false],
  "574": ["Angostura Reservoir", "reservoir", "Fall River County, SD", 10, false],
  "575": ["Pactola Reservoir", "reservoir", "Pennington County, SD", 8, false],
  "576": ["Lake Francis Case", "lake", "Gregory County, SD", 10, false],
  "577": ["Lake Oahe", "lake", "Sully County, SD", 8, false],
  "580": ["Lake Sakakawea", "lake", "McLean County, ND", 8, false],
  "581": ["Lake Sakakawea", "lake", "Mercer County, ND", 10, false],
  "582": ["Devils Lake", "lake", "Ramsey County, ND", 6, false],
  "583": ["Lake Darling", "lake", "Renville County, ND", 10, false],
  "584": ["Lake Oahe", "lake", "Emmons County, ND", 8, false],
  "585": ["Red River", "river", "Cass County, ND", 5, false],
  "586": ["Lake Metigoshe", "lake", "Bottineau County, ND", 10, false],
  "587": ["Lake Sakakawea", "lake", "Williams County, ND", 8, false],
  "588": ["Red River", "river", "Grand Forks County, ND", 5, false],
  // ── Arkansas / Oklahoma ──
  "716": ["Lake D'Arbonne", "lake", "Union Parish, LA", 10, false],
  "717": ["Toledo Bend", "lake", "Sabine Parish, LA", 8, false],
  "718": ["Gulf of Mexico", "gulf", "Terrebonne Parish, LA", 5, true],
  "719": ["Lake Pontchartrain", "lake", "St. Tammany Parish, LA", 6, false],
  "720": ["Atchafalaya Basin", "bay", "St. Landry Parish, LA", 8, true],
  "721": ["Mississippi River", "river", "East Baton Rouge, LA", 5, false],
  "722": ["False River", "lake", "Pointe Coupee Parish, LA", 6, false],
  "723": ["Catahoula Lake", "lake", "LaSalle Parish, LA", 8, false],
  "724": ["Mississippi River", "river", "Concordia Parish, LA", 5, false],
  "725": ["Lake Pontchartrain", "lake", "Jefferson Parish, LA", 4, false],
  "726": ["Grand Isle", "gulf", "Jefferson Parish, LA", 5, true],
  "730": ["Keystone Lake", "lake", "Tulsa County, OK", 8, false],
  "731": ["Keystone Lake", "lake", "Tulsa County, OK", 6, false],
  "734": ["Grand Lake O' the Cherokees", "lake", "Delaware County, OK", 8, false],
  "735": ["Lake Eufaula", "lake", "McIntosh County, OK", 10, false],
  "736": ["Lake Texoma", "lake", "Bryan County, OK", 8, false],
  "737": ["Lake Murray", "lake", "Carter County, OK", 10, false],
  "738": ["Lake Lawtonka", "lake", "Comanche County, OK", 8, false],
  "739": ["Foss Reservoir", "reservoir", "Custer County, OK", 12, false],
  "740": ["Lake Thunderbird", "lake", "Cleveland County, OK", 8, false],
  "741": ["Lake Hefner", "lake", "Oklahoma County, OK", 6, false],
  "743": ["Canton Lake", "lake", "Blaine County, OK", 10, false],
  "744": ["Great Salt Plains Lake", "lake", "Alfalfa County, OK", 10, false],
  "745": ["Sardis Lake", "lake", "Pushmataha County, OK", 10, false],
  "746": ["Broken Bow Lake", "lake", "McCurtain County, OK", 8, false],
  "747": ["Lake Wister", "lake", "Le Flore County, OK", 10, false],
  "748": ["Robert S. Kerr Reservoir", "reservoir", "Sequoyah County, OK", 8, false],
  "749": ["Grand Lake O' the Cherokees", "lake", "Ottawa County, OK", 6, false],
};

/**
 * Check whether the input looks like a valid US ZIP code
 * (5 digits, optionally ZIP+4). The water-body and species data in this
 * module is US-only; anything that fails this check should fall back to
 * the universal Moon-based bite forecast.
 */
export function isUsZip(input: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(input.trim());
}

/**
 * Resolve a US ZIP code to its nearest mapped water body via the
 * 3-digit prefix table. Returns null for non-ZIP input or unmapped prefixes.
 */
export function getWaterBodyByZip(zip: string): WaterBody | null {
  if (!isUsZip(zip)) return null;
  const entry = ZIP_WATER_BODIES[zip.trim().slice(0, 3)];
  if (!entry) return null;
  return {
    name: entry[0],
    type: entry[1],
    county: entry[2],
    distanceMi: entry[3],
    isSaltwater: entry[4],
  };
}

/**
 * Search water bodies by name (or US ZIP code). Returns up to `limit` matches.
 * Used for the typeahead location picker in the fishing forecast.
 */
export function searchWaterBodies(query: string, limit = 6): WaterBody[] {
  if (!query || query.length < 2) return [];
  // ZIP code entered — resolve through the 3-digit prefix table
  if (isUsZip(query)) {
    const byZip = getWaterBodyByZip(query);
    return byZip ? [byZip] : [];
  }
  const q = query.toLowerCase();
  const seen = new Set<string>();
  const results: WaterBody[] = [];
  for (const entry of Object.values(ZIP_WATER_BODIES)) {
    const name = entry[0];
    if (seen.has(name)) continue;
    if (name.toLowerCase().includes(q) || entry[2].toLowerCase().includes(q)) {
      seen.add(name);
      results.push({
        name: entry[0],
        type: entry[1],
        county: entry[2],
        distanceMi: entry[3],
        isSaltwater: entry[4],
      });
      if (results.length >= limit) break;
    }
  }
  return results;
}

/**
 * Get a water body by exact name match.
 */
export function getWaterBodyByName(name: string): WaterBody | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  for (const entry of Object.values(ZIP_WATER_BODIES)) {
    if (entry[0].toLowerCase() === lower) {
      return {
        name: entry[0],
        type: entry[1],
        county: entry[2],
        distanceMi: entry[3],
        isSaltwater: entry[4],
      };
    }
  }
  return null;
}

function getDefaultWaterBody(): WaterBody {
  return {
    name: "Medina Lake",
    type: "lake",
    county: "Bandera County, TX",
    distanceMi: 8,
    isSaltwater: false,
  };
}

// ─── ZODIAC SIGN FROM MOON ──────────────────────────────────────────────────

function getMoonSignForFishing(date: Date): { sign: string; element: string } {
  // Use astronomy-engine for accurate moon sign (sub-arcminute)
  const { full } = getCurrentMoonSign(date);
  const ELEMENTS: Record<string, string> = {
    Aries: "fire", Taurus: "earth", Gemini: "air", Cancer: "water",
    Leo: "fire", Virgo: "earth", Libra: "air", Scorpio: "water",
    Sagittarius: "fire", Capricorn: "earth", Aquarius: "air", Pisces: "water",
  };
  return { sign: full, element: ELEMENTS[full] || "earth" };
}

// ─── BITE INTENSITY BARS ────────────────────────────────────────────────────

function getBiteIntensity(moonTransit: number): BiteBar[] {
  const bars: BiteBar[] = [];
  // Create bars for key hours (not all 24 — show 6am-2am range in 2hr blocks)
  const displayHours = [6, 8, 10, 12, 14, 16, 18, 20, 22, 0, 2];
  const hourLabels: Record<number, string> = {
    0: "12am", 2: "2am", 6: "6am", 8: "8am", 10: "10am",
    12: "12pm", 14: "2pm", 16: "4pm", 18: "6pm", 20: "8pm", 22: "10pm",
  };

  // Major periods: moonTransit ±1hr, moonTransit+12 ±1hr
  // Minor periods: moonTransit-6.5 ±0.5hr, moonTransit+6.5 ±0.5hr
  const majorCenter1 = ((moonTransit % 24) + 24) % 24;
  const majorCenter2 = ((moonTransit + 12) % 24 + 24) % 24;
  const minorCenter1 = ((moonTransit - 6.5) % 24 + 24) % 24;
  const minorCenter2 = ((moonTransit + 6.5) % 24 + 24) % 24;

  for (const h of displayHours) {
    const distToMajor1 = Math.min(Math.abs(h - majorCenter1), 24 - Math.abs(h - majorCenter1));
    const distToMajor2 = Math.min(Math.abs(h - majorCenter2), 24 - Math.abs(h - majorCenter2));
    const distToMinor1 = Math.min(Math.abs(h - minorCenter1), 24 - Math.abs(h - minorCenter1));
    const distToMinor2 = Math.min(Math.abs(h - minorCenter2), 24 - Math.abs(h - minorCenter2));

    let intensity: 0 | 1 | 2 | 3 = 0;
    if (distToMajor1 <= 1.5 || distToMajor2 <= 1.5) {
      intensity = 3;
    } else if (distToMinor1 <= 1 || distToMinor2 <= 1) {
      intensity = 2;
    } else if (distToMajor1 <= 3 || distToMajor2 <= 3 || distToMinor1 <= 2.5 || distToMinor2 <= 2.5) {
      intensity = 1;
    }

    bars.push({ hour: h, label: hourLabels[h] || `${h}`, intensity });
  }
  return bars;
}

// ─── CONDITIONS ─────────────────────────────────────────────────────────────

function getConditions(date: Date, month: number, isSaltwater: boolean): Conditions {
  // Simulated seasonal conditions for Hill Country
  const waterTemps: Record<number, { value: string; qualifier: string }> = {
    0: { value: "52°F", qualifier: "Cold — slow metabolism" },
    1: { value: "54°F", qualifier: "Cold — deep structure" },
    2: { value: "60°F", qualifier: "Warming — pre-spawn" },
    3: { value: "66°F", qualifier: "Prime range" },
    4: { value: "72°F", qualifier: "Peak spawning temp" },
    5: { value: "74°F", qualifier: "Prime for bass" },
    6: { value: "82°F", qualifier: "Warm — fish deep" },
    7: { value: "85°F", qualifier: "Hot — early/late bite" },
    8: { value: "80°F", qualifier: "Cooling — fish active" },
    9: { value: "72°F", qualifier: "Fall turnover" },
    10: { value: "64°F", qualifier: "Cooling fast" },
    11: { value: "56°F", qualifier: "Cold — slow down" },
  };

  // Sky conditions rotate by day-of-week for variety
  const dayOfWeek = date.getDay();
  const skyConditions = [
    { value: "Clear", qualifier: "Sight-fishing" },
    { value: "Partly cloudy", qualifier: "Good cover" },
    { value: "Mostly cloudy", qualifier: "Excellent cover" },
    { value: "Overcast", qualifier: "Feed all day" },
    { value: "Partly cloudy", qualifier: "Good cover" },
    { value: "Clear", qualifier: "Use shade lines" },
    { value: "Scattered clouds", qualifier: "Variable" },
  ];

  const windConditions = [
    { value: "4 mph SW", qualifier: "Calm" },
    { value: "8 mph SE", qualifier: "Light chop" },
    { value: "12 mph S", qualifier: "Moderate chop" },
    { value: "6 mph E", qualifier: "Light ripple" },
    { value: "15 mph NW", qualifier: "Rough — fish sheltered" },
    { value: "3 mph N", qualifier: "Calm" },
    { value: "10 mph W", qualifier: "Good drift" },
  ];

  const barometerConditions = [
    { value: "30.12 in", qualifier: "Falling slowly", trend: "falling" as const },
    { value: "30.18 in", qualifier: "Rising slowly", trend: "rising" as const },
    { value: "30.05 in", qualifier: "Steady", trend: "steady" as const },
    { value: "29.92 in", qualifier: "Dropping — bite on", trend: "falling" as const },
    { value: "30.22 in", qualifier: "High and stable", trend: "steady" as const },
    { value: "30.08 in", qualifier: "Steady", trend: "steady" as const },
    { value: "29.98 in", qualifier: "Falling — feed active", trend: "falling" as const },
  ];

  return {
    waterTemp: waterTemps[month] || waterTemps[5],
    sky: skyConditions[dayOfWeek],
    wind: windConditions[dayOfWeek],
    barometer: barometerConditions[dayOfWeek],
  };
}

// ─── SPECIES DATA ───────────────────────────────────────────────────────────

function getSpeciesStatus(month: number, isSaltwater: boolean): SpeciesStatus[] {
  if (isSaltwater) {
    // Gulf Coast species
    if (month >= 3 && month <= 9) {
      return [
        { name: "Speckled trout", status: "Running the flats", tip: "Topwater at dawn over grass flats, switch to soft plastics by mid-morning", active: true },
        { name: "Redfish", status: "Tailing in shallows", tip: "Sight-cast gold spoons on incoming tide near marsh edges", active: true },
        { name: "Black drum", status: "Bottom feeding", tip: "Fresh shrimp on Carolina rig near jetties and shell beds", active: true },
        { name: "Flounder", status: "Ambush points", tip: "Mud minnows or Gulp along channel edges and drop-offs", active: month >= 4 },
      ];
    }
    return [
      { name: "Speckled trout", status: "Deep channels", tip: "Slow-sinking twitch baits in deeper holes and channels", active: true },
      { name: "Redfish", status: "Schooling up", tip: "Large schools near passes and jetties — cast into the action", active: true },
      { name: "Sheepshead", status: "Structure pilings", tip: "Fiddler crabs or barnacle chunks tight to pilings", active: true },
      { name: "Black drum", status: "Slow, deep", tip: "Cut blue crab on bottom near channel markers", active: false },
    ];
  }

  // Freshwater — Hill Country lakes
  if (month >= 2 && month <= 4) {
    return [
      { name: "Largemouth bass", status: "Spawning, shallow", tip: "Soft plastics on shallow flats near cover — beds visible in clear water", active: true },
      { name: "White bass", status: "Schooling, mid-lake", tip: "Spawning runs up tributaries — small jigs and slabs upstream", active: true },
      { name: "Channel catfish", status: "Best after dark", tip: "Cut bait near creek channel bends — nighttime is prime", active: true },
      { name: "Crappie", status: "Brush piles, 3-8 ft", tip: "Minnows and small jigs around submerged brush — spawn depth", active: true },
    ];
  } else if (month >= 5 && month <= 7) {
    return [
      { name: "Largemouth bass", status: "Early/late topwater", tip: "Buzzbaits and poppers at dawn, deep worms by midday off points", active: true },
      { name: "White bass", status: "Schooling, mid-lake", tip: "Watch for surface boils — cast white or chartreuse slabs into the frenzy", active: true },
      { name: "Channel catfish", status: "Best after dark", tip: "Night fishing is prime — stink bait or fresh-cut shad on bottom", active: true },
      { name: "Crappie", status: "Slow, deeper brush", tip: "Moved deep — vertical jigging 15-25 ft over standing timber", active: false },
    ];
  } else if (month >= 8 && month <= 10) {
    return [
      { name: "Largemouth bass", status: "Following shad", tip: "Crankbaits and spinnerbaits in backs of creek arms — fall feed-up", active: true },
      { name: "Striped bass", status: "Surface feeding", tip: "Topwater early AM near dam tailraces — feeding heavily pre-winter", active: true },
      { name: "Crappie", status: "Moving deeper", tip: "Vertical jigging 12-20 ft as water cools — find the thermocline", active: true },
      { name: "Channel catfish", status: "Feeding up", tip: "Fresh cut shad near creek channel bends — bulking for winter", active: true },
    ];
  }
  // Winter
  return [
    { name: "Largemouth bass", status: "Slow, deep structure", tip: "Drag football jigs along bottom in 15-30 ft — patience required", active: false },
    { name: "Crappie", status: "Standing timber 20-30 ft", tip: "Excellent winter fishing — small jigs vertical over deep brush", active: true },
    { name: "Rainbow trout", status: "Stocked, cold water", tip: "Stocked in Hill Country rivers — drift worms or small spinners", active: true },
    { name: "Channel catfish", status: "Deep holes", tip: "Heavy sinkers in deep holes — slow but catchable with patience", active: false },
  ];
}

// ─── WEEK SCORES ────────────────────────────────────────────────────────────

function getWeekScores(date: Date): { scores: FishingDayScore[]; peakNote: string } {
  const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday

  const scores: FishingDayScore[] = [];
  let peakScore = 0;
  let peakIdx = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const phaseDay = getMoonPhaseDay(d);

    // Calculate score on 0-10 scale
    let score: number;
    if (phaseDay < 2 || (phaseDay > 13.5 && phaseDay < 16)) {
      score = 8.5; // new/full moon
    } else if ((phaseDay > 6.5 && phaseDay < 8.5) || (phaseDay > 21 && phaseDay < 23)) {
      score = 7.0; // quarters
    } else if (phaseDay > 4 && phaseDay < 11) {
      score = 5.5;
    } else if (phaseDay > 18 && phaseDay < 25) {
      score = 5.0;
    } else {
      score = 3.5;
    }

    // Add daily variance from day-of-week and month
    const variance = ((d.getDate() * 7 + i * 3) % 17 - 8) / 10;
    score = Math.max(1, Math.min(10, +(score + variance).toFixed(1)));

    const isToday = d.toDateString() === date.toDateString();
    if (score > peakScore) {
      peakScore = score;
      peakIdx = i;
    }

    scores.push({
      dayLabel: dayLabels[i],
      dayNum: d.getDate(),
      score,
      isToday,
      isPeak: false,
    });
  }

  // Mark peak
  scores[peakIdx].isPeak = true;

  // Generate peak note
  const peakDay = new Date(startOfWeek);
  peakDay.setDate(startOfWeek.getDate() + peakIdx);
  const peakPhaseDay = getMoonPhaseDay(peakDay);
  const peakSign = getMoonSignForFishing(peakDay);
  const peakDayName = dayLabels[peakIdx].charAt(0) + dayLabels[peakIdx].slice(1).toLowerCase();
  const fullDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][peakIdx];
  const phaseNote = getPhaseShortName(peakPhaseDay);

  const peakNote = `${fullDayName} is your peak day — Moon in ${peakSign.sign}, ${phaseNote.toLowerCase().includes("new") || phaseNote.toLowerCase().includes("full") ? phaseNote.toLowerCase() : "building toward " + phaseNote.toLowerCase()}. Plan the trip.`;

  return { scores, peakNote };
}

// ─── FISHING PROVERBS ───────────────────────────────────────────────────────

const FISHING_WISDOM: FishingWisdom[] = [
  { saying: "When the wind is in the east, the fish bite the least. When the wind is in the west, the fish bite the best.", attribution: "English angler's proverb, 18th century" },
  { saying: "Fish bite best before a storm — when the barometer falls, the bass come to call.", attribution: "Ozark fishing wisdom" },
  { saying: "The best time to go fishing is when you can get away.", attribution: "Robert Traver, Anatomy of a Fisherman" },
  { saying: "A rising moon in Pisces is worth more than a full tackle box.", attribution: "Gulf Coast solunar tradition" },
  { saying: "Fish the last hour of falling water and the first hour of rising water — the current does the work.", attribution: "Texas river guide saying" },
  { saying: "When the dogwoods bloom, the bass will move to the shallows and the crappie will stack in the brush.", attribution: "Southern bass fishing tradition" },
  { saying: "Dark days, dark lures. Bright days, bright lures. Let the fish tell you what the sky already knows.", attribution: "Ozark fly fishing proverb" },
  { saying: "The moon overhead feeds them high. The moon underfoot feeds them deep. Either way, they feed.", attribution: "John Alden Knight, solunar tables, 1926" },
  { saying: "Never trust a calm day in March — the fish know what the weather is doing before you do.", attribution: "Hill Country guide wisdom" },
  { saying: "If the heron is fishing, so should you. If the heron has left, save your bait.", attribution: "Lowcountry marsh saying" },
  { saying: "Give a man a fish and he eats for a day. Teach him solunar tables and he'll cancel meetings.", attribution: "Modern angler's proverb" },
  { saying: "The old-timers planted by the moon and fished by the moon. They caught more than we do.", attribution: "Texas Almanac, various years" },
  { saying: "When the cows lie down, the fish look up. When the birds go quiet, the bite is on.", attribution: "English countryside fishing lore" },
  { saying: "A south wind warms the water and stirs the bait. A north wind chills the bones and empties the creel.", attribution: "Great Lakes fishing tradition" },
  { saying: "Fish the edges — where light meets dark, where deep meets shallow, where current meets slack.", attribution: "Universal angling wisdom" },
  { saying: "The worst day fishing beats the best day at the office, but a solunar major period beats both.", attribution: "Modern solunar fishing" },
  { saying: "Three days after the full moon, the night bite dies and the dawn bite wakes up. Plan accordingly.", attribution: "Freshwater bass tournament lore" },
  { saying: "A falling barometer is nature's dinner bell. Every fish in the lake knows it before you do.", attribution: "Midwest bass fishing" },
  { saying: "You can't catch fish if your line isn't in the water, but you can waste a lot of time with it in the wrong water.", attribution: "Pragmatic angler's saying" },
  { saying: "The catfish doesn't care about your fancy gear. Cut shad, heavy sinker, patience. That's the whole recipe.", attribution: "Texas channel cat tradition" },
];

function getFishingWisdom(date: Date): FishingWisdom {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return FISHING_WISDOM[dayOfYear % FISHING_WISDOM.length];
}

// ─── OCEAN DATA ─────────────────────────────────────────────────────────────

function getOceanData(date: Date, month: number): FishingForecast["oceanData"] {
  const dayOfWeek = date.getDay();
  // Simulated tide/swell for Gulf Coast
  const tidePatterns = [
    "High at 6:42 AM, Low at 12:58 PM",
    "High at 7:18 AM, Low at 1:34 PM",
    "High at 8:02 AM, Low at 2:15 PM",
    "High at 8:51 AM, Low at 3:02 PM",
    "High at 5:55 AM, Low at 12:12 PM",
    "High at 6:30 AM, Low at 12:48 PM",
    "High at 7:05 AM, Low at 1:22 PM",
  ];

  const surfTemps: Record<number, string> = {
    0: "62°F", 1: "64°F", 2: "68°F", 3: "72°F", 4: "76°F",
    5: "80°F", 6: "84°F", 7: "86°F", 8: "82°F", 9: "76°F", 10: "70°F", 11: "64°F",
  };

  return {
    tide: tidePatterns[dayOfWeek],
    swellFt: 1 + (dayOfWeek % 3),
    swellDirection: ["SE", "S", "SSE", "E", "SSW", "S", "SE"][dayOfWeek],
    waterClarity: ["Clear", "Slightly murky", "Clear", "Green tint", "Clear", "Murky after rain", "Clear"][dayOfWeek],
    surfTemp: surfTemps[month] || "76°F",
  };
}

// ─── BITE WINDOWS (universal) ───────────────────────────────────────────────

/** Build the day's solunar bite windows from the moon transit hour. */
function buildBiteWindows(moonTransit: number): BiteWindow[] {
  const moonOverheadCenter = moonTransit;
  const moonUnderfootCenter = (moonTransit + 12) % 24;
  const moonriseCenter = ((moonTransit - 6.5) % 24 + 24) % 24;
  const moonsetCenter = ((moonTransit + 6.5) % 24 + 24) % 24;

  const rawWindows: BiteWindow[] = [
    {
      type: "major",
      start: formatHour(moonUnderfootCenter - 1),
      end: formatHour(moonUnderfootCenter + 1),
      label: "Moon underfoot",
      description: "feeding peak",
      direction: "down",
    },
    {
      type: "minor",
      start: formatHour(moonriseCenter - 0.5),
      end: formatHour(moonriseCenter + 0.5),
      label: "Moonrise approaching",
      description: "transition feed",
      direction: "right",
    },
    {
      type: "major",
      start: formatHour(moonOverheadCenter - 1),
      end: formatHour(moonOverheadCenter + 1),
      label: "Moon overhead",
      description: "feeding peak",
      direction: "up",
    },
    {
      type: "minor",
      start: formatHour(moonsetCenter - 0.5),
      end: formatHour(moonsetCenter + 0.5),
      label: "Moonset",
      description: "wind-down feed",
      direction: "right",
    },
  ];

  // Sort chronologically by their center hour
  const centers = [moonUnderfootCenter, moonriseCenter, moonOverheadCenter, moonsetCenter];
  return rawWindows
    .map((w, i) => ({ w, center: centers[i] }))
    .sort((a, b) => a.center - b.center)
    .map(x => x.w);
}

export interface UniversalBiteForecast {
  moonPhaseLabel: string;
  moonSign: string;
  moonElement: string;
  biteIntensity: BiteBar[];
  biteWindows: BiteWindow[];
}

/**
 * Location-independent solunar forecast: Moon-phase bite windows and bite
 * intensity. Pure astronomy — valid anywhere in the world. Used when the
 * user has no US water body set (species/conditions data is US-only).
 */
export function getUniversalBiteForecast(date: Date): UniversalBiteForecast {
  const phaseDay = getMoonPhaseDay(date);
  const moonTransit = getMoonTransit(date);
  const moonInfo = getMoonSignForFishing(date);
  return {
    moonPhaseLabel: getPhaseShortName(phaseDay),
    moonSign: moonInfo.sign,
    moonElement: moonInfo.element,
    biteIntensity: getBiteIntensity(moonTransit),
    biteWindows: buildBiteWindows(moonTransit),
  };
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────────────

/**
 * Get full fishing forecast for a given date.
 * Combines solunar theory, seasonal patterns, conditions, and location data.
 */
export function getFishingForecast(date: Date, waterBodyName?: string): FishingForecast | null {
  // If no water body specified by the user, return null so the UI can show a location prompt
  if (!waterBodyName) return null;

  const phaseDay = getMoonPhaseDay(date);
  const moonTransit = getMoonTransit(date);
  const month = date.getMonth();

  const waterBody = getWaterBodyByName(waterBodyName) || getDefaultWaterBody();
  const moonInfo = getMoonSignForFishing(date);

  // ─── Rating on 0-10 scale ─────────────────────────────────────────────
  let baseRating: number;
  if (phaseDay < 2 || (phaseDay > 13.5 && phaseDay < 16)) {
    baseRating = 8.5;
  } else if ((phaseDay > 6.5 && phaseDay < 8.5) || (phaseDay > 21 && phaseDay < 23)) {
    baseRating = 7.0;
  } else if (phaseDay > 4 && phaseDay < 11) {
    baseRating = 5.5;
  } else if (phaseDay > 18 && phaseDay < 25) {
    baseRating = 5.0;
  } else {
    baseRating = 3.5;
  }

  // Seasonal modifier
  if (month >= 2 && month <= 4) baseRating = Math.min(10, baseRating + 1);
  if (month >= 9 && month <= 10) baseRating = Math.min(10, baseRating + 0.5);
  if (month === 0 || month === 1) baseRating = Math.max(1, baseRating - 1);

  // Daily variance
  const dayVariance = ((date.getDate() * 7 + date.getDay() * 3) % 13 - 6) / 10;
  const rating = Math.max(1, Math.min(10, +(baseRating + dayVariance).toFixed(1)));

  let ratingLabel: string;
  if (rating >= 8) ratingLabel = "Great day";
  else if (rating >= 6) ratingLabel = "Good day";
  else if (rating >= 4) ratingLabel = "Fair day";
  else ratingLabel = "Slow day";

  // ─── Bite windows ─────────────────────────────────────────────────────
  const biteWindows = buildBiteWindows(moonTransit);

  // ─── Bite intensity bars ──────────────────────────────────────────────
  const biteIntensity = getBiteIntensity(moonTransit);

  // ─── Conditions ───────────────────────────────────────────────────────
  const conditions = getConditions(date, month, waterBody.isSaltwater);

  // ─── Species ──────────────────────────────────────────────────────────
  const species = getSpeciesStatus(month, waterBody.isSaltwater);

  // ─── Week scores ──────────────────────────────────────────────────────
  const { scores: weekScores, peakNote: peakDayNote } = getWeekScores(date);

  // ─── Log entries (placeholder) ────────────────────────────────────────
  const logEntries: FishingLogEntry[] = [
    { date: "May 4", note: "5 largemouth, biggest 3.2 lb. Full Moon Scorpio · evening major." },
    { date: "Apr 19", note: "Skunked. Mercury retrograde shadow · barometer crashing." },
  ];

  // ─── Wisdom ───────────────────────────────────────────────────────────
  const wisdom = getFishingWisdom(date);

  // ─── Ocean data (only if saltwater) ───────────────────────────────────
  const oceanData = waterBody.isSaltwater ? getOceanData(date, month) : undefined;

  return {
    waterBody,
    rating,
    ratingLabel,
    moonPhaseLabel: getPhaseShortName(phaseDay),
    moonSign: moonInfo.sign,
    moonElement: moonInfo.element,
    biteIntensity,
    biteWindows,
    conditions,
    species,
    weekScores,
    peakDayNote,
    logEntries,
    wisdom,
    oceanData,
  };
}
