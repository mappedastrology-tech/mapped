"""
Birth chart calculator for Mapped.

This script is called by the Next.js API route. It receives birth data as
a JSON string via command line argument, calculates the full birth chart
using Kerykeion, and prints the results as JSON to stdout.

Supports both Tropical (Western) and Sidereal (Vedic) zodiac systems.
For sidereal, applies an ayanamsa correction to shift all positions.

How it works:
1. Next.js API receives birth data from the form
2. API calls this Python script with the data
3. This script uses Kerykeion (a Swiss Ephemeris wrapper) to calculate
   all planetary positions, house cusps, and aspects
4. For sidereal: subtract the ayanamsa offset from all absolute positions
5. Results are printed as JSON, which the API reads and sends back
"""

import json
import sys
import math
from kerykeion.astrological_subject_factory import AstrologicalSubjectFactory
from kerykeion.aspects import AspectsFactory
from timezonefinder import TimezoneFinder


# ── Ayanamsa values (approximate for 2024-2026 epoch) ──
# These shift slowly (~50 arc-seconds/year). Close enough for natal charts.
AYANAMSA_VALUES = {
    "lahiri":       24.17,   # Chitrapaksha, most widely used
    "krishnamurti": 23.98,   # KP system, slight variation
    "raman":        22.47,   # B.V. Raman's ayanamsa
}

SIGN_NAMES = [
    "Ari", "Tau", "Gem", "Can", "Leo", "Vir",
    "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis",
]


def apply_sidereal(abs_position: float, ayanamsa_offset: float) -> dict:
    """
    Convert a tropical absolute position to sidereal.
    Returns { absPosition, sign, signNum, position (within sign) }.
    """
    sidereal_pos = (abs_position - ayanamsa_offset) % 360
    sign_num = int(sidereal_pos / 30)
    position_in_sign = sidereal_pos % 30
    return {
        "absPosition": round(sidereal_pos, 2),
        "sign": SIGN_NAMES[sign_num],
        "signNum": sign_num,
        "position": round(position_in_sign, 2),
    }


