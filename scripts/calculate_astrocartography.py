"""
Astrocartography calculator for Mapped.

Calculates where each planet in a birth chart falls on the four angles
(Ascendant, Descendant, Midheaven, IC) at every longitude on Earth.
Returns lines that can be plotted on a world map.

Uses pyswisseph (Swiss Ephemeris) for astronomical calculations.
"""

import json
import sys
import swisseph as swe

PLANET_IDS = {
    'Sun': swe.SUN,
    'Moon': swe.MOON,
    'Mercury': swe.MERCURY,
    'Venus': swe.VENUS,
    'Mars': swe.MARS,
    'Jupiter': swe.JUPITER,
    'Saturn': swe.SATURN,
    'Uranus': swe.URANUS,
    'Neptune': swe.NEPTUNE,
    'Pluto': swe.PLUTO,
    'North Node': swe.MEAN_NODE,
}

# Colors for each planet (for frontend rendering)
PLANET_COLORS = {
    'Sun': '#f0c040',
    'Moon': '#c0c0d0',
    'Mercury': '#80b0d0',
    'Venus': '#e08080',
    'Mars': '#d05040',
    'Jupiter': '#8060c0',
    'Saturn': '#707060',
    'Uranus': '#40b0b0',
    'Neptune': '#6080d0',
    'Pluto': '#905050',
    'North Node': '#b08040',
}

# Line style per angle type
ANGLE_STYLES = {
    'ASC': 'solid',
    'DSC': 'dashed',
    'MC': 'solid',
    'IC': 'dashed',
}

# What each angle means for you in that location
ANGLE_MEANINGS = {
    'ASC': 'Rising — shapes your identity and how people see you in this area',
    'DSC': 'Setting — affects your relationships and partnerships in this area',
    'MC': 'Midheaven — influences your career and public reputation in this area',
    'IC': 'Nadir — affects your home life, roots, and inner security in this area',
}

# What each planet activates
PLANET_MEANINGS = {
    'Sun': {
        'keyword': 'Vitality & Purpose',
        'ASC': 'You shine here. Your confidence and sense of self are amplified. People notice you and you feel most like yourself.',
        'DSC': 'You attract powerful partnerships here. Relationships in this area feel significant and identity-defining.',
        'MC': 'Career success and recognition come naturally here. This is where you build your legacy.',
        'IC': 'Deep sense of belonging. This place feels like home in a soul-level way. Good for putting down roots.',
    },
    'Moon': {
        'keyword': 'Emotional Life',
        'ASC': 'Your emotions are right on the surface here. You feel everything more intensely. Great for emotional healing.',
        'DSC': 'Emotionally deep relationships form here. You attract nurturing partners.',
        'MC': 'Your public image is warm and approachable here. Good for careers involving care, food, or family.',
        'IC': 'Maximum emotional comfort. This is the place that feels most like home. Family connections are strong.',
    },
    'Venus': {
        'keyword': 'Love & Beauty',
        'ASC': 'You feel beautiful and magnetic here. Social life thrives and romance comes easily.',
        'DSC': 'Love relationships flourish here. This is one of the best lines for finding a partner.',
        'MC': 'Success in creative fields, art, fashion, or anything aesthetic. People find you charming.',
        'IC': 'Your home here is beautiful and harmonious. Domestic life is peaceful and pleasurable.',
    },
    'Mars': {
        'keyword': 'Drive & Conflict',
        'ASC': 'High energy and ambition here, but also conflicts and arguments. You feel driven but combative.',
        'DSC': 'Passionate but contentious relationships. Attraction is intense but fights are frequent.',
        'MC': 'Career drive is intense. Good for competitive fields, sports, military. Watch for workplace conflicts.',
        'IC': 'Restless home life. Renovations, arguments at home, or a drive to constantly change your living situation.',
    },
    'Jupiter': {
        'keyword': 'Luck & Expansion',
        'ASC': 'Everything expands here — your optimism, opportunities, and sometimes your waistline. Lucky place.',
        'DSC': 'Generous, expansive relationships. You meet people who open doors and broaden your worldview.',
        'MC': 'Career growth and abundance. Promotions, recognition, and financial success come more easily.',
        'IC': 'Big, comfortable home. Abundance in domestic life. Good for family growth and real estate.',
    },
    'Saturn': {
        'keyword': 'Discipline & Lessons',
        'ASC': 'Life feels harder here but the growth is real. You mature, take on responsibility, and build character.',
        'DSC': 'Serious, committed relationships but also heavy ones. Partnerships teach hard lessons.',
        'MC': 'Slow, earned career success. You build authority over time. Not easy, but lasting.',
        'IC': 'Heavy feeling at home. Family responsibilities weigh on you. Good for discipline, hard for comfort.',
    },
    'Uranus': {
        'keyword': 'Freedom & Disruption',
        'ASC': 'You reinvent yourself here. Unexpected events shake up your identity. Exciting but unstable.',
        'DSC': 'Unconventional relationships. You attract unusual partners or your relationships take unexpected turns.',
        'MC': 'Sudden career changes — breakthroughs or breakdowns. Great for innovation and tech careers.',
        'IC': 'Unstable home life. Frequent moves or radical changes to your living situation. Freedom from roots.',
    },
    'Neptune': {
        'keyword': 'Creativity & Illusion',
        'ASC': 'Dreamy, creative, spiritual energy. But also confusion about identity. Art flows easily here.',
        'DSC': 'Idealized relationships that may not be what they seem. Spiritual connections but also deception.',
        'MC': 'Creative career success — music, film, art, healing. But career direction may feel foggy.',
        'IC': 'Spiritual home. The place feels magical but boundaries dissolve. Watch for escapism.',
    },
    'Pluto': {
        'keyword': 'Transformation & Power',
        'ASC': 'Intense personal transformation. You become a more powerful version of yourself here, but it is not comfortable.',
        'DSC': 'Intense, transformative relationships. Power dynamics are strong. Nothing stays surface-level.',
        'MC': 'Power and influence in career. You can rise to the top here, but watch for power struggles.',
        'IC': 'Deep psychological transformation at home. Family secrets surface. Profound but heavy.',
    },
    'Mercury': {
        'keyword': 'Communication & Learning',
        'ASC': 'Your mind is sharp here. Communication flows, learning accelerates, and you connect easily with people.',
        'DSC': 'Intellectual partnerships. You attract people you can talk to for hours.',
        'MC': 'Great for writing, teaching, business, media careers. Your ideas get heard.',
        'IC': 'Your home is a hub of activity and conversation. Good for working from home and learning.',
    },
    'North Node': {
        'keyword': 'Destiny & Soul Growth',
        'ASC': 'You step into your purpose here. Life feels aligned, like you are finally moving in the right direction.',
        'DSC': 'Fated partnerships. The people you meet here push you toward who you are becoming.',
        'MC': 'Your career here feels like a calling, not just a job. Public recognition for being authentically yourself.',
        'IC': 'Soul-level roots. This place connects you to something ancestral or deeply purposeful.',
    },
}


