"""Build the case-study background scenes as HTML (2560x1440).

python3 build.py            -> writes scenes/*.html
python3 render.py [names]   -> screenshots them into ../*.webp

Every scene is built from the project's own stills plus code, diagrams and UI
fragments drawn here. Only real product names and copy from the case pages.
"""
import math
import os
import random

from artlib import (W, H, esc, page, bloom, grid_floor, dot_matrix, code_panel, svg, streams,
                    point_cloud, node_graph, waveform, area_curve, qr, box, skel_lines)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "scenes")
A = "../../../../../"  # scenes/ -> repo assets/


# ── palettes ───────────────────────────────────────────────────────────────

def palette(bg0, accent, glass_tint, code_k, code_s, code_n, ink="#fff", skel="rgba(255,255,255,.14)"):
    r, g, b = glass_tint
    return f"""
--bg0:{bg0}; --ink:{ink}; --accent:{accent};
--glass-top:rgba({r},{g},{b},.80); --glass-bot:rgba({r},{g},{b},.66);
--glass-line:rgba(255,255,255,.12); --glass-hi:rgba(255,255,255,.10);
--shadow:rgba(0,0,0,.45); --card:#fff; --card-line:rgba(0,0,0,.06); --card-ink:#0a0a0a;
--tag-ink:rgba(255,255,255,.86); --tag-bg:rgba(255,255,255,.06); --tag-line:rgba(255,255,255,.16);
--skel:{skel}; --chrome-dot:rgba(255,255,255,.18);
--code-ink:rgba(236,236,245,.86); --code-k:{code_k}; --code-s:{code_s}; --code-c:rgba(255,255,255,.36);
--code-n:{code_n}; --code-p:rgba(255,255,255,.5);
"""


P = {
    "cc": palette("#14122b", "#7c8cff", (30, 28, 64), "#a5b4ff", "#9ee6c9", "#f7c48b"),
    "dr": palette("#151312", "#ec7755", (36, 32, 30), "#ffb08f", "#e9d8a6", "#f6a37f"),
    "wl": palette("#1f0c1a", "#f078be", (56, 22, 46), "#ff9fd2", "#f2d3a3", "#c7b3ff"),
    "ee": palette("#2a0d09", "#ff8a5c", (64, 22, 16), "#ffb38c", "#ffe3a8", "#ffd0b0"),
    "rs": palette("#060706", "#1db954", (18, 22, 19), "#7ee2a1", "#d8f5c4", "#b7f0cb"),
}


def base(bg_css):
    return f'<div class="fill" style="background:{bg_css}"></div>'


def shade(css):
    return f'<div class="fill" style="background:{css}"></div>'


def window(src, x, y, w, h=None, transform="", op=1, pos="0 0", bar=True, radius=22, dim=0, blur=0, z=None, fit="cover", bg="#fff"):
    """A product still in a thin app window. h crops the still (object-fit)."""
    top = ('<div style="height:38px;display:flex;align-items:center;gap:10px;padding:0 18px;background:rgba(246,246,248,.96);'
           'border-bottom:1px solid rgba(0,0,0,.06)"><b style="width:11px;height:11px;border-radius:50%;background:#e2e2e6"></b>'
           '<b style="width:11px;height:11px;border-radius:50%;background:#e2e2e6"></b><b style="width:11px;height:11px;border-radius:50%;background:#e2e2e6"></b></div>') if bar else ""
    img_h = f"height:{h - (38 if bar else 0)}px;" if h else ""
    dimmer = f'<div class="fill" style="background:rgba(0,0,0,{dim})"></div>' if dim else ""
    filt = f"filter:blur({blur}px);" if blur else ""
    zz = f"z-index:{z};" if z is not None else ""
    return (f'<div class="abs" style="left:{x}px;top:{y}px;width:{w}px;{"height:%dpx;" % h if h else ""}opacity:{op};{filt}{zz}'
            f'transform:{transform or "none"};border-radius:{radius}px;overflow:hidden;background:{bg};'
            f'box-shadow:0 80px 160px rgba(0,0,0,.5),0 0 0 1.5px rgba(255,255,255,.14)">{top}'
            f'<img src="{src}" style="display:block;width:100%;{img_h}object-fit:{fit};object-position:{pos}">{dimmer}</div>')


def phone(src, x, y, w, transform="", op=1, pos="50% 0", dim=0, z=None):
    h = int(w * 2.05)
    dimmer = f'<div class="fill" style="background:rgba(0,0,0,{dim});border-radius:{w * .13}px"></div>' if dim else ""
    zz = f"z-index:{z};" if z is not None else ""
    return (f'<div class="abs" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;opacity:{op};{zz}transform:{transform or "none"};'
            f'border-radius:{w * .16:.0f}px;background:#0b0b0c;padding:{w * .035:.0f}px;box-shadow:0 80px 160px rgba(0,0,0,.55),inset 0 0 0 2px rgba(255,255,255,.14)">'
            f'<div style="position:relative;width:100%;height:100%;border-radius:{w * .13:.0f}px;overflow:hidden;background:#fff">'
            f'<img src="{src}" style="display:block;width:100%;height:100%;object-fit:cover;object-position:{pos}">{dimmer}</div></div>')


def tag(text, x, y, dot=True, op=1, size=None, transform=""):
    s = f"font-size:{size}px;height:{size * 2.2:.0f}px;" if size else ""
    return (f'<div class="abs tag" style="left:{x}px;top:{y}px;opacity:{op};{s}transform:{transform or "none"}">'
            f'{"<i></i>" if dot else ""}{esc(text)}</div>')


def label(text, x, y, size=20, color="rgba(255,255,255,.55)", op=1, weight=400, mono=True, ls=".04em"):
    fam = '"JBM", monospace' if mono else '"Inter", sans-serif'
    return (f'<div class="abs" style="left:{x}px;top:{y}px;opacity:{op};font:{weight} {size}px/1.2 {fam};letter-spacing:{ls};'
            f'color:{color};white-space:nowrap">{esc(text)}</div>')