def calculate_chart(data: dict) -> dict:
    """Take birth data and return a complete chart as a dictionary."""

    # Look up the timezone from latitude/longitude.
    # Example: Austin, TX (30.27, -97.74) → "America/Chicago"
    tf = TimezoneFinder()
    tz_str = tf.timezone_at(lat=data["latitude"], lng=data["longitude"])

    if not tz_str:
        raise ValueError("Could not determine timezone for the given coordinates.")

    # Parse the birth date and time from strings into numbers.
    # birthDate comes as "1990-06-15", birthTime as "14:30"
    year, month, day = map(int, data["birthDate"].split("-"))
    hour, minute = map(int, data["birthTime"].split(":"))

    # Calculate the chart using Kerykeion (always tropical first).
    # online=False means it won't try to call GeoNames (we already have coordinates).
    subject = AstrologicalSubjectFactory.from_birth_data(
        name=data["name"],
        year=year,
        month=month,
        day=day,
        hour=hour,
        minute=minute,
        lng=data["longitude"],
        lat=data["latitude"],
        tz_str=tz_str,
        city=data.get("cityName", "Unknown"),
        nation="",
        online=False,
    )

    # ── Zodiac system configuration ──
    zodiac_system = data.get("zodiacSystem", "tropical")
    ayanamsa_name = data.get("ayanamsa", "lahiri")
    is_sidereal = zodiac_system == "sidereal"
    ayanamsa_offset = AYANAMSA_VALUES.get(ayanamsa_name, 24.17) if is_sidereal else 0

    # --- Extract planetary positions ---
    # The 10 main planets plus Chiron, North Node, South Node
    planet_names = [
        "sun", "moon", "mercury", "venus", "mars",
        "jupiter", "saturn", "uranus", "neptune", "pluto",
    ]

    planets = []
    for pname in planet_names:
        planet = getattr(subject, pname)
        tropical_abs = round(planet.abs_pos, 2)

        if is_sidereal:
            sid = apply_sidereal(tropical_abs, ayanamsa_offset)
            planets.append({
                "name": planet.name.replace("_", " "),
                "sign": sid["sign"],
                "signNum": sid["signNum"],
                "position": sid["position"],
                "absPosition": sid["absPosition"],
                "house": planet.house if planet.house else None,
                "retrograde": planet.retrograde,
            })
        else:
            planets.append({
                "name": planet.name.replace("_", " "),
                "sign": planet.sign,
                "signNum": planet.sign_num,
                "position": round(planet.position, 2),
                "absPosition": tropical_abs,
                "house": planet.house if planet.house else None,
                "retrograde": planet.retrograde,
            })

    # --- Extract special points: Chiron, North Node, South Node ---
    special_points = []
    for attr_name, display_name in [
        ("chiron", "Chiron"),
        ("true_north_lunar_node", "North Node"),
        ("true_south_lunar_node", "South Node"),
    ]:
        point = getattr(subject, attr_name, None)
        if point is not None:
            tropical_abs = round(point.abs_pos, 2)

            if is_sidereal:
                sid = apply_sidereal(tropical_abs, ayanamsa_offset)
                special_points.append({
                    "name": display_name,
                    "sign": sid["sign"],
                    "signNum": sid["signNum"],
                    "position": sid["position"],
                    "absPosition": sid["absPosition"],
                    "house": point.house if point.house else None,
                    "retrograde": point.retrograde,
                })
            else:
                special_points.append({
                    "name": display_name,
                    "sign": point.sign,
                    "signNum": point.sign_num,
                    "position": round(point.position, 2),
                    "absPosition": tropical_abs,
                    "house": point.house if point.house else None,
                    "retrograde": point.retrograde,
                })

    # --- Extract Midheaven (MC) ---
    mc = subject.medium_coeli
    if mc:
        tropical_abs_mc = round(mc.abs_pos, 2)
        if is_sidereal:
            sid = apply_sidereal(tropical_abs_mc, ayanamsa_offset)
            midheaven = {
                "sign": sid["sign"],
                "signNum": sid["signNum"],
                "position": sid["position"],
                "absPosition": sid["absPosition"],
            }
        else:
            midheaven = {
                "sign": mc.sign,
                "signNum": mc.sign_num,
                "position": round(mc.position, 2),
                "absPosition": tropical_abs_mc,
            }
    else:
        midheaven = None

    # --- Extract house cusps ---
    # There are 12 houses, each starting at a certain degree
    house_attrs = [
        "first_house", "second_house", "third_house", "fourth_house",
        "fifth_house", "sixth_house", "seventh_house", "eighth_house",
        "ninth_house", "tenth_house", "eleventh_house", "twelfth_house",
    ]

    houses = []
    for i, attr in enumerate(house_attrs):
        house = getattr(subject, attr)
        tropical_abs_h = round(house.abs_pos, 2)

        if is_sidereal:
            sid = apply_sidereal(tropical_abs_h, ayanamsa_offset)
            houses.append({
                "number": i + 1,
                "sign": sid["sign"],
                "signNum": sid["signNum"],
                "position": sid["position"],
                "absPosition": sid["absPosition"],
            })
        else:
            houses.append({
                "number": i + 1,
                "sign": house.sign,
                "signNum": house.sign_num,
                "position": round(house.position, 2),
                "absPosition": round(house.abs_pos, 2),
            })

    # --- Extract aspects ---
    # Aspects are angular relationships between planets (e.g., Sun square Moon)
    # Note: Aspects are based on angular distance, which is the SAME in both
    # tropical and sidereal. The aspect orbs don't change — only the sign
    # labels change. So we can use Kerykeion's tropical aspects directly.
    aspect_result = AspectsFactory.natal_aspects(subject)
    aspects = []
    for a in aspect_result.aspects:
        aspects.append({
            "p1Name": a.p1_name.replace("_", " "),
            "p2Name": a.p2_name.replace("_", " "),
            "aspect": a.aspect,
            "orbit": round(a.orbit, 2),
            "aspectDegrees": a.aspect_degrees,
        })

    # --- Build the Big 3 (Sun, Moon, Rising) ---
    big_three = {
        "sun": planets[0]["sign"],     # Sun sign
        "moon": planets[1]["sign"],    # Moon sign
        "rising": houses[0]["sign"],   # Rising sign = 1st house cusp sign
    }

    # --- Check for rising sign cusp ---
    rising_position = houses[0]["position"]  # degrees within the sign (0-30)
    rising_cusp = None
    if rising_position < 1.0:
        prev_sign = SIGN_NAMES[(houses[0]["signNum"] - 1) % 12]
        rising_cusp = {
            "current": houses[0]["sign"],
            "alternate": prev_sign,
            "position": round(rising_position, 2),
            "message": f"Your rising sign is right on the {prev_sign}/{houses[0]['sign']} cusp. A difference of just a few minutes in birth time could change it. If you know your rising sign from another source, trust that.",
        }
    elif rising_position > 29.0:
        next_sign = SIGN_NAMES[(houses[0]["signNum"] + 1) % 12]
        rising_cusp = {
            "current": houses[0]["sign"],
            "alternate": next_sign,
            "position": round(rising_position, 2),
            "message": f"Your rising sign is right on the {houses[0]['sign']}/{next_sign} cusp. A difference of just a few minutes in birth time could change it. If you know your rising sign from another source, trust that.",
        }

    result = {
        "name": data["name"],
        "birthDate": data["birthDate"],
        "birthTime": data["birthTime"],
        "unknownTime": data.get("unknownTime", False),
        "cityName": data.get("cityName", "Unknown"),
        "latitude": data["latitude"],
        "longitude": data["longitude"],
        "timezone": tz_str,
        "zodiacSystem": zodiac_system,
        "bigThree": big_three,
        "planets": planets,
        "specialPoints": special_points,
        "midheaven": midheaven,
        "houses": houses,
        "aspects": aspects,
        "risingCusp": rising_cusp,
    }

    # Include ayanamsa info for sidereal charts
    if is_sidereal:
        result["ayanamsa"] = ayanamsa_name
        result["ayanamsaDegrees"] = ayanamsa_offset

    return result


if __name__ == "__main__":
    # Read the JSON input from the command line argument
    input_data = json.loads(sys.argv[1])
    result = calculate_chart(input_data)
    # Print the result as JSON — the API route will read this
    print(json.dumps(result))