def calculate_astrocartography(birth_year, birth_month, birth_day, birth_hour_utc, birth_lat, birth_lng):
    """
    Calculate astrocartography lines.

    Returns:
        lines: list of line objects with planet, angle, points, color, meaning
        planets: dict of planet ecliptic longitudes
        nearbyLines: lines that pass near a specific location (if provided)
    """
    jd = swe.julday(int(birth_year), int(birth_month), int(birth_day), float(birth_hour_utc))

    # Get planetary positions
    planet_positions = {}
    for name, pid in PLANET_IDS.items():
        pos = swe.calc_ut(jd, pid)
        planet_positions[name] = round(pos[0][0], 2)

    lines = []

    for planet_name, planet_lon in planet_positions.items():
        for angle_type in ['ASC', 'DSC', 'MC', 'IC']:
            points = []

            if angle_type in ('MC', 'IC'):
                target_mc = planet_lon if angle_type == 'MC' else (planet_lon + 180) % 360

                # MC depends only on longitude (not latitude), so find the longitude
                best_lng = None
                best_diff = 999
                for test_lng in range(-180, 181, 1):
                    try:
                        _, ascmc = swe.houses(jd, 0.0, float(test_lng), b'P')
                        mc = ascmc[1]
                        diff = abs(mc - target_mc) % 360
                        if diff > 180:
                            diff = 360 - diff
                        if diff < best_diff:
                            best_diff = diff
                            best_lng = test_lng
                    except:
                        continue

                # Refine
                if best_lng is not None and best_diff < 3:
                    for fine in range((best_lng - 2) * 10, (best_lng + 2) * 10 + 1):
                        fl = fine / 10.0
                        try:
                            _, ascmc = swe.houses(jd, 0.0, fl, b'P')
                            mc = ascmc[1]
                            diff = abs(mc - target_mc) % 360
                            if diff > 180:
                                diff = 360 - diff
                            if diff < best_diff:
                                best_diff = diff
                                best_lng = fl
                        except:
                            continue

                if best_lng is not None and best_diff < 1:
                    # MC/IC lines are nearly vertical
                    for lat in range(-65, 66, 3):
                        points.append([lat, round(best_lng, 1)])

            else:
                # ASC/DSC lines curve — find longitude for each latitude
                target_offset = 0 if angle_type == 'ASC' else 180

                for lat in range(-60, 61, 3):
                    best_lng = None
                    best_diff = 999
                    target = (planet_lon + target_offset) % 360

                    # Coarse scan
                    for test_lng in range(-180, 181, 2):
                        try:
                            _, ascmc = swe.houses(jd, float(lat), float(test_lng), b'P')
                            asc = ascmc[0]
                            diff = abs(asc - target) % 360
                            if diff > 180:
                                diff = 360 - diff
                            if diff < best_diff:
                                best_diff = diff
                                best_lng = test_lng
                        except:
                            continue

                    # Fine scan
                    if best_lng is not None and best_diff < 5:
                        for fine in range((best_lng - 3) * 10, (best_lng + 3) * 10 + 1):
                            fl = fine / 10.0
                            if fl < -180 or fl > 180:
                                continue
                            try:
                                _, ascmc = swe.houses(jd, float(lat), fl, b'P')
                                asc = ascmc[0]
                                diff = abs(asc - target) % 360
                                if diff > 180:
                                    diff = 360 - diff
                                if diff < best_diff:
                                    best_diff = diff
                                    best_lng = fl
                            except:
                                continue

                        if best_diff < 1.5:
                            points.append([lat, round(best_lng, 1)])

            if len(points) > 2:
                meaning = PLANET_MEANINGS.get(planet_name, {}).get(angle_type, '')
                lines.append({
                    'planet': planet_name,
                    'angle': angle_type,
                    'points': points,
                    'color': PLANET_COLORS.get(planet_name, '#888'),
                    'style': ANGLE_STYLES.get(angle_type, 'solid'),
                    'keyword': PLANET_MEANINGS.get(planet_name, {}).get('keyword', ''),
                    'meaning': meaning,
                })

    return {
        'lines': lines,
        'planets': planet_positions,
    }


