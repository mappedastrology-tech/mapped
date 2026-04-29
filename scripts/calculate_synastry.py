"""
Synastry calculator for Mapped.

Compares two birth charts and calculates:
1. Cross-aspects (how one person's planets aspect the other's)
2. Fated indicators (North Node, Vertex, Saturn, Chiron contacts)
3. Overall compatibility themes — context-aware (family vs romantic vs friendship)

Called by the Next.js API with two sets of chart data (planets + special points).
Now accepts an optional "context" field: "family", "partner", or "friend" (default).

Zodiac system note: The charts passed in already have their signs set to the
correct system (tropical or sidereal) from calculate_chart.py. Aspects are based
on angular distance which is identical in both systems, so no conversion needed here.
The sign labels on the output will naturally reflect whatever system the charts use.
"""

import json
import sys
import math

# Aspect definitions: name, degrees, orb
ASPECTS = [
    ("conjunction", 0, 8),
    ("opposition", 180, 8),
    ("trine", 120, 7),
    ("square", 90, 7),
    ("sextile", 60, 5),
]

# Which contacts count as "fated"
FATED_BODIES = {"North Node", "South Node", "Chiron", "Saturn", "Pluto"}

# Sign element mapping (works for both tropical and sidereal — same abbreviations)
SIGN_ELEMENT = {
    "Ari": "fire", "Leo": "fire", "Sag": "fire",
    "Tau": "earth", "Vir": "earth", "Cap": "earth",
    "Gem": "air", "Lib": "air", "Aqu": "air",
    "Can": "water", "Pis": "water", "Sco": "water",
}

SIGN_FULL = {
    "Ari": "Aries", "Tau": "Taurus", "Gem": "Gemini", "Can": "Cancer",
    "Leo": "Leo", "Vir": "Virgo", "Lib": "Libra", "Sco": "Scorpio",
    "Sag": "Sagittarius", "Cap": "Capricorn", "Aqu": "Aquarius", "Pis": "Pisces",
}


def angle_diff(a, b):
    """Smallest angular distance between two zodiac positions."""
    d = abs(a - b) % 360
    return d if d <= 180 else 360 - d


def find_aspect(pos1, pos2):
    """Check if two positions form an aspect. Returns (aspect_name, orb) or None."""
    diff = angle_diff(pos1, pos2)
    for name, degrees, max_orb in ASPECTS:
        orb = abs(diff - degrees)
        if orb <= max_orb:
            return name, round(orb, 2)
    return None


def calculate_synastry(chart1, chart2, context="friend"):
    """
    chart1 and chart2 each have: planets[], specialPoints[], bigThree{}
    context: "family", "partner", or "friend"
    Returns synastry data: cross_aspects, fated_contacts, element_balance, themes
    """

    # Combine planets + special points for full analysis
    all_points_1 = chart1.get("planets", []) + chart1.get("specialPoints", [])
    all_points_2 = chart2.get("planets", []) + chart2.get("specialPoints", [])

    # Core planets only (for main compatibility)
    core_1 = chart1.get("planets", [])
    core_2 = chart2.get("planets", [])

    cross_aspects = []
    fated_contacts = []

    # Calculate all cross-aspects: every point in chart1 vs every point in chart2
    for p1 in all_points_1:
        for p2 in all_points_2:
            result = find_aspect(p1["absPosition"], p2["absPosition"])
            if result:
                aspect_name, orb = result
                entry = {
                    "p1Name": p1["name"],
                    "p1Sign": p1["sign"],
                    "p2Name": p2["name"],
                    "p2Sign": p2["sign"],
                    "aspect": aspect_name,
                    "orb": orb,
                }

                # Determine if this is a fated contact
                is_fated = (p1["name"] in FATED_BODIES or p2["name"] in FATED_BODIES)
                if is_fated:
                    entry["fated"] = True
                    entry["fatedReason"] = get_fated_reason(p1["name"], p2["name"], aspect_name, context)
                    fated_contacts.append(entry)

                cross_aspects.append(entry)

    # Sort by tightest orb (most exact aspects are most felt)
    cross_aspects.sort(key=lambda a: a["orb"])
    fated_contacts.sort(key=lambda a: a["orb"])

    # Element balance between the two charts
    elem1 = count_elements(core_1)
    elem2 = count_elements(core_2)

    # Compatibility themes — context-aware
    themes = generate_themes(cross_aspects, chart1, chart2, context)

    # Overall score breakdown
    harmony = sum(1 for a in cross_aspects if a["aspect"] in ("trine", "sextile", "conjunction") and a["orb"] < 5)
    tension = sum(1 for a in cross_aspects if a["aspect"] in ("square", "opposition") and a["orb"] < 5)

    return {
        "crossAspects": cross_aspects[:30],  # Top 30 tightest aspects
        "fatedContacts": fated_contacts,
        "elementBalance": {"person1": elem1, "person2": elem2},
        "themes": themes,
        "harmony": harmony,
        "tension": tension,
        "totalAspects": len(cross_aspects),
    }


