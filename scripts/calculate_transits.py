"""
Transit calculator for Mapped.

Calculates current planetary positions and finds aspects to a person's natal chart.
Called by the Next.js API route with natal chart data + current date.

Supports both Tropical (Western) and Sidereal (Vedic) zodiac systems.
For sidereal, applies an ayanamsa correction to transiting planet sign labels.
Note: Aspects are based on angular distance, which is identical in both systems.
"""

import json
import sys
from kerykeion.astrological_subject_factory import AstrologicalSubjectFactory
from timezonefinder import TimezoneFinder

try:
    import swisseph as swe
    HAS_SWE = True
except ImportError:
    HAS_SWE = False


# Aspect definitions: name, degrees, orb
TRANSIT_ASPECTS = [
    ("conjunction", 0, 8),
    ("opposition", 180, 8),
    ("trine", 120, 7),
    ("square", 90, 7),
    ("sextile", 60, 5),
    ("quincunx", 150, 3),
]

SIGN_ABBREV = {
    "Ari": "Aries", "Tau": "Taurus", "Gem": "Gemini", "Can": "Cancer",
    "Leo": "Leo", "Vir": "Virgo", "Lib": "Libra", "Sco": "Scorpio",
    "Sag": "Sagittarius", "Cap": "Capricorn", "Aqu": "Aquarius", "Pis": "Pisces",
}

SIGN_NAMES = [
    "Ari", "Tau", "Gem", "Can", "Leo", "Vir",
    "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis",
]

# Ayanamsa values (same as calculate_chart.py)
AYANAMSA_VALUES = {
    "lahiri":       24.17,
    "krishnamurti": 23.98,
    "raman":        22.47,
}


# ── Swiss Ephemeris planet IDs for fast position lookups ──
SWE_PLANETS = {}
if HAS_SWE:
    SWE_PLANETS = {
        "Sun": swe.SUN, "Moon": swe.MOON, "Mercury": swe.MERCURY,
        "Venus": swe.VENUS, "Mars": swe.MARS, "Jupiter": swe.JUPITER,
        "Saturn": swe.SATURN, "Uranus": swe.URANUS, "Neptune": swe.NEPTUNE,
        "Pluto": swe.PLUTO,
    }

# How far to scan for each planet's transit window (days)
SCAN_RANGE = {
    "Moon": 4, "Sun": 30, "Mercury": 40, "Venus": 40, "Mars": 60,
    "Jupiter": 200, "Saturn": 300, "Uranus": 400, "Neptune": 400, "Pluto": 400,
}


def swe_planet_lon(planet_id: int, jd: float) -> float:
    """Get ecliptic longitude from Swiss Ephemeris (fast)."""
    if not HAS_SWE:
        return 0.0
    result, _ = swe.calc_ut(jd, planet_id)
    return result[0]


def date_to_jd(year: int, month: int, day: int, hour: float = 12.0) -> float:
    if not HAS_SWE:
        return 0.0
    return swe.julday(year, month, day, hour)


def jd_to_datestr(jd: float) -> str:
    if not HAS_SWE:
        return ""
    y, m, d, h = swe.revjul(jd)
    return f"{int(y)}-{int(m):02d}-{int(d):02d}"