def write(name, title, pal, body):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name + ".html"), "w") as f:
        f.write(page(title, pal, body))


TILT_R = "perspective(2600px) rotateY(-18deg) rotateX(7deg) rotateZ(1.5deg)"
TILT_L = "perspective(2600px) rotateY(18deg) rotateX(7deg) rotateZ(-1.5deg)"


# ═══ Contextual Chat ═══════════════════════════════════════════════════════

CC_RETRIEVE = """// contextual-chat/retrieve.ts
export async function ask(question, session) {
  const screen = await readScreen(session) // your page
  const vector = await embed(question)
  const hits = await index.query({
    vector,
    topK: 8,
    filter: { company: screen.companyId },
  })
  return answer({ question, screen, sources: hits })
}"""

CC_ANSWER = """{
  "screen": "company_profile",
  "intent": "plain_language",
  "sources": [
    { "section": "Funding" },
    { "section": "Executive Summary" },
    { "section": "Industry Overview" }
  ],
  "cite": true
}"""


def cc_scenes():
    pal = P["cc"]
    bg = base("radial-gradient(70% 90% at 78% 30%,#2b2a63 0%,#1a1838 55%,#100e22 100%)")

    # cover: the visible window on a square-ish cover is x 560-2000; text sits left, a laptop sits low centre.
    # So the product lives top-right (x 1250-2000, y 40-650) and spills further right for wide screens.
    cloud = svg(1000, 0, 1560, 1440, point_cloud(11, 1560, 1440, 520, color="#c9ceff", hi="#9fb0ff",
                query=(560, 640), k=8, op=(.06, .34), r=(1.3, 3.2), gid="ccc"), op=.7)
    body = "".join([
        bg,
        bloom(1700, 380, 820, "rgba(110,124,255,.42)"),
        bloom(300, 1300, 700, "rgba(150,110,255,.16)"),
        dot_matrix(0, 0, W, H, step=34, r=1.3, color="rgba(255,255,255,.07)",
                   mask="radial-gradient(60% 70% at 70% 40%,black,transparent)"),
        cloud,
        window(A + "systematic-agent/part01/screen-chat.png", 1500, 40, 1000, 600, TILT_R, pos="0 0", dim=.05),
        code_panel(CC_RETRIEVE, 1250, 400, 900, transform="perspective(2600px) rotateY(-12deg) rotateX(5deg)",
                   title="retrieve.ts", z=3),
        tag("screen context", 1290, 330),
        tag("vector search · topK 8", 2050, 760, op=.9),
        shade("linear-gradient(90deg,rgba(14,12,34,.9) 0%,rgba(14,12,34,.6) 38%,rgba(14,12,34,0) 50%)"),
        shade("linear-gradient(0deg,rgba(14,12,34,.5) 0%,rgba(14,12,34,0) 40%)"),
    ])
    write("cc-cover", "Contextual Chat cover", pal, body)

    # band: the embedding space, question linked to its nearest profile sections.
    # Bands are short and wide with big type left and numbers across; the motif sits in the right third.
    labels = [(2010, 430, "Funding"), (2230, 560, "Executive Summary"), (1880, 830, "Industry Overview"),
              (1700, 560, "SWOT Analysis"), (2260, 820, "Alpha Insights")]
    cloud = point_cloud(23, W, H, 900, color="#c9ceff", hi="#a9b8ff", query=(2050, 660), k=10,
                        op=(.05, .34), r=(1.3, 3.4), labels=labels, label_color="rgba(220,226,255,.62)", gid="ccb")
    body = "".join([
        base("radial-gradient(80% 100% at 78% 50%,#26245a 0%,#16142f 60%,#0e0c20 100%)"),
        bloom(2050, 660, 700, "rgba(120,134,255,.34)"),
        svg(0, 0, W, H, cloud),
        box(1790, 940, 540, inner=f'<div style="padding:24px 28px;display:flex;gap:16px;align-items:center">'
            f'<span style="width:32px;height:32px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#c8d0ff,#6f7dff)"></span>'
            f'<span style="font:500 23px/1.3 Inter;color:rgba(255,255,255,.9)">How is this company funded?</span></div>', op=.92),
        label("query embedding", 2090, 630, size=19, color="rgba(255,255,255,.7)"),
        shade("linear-gradient(90deg,rgba(14,12,32,.82) 0%,rgba(14,12,32,.45) 50%,rgba(14,12,32,0) 68%)"),
    ])
    write("cc-band", "Contextual Chat band", pal, body)

    # stage: centre left clear for cards, product stills on the edges, grid floor
    body = "".join([
        base("linear-gradient(180deg,#2c2a66 0%,#232152 45%,#16142f 100%)"),
        bloom(1280, 300, 1100, "rgba(140,150,255,.30)"),
        grid_floor(820, color="rgba(190,200,255,.12)", step=110, tilt=74),
        window(A + "systematic-agent/ai-insights.png", -260, 160, 880, 1100, TILT_L, pos="0 0", op=.9, dim=.08),
        window(A + "systematic-agent/part01/screen-chat.png", 2020, 220, 980, 640, TILT_R, pos="0 0", op=.9, dim=.08),
        code_panel(CC_ANSWER, 2000, 860, 700, transform="perspective(2600px) rotateY(-16deg) rotateX(6deg)", title="answer.json", op=.9),
        shade("radial-gradient(48% 60% at 50% 52%,rgba(22,20,48,.55) 0%,rgba(22,20,48,0) 100%)"),
    ])
    write("cc-stage", "Contextual Chat stage", pal, body)

    # dark: quiet knowledge graph behind a long text ledger
    graph = node_graph(5, W, H, 70, color="#aab4ff", hi="#9aa8ff", edges_k=2, hub=(2050, 420),
                       labels=[(3, "Funding"), (9, "Team"), (14, "Industry"), (21, "Investors")], op=(.12, .4), gid="ccd",
                       label_color="rgba(220,226,255,.5)")
    body = "".join([
        base("linear-gradient(180deg,#121027 0%,#0c0b1c 100%)"),
        bloom(2050, 420, 800, "rgba(110,124,255,.22)"),
        svg(0, 0, W, H, graph, op=.7),
        code_panel(CC_RETRIEVE, 1700, 860, 980, transform="perspective(2600px) rotateY(-14deg) rotateX(6deg)", op=.55, title="retrieve.ts"),
        shade("linear-gradient(90deg,rgba(10,9,24,.8) 0%,rgba(10,9,24,.45) 50%,rgba(10,9,24,.1) 100%)"),
    ])
    write("cc-dark", "Contextual Chat dark", pal, body)