CORE_PLANETS = {"Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"}

def count_elements(planets):
    """Count how many planets fall in each element (core planets only)."""
    counts = {"fire": 0, "earth": 0, "air": 0, "water": 0}
    for p in planets:
        if p.get("name", "") not in CORE_PLANETS:
            continue
        elem = SIGN_ELEMENT.get(p["sign"])
        if elem:
            counts[elem] += 1
    return counts


def get_fated_reason(p1_name, p2_name, aspect, context="friend"):
    """Generate a reason why this contact feels fated. Context-aware for family/partner/friend/city."""
    bodies = {p1_name, p2_name}
    is_family = context == "family"
    is_city = context == "city"

    if "North Node" in bodies:
        other = (bodies - {"North Node"}).pop() if len(bodies) > 1 else "North Node"
        if other == "Sun":
            if is_city:
                return "This city's identity aligns with your soul's growth direction. Living here pulls you toward who you're meant to become — it's not a coincidence you ended up in this place."
            if is_family:
                return "Their Sun lights up your growth direction. This family member models something your soul is trying to learn in this lifetime."
            return "Their Sun lights up your soul's growth direction. This person feels like they're pulling you toward your destiny."
        elif other == "Moon":
            if is_city:
                return "The emotional rhythm of this city nurtures the direction you're growing toward. The way this place makes you feel is part of your evolution."
            if is_family:
                return "Their Moon nurtures the direction you're growing toward. This family bond supports who you're becoming."
            return "Their Moon touches your North Node — this connection nurtures the person you're becoming, not the person you were."
        elif other == "Venus":
            if is_city:
                return "This city's values and aesthetics connect to your North Node. What this place loves and celebrates teaches you something about your own worthiness and desires."
            if is_family:
                return "Their Venus on your North Node means this family bond teaches you about love, values, and worthiness."
            return "Their Venus on your North Node means loving them pushes you to grow. The attraction feels purposeful."
        elif other == "Mars":
            if is_city:
                return "This city's drive and pace activate your North Node. The hustle of this place pushes you to act on your purpose, sometimes through friction that ultimately serves your growth."
            if is_family:
                return "Their Mars activates your North Node — this family member pushes you to act, sometimes through friction that ultimately serves your growth."
            return "Their Mars activates your North Node — this person motivates you toward your life's purpose, sometimes through friction."
        elif other == "Saturn":
            if is_city:
                return "Saturn and the North Node between you and this city — you have karmic lessons to learn in this place. The city's structures and limitations are teaching you something you can't learn anywhere else."
            return "Saturn and the North Node together — this is a karmic contract. You're here to teach each other something neither of you can learn alone."
        elif other == "Pluto":
            if is_city:
                return "Pluto on your North Node from this city's chart is a soul-level tie to this place. Living here transforms you in the direction of your destiny, whether comfortable or not."
            if is_family:
                return "Pluto on the North Node is a soul-level family bond. This person transforms you in the direction of your destiny, whether comfortable or not."
            return "Pluto on the North Node is a soul-level bond. This person transforms you in the direction of your destiny, whether you want it or not."
        else:
            if is_city:
                return f"The city's {other} connects to your North Node — this place is linked to your soul's growth direction. There's a reason you're drawn here."
            return f"Their {other} connects to your North Node — this person is linked to your soul's growth direction in this lifetime."

    if "South Node" in bodies:
        other = (bodies - {"South Node"}).pop() if len(bodies) > 1 else "South Node"
        if is_city:
            return f"The city's {other} touches your South Node — this place carries deep familiarity, like you've lived here before in another life. The comfort is real, but the lesson is not to get stuck in old patterns."
        if is_family:
            return f"Their {other} touches your South Node — this family connection carries deep familiarity, possibly from past lives. The lesson is growing beyond old family patterns together."
        return f"Their {other} touches your South Node — you may have known each other in a past life. There's instant familiarity, but the lesson is not to stay stuck in old patterns."

    if "Chiron" in bodies:
        other = (bodies - {"Chiron"}).pop() if len(bodies) > 1 else "Chiron"
        if is_city:
            if aspect in ("conjunction", "opposition"):
                return f"The city's {other} activates your Chiron — this place touches your deepest wound. Something about living here brings old pain to the surface, but that's where the healing happens."
            return f"The city's {other} aspects your Chiron — this place has a quiet ability to heal something you've been carrying. The healing isn't dramatic, but it's real."
        if is_family:
            if aspect in ("conjunction", "opposition"):
                return f"Their {other} activates your Chiron — this family member touches your deepest wound. The healing happens through this relationship, even when it's painful."
            return f"Their {other} aspects your Chiron — this family member can help you heal something inherited through the bloodline."
        if aspect in ("conjunction", "opposition"):
            return f"Their {other} activates your Chiron — this person touches your deepest wound. It hurts, but it's the hurt that heals. They see the part of you that you hide."
        return f"Their {other} aspects your Chiron — this person can help you heal something you've been carrying for a long time, if you let them."

    if "Saturn" in bodies:
        other = (bodies - {"Saturn"}).pop() if len(bodies) > 1 else "Saturn"
        if is_city:
            if aspect == "conjunction":
                return f"Saturn conjunct the city's {other} — this place carries weight for you. There's a sense of duty or destiny tied to being here. It's not the easiest city for you, but it builds something lasting."
            elif aspect in ("square", "opposition"):
                return f"Saturn {aspect}s the city's {other} — this city tests you. The structures, rules, or pace of this place create friction with your ambitions. Growth here requires patience and persistence."
            return f"Saturn aspects the city's {other} — there's a stabilizing, grounding quality to your relationship with this place. It endures."
        if is_family:
            if aspect == "conjunction":
                return f"Saturn conjunct their {other} — this family bond carries weight and responsibility. There's a sense of duty that defines this relationship."
            elif aspect in ("square", "opposition"):
                return f"Saturn {aspect}s their {other} — this family relationship tests both of you around authority, expectations, and generational patterns."
            return f"Saturn aspects their {other} — there's a stabilizing, foundational quality to this family bond. It endures."
        if aspect == "conjunction":
            return f"Saturn conjunct their {other} — this is a serious bond. There's a sense of duty, responsibility, and long-term commitment here. It might not be easy, but it's real."
        elif aspect in ("square", "opposition"):
            return f"Saturn {aspect}s their {other} — this relationship tests both of you. There's friction around responsibility, authority, and expectations. Growth requires patience."
        return f"Saturn aspects their {other} — there's a stabilizing, grounding quality to this connection. It has staying power."

    if "Pluto" in bodies:
        other = (bodies - {"Pluto"}).pop() if len(bodies) > 1 else "Pluto"
        if is_city:
            return f"Pluto aspects the city's {other} — your relationship with this place is intense and transformative. Power dynamics with the city itself may be a theme. Living here changes you at a deep level."
        if is_family:
            return f"Pluto aspects their {other} — this family bond is intense and transformative. Power dynamics may be a theme. This relationship changes both of you at a deep level."
        return f"Pluto aspects their {other} — this connection is intense, transformative, and impossible to ignore. Power dynamics are a theme. Neither of you will leave unchanged."

    if is_city:
        return "This contact carries a fated quality — your connection to this place has a purposeful, karmic dimension."
    return "This contact carries a fated quality — it may not be comfortable, but it's purposeful."


