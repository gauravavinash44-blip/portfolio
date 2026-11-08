"""Small component kit for the case-study background art.

Every scene is a 2560x1440 HTML page made of absolutely positioned layers.
Coordinates are in that 2560x1440 space. Nothing here loads from the network.
"""
import html as _html
import math
import random
import re

W, H = 2560, 1440


def esc(s):
    return _html.escape(str(s), quote=False)


def style(**kw):
    out = []
    for k, v in kw.items():
        if v is None:
            continue
        k = k.replace("_", "-")
        if isinstance(v, (int, float)) and k in ("left", "top", "width", "height", "right", "bottom", "font-size", "border-radius"):
            v = f"{v}px"
        out.append(f"{k}:{v}")
    return ";".join(out)


# ── page shell ─────────────────────────────────────────────────────────────

BASE_CSS = """
@font-face { font-family: "Inter"; src: url("../fonts/inter-latin-400-normal.woff2") format("woff2"); font-weight: 400; }
@font-face { font-family: "Inter"; src: url("../fonts/inter-latin-500-normal.woff2") format("woff2"); font-weight: 500; }
@font-face { font-family: "Inter"; src: url("../fonts/inter-latin-600-normal.woff2") format("woff2"); font-weight: 600; }
@font-face { font-family: "JBM"; src: url("../fonts/jetbrains-mono-latin-400-normal.woff2") format("woff2"); font-weight: 400; }
@font-face { font-family: "JBM"; src: url("../fonts/jetbrains-mono-latin-500-normal.woff2") format("woff2"); font-weight: 500; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 2560px; height: 1440px; overflow: hidden; background: var(--bg0); }
body { font-family: "Inter", system-ui, sans-serif; color: var(--ink); -webkit-font-smoothing: antialiased; font-feature-settings: "ss01", "cv11", "tnum"; }
.scene { position: absolute; inset: 0; overflow: hidden; }
.abs { position: absolute; }
.mono { font-family: "JBM", ui-monospace, monospace; }
.fill { position: absolute; inset: 0; }
.persp { position: absolute; inset: 0; perspective: 3200px; transform-style: preserve-3d; }
.p3 { position: absolute; transform-style: preserve-3d; }
.glass { background: linear-gradient(180deg, var(--glass-top), var(--glass-bot)); border: 1.5px solid var(--glass-line); border-radius: 30px;
  -webkit-backdrop-filter: blur(28px) saturate(1.2); backdrop-filter: blur(28px) saturate(1.2);
  box-shadow: 0 60px 140px var(--shadow), inset 0 1.5px 0 var(--glass-hi); }
.solid { background: var(--card); border-radius: 30px; box-shadow: 0 60px 140px var(--shadow), 0 0 0 1.5px var(--card-line); color: var(--card-ink); }
.tag { display: inline-flex; align-items: center; gap: 12px; height: 46px; padding: 0 20px; border-radius: 999px; font: 500 20px/1 "JBM", monospace; letter-spacing: .02em;
  color: var(--tag-ink); background: var(--tag-bg); box-shadow: inset 0 0 0 1.5px var(--tag-line); white-space: nowrap; }
.tag i { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 16px var(--accent); }
.bar { height: 14px; border-radius: 999px; background: var(--skel); }
.code { font: 400 23px/1.62 "JBM", monospace; color: var(--code-ink); white-space: pre; letter-spacing: 0; }
.code .k { color: var(--code-k); } .code .s { color: var(--code-s); } .code .c { color: var(--code-c); } .code .n { color: var(--code-n); } .code .p { color: var(--code-p); }
.code .ln { color: var(--code-c); opacity: .55; display: inline-block; width: 52px; }
.chrome { display: flex; gap: 12px; padding: 26px 30px 0; }
.chrome b { width: 14px; height: 14px; border-radius: 50%; background: var(--chrome-dot); }
.grain { position: absolute; inset: 0; pointer-events: none; }
"""