# ═══ Deal Room ═════════════════════════════════════════════════════════════

DR_STATE = """// deal-room/state.ts
const dealRoom = createMachine({
  initial: "setup",
  states: {
    setup:       { on: { CREATE_FROM_PROFILE: "nda" } },
    nda:         { on: { SIGNED: "commitments" } },
    commitments: { on: { REVOKE: "nda" } },
  },
})"""

DR_GATE = """// deal-room/access.ts
function canViewDocs(user, deal) {
  if (!deal.ndaRequired) return true
  const nda = deal.signatures[user.id]
  // docs stay dark until someone signs
  return nda?.status === "signed" && !deal.revoked.has(user.id)
}"""

DR_ROWS = [("John Doe", "Tech Solutions", "NDA Signed"), ("Jane Smith", "Creative Agency", "Viewed"),
           ("Mark Johnson", "Marketing Hub", "Downloaded"), ("Emily Davis", "Design Studio", "Interest"),
           ("Michael Brown", "Finance Co.", "Pending"), ("Sarah Wilson", "Consulting Group", "Pending")]


def dr_rows(x, y, w, op=1, transform="", hl=0):
    rows = []
    for i, (n, c, s) in enumerate(DR_ROWS):
        on = s not in ("Pending",)
        col = "#ec7755" if s == "NDA Signed" else ("rgba(255,255,255,.8)" if on else "rgba(255,255,255,.4)")
        rows.append(f'<div style="display:grid;grid-template-columns:1.2fr 1.3fr 1fr;align-items:center;height:76px;padding:0 30px;'
                    f'border-top:1px solid rgba(255,255,255,.08);font:400 22px/1 Inter;color:rgba(255,255,255,{.85 if on else .5});'
                    f'{"background:rgba(236,119,85,.10);" if i == hl else ""}">'
                    f'<span>{esc(n)}</span><span style="color:rgba(255,255,255,.5)">{esc(c)}</span>'
                    f'<span style="font:500 19px/1 JBM;color:{col};display:flex;align-items:center;gap:12px">'
                    f'<i style="width:9px;height:9px;border-radius:50%;background:{col};box-shadow:0 0 14px {col}"></i>{esc(s)}</span></div>')
    head = ('<div style="display:flex;justify-content:space-between;padding:28px 30px 22px;font:500 22px/1 Inter;color:#fff">'
            '<span>Engagement</span><span style="font:400 18px/1 JBM;color:rgba(255,255,255,.45)">viewed · signed · downloaded</span></div>')
    return box(x, y, w, inner=head + "".join(rows), op=op, transform=transform)


def dr_ladder(x, y, w, op=1):
    steps = [("01", "Setup", "create from profile"), ("02", "NDA", "gate in product"), ("03", "Commitments", "docs · access · interest")]
    gap = w / 3
    out = []
    lines = ""
    for i in range(2):
        x1 = gap * i + 150
        x2 = gap * (i + 1) + 20
        lines += (f'<path d="M{x1},60 L{x2},60" stroke="#ec7755" stroke-opacity=".55" stroke-width="2.5" stroke-dasharray="2 12" stroke-linecap="round"/>'
                  f'<circle cx="{(x1 + x2) / 2}" cy="60" r="7" fill="#ffb08f"/><circle cx="{(x1 + x2) / 2}" cy="60" r="22" fill="#ec7755" fill-opacity=".18"/>')
    out.append(svg(x, y, w, 120, lines, op=op))
    for i, (n, t, s) in enumerate(steps):
        lock = i == 1
        out.append(box(x + gap * i - 10, y + 10, 190 if not lock else 200,
                       inner=f'<div style="padding:18px 22px"><div style="font:500 17px/1 JBM;color:rgba(255,255,255,.45)">{n}</div>'
                             f'<div style="font:500 26px/1.2 Inter;color:#fff;margin-top:8px">{esc(t)}</div></div>',
                       op=op, extra="border-radius:22px" + (";box-shadow:0 0 0 2px rgba(236,119,85,.7),0 40px 90px rgba(0,0,0,.4)" if lock else "")))
        out.append(label(s, x + gap * i - 4, y + 140, size=18, color="rgba(255,255,255,.5)", op=op))
    return "".join(out)


def dr_ladder_v(x, y, op=1):
    """Setup -> NDA -> Commitments, stacked, with the NDA gate lit."""
    steps = [("01", "Setup", "create from profile"), ("02", "NDA", "gate inside the product"), ("03", "Commitments", "docs · access · interest")]
    out = []
    path = ""
    for i in range(2):
        y1, y2 = i * 190 + 104, (i + 1) * 190 - 4
        path += (f'<path d="M48,{y1} L48,{y2}" stroke="#ec7755" stroke-opacity=".6" stroke-width="2.5" stroke-dasharray="2 11" stroke-linecap="round"/>'
                 f'<circle cx="48" cy="{(y1 + y2) / 2}" r="6" fill="#ffb08f"/><circle cx="48" cy="{(y1 + y2) / 2}" r="20" fill="#ec7755" fill-opacity=".18"/>')
    out.append(svg(x, y, 120, 560, path, op=op))
    for i, (n, t, s_) in enumerate(steps):
        lock = i == 1
        out.append(box(x, y + i * 190, 470, 100,
                       inner=f'<div style="height:100%;display:flex;align-items:center;gap:22px;padding:0 26px">'
                             f'<span style="font:500 18px/1 JBM;color:{"#ffb08f" if lock else "rgba(255,255,255,.45)"}">{n}</span>'
                             f'<span style="font:500 26px/1 Inter;color:#fff">{esc(t)}</span>'
                             f'<span style="margin-left:auto;font:400 17px/1 JBM;color:rgba(255,255,255,.45)">{esc(s_)}</span></div>',
                       op=op, extra="border-radius:24px" + (";box-shadow:0 0 0 2px rgba(236,119,85,.75),0 40px 90px rgba(0,0,0,.4)" if lock else "")))
    return "".join(out)


