/* Liquid Glass: an add-on layer for the Craft home and the case pages.
   - Glass chrome: the Home / Projects nav, search, and the case-page pills get rim light,
     depth and a glare that follows the cursor (CSS variables, set at most once a frame).
   - Lens: in Chromium the backdrop is bent at the edges through an SVG displacement map,
     built per element from its real size and corner radius. Other browsers keep the blur.
   - Magnetic controls lean toward the cursor and press in, on a small spring that only
     runs while something is moving.
   - Case pages: the bar settles into denser glass on scroll, dims over dark sections, and
     the section nav gets one indicator that slides to the section being read.
   No dependencies. Touch screens get the static glass; reduced motion turns the movement off. */
(function () {
  "use strict";
  if (window.__lg) return; window.__lg = true;

  var doc = document, root = doc.documentElement;
  var FINE = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var STILL = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CLEAR = window.matchMedia && matchMedia("(prefers-reduced-transparency: reduce)").matches;
  /* SVG filters inside backdrop-filter only work in Chromium; phones keep the lighter plain blur */
  var LENS = FINE && !!navigator.userAgentData && !CLEAR && !!(window.CSS && CSS.supports && CSS.supports("backdrop-filter", "blur(1px)"));

  var GLASS = [
    { sel: ".cr-hero .cr-seg, .cr-seg.cr-glass-light", light: false },
    { sel: ".cr-iconbtn--glass", light: false },
    { sel: ".cm-bar > .cm-pill", light: true },
    /* Projects view: the tabs, back button and story arrows float over the scrolling cards */
    { sel: ".cpg-tabs, .cpg .cpg-back, .cpg-nav .cpg-round:not(.cpg-round--blue):not(.cpg-round--white)", dark: true }
  ];
  var MAG = [
    ".cr-iconbtn--glass", ".cr-chip--btn", ".cr-row-go", ".cr-preview-go", ".cr-rp-play",
    ".cr-hello-go", ".cr-hero .cr-iconbtn--solid", ".cr-mstat-link--icon", ".cm-bar > a.cm-pill", ".cm-next-go",
    ".cpg .cpg-back", ".cpg-cs-go", ".cpg-nav .cpg-round", ".cpg-pip"
  ].join(",");

  var glass = [], mags = [];

  /* ───────── Lens map ─────────
     Each pixel's red/green says where to sample the backdrop from. Near the edge the sample
     moves inward, so the scene behind bends round the rim like thick glass. */
  var svg = null, lensId = 0;
  function lensSvg() {
    if (svg) return svg;
    svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
    doc.body.appendChild(svg);
    return svg;
  }
  function lensMap(w, h, r) {
    var c = doc.createElement("canvas"); c.width = w; c.height = h;
    var g = c.getContext("2d"), img = g.createImageData(w, h), d = img.data;
    var band = Math.max(6, Math.min(h * 0.5, 22));
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var px = x + 0.5, py = y + 0.5;
        /* nearest point on the rectangle shrunk by the radius */
        var qx = Math.min(Math.max(px, r), w - r), qy = Math.min(Math.max(py, r), h - r);
        var vx = px - qx, vy = py - qy, len = Math.sqrt(vx * vx + vy * vy);
        var dx = 0, dy = 0;
        var edge = r - len; /* distance in from the rim */
        if (len > 0.0001 && edge < band) {
          var t = 1 - Math.max(0, edge) / band; t = t * t * (3 - 2 * t);
          dx = -vx / len * t; dy = -vy / len * t;
        } else if (len <= 0.0001) {
          /* inside the core: the flat sides still bend near the top and bottom */
          var e = Math.min(py, h - py, px, w - px);
          if (e < band) {
            var s = 1 - e / band; s = s * s * (3 - 2 * s);
            if (e === py) dy = s; else if (e === h - py) dy = -s; else if (e === px) dx = s; else dx = -s;
          }
        }
        var i = (y * w + x) * 4;
        d[i] = 128 + dx * 127; d[i + 1] = 128 + dy * 127; d[i + 2] = 128; d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL();
  }
  function buildLens(item) {
    var el = item.el, w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
    if (!w || !h || (w === item.w && h === item.h)) return;
    item.w = w; item.h = h;
    var r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, h / 2, w / 2);
    var ns = "http://www.w3.org/2000/svg";
    if (!item.filter) {
      item.id = "lg-lens-" + (++lensId);
      var f = doc.createElementNS(ns, "filter");
      f.setAttribute("id", item.id);
      f.setAttribute("filterUnits", "userSpaceOnUse");
      f.setAttribute("primitiveUnits", "userSpaceOnUse");
      f.setAttribute("color-interpolation-filters", "sRGB");
      var im = doc.createElementNS(ns, "feImage");
      im.setAttribute("preserveAspectRatio", "none"); im.setAttribute("result", "map");
      var dm = doc.createElementNS(ns, "feDisplacementMap");
      dm.setAttribute("in", "SourceGraphic"); dm.setAttribute("in2", "map");
      dm.setAttribute("xChannelSelector", "R"); dm.setAttribute("yChannelSelector", "G");
      f.appendChild(im); f.appendChild(dm);
      lensSvg().appendChild(f);
      item.filter = f; item.img = im; item.disp = dm;
    }
    var f2 = item.filter;
    f2.setAttribute("x", 0); f2.setAttribute("y", 0); f2.setAttribute("width", w); f2.setAttribute("height", h);
    item.img.setAttribute("x", 0); item.img.setAttribute("y", 0);
    item.img.setAttribute("width", w); item.img.setAttribute("height", h);
    item.img.setAttribute("href", lensMap(w, h, r));
    item.disp.setAttribute("scale", Math.round(Math.min(34, h * 0.6)));
    el.style.setProperty("--lg-lens", "url(#" + item.id + ")");
    el.classList.add("lg-lens");
  }
  var ro = LENS && window.ResizeObserver ? new ResizeObserver(function (entries) {
    entries.forEach(function (e) { glass.forEach(function (g) { if (g.el === e.target) buildLens(g); }); });
  }) : null;

  /* ───────── Tag the chrome (the home re-renders, so this runs again on change) ───────── */
  function attach() {
    glass = glass.filter(function (g) { return g.el.isConnected; });
    mags = mags.filter(function (m) { return m.el.isConnected; });
    GLASS.forEach(function (spec) {
      doc.querySelectorAll(spec.sel).forEach(function (el) {
        if (el.__lg) return; el.__lg = 1;
        el.classList.add("lg"); if (spec.light) el.classList.add("lg--light"); if (spec.dark) el.classList.add("lg--dark");
        var item = { el: el, on: 0 };
        glass.push(item);
        if (LENS) { buildLens(item); if (ro) ro.observe(el); }
      });
    });
    if (FINE && !STILL) doc.querySelectorAll(MAG).forEach(function (el) {
      if (el.__lgm) return; el.__lgm = 1;
      el.classList.add("lg-mag");
      var m = { el: el, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, s: 1, vs: 0, ts: 1 };
      mags.push(m);
      el.addEventListener("pointerdown", function () { m.ts = 0.94; kick(); });
      el.addEventListener("pointerup", function () { m.ts = 1; kick(); });
      el.addEventListener("pointerleave", function () { m.ts = 1; kick(); });
      el.addEventListener("blur", function () { m.tx = m.ty = 0; m.ts = 1; kick(); });
    });
  }

  /* ───────── Cursor: glare and magnetic pull, read and written once per frame ───────── */
  var px = -1e4, py = -1e4, framePending = false;
  function frame() {
    framePending = false;
    var i, r, item;
    /* reads first */
    var gr = glass.map(function (g) { return g.el.getBoundingClientRect(); });
    var mr = mags.map(function (m) { return m.el.getBoundingClientRect(); });
    /* then writes */
    for (i = 0; i < glass.length; i++) {
      item = glass[i]; r = gr[i];
      var ox = Math.max(r.left - px, 0, px - r.right), oy = Math.max(r.top - py, 0, py - r.bottom);
      var near = Math.sqrt(ox * ox + oy * oy);
      var on = near >= 70 ? 0 : (1 - near / 70);
      if (on > 0 || item.on > 0) {
        item.el.style.setProperty("--lg-x", (px - r.left).toFixed(1) + "px");
        item.el.style.setProperty("--lg-y", (py - r.top).toFixed(1) + "px");
        item.el.style.setProperty("--lg-on", on.toFixed(3));
        item.on = on;
      }
    }
    for (i = 0; i < mags.length; i++) {
      var m = mags[i]; r = mr[i];
      /* the resting centre, without the current pull */
      var cx = r.left + r.width / 2 - m.x, cy = r.top + r.height / 2 - m.y;
      var dx = px - cx, dy = py - cy, dist = Math.sqrt(dx * dx + dy * dy);
      var reach = Math.max(r.width, r.height) / 2 + 34;
      if (dist < reach) {
        var t = 1 - dist / reach; t = Math.min(1, t * 1.6);
        var k = Math.min(0.24, 7 / Math.max(r.width, r.height) * 3.2);
        m.tx = Math.max(-7, Math.min(7, dx * k * t));
        m.ty = Math.max(-6, Math.min(6, dy * k * t));
      } else { m.tx = 0; m.ty = 0; }
    }
    kick();
  }
  function schedule() { if (!framePending) { framePending = true; requestAnimationFrame(frame); } }

  /* ───────── Spring: runs only while a control is still settling ───────── */
  var springOn = false, last = 0;
  function kick() { if (!springOn && mags.length) { springOn = true; last = 0; requestAnimationFrame(spring); } }
  function spring(now) {
    var dt = last ? Math.min(0.032, (now - last) / 1000) : 0.016; last = now;
    var moving = false;
    for (var i = 0; i < mags.length; i++) {
      var m = mags[i];
      /* pull: stiffness 190, damping 15 (a touch of overshoot); press: quicker and firmer */
      var ax = 190 * (m.tx - m.x) - 15 * m.vx, ay = 190 * (m.ty - m.y) - 15 * m.vy;
      var as = 520 * (m.ts - m.s) - 26 * m.vs;
      m.vx += ax * dt; m.vy += ay * dt; m.vs += as * dt;
      m.x += m.vx * dt; m.y += m.vy * dt; m.s += m.vs * dt;
      var still = Math.abs(m.tx - m.x) < 0.02 && Math.abs(m.ty - m.y) < 0.02 && Math.abs(m.vx) + Math.abs(m.vy) < 0.05 &&
        Math.abs(m.ts - m.s) < 0.0005 && Math.abs(m.vs) < 0.005;
      if (still) { m.x = m.tx; m.y = m.ty; m.s = m.ts; m.vx = m.vy = m.vs = 0; } else moving = true;
      m.el.style.translate = (m.x || m.y) ? m.x.toFixed(2) + "px " + m.y.toFixed(2) + "px" : "";
      m.el.style.scale = m.s !== 1 ? m.s.toFixed(4) : "";
    }
    if (moving) requestAnimationFrame(spring); else springOn = false;
  }

  if (FINE) {
    doc.addEventListener("pointermove", function (e) { if (e.pointerType === "mouse" || e.pointerType === "pen") { px = e.clientX; py = e.clientY; schedule(); } }, { passive: true });
    doc.addEventListener("pointerleave", function () { px = py = -1e4; schedule(); });
    window.addEventListener("blur", function () { px = py = -1e4; schedule(); });
    window.addEventListener("scroll", schedule, { passive: true });
  }

  /* ───────── Case pages: scroll states, dark sections, the sliding section indicator ───────── */
  function caseBar() {
    var bar = doc.querySelector(".cm-bar");
    if (!bar || bar.__lg) return; bar.__lg = 1;

    var toc = bar.querySelector(".cm-toc"), ind = null;
    function place(instant) {
      if (!ind) return;
      var cur = toc.querySelector('a[aria-current="true"]');
      if (!cur) { ind.classList.remove("is-on"); return; }
      ind.style.setProperty("--ind-x", cur.offsetLeft + "px");
      ind.style.setProperty("--ind-w", cur.offsetWidth + "px");
      ind.classList.add("is-on");
      if (instant !== true && !ind.classList.contains("is-ready")) requestAnimationFrame(function () { ind.classList.add("is-ready"); });
    }
    if (toc) {
      ind = doc.createElement("span"); ind.className = "lg-ind"; ind.setAttribute("aria-hidden", "true");
      toc.insertBefore(ind, toc.firstChild);
      toc.classList.add("lg-has-ind");
      new MutationObserver(function () { place(); }).observe(toc, { attributes: true, subtree: true, attributeFilter: ["aria-current"] });
      window.addEventListener("resize", function () { place(true); }, { passive: true });
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { place(true); });
      place(true);
    }

    /* What sits under the bar: a dark section dims the glass so it never glows */
    function darkUnder() {
      var pill = bar.querySelector(".cm-pill"); if (!pill) return false;
      var r = pill.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      var stack = doc.elementsFromPoint ? doc.elementsFromPoint(x, y) : [];
      for (var i = 0; i < stack.length; i++) {
        var el = stack[i];
        if (bar.contains(el)) continue;
        for (var n = el; n && n !== doc.documentElement; n = n.parentElement) {
          var bg = getComputedStyle(n).backgroundColor, m = bg.match(/[\d.]+/g);
          if (m && (m.length < 4 || +m[3] > 0.6)) {
            var lum = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
            return lum < 0.4;
          }
        }
        return false;
      }
      return false;
    }
    var tick = false, lastDark = 0;
    function onScroll() {
      tick = false;
      bar.classList.toggle("lg-scrolled", window.scrollY > 12);
      var now = Date.now();
      if (now - lastDark > 90) { lastDark = now; bar.classList.toggle("lg-dark", darkUnder()); }
    }
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
    /* settle once more after the scroll stops, so the last frame is never missed */
    var idle; window.addEventListener("scroll", function () { clearTimeout(idle); idle = setTimeout(function () { lastDark = 0; onScroll(); }, 140); }, { passive: true });
  }

  /* ───────── Start ───────── */
  function start() {
    attach(); caseBar();
    var host = doc.getElementById("root");
    if (host) {
      var queued = false;
      new MutationObserver(function () {
        if (queued) return; queued = true;
        requestAnimationFrame(function () { queued = false; attach(); });
      }).observe(host, { childList: true, subtree: true });
    }
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", start); else start();
  /* For checking in the console: which features are on, and a manual re-scan */
  window.LiquidGlass = { lens: LENS, cursor: FINE, motion: !STILL, count: function () { return { glass: glass.length, magnetic: mags.length }; }, refresh: attach };
})();
