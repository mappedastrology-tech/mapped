"""
Composite chart calculator for Mapped.

A composite chart is the "relationship chart" — the midpoint of two people's
natal charts. Each composite planet = midpoint of Person A's planet and
Person B's planet. It represents the relationship itself as a third entity.

No ephemeris needed — this is pure math.

Input: { chart1: { planets[], houses[], specialPoints[] }, chart2: { ... } }
Output: { planets[], houses[], specialPoints[], midheaven, bigThree, aspects[] }
"""

import json
import sys
import math

SIGN_NAMES = [
    "Ari", "Tau", "Gem", "Can", "Leo", "Vir",
    "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis",
]

ASPECTS = [
    ("conjunction", 0, 8),
    ("opposition", 180, 8),
    ("trine", 120, 7),
    ("square", 90, 7),
    ("sextile", 60, 5),
    ("quincunx", 150, 3),
]


def midpoint(pos1: float, pos2: float) -> float:
    """
    Calculate the shorter-arc midpoint of two zodiac positions (0-360).
    Always returns the midpoint on the shorter arc between the two points.
    """
    diff = (pos2 - pos1) % 360
    if diff > 180:
        # The shorter arc goes the other way
        mid = (pos1 + diff / 2 + 180) % 360
    else:
        mid = (pos1 + diff / 2) % 360
    return round(mid, 2)


def pos_to_sign(abs_pos: float) -> dict:
    """Convert absolute position (0-360) to sign info."""
    sign_num = int(abs_pos / 30) % 12
    position = abs_pos % 30
    return {
        "sign": SIGN_NAMES[sign_num],
        "signNum": sign_num,
        "position": round(position, 2),
        "absPosition": round(abs_pos, 2),
    }


def angle_diff(a: float, b: float) -> float:
    d = abs(a - b) % 360
    return d if d <= 180 else 360 - d


def find_aspect(pos1: float, pos2: float):
    diff = angle_diff(pos1, pos2)
    for name, degrees, max_orb in ASPECTS:
        orb = abs(diff - degrees)
        if orb <= max_orb:
            return name, round(orb, 2)
    return None


def calculate_composite(data: dict) -> dict:
    chart1 = data["chart1"]
    chart2 = data["chart2"]

    # ── Composite planets ──
    planets1 = {p["name"]: p for p in chart1.get("planets", [])}
    planets2 = {p["name"]: p for p in chart2.get("planets", [])}

    composite_planets = []
    for name in ["Sun", "Moon", "Mercury", "Venus", "Mars",
                  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]:
        p1 = planets1.get(name)
        p2 = planets2.get(name)
        if p1 and p2:
            mid = midpoint(p1["absPosition"], p2["absPosition"])
            info = pos_to_sign(mid)
            composite_planets.append({
                "name": name,
                **info,
                "house": None,  # Will assign after houses are calculated
                "retrograde": False,  # Composite planets don't have retrograde
            })

    # ── Composite houses ──
    houses1 = {h["number"]: h for h in chart1.get("houses", [])}
    houses2 = {h["number"]: h for h in chart2.get("houses", [])}

    composite_houses = []
    for num in range(1, 13):
        h1 = houses1.get(num)
        h2 = houses2.get(num)
        if h1 and h2:
            mid = midpoint(h1["absPosition"], h2["absPosition"])
            info = pos_to_sign(mid)
            composite_houses.append({
                "number": num,
                **info,
            })

    # ── Assign houses to planets ──
    if composite_houses:
        house_cusps = sorted(composite_houses, key=lambda h: h["number"])
        for planet in composite_planets:
            planet["house"] = assign_house(planet["absPosition"], house_cusps)

    # ── Composite special points ──
    sp1 = {p["name"]: p for p in chart1.get("specialPoints", [])}
    sp2 = {p["name"]: p for p in chart2.get("specialPoints", [])}

    composite_special = []
    for name in ["Chiron", "North Node", "South Node"]:
        s1 = sp1.get(name)
        s2 = sp2.get(name)
        if s1 and s2:
            mid = midpoint(s1["absPosition"], s2["absPosition"])
            info = pos_to_sign(mid)
            house = assign_house(mid, house_cusps) if composite_houses else None
            composite_special.append({
                "name": name,
                **info,
                "house": house,
                "retrograde": False,
            })

    # ── Midheaven ──
    midheaven = None
    if composite_houses:
        h10 = next((h for h in composite_houses if h["number"] == 10), None)
        if h10:
            midheaven = {
                "sign": h10["sign"],
                "signNum": h10["signNum"],
                "position": h10["position"],
                "absPosition": h10["absPosition"],
            }

    # ── Big Three ──
    big_three = {}
    sun_p = next((p for p in composite_planets if p["name"] == "Sun"), None)
    moon_p = next((p for p in composite_planets if p["name"] == "Moon"), None)
    if sun_p:
        big_three["sun"] = sun_p["sign"]
    if moon_p:
        big_three["moon"] = moon_p["sign"]
    if composite_houses:
        big_three["rising"] = composite_houses[0]["sign"]  # 1st house cusp

    # ── Aspects between composite planets ──
    all_bodies = composite_planets + composite_special
    aspects = []
    for i in range(len(all_bodies)):
        for j in range(i + 1, len(all_bodies)):
            result = find_aspect(all_bodies[i]["absPosition"], all_bodies[j]["absPosition"])
            if result:
                aspect_name, orb = result
                aspects.append({
                    "p1Name": all_bodies[i]["name"],
                    "p2Name": all_bodies[j]["name"],
                    "aspect": aspect_name,
                    "orbit": orb,
                })

    aspects.sort(key=lambda a: a["orbit"])

    return {
        "bigThree": big_three,
        "planets": composite_planets,
        "houses": composite_houses,
        "specialPoints": composite_special,
        "midheaven": midheaven,
        "aspects": aspects[:25],
    }


def assign_house(planet_pos: float, houses: list) -> int:
    """Determine which house a planet falls in based on house cusp positions."""
    for i in range(len(houses)):
        cusp_start = houses[i]["absPosition"]
        cusp_end = houses[(i + 1) % len(houses)]["absPosition"]

        if cusp_end < cusp_start:
            # Wraps around 360/0
            if planet_pos >= cusp_start or planet_pos < cusp_end:
                return houses[i]["number"]
        else:
            if cusp_start <= planet_pos < cusp_end:
                return houses[i]["number"]

    return 1  # fallback


if __name__ == "__main__":
    input_data = json.loads(sys.argv[1])
    result = calculate_composite(input_data)
    print(json.dumps(result))