def dr_scenes():
    pal = P["dr"]
    body = "".join([
        base("radial-gradient(80% 90% at 74% 22%,#3a2a22 0%,#1d1a18 55%,#121110 100%)"),
        bloom(1750, 360, 820, "rgba(236,119,85,.40)"),
        bloom(500, 1400, 700, "rgba(233,102,53,.12)"),
        grid_floor(820, color="rgba(255,190,160,.08)", step=120, tilt=74),
        window(A + "deal-room-dashboard-insights.png", 1480, 40, 1040, 640, TILT_R, pos="0 0", dim=.05),
        code_panel(DR_STATE, 1240, 410, 900, transform="perspective(2600px) rotateY(-12deg) rotateX(5deg)", title="state.ts", z=3),
        tag("NDA required", 1280, 340),
        shade("linear-gradient(90deg,rgba(18,16,15,.9) 0%,rgba(18,16,15,.6) 38%,rgba(18,16,15,0) 50%)"),
        shade("linear-gradient(0deg,rgba(18,16,15,.5) 0%,rgba(18,16,15,0) 40%)"),
    ])
    write("dr-cover", "Deal Room cover", pal, body)

    body = "".join([
        base("radial-gradient(70% 100% at 85% 55%,#3b2a22 0%,#1f1c1a 60%,#141312 100%)"),
        bloom(2100, 700, 760, "rgba(236,119,85,.30)"),
        dot_matrix(0, 0, W, H, step=36, r=1.3, color="rgba(255,255,255,.07)", mask="radial-gradient(50% 70% at 78% 50%,black,transparent)"),
        dr_ladder_v(1880, 430),
        shade("linear-gradient(90deg,rgba(20,18,17,.85) 0%,rgba(20,18,17,.5) 48%,rgba(20,18,17,0) 66%)"),
    ])
    write("dr-band", "Deal Room band", pal, body)

    body = "".join([
        base("linear-gradient(180deg,#3b322d 0%,#2a2522 50%,#1d1a18 100%)"),
        bloom(1280, 220, 1100, "rgba(236,119,85,.26)"),
        grid_floor(820, color="rgba(255,200,170,.10)", step=110, tilt=74),
        window(A + "nda-select-for-deal.png", -200, 200, 820, 560, TILT_L, pos="0 0", bar=False, op=.92, dim=.06),
        window(A + "nda-signed-success.png", 2080, 260, 700, 432, TILT_R, pos="50% 50%", bar=False, op=.92, dim=.06),
        code_panel(DR_GATE, 1960, 820, 840, transform="perspective(2600px) rotateY(-16deg) rotateX(6deg)", title="access.ts", op=.88),
        shade("radial-gradient(48% 60% at 50% 52%,rgba(30,26,24,.5) 0%,rgba(30,26,24,0) 100%)"),
    ])
    write("dr-stage", "Deal Room stage", pal, body)

    body = "".join([
        base("linear-gradient(180deg,#1b1918 0%,#100f0e 100%)"),
        bloom(2200, 200, 800, "rgba(236,119,85,.2)"),
        dr_rows(1560, 180, 980, op=.5, transform="perspective(2600px) rotateY(-14deg) rotateX(8deg)", hl=-1),
        code_panel(DR_GATE, 1460, 820, 1000, transform="perspective(2600px) rotateY(-14deg) rotateX(6deg)", op=.5, title="access.ts"),
        shade("linear-gradient(90deg,rgba(14,13,12,.85) 0%,rgba(14,13,12,.5) 50%,rgba(14,13,12,.1) 100%)"),
    ])
    write("dr-dark", "Deal Room dark", pal, body)


# ═══ White Label ═══════════════════════════════════════════════════════════

WL_CONFIG = """// settings/white-label.json
{
  "subdomain": "yourfirm.systematicventures.com",
  "logo": { "file": "logo.svg", "after": "subdomain" },
  "sender": {
    "from": "deals@yourfirm.com",
    "status": "pending"
  },
  "live": false
}"""

WL_LIVE = """type SenderState = "empty" | "pending" | "resent" | "verified"

// live is a result, not a skin
function isLive(firm) {
  return Boolean(firm.subdomain)
    && Boolean(firm.logo)
    && firm.sender.status === "verified"
}"""


def wl_pill(text, kind):
    c = {"verified": ("#7ee2a1", "rgba(126,226,161,.14)"), "pending": ("#f6c177", "rgba(246,193,119,.14)"),
         "empty": ("rgba(255,255,255,.6)", "rgba(255,255,255,.08)"), "pink": ("#ff9fd2", "rgba(255,159,210,.14)")}[kind]
    return (f'<span style="display:inline-flex;align-items:center;gap:10px;height:40px;padding:0 16px;border-radius:999px;'
            f'font:500 18px/1 JBM;color:{c[0]};background:{c[1]}"><i style="width:8px;height:8px;border-radius:50%;background:{c[0]}"></i>{esc(text)}</span>')


