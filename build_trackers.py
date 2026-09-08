#!/usr/bin/env python3
"""Build Mapped_Simulation_Trackers.xlsx — fillable QA + fact-check workbook."""
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

FONT = "Arial"
HEADER_FILL = PatternFill("solid", fgColor="2D2A26")
HEADER_FONT = Font(name=FONT, bold=True, color="F0E6D2", size=11)
FILLIN = PatternFill("solid", fgColor="FFF7D6")      # yellow = user fills in
EXAMPLE_FONT = Font(name=FONT, italic=True, color="8A8A8A", size=10)
SECTION_FILL = PatternFill("solid", fgColor="EDE6D6")
BASE_FONT = Font(name=FONT, size=10)
BOLD = Font(name=FONT, size=10, bold=True)
thin = Side(style="thin", color="D9D2C4")
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical="top")
TOP = Alignment(vertical="top")

wb = openpyxl.Workbook()

def style_header(ws, ncols, row=1):
    for c in range(1, ncols + 1):
        cell = ws.cell(row=row, column=c)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(wrap_text=True, vertical="center")
        cell.border = BORDER
    ws.freeze_panes = ws.cell(row=row + 1, column=1)

def widths(ws, wmap):
    for col, w in wmap.items():
        ws.column_dimensions[col].width = w

def put(ws, r, c, val, font=BASE_FONT, fill=None, align=WRAP):
    cell = ws.cell(row=r, column=c, value=val)
    cell.font = font
    cell.alignment = align
    cell.border = BORDER
    if fill:
        cell.fill = fill
    return cell

def fillin_cols(ws, first_row, last_row, cols):
    for r in range(first_row, last_row + 1):
        for c in cols:
            cell = ws.cell(row=r, column=c)
            cell.fill = FILLIN
            cell.font = BASE_FONT
            cell.alignment = WRAP
            cell.border = BORDER

# ───────────────────────── README ─────────────────────────
ws = wb.active
ws.title = "README"
widths(ws, {"A": 26, "B": 30, "C": 22, "D": 22, "E": 22, "F": 40})
put(ws, 1, 1, "Mapped — Simulation & Fact-Check Trackers", Font(name=FONT, bold=True, size=15))
ws.merge_cells("A1:F1")
rows = [
    ("", ""),
    ("How to use", "The companion doc 'Mapped_Simulation_Plan_and_SOP.md' explains the why and how. This workbook is where you record what you find. Fill the YELLOW cells. Each sheet has one italic grey EXAMPLE row — delete it before you start."),
    ("Legend — yellow cell", "You fill it in."),
    ("Legend — EXAMPLE row", "Sample values showing the expected format. Delete before real use."),
    ("Severity", "S1 — Critical (broken / wrong-user data / safety) · S2 — Major (wrong or misleading output) · S3 — Minor (confusing/ugly) · S4 — Trivial (cosmetic)."),
    ("Match / Pass values", "Y = matches reference / passes · N = mismatch (log an issue) · — = not applicable / not yet checked."),
]
r = 2
for a, b in rows:
    put(ws, r, 1, a, BOLD if a else BASE_FONT, SECTION_FILL if a in ("How to use",) else None)
    put(ws, r, 2, b)
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=6)
    r += 1
# legend swatches
ws.cell(row=4, column=1).fill = FILLIN
ws.cell(row=5, column=1).font = EXAMPLE_FONT