def score_theme(aspect_list, base_weight=50):
    """Score a theme 0-100 based on underlying aspects. Tighter orbs and stronger aspect types score higher."""
    if not aspect_list:
        return base_weight

    ASPECT_WEIGHT = {"conjunction": 1.0, "opposition": 0.85, "square": 0.8, "trine": 0.75, "sextile": 0.65}

    best = aspect_list[0]  # Already sorted by orb
    orb = best.get("orb", 3.0)
    aspect = best.get("aspect", "conjunction")

    # Orb factor: 0° orb = 1.0, max orb (~8°) = 0.3
    orb_factor = max(0.3, 1.0 - (orb / 10.0))

    # Aspect type factor
    aspect_factor = ASPECT_WEIGHT.get(aspect, 0.7)

    # Multiple aspects in same pair boost score
    count_bonus = min(len(aspect_list) * 0.08, 0.2)

    raw = base_weight * orb_factor * aspect_factor + (count_bonus * 100)
    return max(10, min(100, round(raw)))


def generate_themes(aspects, chart1, chart2, context="friend"):
    """Generate overarching relationship themes from the aspect pattern. Context-aware."""
    themes = []
    is_family = context == "family"
    is_partner = context == "partner"
    is_city = context == "city"

    # Count aspect types for core planets only
    sun_moon = [a for a in aspects if
                (a["p1Name"] == "Sun" and a["p2Name"] == "Moon") or
                (a["p1Name"] == "Moon" and a["p2Name"] == "Sun")]
    venus_mars = [a for a in aspects if
                  (a["p1Name"] == "Venus" and a["p2Name"] == "Mars") or
                  (a["p1Name"] == "Mars" and a["p2Name"] == "Venus")]
    moon_moon = [a for a in aspects if a["p1Name"] == "Moon" and a["p2Name"] == "Moon"]
    sun_sun = [a for a in aspects if a["p1Name"] == "Sun" and a["p2Name"] == "Sun"]
    venus_venus = [a for a in aspects if a["p1Name"] == "Venus" and a["p2Name"] == "Venus"]
    mercury_mercury = [a for a in aspects if a["p1Name"] == "Mercury" and a["p2Name"] == "Mercury"]
    saturn_sun = [a for a in aspects if
                  (a["p1Name"] == "Saturn" and a["p2Name"] == "Sun") or
                  (a["p1Name"] == "Sun" and a["p2Name"] == "Saturn")]

    if sun_moon:
        best = sun_moon[0]
        sm_score = score_theme(sun_moon, 90)
        if best["aspect"] in ("conjunction", "trine", "sextile"):
            if is_city:
                themes.append({
                    "title": "The City Gets You",
                    "score": sm_score,
                    "summary": "Your Sun and the city's Moon (or vice versa) are in harmony. Who you are at your core resonates with the emotional rhythm of this place. You feel understood here without having to explain yourself." if sm_score >= 50 else "There's a Sun-Moon connection between you and this city, but it's loose. You might catch glimpses of feeling understood here, but it's not the city's defining effect on you.",
                })
            elif is_family:
                themes.append({
                    "title": "Natural Understanding",
                    "score": sm_score,
                    "summary": ("Your Sun and their Moon (or vice versa) are in harmony. One of you naturally understands what the other needs. This creates an intuitive family bond where you 'get' each other without trying." if sm_score >= 50 else "There's a Sun-Moon link between you, but it's subtle. You understand each other on some level, though it may take more effort than it would in a tighter connection."),
                })
            else:
                themes.append({
                    "title": "Natural Understanding",
                    "score": sm_score,
                    "summary": ("Your Sun and their Moon (or vice versa) are in harmony. One of you shines in a way the other instinctively nurtures. You 'get' each other without trying." if sm_score >= 50 else "There's a Sun-Moon link in your charts — a thread of understanding between your identity and their emotions. It's present but not dominant, more of an undercurrent than a defining feature."),
                })
        elif best["aspect"] in ("square", "opposition"):
            if is_city:
                themes.append({
                    "title": "The City Challenges Your Identity",
                    "score": score_theme(sun_moon, 85),
                    "summary": "Your Sun and the city's Moon create friction. Who you are at your core rubs against the emotional undercurrent of this place. You may feel like you're constantly adjusting or defending who you are here.",
                })
            elif is_family:
                themes.append({
                    "title": "Push and Pull Dynamic",
                    "score": score_theme(sun_moon, 85),
                    "summary": "Your Sun and their Moon create friction. Your core identity rubs against their emotional needs. This family dynamic requires conscious effort to avoid triggering each other.",
                })
            else:
                themes.append({
                    "title": "Push and Pull Dynamic",
                    "score": score_theme(sun_moon, 85),
                    "summary": "Your Sun and their Moon create friction. Your core identity rubs against their emotional needs. It's magnetic but requires conscious effort to not trigger each other.",
                })

    # Venus-Mars: only show for partner/friend, not family or city
    if venus_mars and not is_family and not is_city:
        best = venus_mars[0]
        if best["aspect"] in ("conjunction", "trine", "sextile", "opposition"):
            themes.append({
                "title": "Physical Chemistry",
                "score": score_theme(venus_mars, 75),
                "summary": "Venus-Mars contact is the classic attraction indicator. There's a pull between desire and affection here that goes beyond friendship. You feel it in your body.",
            })
        elif best["aspect"] == "square":
            themes.append({
                "title": "Frustrated Desire",
                "score": score_theme(venus_mars, 75),
                "summary": "Venus square Mars creates intense attraction with a catch — what one person wants, the other gives differently. The chemistry is real but the timing can feel off.",
            })

    # Venus-Venus: love language / values compatibility
    if venus_venus:
        best = venus_venus[0]
        vv_score = score_theme(venus_venus, 65)
        if best["aspect"] in ("conjunction", "trine", "sextile"):
            if is_city:
                themes.append({
                    "title": "You Love What This City Loves",
                    "score": vv_score,
                    "summary": ("Your Venus signs are in harmony. Your taste, values, and sense of beauty align with what this city celebrates. The restaurants, art, culture, and social scene here feel like they were made for you." if vv_score >= 50 else "There's some overlap between your taste and what this city offers, but it's not a perfect match. You'll find pockets of it rather than a city-wide resonance."),
                })
            elif is_family:
                themes.append({
                    "title": "Shared Values",
                    "score": vv_score,
                    "summary": ("Your Venus signs are in harmony. You share similar values, tastes, and ideas about what makes life beautiful. Family gatherings feel natural and enjoyable." if vv_score >= 50 else "Your values overlap in places but diverge in others. You appreciate different things, which can actually broaden each other's perspective over time."),
                })
            else:
                themes.append({
                    "title": "Shared Love Language" if vv_score >= 50 else "Different Love Languages",
                    "score": vv_score,
                    "summary": ("Your Venus signs are in harmony. You share similar values, aesthetics, and ways of showing affection. Love flows naturally between you." if vv_score >= 50 else "Your Venus signs are connected but loosely. You show care in different ways, which means what feels loving to one person might not register for the other. It takes learning each other's language."),
                })

    if moon_moon:
        best = moon_moon[0]
        mm_score = score_theme(moon_moon, 80)
        if best["aspect"] in ("conjunction", "trine", "sextile"):
            if is_city:
                themes.append({
                    "title": "Emotionally at Home",
                    "score": mm_score,
                    "summary": ("Your Moons are in sync. The emotional rhythm of this city matches yours — you feel safe, comfortable, and nourished here without having to try. This is a place that feels like home in your bones." if mm_score >= 50 else "There's a Moon connection between you and this city, but it's faint. You might feel emotionally comfortable here sometimes, but it's inconsistent — more like visiting a friend's house than coming home."),
                })
            elif is_family:
                themes.append({
                    "title": "Emotional Safety" if mm_score >= 50 else "Emotional Awareness",
                    "score": mm_score,
                    "summary": ("Your Moons are in sync. You feel emotionally safe with each other. This family bond has a nurturing quality where both people feel understood and held." if mm_score >= 50 else "Your Moons are connected but not closely. You care about each other's emotional wellbeing, but reading each other's moods doesn't come automatically — it's something you build over time."),
                })
            else:
                themes.append({
                    "title": "Emotional Resonance" if mm_score >= 50 else "Emotional Awareness",
                    "score": mm_score,
                    "summary": ("Your Moons are in sync. You feel safe with each other. Emotional rhythms match — you know when to push and when to hold space without being told." if mm_score >= 50 else "Your Moons are connected but it's a loose link. You're aware of each other's emotional states, but the instinctive 'I know exactly what you need right now' isn't always there. The care is real, the timing just takes work."),
                })
        elif best["aspect"] in ("square", "opposition"):
            if is_city:
                themes.append({
                    "title": "Emotional Mismatch",
                    "score": score_theme(moon_moon, 75),
                    "summary": "Your Moons clash with this city's. What you need emotionally — the pace, the energy, the way people connect — doesn't come naturally here. You may feel homesick even while you're home.",
                })
            elif is_family:
                themes.append({
                    "title": "Emotional Friction",
                    "score": score_theme(moon_moon, 75),
                    "summary": "Your Moons clash. What comforts one person unsettles the other. You care about each other but express it in fundamentally different ways. Understanding each other's emotional language is the family work.",
                })
            else:
                themes.append({
                    "title": "Emotional Tension",
                    "score": score_theme(moon_moon, 75),
                    "summary": "Your Moons clash. What soothes one person agitates the other. You love each other but you comfort differently. Learning each other's emotional language is the work.",
                })

    if sun_sun:
        best = sun_sun[0]
        if best["aspect"] == "conjunction":
            if is_city:
                themes.append({
                    "title": "Same Frequency",
                    "score": score_theme(sun_sun, 70),
                    "summary": "Your Sun and this city's Sun are in the same sign. You share a core identity — the city's values, pace, and purpose mirror your own. This can feel incredibly validating, but watch for blind spots you share.",
                })
            else:
                themes.append({
                    "title": "Mirror Energy",
                    "score": score_theme(sun_sun, 70),
                    "summary": "Your Suns are in the same sign. You understand each other's core identity because it's the same frequency. The danger is that you amplify each other's worst traits too.",
                })

    # Mercury-Mercury: communication compatibility
    if mercury_mercury:
        best = mercury_mercury[0]
        merc_score = score_theme(mercury_mercury, 55)
        if best["aspect"] in ("conjunction", "trine", "sextile"):
            if is_city:
                themes.append({
                    "title": "The City Speaks Your Language",
                    "score": merc_score,
                    "summary": "Your Mercury signs flow together. The way information moves in this city — conversations, media, daily rhythms — matches how you think. You feel mentally sharp and connected here." if merc_score >= 50 else "There's a loose Mercury connection between you and this city. The way people think and communicate here has some overlap with your style, but it's not the defining feature of the relationship.",
                })
            else:
                if merc_score >= 60:
                    merc_summary = "Your Mercury signs flow together. You think and communicate in compatible ways. Conversations come naturally and misunderstandings are rare."
                elif merc_score >= 45:
                    merc_summary = "Your Mercury signs are loosely connected. You can communicate, but it takes a little more effort to land on the same page. The connection is there — it's just not effortless."
                else:
                    merc_summary = "There's a Mercury link between your charts, but it's faint. Communication isn't your strongest suit together — you may occasionally talk past each other or need to repeat yourselves. It works, it just takes more intention."
                themes.append({
                    "title": "Easy Communication" if merc_score >= 50 else "Communication Style",
                    "score": merc_score,
                    "summary": merc_summary,
                })
        elif best["aspect"] in ("square", "opposition"):
            merc_clash_score = score_theme(mercury_mercury, 50)
            if is_city:
                themes.append({
                    "title": "Mental Friction with the City",
                    "score": merc_clash_score,
                    "summary": "Your Mercury clashes with this city's. The pace of information, the way people communicate, the daily rhythm — it doesn't match how you think. You may feel mentally foggy or frustrated by miscommunications here.",
                })
            else:
                themes.append({
                    "title": "Communication Gaps",
                    "score": merc_clash_score,
                    "summary": "Your Mercury signs clash. You process and express information differently, which can lead to misunderstandings. Extra patience in conversations goes a long way.",
                })

    # Saturn-Sun: authority/structure theme
    if saturn_sun:
        best = saturn_sun[0]
        if best["aspect"] in ("conjunction", "square", "opposition"):
            if is_city:
                themes.append({
                    "title": "The City Disciplines You",
                    "score": score_theme(saturn_sun, 60),
                    "summary": "Saturn touches the Sun between you and this city. The structures here — cost of living, career demands, social expectations — push you to grow up, work harder, and earn your place. It's not easy, but it builds character.",
                })
            elif is_family:
                themes.append({
                    "title": "Authority Dynamic",
                    "score": score_theme(saturn_sun, 60),
                    "summary": "Saturn touches the Sun between you — there's a strong authority/child dynamic here. One person may feel judged or constrained by the other. This is common in parent-child relationships and requires conscious effort to evolve beyond the original power structure.",
                })

    # Element compatibility (core planets only)
    e1 = count_elements(chart1.get("planets", []))
    e2 = count_elements(chart2.get("planets", []))
    shared_dominant = None
    for elem in ["fire", "earth", "air", "water"]:
        if e1[elem] >= 3 and e2[elem] >= 3:
            shared_dominant = elem
    if shared_dominant:
        elem_names = {"fire": "Fire", "earth": "Earth", "air": "Air", "water": "Water"}
        elem_dynamic = {
            'fire': {
                'strong': "You push each other to act. When you're together, things move — decisions get made, energy stays high, and neither of you lets the other sit still for too long. The risk is burning each other out or turning everything into a competition.",
                'moderate': "You bring out each other's boldness. There's a charge when you're together that makes you both more willing to take risks and say what you mean. It keeps the relationship from ever feeling stale.",
            },
            'earth': {
                'strong': "You ground each other. This relationship has a built-in steadiness — you both value showing up, following through, and building something real. The downside is you can get stuck in routines and resist change together.",
                'moderate': "There's a practical reliability between you. When things get chaotic, you tend to stabilize each other. You both appreciate loyalty and consistency, which gives this connection a quiet dependability.",
            },
            'air': {
                'strong': "You live in conversation. This is a relationship built on ideas, humor, and mental stimulation — you keep each other thinking. The risk is staying in your heads and avoiding the emotional depth underneath.",
                'moderate': "You click mentally. There's an ease to how you communicate — inside jokes land, ideas bounce, and you rarely have to over-explain yourselves. That mental shorthand is a real asset in this relationship.",
            },
            'water': {
                'strong': "You feel everything together. This relationship runs on emotional intuition — you read each other without words and absorb each other's moods. The challenge is learning where your feelings end and theirs begin.",
                'moderate': "There's an emotional undercurrent between you. You pick up on each other's moods easily and there's an unspoken understanding that doesn't need to be explained. It makes the hard conversations easier to navigate.",
            },
        }
        # Check if it's actually dominant or just present
        e1_dom = max(e1, key=e1.get)
        e2_dom = max(e2, key=e2.get)
        both_dom = (e1_dom == shared_dominant and e2_dom == shared_dominant)
        strength = 'strong' if both_dom else 'moderate'
        if is_city:
            themes.append({
                "title": f"Shared {elem_names[shared_dominant]} DNA",
                "score": 50 if both_dom else 40,
                "summary": elem_dynamic[shared_dominant][strength],
            })
        else:
            themes.append({
                "title": f"Shared {elem_names[shared_dominant]} Energy",
                "score": 50 if both_dom else 40,
                "summary": elem_dynamic[shared_dominant][strength],
            })

    if not themes:
        if is_city:
            themes.append({
                "title": "A Nuanced Relationship",
                "score": 30,
                "summary": "Your chart and this city's chart don't have the obvious compatibility markers — which means the relationship is more nuanced. Look at the individual aspects below to understand the specific ways this place affects you.",
            })
        else:
            themes.append({
                "title": "Complex Connection",
                "score": 30,
                "summary": "Your charts don't have the obvious 'textbook' compatibility markers — which means the connection is more nuanced. Look at the individual aspects below to understand the specific ways you connect.",
            })

    return themes


if __name__ == "__main__":
    input_data = json.loads(sys.argv[1])
    chart1 = input_data["chart1"]
    chart2 = input_data["chart2"]
    context = input_data.get("context", "friend")
    result = calculate_synastry(chart1, chart2, context)
    print(json.dumps(result))