def wl_rows(x, y, w, op=1, transform=""):
    rows = [("Custom Subdomain", "yourfirm.systematicventures.com", "verified", "Live"),
            ("Your Logo", "firm-logo.svg", "verified", "Uploaded"),
            ("Custom Sender", "deals@yourfirm.com", "pending", "Pending verification")]
    inner = '<div style="padding:30px 34px 10px;font:500 26px/1 Inter;color:#fff">White Label Setup</div>'
    for t, v, k, s in rows:
        inner += (f'<div style="display:flex;justify-content:space-between;align-items:center;padding:26px 34px;border-top:1px solid rgba(255,255,255,.08)">'
                  f'<div><div style="font:500 22px/1.2 Inter;color:rgba(255,255,255,.9)">{esc(t)}</div>'
                  f'<div style="font:400 19px/1.2 JBM;color:rgba(255,255,255,.45);margin-top:10px">{esc(v)}</div></div>{wl_pill(s, k)}</div>')
    return box(x, y, w, inner=inner, op=op, transform=transform)


def wl_flow(x, y, op=1, lw=300, gap=120):
    """Three lanes: subdomain -> DNS -> live URL, logo -> storage, sender -> pending -> verified."""
    lanes = [
        ("Subdomain", ["DNS record", "Live URL"], "verified"),
        ("Logo", ["File storage", "Shown on invites"], "verified"),
        ("Sender", ["Pending", "Verified"], "pending"),
    ]
    out = []
    for li, (start, steps, kind) in enumerate(lanes):
        yy = li * 180
        nodes = [start] + steps
        for ni, n in enumerate(nodes):
            xx = ni * (lw + gap)
            hot = ni == 0
            out.append(box(x + xx, y + yy, lw, 100,
                           inner=f'<div style="height:100%;display:flex;align-items:center;gap:14px;padding:0 22px;font:500 21px/1 Inter;white-space:nowrap;color:{"#fff" if hot else "rgba(255,255,255,.75)"}">'
                                 f'<i style="width:10px;height:10px;border-radius:50%;background:{"#f078be" if hot else ("#7ee2a1" if (kind == "verified" or n == "Verified") and ni == len(nodes) - 1 else "#f6c177" if n == "Pending" else "rgba(255,255,255,.4)")}"></i>{esc(n)}</div>',
                           op=op, extra="border-radius:22px"))
        path = ""
        for ni in range(len(nodes) - 1):
            x1 = (ni + 1) * lw + ni * gap
            x2 = x1 + gap
            dash = ' stroke-dasharray="3 10"' if (kind == "pending" and ni == 1) else ""
            path += f'<path d="M{x1 + 8},{yy + 50} L{x2 - 8},{yy + 50}" stroke="#f078be" stroke-opacity=".6" stroke-width="2.5" stroke-linecap="round"{dash}/>'
            path += f'<circle cx="{x2 - 8}" cy="{yy + 50}" r="5" fill="#ff9fd2"/>'
        out.append(svg(x, y, 3 * lw + 2 * gap, 3 * 180, path, op=op))
    return "".join(out)


def wl_scenes():
    pal = P["wl"]
    body = "".join([
        base("radial-gradient(80% 90% at 72% 22%,#5a1f4b 0%,#2c1027 55%,#170814 100%)"),
        bloom(1750, 380, 820, "rgba(240,120,190,.36)"),
        grid_floor(820, color="rgba(255,180,220,.08)", step=120, tilt=74),
        window(A + "white-label/screens/new-identity-branding.png", 1480, 40, 1040, 680, TILT_R, pos="0 0", dim=.04),
        code_panel(WL_CONFIG, 1230, 400, 900, transform="perspective(2600px) rotateY(-12deg) rotateX(5deg)", title="white-label.json", z=3),
        tag("logo after URL", 1270, 330),
        shade("linear-gradient(90deg,rgba(24,8,20,.9) 0%,rgba(24,8,20,.6) 38%,rgba(24,8,20,0) 50%)"),
        shade("linear-gradient(0deg,rgba(24,8,20,.5) 0%,rgba(24,8,20,0) 40%)"),
    ])
    write("wl-cover", "White Label cover", pal, body)

    body = "".join([
        base("radial-gradient(70% 100% at 85% 55%,#4f1a42 0%,#2a0f25 60%,#1a0816 100%)"),
        bloom(2080, 700, 760, "rgba(240,120,190,.28)"),
        dot_matrix(0, 0, W, H, step=36, r=1.3, color="rgba(255,255,255,.07)", mask="radial-gradient(50% 70% at 78% 50%,black,transparent)"),
        wl_flow(1660, 470, lw=250, gap=56),
        tag("DNS", 1966, 380, op=.85), tag("file storage", 2272, 380, op=.85),
        label("verification wait", 2272, 1040, size=18, color="rgba(255,255,255,.5)"),
        shade("linear-gradient(90deg,rgba(26,8,22,.85) 0%,rgba(26,8,22,.5) 48%,rgba(26,8,22,0) 64%)"),
    ])
    write("wl-band", "White Label band", pal, body)

    body = "".join([
        base("linear-gradient(180deg,#5b2650 0%,#3f1838 50%,#260c22 100%)"),
        bloom(1280, 220, 1100, "rgba(255,160,215,.26)"),
        grid_floor(820, color="rgba(255,200,230,.10)", step=110, tilt=74),
        window(A + "white-label/screens/new-create-subdomain.png", -180, 240, 820, 400, TILT_L, pos="0 0", bar=False, op=.92, dim=.04),
        window(A + "white-label/screens/sender-pending-resend.png", -120, 760, 760, 146, TILT_L, pos="0 0", bar=False, op=.85, dim=.04),
        window(A + "white-label/screens/sender-verified.png", 2020, 240, 760, 146, TILT_R, pos="0 0", bar=False, op=.9, dim=.04),
        code_panel(WL_LIVE, 1940, 520, 880, transform="perspective(2600px) rotateY(-16deg) rotateX(6deg)", title="live.ts", op=.9),
        shade("radial-gradient(48% 60% at 50% 52%,rgba(50,18,44,.5) 0%,rgba(50,18,44,0) 100%)"),
    ])
    write("wl-stage", "White Label stage", pal, body)

    body = "".join([
        base("linear-gradient(180deg,#240c20 0%,#140611 100%)"),
        bloom(2200, 240, 800, "rgba(240,120,190,.2)"),
        wl_rows(1600, 160, 940, op=.55, transform="perspective(2600px) rotateY(-14deg) rotateX(8deg)"),
        code_panel(WL_LIVE, 1480, 820, 1000, transform="perspective(2600px) rotateY(-14deg) rotateX(6deg)", op=.5, title="live.ts"),
        shade("linear-gradient(90deg,rgba(20,6,17,.85) 0%,rgba(20,6,17,.5) 50%,rgba(20,6,17,.1) 100%)"),
    ])
    write("wl-dark", "White Label dark", pal, body)