r += 1
put(ws, r, 1, "Sheet index", BOLD, SECTION_FILL); ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=6); r += 1
index = [
    ("Personas", "The 12 synthetic users, birth data, targets, account, fact-check status."),
    ("Coverage", "Every surface × persona — tick when exercised; each surface needs ≥3 personas."),
    ("Issue Log", "Every defect and every 'doesn't make sense' finding, logged live."),
    ("FactCheck-Astrology", "Big-3, placements, houses vs an independent ephemeris (Astro.com, tropical + Placidus)."),
    ("FactCheck-Numerology", "Life Path / Expression / Soul Urge / Personality / Birthday / Maturity vs hand-calc."),
    ("FactCheck-HumanDesign", "Type / Authority / Profile / Definition / centers / channels / design-side gates vs MyBodyGraph."),
    ("FactCheck-Resonance", "Archetype / Animal / Deity / Character — determinism, cost, provenance, face-validity."),
    ("Determinism-Cost", "Does each generated surface regenerate or spend credits on repeat views?"),
    ("Weekly-Run-Log", "One row per simulated week / session per persona."),
    ("Deploy-Regression", "Re-checks after each fix/deploy."),
]
for name, desc in index:
    put(ws, r, 1, name, BOLD)
    put(ws, r, 2, desc); ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=6)
    r += 1

r += 1
put(ws, r, 1, "Issue dashboard (auto)", BOLD, SECTION_FILL); ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=6); dash = r + 1
metrics = [
    ("Total issues logged", "=COUNTA('Issue Log'!A3:A1000)"),
    ("S1 — Critical", "=COUNTIF('Issue Log'!G3:G1000,\"S1 — Critical\")"),
    ("S2 — Major", "=COUNTIF('Issue Log'!G3:G1000,\"S2 — Major\")"),
    ("S3 — Minor", "=COUNTIF('Issue Log'!G3:G1000,\"S3 — Minor\")"),
    ("S4 — Trivial", "=COUNTIF('Issue Log'!G3:G1000,\"S4 — Trivial\")"),
    ("Still Open", "=COUNTIF('Issue Log'!M3:M1000,\"Open\")"),
    ("Personas fact-checked", "=COUNTIF(Personas!I2:I13,\"Signed off\")"),
]
for i, (label, formula) in enumerate(metrics):
    rr = dash + i
    put(ws, rr, 1, label, BASE_FONT)
    put(ws, rr, 2, formula, BOLD, align=TOP)

# ───────────────────────── Personas ─────────────────────────
ws = wb.create_sheet("Personas")
cols = ["ID", "Persona", "Birth date", "Birth time", "Birthplace", "Timezone note",
        "Edge cases / target to confirm", "Account (login)", "Fact-check status"]
for c, h in enumerate(cols, 1):
    put(ws, 1, c, h)
style_header(ws, len(cols))
widths(ws, {"A": 6, "B": 20, "C": 13, "D": 11, "E": 20, "F": 22, "G": 46, "H": 22, "I": 16})
personas = [
    ("P01","Ava Chen","1990-07-15","14:30","New York, USA","US Eastern, DST on","Baseline / control; standard 2-word Latin name; Cancer Sun."),
    ("P02","Mateo Rossi","1985-10-27","02:30","Rome, Italy","CET, DST fall-back weekend","Local time that occurs twice — UTC-offset resolution."),
    ("P03","Zainab Al-Farsi","1993-02-18","23:50","Dubai, UAE","GST +4, no DST","Near-midnight (date-rollover); name with particle/hyphen."),
    ("P04","Freya Þórsdóttir","1998-12-21","03:10","Reykjavík, Iceland","GMT+0","High latitude (Placidus distortion, intercepted signs); non-ASCII name → numerology transliteration."),
    ("P05","Kwame Mensah","1979-12-31","23:55","Accra, Ghana","GMT+0","Year-boundary birth; equatorial; pre-1980 historical TZ."),
    ("P06","Mia Nakamura","2000-02-29","12:00","Tokyo, Japan","JST +9, no DST","Leap day (Feb 29); exact noon."),
    ("P07","Lucas Silva","1988-02-05","21:40","São Paulo, Brazil","BRT, historical summer-time","Southern hemisphere; Brazil DST whose rules changed."),
    ("P08","Priya Nair","1995-09-05","18:20","Mumbai, India","IST +5:30","Half-hour (non-integer) timezone offset."),
    ("P09","Sam Rivers","1992-04-04","UNKNOWN","Denver, USA","US Mountain","Unknown birth time → no Rising, no Human Design; tests degraded 'no-birth-time' path everywhere."),
    ("P10","Noor Haddad","1990-06-13","08:15","Beirut, Lebanon","EET +2","Master number target (digit-sum 29 → Life Path 11); inspect for karmic-debt numbers."),
    ("P11","Elena Petrova","1970-06-13","10:05","Moscow, USSR","MSK, Soviet 'decree time'","Target Reflector HD type (~1%; confirm, don't force); Soviet-era TZ oddity."),
    ("P12","Diego Torres-Vega","1996-04-19","05:50","Mexico City, Mexico","CST","Sun on Aries/Taurus cusp + dawn birth (rising-cusp warning); hyphenated surname for numerology."),
]
r = 2
for p in personas:
    for c, v in enumerate(p, 1):
        put(ws, r, c, v)
    r += 1