def find_transit_window(planet_name: str, natal_abs: float, aspect_deg: float,
                        max_orb: float, today_jd: float, ayanamsa_offset: float = 0) -> dict:
    """
    Scan outward from today to find when this transit aspect enters/leaves orb
    and when it's exact (tightest orb). Returns {startDate, exactDate, endDate}.
    For sidereal, ayanamsa_offset adjusts the transit planet's longitude.
    """
    pid = SWE_PLANETS.get(planet_name)
    if pid is None:
        return {}

    scan = SCAN_RANGE.get(planet_name, 120)

    def orb_at(jd):
        lon = swe_planet_lon(pid, jd)
        if ayanamsa_offset:
            lon = (lon - ayanamsa_offset) % 360
        return abs(angle_diff(lon, natal_abs) - aspect_deg)

    # Scan backward to find when aspect entered orb
    start_jd = today_jd
    for d in range(1, scan + 1):
        jd = today_jd - d
        if orb_at(jd) > max_orb:
            start_jd = jd + 1
            break
    else:
        start_jd = today_jd - scan

    # Scan forward to find when aspect leaves orb
    end_jd = today_jd
    for d in range(1, scan + 1):
        jd = today_jd + d
        if orb_at(jd) > max_orb:
            end_jd = jd - 1
            break
    else:
        end_jd = today_jd + scan

    # Find exact date (minimum orb) within window — use 0.5 day steps then refine
    best_jd = today_jd
    best_orb = orb_at(today_jd)
    jd = start_jd
    step = max(1, int((end_jd - start_jd) / 120))  # coarse pass
    while jd <= end_jd:
        o = orb_at(jd)
        if o < best_orb:
            best_orb = o
            best_jd = jd
        jd += step

    # Refine around best_jd with 0.5-day steps
    for half_d_10x in range(-20, 21):
        jd = best_jd + half_d_10x * 0.5
        if jd < start_jd or jd > end_jd:
            continue
        o = orb_at(jd)
        if o < best_orb:
            best_orb = o
            best_jd = jd

    return {
        "startDate": jd_to_datestr(start_jd),
        "exactDate": jd_to_datestr(best_jd),
        "endDate": jd_to_datestr(end_jd),
    }


def apply_sidereal(abs_position: float, ayanamsa_offset: float) -> dict:
    """Convert a tropical absolute position to sidereal."""
    sidereal_pos = (abs_position - ayanamsa_offset) % 360
    sign_num = int(sidereal_pos / 30)
    position_in_sign = sidereal_pos % 30
    return {
        "absPosition": round(sidereal_pos, 2),
        "sign": SIGN_NAMES[sign_num],
        "signNum": sign_num,
        "position": round(position_in_sign, 2),
    }


def angle_diff(a: float, b: float) -> float:
    """Shortest angular distance between two zodiac positions (0-180)."""
    d = abs(a - b) % 360
    return d if d <= 180 else 360 - d


def find_aspect(transit_pos: float, natal_pos: float):
    """Check if two positions form an aspect. Returns (aspect_name, orb) or None."""
    diff = angle_diff(transit_pos, natal_pos)
    for name, degrees, max_orb in TRANSIT_ASPECTS:
        orb = abs(diff - degrees)
        if orb <= max_orb:
            return name, round(orb, 2)
    return None