# ═══ EasyEat ═══════════════════════════════════════════════════════════════

EE_RULES = """// menu/customize.ts
const diySalad = {
  groups: [
    { name: "Base",   min: 1, max: 1, required: true },
    { name: "Main",   min: 1, max: 3, required: true },
    { name: "Add On", min: 0, max: 3 },
  ],
}

// one screen that counts for you
function canAddToCart(item, picks) {
  return item.groups.every(g => count(picks, g) >= g.min)
}"""

EE_ORDER = """{
  "item": "DIY Salad",
  "picks": {
    "Base": ["Romaine"],
    "Main": ["Beetroot", "Celery", "Masala Chickpeas"]
  },
  "status": "sent_to_kitchen"
}"""


def ticket(x, y, w, transform="", op=1):
    lines = [("1x", "DIY Salad"), ("", "Main · Beetroot"), ("", "Main · Celery"), ("", "Main · Masala Chickpeas"), ("1x", "Rabbit Salad")]
    inner = ('<div style="padding:30px 32px 24px;font:500 20px/1 JBM;color:#3a1c14;letter-spacing:.06em">ORDER · TABLE QR</div>'
             '<div style="margin:0 32px;border-top:2px dashed rgba(58,28,20,.25)"></div><div style="padding:18px 32px 30px">')
    for q, t in lines:
        inner += (f'<div style="display:flex;gap:20px;white-space:nowrap;font:{500 if q else 400} 21px/1.9 JBM;color:{"#2a120c" if q else "rgba(42,18,12,.6)"}">'
                  f'<span style="width:34px">{q}</span><span>{esc(t)}</span></div>')
    inner += '</div><div style="margin:0 32px 28px;height:40px;border-radius:999px;background:#e5533c;color:#fff;font:500 18px/40px JBM;text-align:center">sent to kitchen</div>'
    return box(x, y, w, inner=inner, cls="", op=op, transform=transform,
               extra="background:#fbf3ea;border-radius:18px;box-shadow:0 70px 140px rgba(40,6,2,.5)")


def ee_flow(x, y, op=1):
    steps = ["Scan QR", "Menu", "Customize", "Cart", "Kitchen"]
    out = []
    sw, gap = 210, 70
    path = ""
    for i, s in enumerate(steps):
        hot = s == "Customize"
        out.append(box(x + i * (sw + gap), y, sw, 92,
                       inner=f'<div style="height:100%;display:flex;align-items:center;justify-content:center;gap:12px;font:500 22px/1 Inter;color:{"#fff" if hot else "rgba(255,255,255,.78)"}">{esc(s)}</div>',
                       op=op, extra="border-radius:999px" + (";box-shadow:0 0 0 2px rgba(255,160,120,.8),0 40px 90px rgba(0,0,0,.35)" if hot else "")))
        if i:
            x1 = i * (sw + gap) - gap + 6
            path += f'<path d="M{x1},46 L{x1 + gap - 12},46" stroke="#ffb38c" stroke-opacity=".7" stroke-width="2.5" stroke-linecap="round"/><circle cx="{x1 + gap - 12}" cy="46" r="4.5" fill="#ffd0b0"/>'
    out.append(svg(x, y, 5 * sw + 4 * gap, 92, path, op=op))
    return "".join(out)


def ee_flow_v(x, y, op=1):
    steps = ["Scan QR", "Menu", "Customize", "Cart", "Kitchen"]
    out = []
    sh, gap = 84, 50
    path = ""
    for i, s_ in enumerate(steps):
        hot = s_ == "Customize"
        out.append(box(x, y + i * (sh + gap), 300, sh,
                       inner=f'<div style="height:100%;display:flex;align-items:center;gap:16px;padding:0 28px;font:500 22px/1 Inter;color:{"#fff" if hot else "rgba(255,255,255,.78)"}">'
                             f'<span style="font:500 16px/1 JBM;color:{"#ffd0b0" if hot else "rgba(255,255,255,.4)"}">0{i + 1}</span>{esc(s_)}</div>',
                       op=op, extra="border-radius:999px" + (";box-shadow:0 0 0 2px rgba(255,160,120,.8),0 40px 90px rgba(0,0,0,.35)" if hot else "")))
        if i:
            y1 = i * (sh + gap) - gap + 6
            path += f'<path d="M40,{y1} L40,{y1 + gap - 12}" stroke="#ffb38c" stroke-opacity=".7" stroke-width="2.5" stroke-linecap="round"/><circle cx="40" cy="{y1 + gap - 12}" r="4.5" fill="#ffd0b0"/>'
    out.append(svg(x, y, 300, 5 * sh + 4 * gap, path, op=op))
    return "".join(out)