fillin_cols(ws, 2, r - 1, [8, 9])
# data validation for status
dv = DataValidation(type="list", formula1='"Not started,In progress,Signed off"', allow_blank=True)
ws.add_data_validation(dv); dv.add(f"I2:I{r-1}")

# ───────────────────────── Coverage ─────────────────────────
ws = wb.create_sheet("Coverage")
pids = [p[0] for p in personas]
cols = ["Surface / feature"] + pids + ["# covered", "≥3?"]
for c, h in enumerate(cols, 1):
    put(ws, 1, c, h)
style_header(ws, len(cols))
wmap = {"A": 30}
for i in range(len(pids)):
    wmap[get_column_letter(2 + i)] = 5
wmap[get_column_letter(2 + len(pids))] = 10
wmap[get_column_letter(3 + len(pids))] = 7
widths(ws, wmap)
surfaces = ["Chart / Astrology","Transits","Synastry / Connections","Composite","Solar Return",
    "Astrocartography","Numerology","Human Design","Palmistry + share card","Tarot","Oracle decks",
    "Dolly (web)","Dolly (mobile)","Journal check-in","Burn mode","Voice-to-text","Photos in entries",
    "Profile / Resonance","Animal / Deity / Character cards","Maps / People","Home","Rituals / Learn",
    "Notifications","Settings / Theme / Top bar","Auth / Accounts","Payments (if live)"]
r = 2
countcol = 2 + len(pids)
passcol = 3 + len(pids)
for s in surfaces:
    put(ws, r, 1, s, BASE_FONT)
    cl = get_column_letter(2); cr = get_column_letter(1 + len(pids))
    put(ws, r, countcol, f'=COUNTIF({cl}{r}:{cr}{r},"x")', BOLD, align=TOP)
    put(ws, r, passcol, f'=IF({get_column_letter(countcol)}{r}>=3,"OK","under")', BASE_FONT, align=TOP)
    r += 1
fillin_cols(ws, 2, r - 1, list(range(2, 2 + len(pids))))
put(ws, r + 1, 1, "Tick 'x' when a persona exercises a surface (both web & mobile where relevant). Target: every surface ≥3 personas.", EXAMPLE_FONT)
ws.merge_cells(start_row=r+1, start_column=1, end_row=r+1, end_column=passcol)

# ───────────────────────── Issue Log ─────────────────────────
ws = wb.create_sheet("Issue Log")
cols = ["ID","Date","Persona","Platform","Surface / Feature","Type","Severity","Title",
        "Steps to reproduce","Expected","Actual","Status","Owner","Fix commit / PR","Evidence link","Notes"]
for c, h in enumerate(cols, 1):
    put(ws, 1, c, h)
style_header(ws, len(cols))
widths(ws, {"A":7,"B":11,"C":9,"D":9,"E":18,"F":16,"G":15,"H":24,"I":30,"J":24,"K":24,"L":12,"M":10,"N":16,"O":18,"P":22})
example = ["I-001","2026-01-15","P06","web","Chart / Astrology","Calc/Data error","S2 — Major",
    "Feb-29 birth shows wrong Sun degree","Enter P06 birth data; open chart",
    "Sun ~10° Pisces (per Astro.com)","Sun shows 9° Aquarius","Open","", "",
    "link to screenshot","Leap-day handling suspected"]