def page(title, palette_css, body, extra_css=""):
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>{esc(title)}</title>
<style>{BASE_CSS}
:root {{ {palette_css} }}
{extra_css}
</style></head>
<body><div class="scene">
{body}
</div></body></html>
"""


# ── atmosphere ─────────────────────────────────────────────────────────────

def bloom(x, y, r, color, op=1.0, blur=0, squash=1.0):
    """Soft radial light centred at x,y with radius r."""
    return (f'<div class="abs" style="{style(left=x - r, top=y - r * squash, width=2 * r, height=2 * r * squash, opacity=op, filter=f"blur({blur}px)" if blur else None)};'
            f'border-radius:50%;background:radial-gradient(closest-side,{color},transparent)"></div>')


def grid_floor(top, color="rgba(255,255,255,.08)", step=120, tilt=72, op=1, origin="50% 0%", fade="black 0%,black 30%,transparent 92%", height=2400, left=-1200, width=4960):
    """Perspective grid plane receding to a horizon at `top`."""
    return f'''<div class="abs" style="left:0;top:{top}px;width:{W}px;height:{H}px;perspective:900px;perspective-origin:50% 0%;opacity:{op}">
  <div class="abs" style="left:{left}px;top:0;width:{width}px;height:{height}px;transform-origin:{origin};transform:rotateX({tilt}deg);
    background-image:linear-gradient({color} 1.5px,transparent 1.5px),linear-gradient(90deg,{color} 1.5px,transparent 1.5px);background-size:{step}px {step}px;
    -webkit-mask-image:linear-gradient(180deg,{fade});mask-image:linear-gradient(180deg,{fade})"></div></div>'''


def dot_matrix(x, y, w, h, step=28, r=1.6, color="rgba(255,255,255,.18)", mask="radial-gradient(closest-side,black,transparent)"):
    return (f'<div class="abs" style="{style(left=x, top=y, width=w, height=h)};background-image:radial-gradient({color} {r}px,transparent {r + 0.6}px);'
            f'background-size:{step}px {step}px;-webkit-mask-image:{mask};mask-image:{mask}"></div>')


def beam(x, y, w, h, angle, color, op=1, blur=30):
    return (f'<div class="abs" style="{style(left=x, top=y, width=w, height=h, opacity=op)};transform:rotate({angle}deg);filter:blur({blur}px);'
            f'background:linear-gradient(90deg,transparent,{color} 45%,{color} 55%,transparent);border-radius:50%"></div>')


# ── code ───────────────────────────────────────────────────────────────────

_TOK = re.compile(r'(//[^\n]*|#[^\n]*|"[^"]*"|\b(?:const|let|return|await|async|function|if|else|for|in|of|true|false|null|def|from|import|with)\b|\b\d[\d.,%]*\b|[{}\[\]()=>:,])')


def highlight(src):
    out = []
    pos = 0
    for m in _TOK.finditer(src):
        out.append(esc(src[pos:m.start()]))
        t = m.group(0)
        if t.startswith("//") or (t.startswith("#") and not t.startswith("#{")):
            cls = "c"
        elif t.startswith('"'):
            cls = "s"
        elif t[0].isdigit():
            cls = "n"
        elif t[0].isalpha():
            cls = "k"
        else:
            cls = "p"
        out.append(f'<span class="{cls}">{esc(t)}</span>')
        pos = m.end()
    out.append(esc(src[pos:]))
    return "".join(out)


def code_block(src, numbers=True, start=1):
    lines = src.strip("\n").split("\n")
    rows = []
    for i, ln in enumerate(lines):
        n = f'<span class="ln">{start + i}</span>' if numbers else ""
        rows.append(n + highlight(ln))
    return '<div class="code">' + "\n".join(rows) + "</div>"


def code_panel(src, x, y, w, h=None, transform="", blur=0, op=1, title=None, numbers=True, pad=36, cls="glass", z=None):
    head = ""
    if title:
        head = (f'<div class="chrome"><b></b><b></b><b></b><span class="mono" style="margin-left:18px;font-size:19px;color:var(--code-c);line-height:14px">{esc(title)}</span></div>')
    return (f'<div class="abs {cls}" style="{style(left=x, top=y, width=w, height=h, opacity=op, transform=transform or None, filter=f"blur({blur}px)" if blur else None, z_index=z)};overflow:hidden">'
            f'{head}<div style="padding:{pad - 8 if title else pad}px {pad}px {pad}px">{code_block(src, numbers)}</div></div>')


# ── svg generators ─────────────────────────────────────────────────────────

def svg(x, y, w, h, inner, op=1, blur=0, transform="", extra=""):
    return (f'<svg class="abs" style="{style(left=x, top=y, width=w, height=h, opacity=op, filter=f"blur({blur}px)" if blur else None, transform=transform or None)};overflow:visible" '
            f'viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" {extra}>{inner}</svg>')


def streams(seed, w, h, n, y_spread, x0=0, x1=None, converge=None, color_a="#fff", color_b="#fff", width=(1.2, 3.2), op=(0.15, 0.7), packets=0, packet_color="#fff", dead_ends=0, wobble=1.0, gid="st"):
    """Horizontal flow lines. If converge=(cx, cy) the lines bend into that point."""
    rnd = random.Random(seed)
    x1 = w if x1 is None else x1
    out = [f'<defs><linearGradient id="{gid}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="{color_a}" stop-opacity="0"/>'
           f'<stop offset=".35" stop-color="{color_a}"/><stop offset="1" stop-color="{color_b}"/></linearGradient>'
           f'<radialGradient id="{gid}p"><stop offset="0" stop-color="{packet_color}"/><stop offset="1" stop-color="{packet_color}" stop-opacity="0"/></radialGradient></defs>']
    paths = []
    for i in range(n):
        t = i / max(1, n - 1)
        y0 = h / 2 + (t - 0.5) * y_spread + rnd.uniform(-20, 20)
        if converge:
            cx, cy = converge
            c1 = (x0 + (cx - x0) * rnd.uniform(.35, .55), y0 + rnd.uniform(-60, 60) * wobble)
            c2 = (x0 + (cx - x0) * rnd.uniform(.7, .9), cy + (y0 - cy) * rnd.uniform(.05, .2))
            d = f"M{x0:.0f},{y0:.0f} C{c1[0]:.0f},{c1[1]:.0f} {c2[0]:.0f},{c2[1]:.0f} {cx:.0f},{cy:.0f} L{x1:.0f},{cy + (t - .5) * 6:.0f}"
            if i < dead_ends:
                end = rnd.uniform(.3, .65)
                ex = x0 + (cx - x0) * end
                d = f"M{x0:.0f},{y0:.0f} C{x0 + (ex - x0) * .5:.0f},{y0 + rnd.uniform(-40, 40):.0f} {ex - 80:.0f},{y0 + rnd.uniform(-90, 90):.0f} {ex:.0f},{y0 + rnd.uniform(-120, 120):.0f}"
        else:
            amp = rnd.uniform(30, 120) * wobble
            ph = rnd.uniform(0, 6.28)
            pts = []
            for k in range(0, 9):
                xx = x0 + (x1 - x0) * k / 8
                yy = y0 + amp * math.sin(ph + k * 0.8) * (0.4 + 0.6 * k / 8)
                pts.append((xx, yy))
            d = "M" + " ".join(f"{a:.0f},{b:.0f}" for a, b in pts[:1])
            for k in range(1, len(pts)):
                ax, ay = pts[k - 1]
                bx, by = pts[k]
                d += f" C{ax + (bx - ax) / 2:.0f},{ay:.0f} {ax + (bx - ax) / 2:.0f},{by:.0f} {bx:.0f},{by:.0f}"
        sw = rnd.uniform(*width)
        o = rnd.uniform(*op)
        paths.append((d, sw, o))
        out.append(f'<path d="{d}" fill="none" stroke="url(#{gid})" stroke-width="{sw:.2f}" stroke-opacity="{o:.2f}" stroke-linecap="round"/>')
        if i < dead_ends and converge:
            m = re.findall(r"(-?\d+),(-?\d+)$", d)
            if m:
                ex, ey = map(float, m[-1])
                out.append(f'<circle cx="{ex:.0f}" cy="{ey:.0f}" r="5" fill="none" stroke="{color_a}" stroke-opacity=".7" stroke-width="2"/>')
    for k in range(packets):
        d, sw, o = paths[rnd.randrange(len(paths))]
        off = rnd.uniform(0.2, 0.95)
        r = rnd.uniform(5, 11)
        out.append(f'<circle r="{r * 3:.1f}" fill="url(#{gid}p)" opacity=".9"><animateMotion dur="1s" begin="-{off:.2f}s" fill="freeze" keyPoints="{off:.3f};{off:.3f}" keyTimes="0;1" calcMode="linear" path="{d}"/></circle>')
        out.append(f'<circle r="{r * .55:.1f}" fill="{packet_color}"><animateMotion dur="1s" begin="-{off:.2f}s" fill="freeze" keyPoints="{off:.3f};{off:.3f}" keyTimes="0;1" calcMode="linear" path="{d}"/></circle>')
    return "".join(out)


def point_cloud(seed, w, h, n, color="#fff", hi="#fff", cluster=None, k=7, query=None, r=(1.6, 4.2), op=(0.18, 0.75), labels=None, label_color="rgba(255,255,255,.7)", gid="pc"):
    """Embedding scatter. cluster=(cx,cy,rad) brightens near points; query=(qx,qy) links to the k nearest."""
    rnd = random.Random(seed)
    pts = []
    for _ in range(n):
        # a few soft clusters
        if rnd.random() < .55:
            cx, cy = rnd.choice([(w * .22, h * .35), (w * .58, h * .62), (w * .8, h * .3), (w * .35, h * .75)])
            px, py = rnd.gauss(cx, w * .09), rnd.gauss(cy, h * .12)
        else:
            px, py = rnd.uniform(0, w), rnd.uniform(0, h)
        if 0 <= px <= w and 0 <= py <= h:
            pts.append((px, py))
    out = [f'<defs><radialGradient id="{gid}g"><stop offset="0" stop-color="{hi}" stop-opacity=".9"/><stop offset="1" stop-color="{hi}" stop-opacity="0"/></radialGradient></defs>']
    near = []
    if query:
        qx, qy = query
        near = sorted(pts, key=lambda p: (p[0] - qx) ** 2 + (p[1] - qy) ** 2)[:k]
        for (px, py) in near:
            out.append(f'<line x1="{qx:.0f}" y1="{qy:.0f}" x2="{px:.0f}" y2="{py:.0f}" stroke="{hi}" stroke-opacity=".55" stroke-width="1.6"/>')
    for (px, py) in pts:
        if (px, py) in near:
            continue
        rr = rnd.uniform(*r)
        o = rnd.uniform(*op)
        if cluster:
            cx, cy, cr = cluster
            dd = math.hypot(px - cx, py - cy)
            if dd < cr:
                o = min(1, o + .4 * (1 - dd / cr))
        out.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{rr:.1f}" fill="{color}" fill-opacity="{o:.2f}"/>')
    for (px, py) in near:
        out.append(f'<circle cx="{px:.0f}" cy="{py:.0f}" r="22" fill="url(#{gid}g)"/><circle cx="{px:.0f}" cy="{py:.0f}" r="6" fill="{hi}"/>')
    if query:
        qx, qy = query
        out.append(f'<circle cx="{qx:.0f}" cy="{qy:.0f}" r="70" fill="url(#{gid}g)"/><circle cx="{qx:.0f}" cy="{qy:.0f}" r="13" fill="#fff"/>'
                   f'<circle cx="{qx:.0f}" cy="{qy:.0f}" r="28" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>')
    for (lx, ly, txt) in (labels or []):
        out.append(f'<text x="{lx}" y="{ly}" fill="{label_color}" font-family="JBM" font-size="20" letter-spacing=".5">{esc(txt)}</text>')
    return "".join(out)


def node_graph(seed, w, h, n, color="#fff", hi="#fff", labels=(), edges_k=2, r=(3, 7), op=(.25, .8), hub=None, gid="ng", label_color="rgba(255,255,255,.75)", label_size=20):
    """Constellation of nodes joined to their nearest neighbours. labels: [(idx, text)] or hub label."""
    rnd = random.Random(seed)
    pts = [(rnd.uniform(w * .03, w * .97), rnd.uniform(h * .05, h * .95)) for _ in range(n)]
    if hub:
        pts[0] = hub
    out = [f'<defs><radialGradient id="{gid}g"><stop offset="0" stop-color="{hi}" stop-opacity=".8"/><stop offset="1" stop-color="{hi}" stop-opacity="0"/></radialGradient></defs>']
    seen = set()
    for i, (x, y) in enumerate(pts):
        nb = sorted(range(n), key=lambda j: (pts[j][0] - x) ** 2 + (pts[j][1] - y) ** 2)[1:edges_k + 1]
        for j in nb:
            key = tuple(sorted((i, j)))
            if key in seen:
                continue
            seen.add(key)
            hot = hub is not None and 0 in key
            out.append(f'<line x1="{x:.0f}" y1="{y:.0f}" x2="{pts[j][0]:.0f}" y2="{pts[j][1]:.0f}" stroke="{hi if hot else color}" '
                       f'stroke-opacity="{.6 if hot else rnd.uniform(.08, .26):.2f}" stroke-width="{2 if hot else 1.3}"/>')
    if hub:
        hx, hy = hub
        for j in sorted(range(1, n), key=lambda j: (pts[j][0] - hx) ** 2 + (pts[j][1] - hy) ** 2)[:6]:
            out.append(f'<line x1="{hx:.0f}" y1="{hy:.0f}" x2="{pts[j][0]:.0f}" y2="{pts[j][1]:.0f}" stroke="{hi}" stroke-opacity=".5" stroke-width="1.8"/>')
    lab = dict(labels)
    for i, (x, y) in enumerate(pts):
        rr = rnd.uniform(*r)
        o = rnd.uniform(*op)
        if i in lab or (hub and i == 0):
            out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="40" fill="url(#{gid}g)"/><circle cx="{x:.0f}" cy="{y:.0f}" r="8" fill="{hi}"/>'
                       f'<circle cx="{x:.0f}" cy="{y:.0f}" r="18" fill="none" stroke="{hi}" stroke-opacity=".5" stroke-width="1.6"/>')
            if i in lab:
                out.append(f'<text x="{x + 30:.0f}" y="{y + 7:.0f}" fill="{label_color}" font-family="JBM" font-size="{label_size}" letter-spacing=".5">{esc(lab[i])}</text>')
        else:
            out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rr:.1f}" fill="{color}" fill-opacity="{o:.2f}"/>')
    return "".join(out)


def waveform(seed, w, h, bars, gap=4, color="#fff", hi=None, hi_range=(0, 0), env=None, rounded=True, op=1.0, mirror=True):
    """Audio waveform bars. env(t)->0..1 shapes loudness."""
    rnd = random.Random(seed)
    bw = (w - gap * (bars - 1)) / bars
    out = []
    for i in range(bars):
        t = i / (bars - 1)
        e = env(t) if env else 1
        a = max(.04, min(1, e * (0.55 + 0.45 * rnd.random()) * (0.75 + 0.25 * math.sin(i * 0.9))))
        bh = a * h * (1 if mirror else 1)
        x = i * (bw + gap)
        c = hi if (hi and hi_range[0] <= t <= hi_range[1]) else color
        y = (h - bh) / 2 if mirror else h - bh
        out.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="{bw / 2 if rounded else 0:.1f}" fill="{c}" fill-opacity="{op:.2f}"/>')
    return "".join(out)


def area_curve(w, h, fn, steps=160, stroke="#fff", fill_top="rgba(255,255,255,.3)", sw=3, gid="ac", dash=None):
    pts = [(w * i / steps, h - fn(i / steps) * h) for i in range(steps + 1)]
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    da = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<defs><linearGradient id="{gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="{fill_top}"/><stop offset="1" stop-color="{fill_top}" stop-opacity="0"/></linearGradient></defs>'
            f'<path d="{d} L{w},{h} L0,{h} Z" fill="url(#{gid})"/><path d="{d}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"{da}/>')


def qr(seed, size, cells=29, color="#000", bg="transparent", r=0.0):
    """Original QR-like pattern (decorative, not a real code)."""
    rnd = random.Random(seed)
    c = size / cells
    out = [f'<rect width="{size}" height="{size}" fill="{bg}"/>']

    def finder(cx, cy):
        return (f'<rect x="{cx * c}" y="{cy * c}" width="{7 * c}" height="{7 * c}" rx="{c * 1.6}" fill="none" stroke="{color}" stroke-width="{c}" transform="translate({c / 2},{c / 2}) scale(1)" />'
                f'<rect x="{(cx + 2) * c}" y="{(cy + 2) * c}" width="{3 * c}" height="{3 * c}" rx="{c * .8}" fill="{color}"/>')
    occupied = lambda i, j: (i < 8 and j < 8) or (i >= cells - 8 and j < 8) or (i < 8 and j >= cells - 8)
    for i in range(cells):
        for j in range(cells):
            if occupied(i, j):
                continue
            if rnd.random() < 0.46:
                out.append(f'<rect x="{i * c + c * .08:.1f}" y="{j * c + c * .08:.1f}" width="{c * .84:.1f}" height="{c * .84:.1f}" rx="{c * r:.1f}" fill="{color}"/>')
    # finder patterns drawn without stroke offset tricks
    for (fx, fy) in ((0, 0), (cells - 7, 0), (0, cells - 7)):
        out.append(f'<rect x="{fx * c + c / 2:.1f}" y="{fy * c + c / 2:.1f}" width="{6 * c:.1f}" height="{6 * c:.1f}" rx="{c * 1.4:.1f}" fill="none" stroke="{color}" stroke-width="{c:.1f}"/>'
                   f'<rect x="{(fx + 2) * c:.1f}" y="{(fy + 2) * c:.1f}" width="{3 * c:.1f}" height="{3 * c:.1f}" rx="{c * .7:.1f}" fill="{color}"/>')
    return "".join(out)


# ── UI fragments ───────────────────────────────────────────────────────────

def skel_lines(widths, gap=22, h=14, color="var(--skel)", first=None):
    out = []
    for i, wd in enumerate(widths):
        c = first if (first and i == 0) else color
        hh = h * 1.5 if (first and i == 0) else h
        out.append(f'<div style="height:{hh}px;width:{wd}%;border-radius:999px;background:{c};margin-top:{0 if i == 0 else gap}px"></div>')
    return "".join(out)


def box(x, y, w, h=None, inner="", cls="glass", transform="", blur=0, op=1, extra="", z=None, pad=None):
    st = style(left=x, top=y, width=w, height=h, opacity=op, transform=transform or None,
               filter=f"blur({blur}px)" if blur else None, z_index=z, padding=f"{pad}px" if pad is not None else None)
    return f'<div class="abs {cls}" style="{st};{extra}">{inner}</div>'


def screenshot(src, x, y, w, transform="", blur=0, op=1, radius=26, extra="", shade=None):
    sh = f'<div class="fill" style="background:{shade};border-radius:{radius}px"></div>' if shade else ""
    return (f'<div class="abs" style="{style(left=x, top=y, width=w, opacity=op, transform=transform or None, filter=f"blur({blur}px)" if blur else None)};'
            f'border-radius:{radius}px;overflow:hidden;box-shadow:0 60px 140px var(--shadow);{extra}"><img src="{src}" style="display:block;width:100%">{sh}</div>')


def grain_css():
    return ""