def ee_scenes():
    pal = P["ee"]
    body = "".join([
        base("radial-gradient(80% 90% at 72% 20%,#7a2418 0%,#4a130d 55%,#2a0a07 100%)"),
        bloom(1700, 340, 820, "rgba(255,140,100,.36)"),
        dot_matrix(0, 0, W, H, step=34, r=1.3, color="rgba(255,230,210,.08)", mask="radial-gradient(60% 70% at 70% 40%,black,transparent)"),
        code_panel(EE_ORDER, 1250, 380, 820, transform="perspective(2600px) rotateY(-12deg) rotateX(5deg)", title="order.json", z=2),
        ticket(1720, 50, 380, transform="perspective(2600px) rotateY(-10deg) rotateZ(3deg)", op=.95),
        box(2190, 150, 190, 190, inner=svg(20, 20, 150, 150, qr(4, 150, color="#2a120c")), cls="",
            extra="background:#fbf3ea;border-radius:24px;box-shadow:0 60px 120px rgba(40,6,2,.5);transform:rotate(-6deg)"),
        label("scan at the table", 2190, 370, size=18, color="rgba(255,230,210,.6)"),
        phone(A + "easyeat/customization-top.png", 2200, 480, 280, "perspective(2600px) rotateY(-16deg) rotateX(6deg) rotateZ(2deg)", dim=.12, op=.85),
        shade("linear-gradient(90deg,rgba(40,10,7,.9) 0%,rgba(40,10,7,.6) 38%,rgba(40,10,7,0) 50%)"),
        shade("linear-gradient(0deg,rgba(40,10,7,.45) 0%,rgba(40,10,7,0) 40%)"),
    ])
    write("ee-cover", "EasyEat cover", pal, body)

    body = "".join([
        base("radial-gradient(70% 100% at 82% 55%,#6e1f15 0%,#43110c 60%,#2a0a07 100%)"),
        bloom(2100, 700, 760, "rgba(255,140,100,.28)"),
        dot_matrix(0, 0, W, H, step=36, r=1.3, color="rgba(255,230,210,.07)", mask="radial-gradient(50% 70% at 78% 50%,black,transparent)"),
        code_panel(EE_ORDER, 1500, 420, 760, transform="perspective(2600px) rotateY(-12deg) rotateX(6deg)", title="order.json", op=.5),
        ee_flow_v(2060, 380),
        shade("linear-gradient(90deg,rgba(40,10,7,.85) 0%,rgba(40,10,7,.5) 48%,rgba(40,10,7,0) 66%)"),
    ])
    write("ee-band", "EasyEat band", pal, body)

    body = "".join([
        base("linear-gradient(180deg,#a8442f 0%,#86301f 50%,#5a1a10 100%)"),
        bloom(1280, 200, 1100, "rgba(255,210,170,.28)"),
        grid_floor(820, color="rgba(255,220,200,.10)", step=110, tilt=74),
        phone(A + "easyeat/main-complete.png", -40, 220, 400, "perspective(2600px) rotateY(18deg) rotateX(6deg) rotateZ(-3deg)", op=.95, dim=.04),
        phone(A + "easyeat/max-limit.png", 2200, 200, 400, "perspective(2600px) rotateY(-18deg) rotateX(6deg) rotateZ(3deg)", op=.95, dim=.04),
        ticket(1900, 860, 440, transform="perspective(2600px) rotateY(-14deg) rotateZ(4deg)", op=.95),
        shade("radial-gradient(48% 60% at 50% 52%,rgba(90,26,16,.45) 0%,rgba(90,26,16,0) 100%)"),
    ])
    write("ee-stage", "EasyEat stage", pal, body)

    body = "".join([
        base("linear-gradient(180deg,#3e100b 0%,#240806 100%)"),
        bloom(2200, 240, 800, "rgba(255,140,100,.22)"),
        code_panel(EE_RULES, 1440, 200, 1080, transform="perspective(2600px) rotateY(-14deg) rotateX(6deg)", op=.55, title="customize.ts"),
        ticket(2080, 900, 420, transform="perspective(2600px) rotateY(-14deg) rotateZ(4deg)", op=.5),
        shade("linear-gradient(90deg,rgba(32,8,6,.85) 0%,rgba(32,8,6,.5) 50%,rgba(32,8,6,.1) 100%)"),
    ])
    write("ee-dark", "EasyEat dark", pal, body)


# ═══ Resonance ═════════════════════════════════════════════════════════════

RS_CODE = """// resonance/moments.ts
const signals = ["skips", "seeks", "replays", "saves"]

function startAt(track, listener) {
  const yours = listener.moments(track.id, signals)
  if (yours.length) return { at: yours[0], label: "Your moment" }

  const popular = track.popularMoments()
  if (popular.length) return { at: popular[0], label: "Popular moment" }

  return { at: 0, label: "Just explore" }
}"""


def song_env(t):
    # intro, verse, build, drop, breakdown, second drop, outro
    if t < .12: e = .25 + t * 1.5
    elif t < .34: e = .45 + .05 * math.sin(t * 40)
    elif t < .46: e = .45 + (t - .34) * 3.2
    elif t < .62: e = .95
    elif t < .7: e = .4
    elif t < .86: e = .92
    else: e = .9 - (t - .86) * 5
    return max(.06, min(1, e))


def energy(t):
    return .1 + .8 * (song_env(t) ** 1.6) * (.92 + .08 * math.sin(t * 30))


def rs_wave(x, y, w, h, hi_range=(.46, .62), op=1, seed=3, bars=220, color="rgba(255,255,255,.28)"):
    return svg(x, y, w, h, waveform(seed, w, h, bars, gap=4, color=color, hi="#1db954", hi_range=hi_range, env=song_env), op=op)


def rs_markers(x, y, w, h, op=1, labels=True):
    marks = [(.18, "Lyric", False), (.4, "Build", False), (.46, "Drop", True), (.72, "Popular moment", False)]
    out = []
    for t, name, me in marks:
        xx = x + w * t
        c = "#1db954" if me else "rgba(255,255,255,.55)"
        out.append(f'<div class="abs" style="left:{xx - 1}px;top:{y}px;width:2px;height:{h}px;opacity:{op};background:linear-gradient({c},transparent)"></div>')
        out.append(f'<div class="abs" style="left:{xx - 9}px;top:{y - 9}px;width:18px;height:18px;border-radius:50%;opacity:{op};background:{c};box-shadow:0 0 24px {c}"></div>')
        if labels:
            out.append(label("Your moment" if me else name, xx + 20, y - 18, size=20, color="#7ee2a1" if me else "rgba(255,255,255,.6)", op=op))
    return "".join(out)