for c, v in enumerate(example, 1):
    put(ws, 2, c, v, EXAMPLE_FONT)
fillin_cols(ws, 3, 200, list(range(1, len(cols) + 1)))
# reset example row fill to none
for c in range(1, len(cols)+1):
    ws.cell(row=2, column=c).fill = PatternFill()
    ws.cell(row=2, column=c).font = EXAMPLE_FONT
dv_plat = DataValidation(type="list", formula1='"web,iOS,Android,mobile-web"', allow_blank=True)
dv_type = DataValidation(type="list", formula1='"Bug,Calc/Data error,Content accuracy,UX/Confusion,Copy,Performance,Visual/Layout,Accessibility,Cost/Credits,Privacy/Security,Safety/Content-policy"', allow_blank=True)
dv_sev = DataValidation(type="list", formula1='"S1 — Critical,S2 — Major,S3 — Minor,S4 — Trivial"', allow_blank=True)
dv_stat = DataValidation(type="list", formula1='"Open,In progress,Fixed,Verified,Closed,Won\'t fix"', allow_blank=True)
for dv, rng in [(dv_plat,"D3:D200"),(dv_type,"F3:F200"),(dv_sev,"G3:G200"),(dv_stat,"L3:L200")]:
    ws.add_data_validation(dv); dv.add(rng)

# ───────── generic per-persona fact-check builder ─────────
YN = '"Y,N,—"'
def build_factcheck(title, cols, items, fillin_from, example_row, dv_specs=None):
    ws = wb.create_sheet(title)
    for c, h in enumerate(cols, 1):
        put(ws, 1, c, h)
    style_header(ws, len(cols))
    r = 2
    # example row (italic grey) right under header
    for c, v in enumerate(example_row, 1):
        put(ws, r, c, v, EXAMPLE_FONT)
    r += 1
    first_data = r
    for pid, pname in [(p[0], p[1]) for p in personas]:
        # section band per persona
        put(ws, r, 1, f"{pid} — {pname}", BOLD, SECTION_FILL)
        for c in range(2, len(cols) + 1):
            put(ws, r, c, "", BASE_FONT, SECTION_FILL)
        r += 1
        for it in items:
            put(ws, r, 1, "", BASE_FONT)
            put(ws, r, 2, it, BASE_FONT)
            for c in range(3, len(cols) + 1):
                put(ws, r, c, "", BASE_FONT)
            r += 1
    last = r - 1
    fillin_cols(ws, first_data, last, fillin_from)
    # re-apply section bands over any fillin (bands are non-item rows)
    rr = first_data
    for _ in personas:
        for c in range(1, len(cols) + 1):
            ws.cell(row=rr, column=c).fill = SECTION_FILL
        rr += 1 + len(items)
    if dv_specs:
        for formula, col in dv_specs:
            dv = DataValidation(type="list", formula1=formula, allow_blank=True)
            ws.add_data_validation(dv)
            dv.add(f"{col}3:{col}{last}")
    return ws, first_data, last

# Astrology
astro_items = ["Sun — sign","Moon — sign","Rising / Ascendant — sign","Mercury — sign & house",
    "Venus — sign & house","Mars — sign & house","Jupiter — sign & house","Saturn — sign & house",
    "Uranus — sign & house","Neptune — sign & house","Pluto — sign & house","North Node — sign & house",
    "Chiron — sign & house","Midheaven (MC) — sign","Edge-case behaviour (this persona's target)"]
astro_cols = ["Persona","Item","App value","Reference value","Reference (source + settings)","Match (Y/N/—)","Sev if mismatch","Issue ID","Notes"]
ws2, fd, ld = build_factcheck("FactCheck-Astrology", astro_cols, astro_items, [3,4,5,6,7,8,9],
    ["EXAMPLE","Sun — sign","Cancer","Cancer","Astro.com, tropical + Placidus","Y","","","match"],
    dv_specs=[(YN,"F"), ('"S1 — Critical,S2 — Major,S3 — Minor,S4 — Trivial"',"G")])
widths(ws2, {"A":16,"B":26,"C":18,"D":18,"E":26,"F":13,"G":15,"H":9,"I":30})

