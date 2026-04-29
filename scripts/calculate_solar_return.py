"""
Solar Return chart calculator for Mapped.

A solar return is the chart for the exact moment the Sun returns to its
natal degree each year — essentially your astrological birthday chart.
It maps themes for the year ahead.

Called by the Next.js API route with:
  { natalSunAbsPos, birthTime, latitude, longitude, year, zodiacSystem?, ayanamsa? }

Uses Kerykeion to search for the exact Sun-return moment by iterating
through dates near the birthday in the target year, then calculates
a full chart for that moment.
"""

import json
import sys
import math
from datetime import datetime, timedelta
from kerykeion.astrological_subject_factory import AstrologicalSubjectFactory
from kerykeion.aspects import AspectsFactory
from timezonefinder import TimezoneFinder


AYANAMSA_VALUES = {
    "lahiri":       24.17,
    "krishnamurti": 23.98,
    "raman":        22.47,
}

SIGN_NAMES = [
    "Ari", "Tau", "Gem", "Can", "Leo", "Vir",
    "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis",
]


def apply_sidereal(abs_position: float, ayanamsa_offset: float) -> dict:
    sidereal_pos = (abs_position - ayanamsa_offset) % 360
    sign_num = int(sidereal_pos / 30)
    position_in_sign = sidereal_pos % 30
    return {
        "absPosition": round(sidereal_pos, 2),
        "sign": SIGN_NAMES[sign_num],
        "signNum": sign_num,
        "position": round(position_in_sign, 2),
    }


def get_sun_position(year, month, day, hour, minute, lat, lng, tz_str):
    """Get the Sun's absolute position for a given moment."""
    subject = AstrologicalSubjectFactory.from_birth_data(
        name="transit",
        year=year, month=month, day=day,
        hour=hour, minute=minute,
        lng=lng, lat=lat,
        tz_str=tz_str,
        city="", nation="",
        online=False,
    )
    return subject.sun.abs_pos


def find_solar_return_moment(natal_sun_abs, birth_month, birth_day, target_year, lat, lng, tz_str):
    """
    Find the exact date and time when the Sun returns to its natal degree.
    Uses binary search around the birthday in the target year.
    """
    # Start searching 2 days before the birthday in the target year
    search_start = datetime(target_year, birth_month, birth_day, 0, 0) - timedelta(days=2)

    # Phase 1: scan hour by hour over a 5-day window to find the crossing
    best_dt = search_start
    best_diff = 999

    for h in range(5 * 24):  # 5 days of hours
        dt = search_start + timedelta(hours=h)
        sun_pos = get_sun_position(
            dt.year, dt.month, dt.day, dt.hour, dt.minute,
            lat, lng, tz_str
        )
        # Angular difference (handle 360° wrap)
        diff = (sun_pos - natal_sun_abs + 180) % 360 - 180
        if abs(diff) < abs(best_diff):
            best_diff = diff
            best_dt = dt

    # Phase 2: refine to the minute with binary search
    low = best_dt - timedelta(hours=1)
    high = best_dt + timedelta(hours=1)

    for _ in range(20):  # 20 iterations gets us sub-minute precision
        mid = low + (high - low) / 2
        sun_pos = get_sun_position(
            mid.year, mid.month, mid.day, mid.hour, mid.minute,
            lat, lng, tz_str
        )
        diff = (sun_pos - natal_sun_abs + 180) % 360 - 180
        if diff < 0:
            low = mid
        else:
            high = mid

    return mid