def find_nearby_lines(lines, target_lat, target_lng, radius_deg=5):
    """Find which lines pass near a specific location."""
    nearby = []
    for line in lines:
        for pt in line['points']:
            lat_diff = abs(pt[0] - target_lat)
            lng_diff = abs(pt[1] - target_lng)
            if lng_diff > 180:
                lng_diff = 360 - lng_diff
            dist = (lat_diff ** 2 + lng_diff ** 2) ** 0.5
            if dist < radius_deg:
                nearby.append({
                    'planet': line['planet'],
                    'angle': line['angle'],
                    'distance': round(dist, 1),
                    'keyword': line['keyword'],
                    'meaning': line['meaning'],
                    'color': line['color'],
                })
                break  # one match per line is enough
    nearby.sort(key=lambda x: x['distance'])
    return nearby


def find_parans(lines, tolerance_deg=2.0):
    """
    Find parans — locations where two planetary lines cross or come closest.

    For each unique pair of lines (planet1+angle1 × planet2+angle2), we find
    the single point where they are nearest. If that minimum distance is within
    tolerance, it's reported as a crossing. This avoids the bug where two lines
    running roughly parallel produce dozens of false "crossings."
    """
    # For each unique line pair, find the single closest approach point
    best = {}  # key -> best candidate

    for i, line_a in enumerate(lines):
        for j, line_b in enumerate(lines):
            if j <= i:
                continue
            if line_a['planet'] == line_b['planet']:
                continue  # same planet, different angles — not a paran

            key = f"{line_a['planet']}|{line_a['angle']}|{line_b['planet']}|{line_b['angle']}"

            best_dist = tolerance_deg + 1
            best_pt = None

            for pt_a in line_a['points']:
                for pt_b in line_b['points']:
                    lat_diff = abs(pt_a[0] - pt_b[0])
                    lng_diff = abs(pt_a[1] - pt_b[1])
                    if lng_diff > 180:
                        lng_diff = 360 - lng_diff
                    dist = (lat_diff ** 2 + lng_diff ** 2) ** 0.5

                    if dist < best_dist:
                        best_dist = dist
                        best_pt = (
                            round((pt_a[0] + pt_b[0]) / 2, 1),
                            round((pt_a[1] + pt_b[1]) / 2, 1),
                        )

            if best_dist <= tolerance_deg and best_pt is not None:
                # Only keep if this is the best crossing for this line pair
                if key not in best or best_dist < best[key]['distance']:
                    best[key] = {
                        'planet1': line_a['planet'],
                        'angle1': line_a['angle'],
                        'planet2': line_b['planet'],
                        'angle2': line_b['angle'],
                        'lat': best_pt[0],
                        'lng': best_pt[1],
                        'distance': round(best_dist, 2),
                        'color1': line_a['color'],
                        'color2': line_b['color'],
                    }

    parans = list(best.values())
    parans.sort(key=lambda x: x['distance'])
    return parans


if __name__ == '__main__':
    input_data = json.loads(sys.argv[1])

    birth_year = input_data['birthYear']
    birth_month = input_data['birthMonth']
    birth_day = input_data['birthDay']
    birth_hour_utc = input_data['birthHourUtc']
    birth_lat = input_data['birthLat']
    birth_lng = input_data['birthLng']

    result = calculate_astrocartography(
        birth_year, birth_month, birth_day,
        birth_hour_utc, birth_lat, birth_lng
    )

    # Find parans (line crossings)
    result['parans'] = find_parans(result['lines'])

    # If a target location is provided, find nearby lines
    if 'targetLat' in input_data and 'targetLng' in input_data:
        result['nearbyLines'] = find_nearby_lines(
            result['lines'],
            input_data['targetLat'],
            input_data['targetLng'],
            input_data.get('radius', 5)
        )

    print(json.dumps(result))