# Numerology
num_items = ["Life Path","Expression","Soul Urge","Personality","Birthday","Maturity",
    "Master numbers present (11/22/33)","Karmic-debt numbers (13/14/16/19)","Name string used (exact)","Reduction method confirmed"]
num_cols = ["Persona","Item","App value","Hand-calc value","Match (Y/N/—)","Sev if mismatch","Issue ID","Notes"]
ws3, _, ld3 = build_factcheck("FactCheck-Numerology", num_cols, num_items, [3,4,5,6,7,8],
    ["EXAMPLE","Life Path","11","11","Y","","","master preserved"],
    dv_specs=[(YN,"E"), ('"S1 — Critical,S2 — Major,S3 — Minor,S4 — Trivial"',"F")])
widths(ws3, {"A":16,"B":30,"C":18,"D":18,"E":13,"F":15,"G":9,"H":30})
put(ws3, ld3 + 2, 2, "Pin the method BEFORE calculating: Pythagorean, master numbers 11/22/33 preserved, and confirm which exact NAME STRING the app feeds in (full birth name vs display/account name).", EXAMPLE_FONT)
ws3.merge_cells(start_row=ld3+2, start_column=2, end_row=ld3+2, end_column=8)

# Human Design
hd_items = ["Type","Strategy","Authority","Profile (both lines)","Definition","Defined centers (list)",
    "Channels (list)","Personality gates (spot-check ≥3)","Design-side gates (spot-check ≥3)","Incarnation cross"]
hd_cols = ["Persona","Item","App value","Reference (MyBodyGraph)","Match (Y/N/—)","Sev if mismatch","Issue ID","Notes"]
ws4, _, ld4 = build_factcheck("FactCheck-HumanDesign", hd_cols, hd_items, [3,4,5,6,7,8],
    ["EXAMPLE","Type","Projector","Projector","Y","","","design-side confirmed"],
    dv_specs=[(YN,"E"), ('"S1 — Critical,S2 — Major,S3 — Minor,S4 — Trivial"',"F")])
widths(ws4, {"A":16,"B":30,"C":20,"D":24,"E":13,"F":15,"G":9,"H":28})
put(ws4, ld4 + 2, 2, "P09 (unknown time): confirm HD is correctly WITHHELD, not guessed. The design side (88° solar arc) is where HD engines most often err — always spot-check it.", EXAMPLE_FONT)
ws4.merge_cells(start_row=ld4+2, start_column=2, end_row=ld4+2, end_column=8)

# Resonance
res_items = ["Archetype — primary","Archetype — secondary / 'shaded by'","Animal guide (+ tier)",
    "Animal provenance correct? (source + 'Animal Guide' term, within cultural gate)",
    "Deity (+ tier)","Deity phrasing correct? (living-open = comparative, within cultural gate)",
    "Character (+ work)","Deterministic on reload (identical every time)?","No AI-credit spend on reload?",
    "Face-validity — plausible for this chart? (why)","Evidence lines cite this persona's real placements?"]
res_cols = ["Persona","Check","Value / result","Pass (Y/N/—)","Notes"]
ws5, _, ld5 = build_factcheck("FactCheck-Resonance", res_cols, res_items, [3,4,5],
    ["EXAMPLE","Archetype — primary","The Gate","Y","coherent w/ Scorpio 8th"],
    dv_specs=[(YN,"D")])
widths(ws5, {"A":16,"B":48,"C":22,"D":13,"E":34})

# ───────────────────────── Determinism-Cost ─────────────────────────
ws = wb.create_sheet("Determinism-Cost")
cols = ["Surface","Expected","Regenerates on reload? (Y/N)","Credits before","Credits after","Delta","Pass","Notes"]
for c, h in enumerate(cols, 1):
    put(ws, 1, c, h)