def calculate_solar_return(data: dict) -> dict:
    """Calculate the full solar return chart for a given year."""
    natal_sun_abs = data["natalSunAbsPos"]
    birth_month, birth_day = map(int, data.get("birthDate", "2000-01-01").split("-")[1:])
    target_year = data.get("year", datetime.now().year)
    lat = data["latitude"]
    lng = data["longitude"]
    zodiac_system = data.get("zodiacSystem", "tropical")
    ayanamsa_name = data.get("ayanamsa", "lahiri")
    is_sidereal = zodiac_system == "sidereal"
    ayanamsa_offset = AYANAMSA_VALUES.get(ayanamsa_name, 24.17) if is_sidereal else 0

    tf = TimezoneFinder()
    tz_str = tf.timezone_at(lat=lat, lng=lng)
    if not tz_str:
        raise ValueError("Could not determine timezone for the given coordinates.")

    # Find the exact return moment
    return_dt = find_solar_return_moment(
        natal_sun_abs, birth_month, birth_day, target_year, lat, lng, tz_str
    )

    # Calculate the full chart at the return moment
    subject = AstrologicalSubjectFactory.from_birth_data(
        name=data.get("name", "Solar Return"),
        year=return_dt.year,
        month=return_dt.month,
        day=return_dt.day,
        hour=return_dt.hour,
        minute=return_dt.minute,
        lng=lng, lat=lat,
        tz_str=tz_str,
        city=data.get("cityName", ""),
        nation="",
        online=False,
    )

    # Extract planets
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
                "sign": sid["sign"], "signNum": sid["signNum"],
                "position": sid["position"], "absPosition": sid["absPosition"],
                "house": planet.house if planet.house else None,
                "retrograde": planet.retrograde,
            })
        else:
            planets.append({
                "name": planet.name.replace("_", " "),
                "sign": planet.sign, "signNum": planet.sign_num,
                "position": round(planet.position, 2),
                "absPosition": tropical_abs,
                "house": planet.house if planet.house else None,
                "retrograde": planet.retrograde,
            })

    # Extract special points
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
                    "sign": sid["sign"], "signNum": sid["signNum"],
                    "position": sid["position"], "absPosition": sid["absPosition"],
                    "house": point.house if point.house else None,
                    "retrograde": point.retrograde,
                })
            else:
                special_points.append({
                    "name": display_name,
                    "sign": point.sign, "signNum": point.sign_num,
                    "position": round(point.position, 2),
                    "absPosition": round(point.abs_pos, 2),
                    "house": point.house if point.house else None,
                    "retrograde": point.retrograde,
                })

    # Extract midheaven
    mc = subject.medium_coeli
    if mc:
        tropical_abs_mc = round(mc.abs_pos, 2)
        if is_sidereal:
            sid = apply_sidereal(tropical_abs_mc, ayanamsa_offset)
            midheaven = {"sign": sid["sign"], "signNum": sid["signNum"], "position": sid["position"], "absPosition": sid["absPosition"]}
        else:
            midheaven = {"sign": mc.sign, "signNum": mc.sign_num, "position": round(mc.position, 2), "absPosition": tropical_abs_mc}
    else:
        midheaven = None

    # Extract houses
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
            houses.append({"number": i + 1, "sign": sid["sign"], "signNum": sid["signNum"], "position": sid["position"], "absPosition": sid["absPosition"]})
        else:
            houses.append({"number": i + 1, "sign": house.sign, "signNum": house.sign_num, "position": round(house.position, 2), "absPosition": round(house.abs_pos, 2)})

    # Extract aspects
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

    # Big three for this return chart
    big_three = {
        "sun": planets[0]["sign"],
        "moon": planets[1]["sign"],
        "rising": houses[0]["sign"],
    }

    return_date_str = return_dt.strftime("%Y-%m-%d")
    return_time_str = return_dt.strftime("%H:%M")

    result = {
        "year": target_year,
        "returnDate": return_date_str,
        "returnTime": return_time_str,
        "natalSunDegree": round(natal_sun_abs, 2),
        "bigThree": big_three,
        "planets": planets,
        "specialPoints": special_points,
        "midheaven": midheaven,
        "houses": houses,
        "aspects": aspects,
        "zodiacSystem": zodiac_system,
    }

    if is_sidereal:
        result["ayanamsa"] = ayanamsa_name
        result["ayanamsaDegrees"] = ayanamsa_offset

    return result


if __name__ == "__main__":
    input_data = json.loads(sys.argv[1])
    result = calculate_solar_return(input_data)
    print(json.dumps(result))