def now_playing(x, y, w, transform="", op=1):
    inner = (f'<div style="padding:28px">'
             f'<img src="{A}resonance/np-art-lg.jpg" style="display:block;width:100%;aspect-ratio:1;object-fit:cover;border-radius:16px">'
             f'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:26px">'
             f'<div><div style="font:600 30px/1.2 Inter;color:#fff">Echo</div><div style="font:400 21px/1.4 Inter;color:rgba(255,255,255,.55)">Now Playing</div></div>'
             f'<div style="width:46px;height:46px;border-radius:50%;border:3px solid #1db954;display:grid;place-items:center">'
             f'<i style="width:12px;height:12px;border-radius:50%;background:#1db954"></i></div></div>'
             f'<div style="position:relative;height:6px;border-radius:9px;background:rgba(255,255,255,.18);margin-top:30px">'
             f'<div style="position:absolute;left:0;top:0;bottom:0;width:46%;border-radius:9px;background:#fff"></div>'
             f'<i style="position:absolute;left:46%;top:-7px;width:20px;height:20px;margin-left:-10px;border-radius:50%;background:#1db954;box-shadow:0 0 18px #1db954"></i>'
             f'<i style="position:absolute;left:72%;top:-2px;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:rgba(255,255,255,.7)"></i>'
             f'<i style="position:absolute;left:18%;top:-2px;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:rgba(255,255,255,.7)"></i></div>'
             f'<div style="display:flex;justify-content:space-between;font:400 18px/1 JBM;color:rgba(255,255,255,.45);margin-top:16px"><span>Your moment</span><span>Popular</span></div>'
             f'</div>')
    return box(x, y, w, inner=inner, op=op, transform=transform, extra="border-radius:34px")


def rs_scenes():
    pal = P["rs"]
    body = "".join([
        base("radial-gradient(80% 90% at 74% 30%,#0f2a19 0%,#0a120d 50%,#050605 100%)"),
        bloom(1800, 440, 820, "rgba(29,185,84,.30)"),
        svg(1150, 80, 1410, 260, area_curve(1410, 260, energy, stroke="rgba(126,226,161,.7)", fill_top="rgba(29,185,84,.2)", sw=3, gid="rse"), op=.8),
        label("energy", 1180, 60, size=19, color="rgba(255,255,255,.45)"),
        rs_wave(1150, 390, 1410, 250, bars=180),
        rs_markers(1150, 380, 1410, 270),
        now_playing(1560, 760, 380, transform="perspective(2600px) rotateY(-14deg) rotateX(6deg)", op=.8),
        shade("linear-gradient(90deg,rgba(5,6,5,.92) 0%,rgba(5,6,5,.6) 38%,rgba(5,6,5,0) 50%)"),
        shade("linear-gradient(0deg,rgba(5,6,5,.5) 0%,rgba(5,6,5,0) 40%)"),
    ])
    write("rs-cover", "Resonance cover", pal, body)

    lanes = ["Vocals", "Drums", "Bass", "Other"]
    lane_svgs = []
    lx, lw = 1760, 800
    for i, n in enumerate(lanes):
        yy = 360 + i * 190
        lane_svgs.append(label(n, 1600, yy + 50, size=19, color="rgba(255,255,255,.5)"))
        lane_svgs.append(svg(lx, yy, lw, 130, waveform(10 + i, lw, 130, 110, gap=3, color="rgba(255,255,255,.22)", hi="#1db954",
                                                         hi_range=(.46, .62), env=lambda t, i=i: song_env(t) * (.6 + .4 * ((i * 37 % 7) / 7)))))
    body = "".join([
        base("radial-gradient(70% 100% at 82% 50%,#0e2216 0%,#090d0a 60%,#050605 100%)"),
        bloom(2140, 720, 700, "rgba(29,185,84,.22)"),
        *lane_svgs,
        f'<div class="abs" style="left:{lx + lw * .46 - 10:.0f}px;top:330px;width:{lw * .16 + 20:.0f}px;height:780px;border-radius:22px;background:rgba(29,185,84,.08);box-shadow:inset 0 0 0 1.5px rgba(29,185,84,.4)"></div>',
        tag("drop · your moment", int(lx + lw * .46 - 10), 260),
        shade("linear-gradient(90deg,rgba(5,6,5,.88) 0%,rgba(5,6,5,.5) 50%,rgba(5,6,5,0) 66%)"),
    ])
    write("rs-band", "Resonance band", pal, body)

    body = "".join([
        base("linear-gradient(180deg,#132a1b 0%,#0c160f 50%,#070907 100%)"),
        bloom(1280, 260, 1100, "rgba(29,185,84,.22)"),
        rs_wave(-60, 1040, 2680, 300, op=.55, seed=8, bars=320, color="rgba(255,255,255,.2)"),
        rs_markers(-60, 1030, 2680, 320, op=.7, labels=False),
        now_playing(-140, 180, 520, transform="perspective(2600px) rotateY(18deg) rotateX(6deg)", op=.88),
        code_panel(RS_CODE, 2000, 200, 880, transform="perspective(2600px) rotateY(-16deg) rotateX(6deg)", title="moments.ts", op=.85),
        shade("radial-gradient(48% 60% at 50% 48%,rgba(10,18,12,.55) 0%,rgba(10,18,12,0) 100%)"),
    ])
    write("rs-stage", "Resonance stage", pal, body)

    body = "".join([
        base("linear-gradient(180deg,#080a08 0%,#040504 100%)"),
        bloom(2200, 240, 800, "rgba(29,185,84,.16)"),
        code_panel(RS_CODE, 1460, 180, 1080, transform="perspective(2600px) rotateY(-14deg) rotateX(6deg)", op=.55, title="moments.ts"),
        rs_wave(1300, 1040, 1300, 240, op=.45, seed=5, bars=160),
        shade("linear-gradient(90deg,rgba(4,5,4,.85) 0%,rgba(4,5,4,.5) 50%,rgba(4,5,4,.1) 100%)"),
    ])
    write("rs-dark", "Resonance dark", pal, body)


if __name__ == "__main__":
    cc_scenes()
    dr_scenes()
    wl_scenes()
    ee_scenes()
    rs_scenes()
    print("\n".join(sorted(os.listdir(OUT))))