style_header(ws, len(cols))
widths(ws, {"A":26,"B":24,"C":22,"D":13,"E":13,"F":9,"G":10,"H":26})
dc_rows = [
    ("Chart interpretation text","Fixed"),("Numerology text","Fixed"),("Human Design text","Fixed"),
    ("Placement detail (e.g. 'Mars in 8th')","Fixed"),("Archetype","Fixed"),("Animal guide","Fixed"),
    ("Deity","Fixed"),("Character","Fixed"),("Tarot / Oracle reading (a saved pull)","Fixed"),
    ("Dolly reply","Time-sensitive"),("Today's transits","Time-sensitive"),("Near-future transits","Time-sensitive"),
]
r = 2
for name, exp in dc_rows:
    put(ws, r, 1, name, BASE_FONT)
    put(ws, r, 2, exp, BASE_FONT)
    for c in (3,4,5,8):
        put(ws, r, c, "", BASE_FONT, FILLIN)
    put(ws, r, 6, f"=IF(OR(D{r}=\"\",E{r}=\"\"),\"\",E{r}-D{r})", BASE_FONT, align=TOP)
    put(ws, r, 7, f"=IF(OR(C{r}=\"\",D{r}=\"\",E{r}=\"\"),\"\",IF(B{r}=\"Fixed\",IF(AND(F{r}=0,C{r}=\"No\"),\"PASS\",\"FAIL\"),\"n/a\"))", BOLD, align=TOP)
    r += 1
dv_yn = DataValidation(type="list", formula1='"Y,N,No,Yes"', allow_blank=True)
ws.add_data_validation(dv_yn); dv_yn.add(f"C2:C{r-1}")
put(ws, r + 1, 1, "Fixed surfaces must NOT regenerate and must NOT spend credits on repeat views (delta = 0, regenerates = No). Time-sensitive surfaces may recompute — that's expected and typically free/calculated.", EXAMPLE_FONT)
ws.merge_cells(start_row=r+1, start_column=1, end_row=r+1, end_column=8)

# ───────────────────────── Weekly-Run-Log ─────────────────────────
ws = wb.create_sheet("Weekly-Run-Log")
cols = ["Session ID","Date","Persona","Sim-week (1–12)","Platform","Surfaces touched","Issues opened (IDs)","Notes"]
for c, h in enumerate(cols, 1):
    put(ws, 1, c, h)
style_header(ws, len(cols))
widths(ws, {"A":11,"B":11,"C":9,"D":14,"E":11,"F":34,"G":18,"H":30})
ex = ["S-001","2026-01-15","P01","1","web","Home, Journal (morning), Tarot→Dolly, Transits","I-001, I-002","first pass"]
for c, v in enumerate(ex, 1):
    put(ws, 2, c, v, EXAMPLE_FONT)
    ws.cell(row=2, column=c).fill = PatternFill()
fillin_cols(ws, 3, 200, list(range(1, len(cols)+1)))
dvp = DataValidation(type="list", formula1='"web,iOS,Android,mobile-web"', allow_blank=True)
ws.add_data_validation(dvp); dvp.add("E3:E200")

# ───────────────────────── Deploy-Regression ─────────────────────────
ws = wb.create_sheet("Deploy-Regression")
cols = ["Build / commit","Date","Issue ID re-tested","Persona","Result","resonance:validate","Smoke re-check","Notes"]
for c, h in enumerate(cols, 1):
    put(ws, 1, c, h)
style_header(ws, len(cols))
widths(ws, {"A":16,"B":11,"C":16,"D":9,"E":10,"F":16,"G":24,"H":28})
ex = ["6b048f6","2026-01-16","I-001","P06","Pass","PASS (gates green)","1 astro line re-checked OK","leap-day fix verified"]
for c, v in enumerate(ex, 1):
    put(ws, 2, c, v, EXAMPLE_FONT)
    ws.cell(row=2, column=c).fill = PatternFill()
fillin_cols(ws, 3, 100, list(range(1, len(cols)+1)))
dvr = DataValidation(type="list", formula1='"Pass,Fail"', allow_blank=True)
ws.add_data_validation(dvr); dvr.add("E3:E100")

wb.save("Mapped_Simulation_Trackers.xlsx")
print("saved")