def calculate_transits(data: dict) -> dict:
    """Calculate current transits to a natal chart."""

    natal_planets = data["natalPlanets"]       # list of {name, sign, absPosition, house, ...}
    natal_houses = data.get("natalHouses", [])  # list of {number, sign, absPosition}
    transit_date = data["transitDate"]          # "YYYY-MM-DD"
    latitude = data.get("latitude", 30.27)      # default to Austin
    longitude = data.get("longitude", -97.74)

    # Zodiac system config
    zodiac_system = data.get("zodiacSystem", "tropical")
    ayanamsa_name = data.get("ayanamsa", "lahiri")
    is_sidereal = zodiac_system == "sidereal"
    ayanamsa_offset = AYANAMSA_VALUES.get(ayanamsa_name, 24.17) if is_sidereal else 0

    # Get timezone for transit calculation location
    tf = TimezoneFinder()
    tz_str = tf.timezone_at(lat=latitude, lng=longitude) or "America/Chicago"

    # Parse transit date
    year, month, day = map(int, transit_date.split("-"))

    # Calculate current sky positions using Kerykeion (always tropical internally)
    transit_subject = AstrologicalSubjectFactory.from_birth_data(
        name="Transit",
        year=year,
        month=month,
        day=day,
        hour=12,  # noon
        minute=0,
        lng=longitude,
        lat=latitude,
        tz_str=tz_str,
        city="Transit",
        nation="",
        online=False,
    )

    # Extract transiting planet positions
    planet_names = [
        "sun", "moon", "mercury", "venus", "mars",
        "jupiter", "saturn", "uranus", "neptune", "pluto",
    ]

    transit_planets = []
    for pname in planet_names:
        planet = getattr(transit_subject, pname)
        tropical_abs = round(planet.abs_pos, 2)

        if is_sidereal:
            sid = apply_sidereal(tropical_abs, ayanamsa_offset)
            transit_planets.append({
                "name": planet.name.replace("_", " "),
                "sign": sid["sign"],
                "signNum": sid["signNum"],
                "position": sid["position"],
                "absPosition": sid["absPosition"],
                "retrograde": planet.retrograde,
            })
        else:
            transit_planets.append({
                "name": planet.name.replace("_", " "),
                "sign": planet.sign,
                "signNum": planet.sign_num,
                "position": round(planet.position, 2),
                "absPosition": tropical_abs,
                "retrograde": planet.retrograde,
            })

    # Determine which natal house each transiting planet falls in
    house_cusps = sorted(natal_houses, key=lambda h: h.get("number", 0))
    cusp_positions = [h["absPosition"] for h in house_cusps] if house_cusps else []

    def get_transit_house(abs_pos: float) -> int:
        """Find which natal house a transiting planet occupies."""
        if not cusp_positions:
            return 0
        for i in range(12):
            next_i = (i + 1) % 12
            start = cusp_positions[i]
            end = cusp_positions[next_i]
            if start < end:
                if start <= abs_pos < end:
                    return i + 1
            else:  # wraps around 0°
                if abs_pos >= start or abs_pos < end:
                    return i + 1
        return 1

    # Find all transit-to-natal aspects
    # Use the transit planet's absPosition (sidereal or tropical) and
    # the natal planet's absPosition (already in the correct system from chart calc)
    transit_aspects = []
    for tp in transit_planets:
        t_house = get_transit_house(tp["absPosition"])

        for np in natal_planets:
            result = find_aspect(tp["absPosition"], np["absPosition"])
            if result:
                aspect_name, orb = result
                transit_aspects.append({
                    "transitPlanet": tp["name"],
                    "transitSign": tp["sign"],
                    "transitRetrograde": tp["retrograde"],
                    "natalPlanet": np["name"],
                    "natalSign": np["sign"],
                    "natalHouse": np.get("house", None),
                    "transitHouse": t_house,
                    "aspect": aspect_name,
                    "orb": orb,
                })

    # Sort by significance: tighter orbs first, then by planet importance
    planet_weight = {
        "Pluto": 10, "Neptune": 9, "Uranus": 8, "Saturn": 7,
        "Jupiter": 6, "Mars": 5, "Venus": 4, "Mercury": 3,
        "Sun": 2, "Moon": 1,
    }
    transit_aspects.sort(
        key=lambda a: (-planet_weight.get(a["transitPlanet"], 0), a["orb"])
    )

    # ── Compute date windows for each aspect (requires swisseph) ──
    if HAS_SWE:
        today_jd = date_to_jd(year, month, day, 12.0)
        aspect_orb_map = {name: max_orb for name, _, max_orb in TRANSIT_ASPECTS}

        for ta in transit_aspects:
            natal_abs = None
            for np in natal_planets:
                if np["name"] == ta["natalPlanet"]:
                    natal_abs = np["absPosition"]
                    break
            if natal_abs is None:
                continue

            aspect_deg = next((deg for name, deg, _ in TRANSIT_ASPECTS if name == ta["aspect"]), None)
            if aspect_deg is None:
                continue

            max_orb_for_aspect = aspect_orb_map.get(ta["aspect"], 8)
            window = find_transit_window(
                ta["transitPlanet"], natal_abs, aspect_deg,
                max_orb_for_aspect, today_jd, ayanamsa_offset
            )
            if window:
                ta["startDate"] = window["startDate"]
                ta["exactDate"] = window["exactDate"]
                ta["endDate"] = window["endDate"]

    result = {
        "transitDate": transit_date,
        "transitPlanets": transit_planets,
        "transitAspects": transit_aspects,
        "zodiacSystem": zodiac_system,
    }

    if is_sidereal:
        result["ayanamsa"] = ayanamsa_name

    return result


if __name__ == "__main__":
    input_data = json.loads(sys.argv[1])
    result = calculate_transits(input_data)
    print(json.dumps(result))
