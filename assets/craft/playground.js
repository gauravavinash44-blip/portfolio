/* Craft mode: Projects (case studies, AI works) and Design Playground.
   Projects: Home slides down to a bar at the bottom. Playground: Home slides up to a bar at the top.
   A dark gallery waits behind it;
   and a card grows into a story viewer.
   Exposes window.CraftPlayground = { PlaygroundCard, PlaygroundView, preload }. */
(function () {
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef,
    useLayoutEffect = React.useLayoutEffect, useCallback = React.useCallback;

  var EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
  var EASE_IN = "cubic-bezier(0.55, 0, 0.75, 0.2)";
  /* Curves read off the reference recording (60fps) */
  var EASE_SLIDE = "cubic-bezier(0.7, 0, 0.15, 1)";   /* home -> sheet: slow start, fastest mid-way, long settle */
  var EASE_GROW = "cubic-bezier(0.75, 0, 0.35, 1)";   /* card -> story: barely moves for 100ms, near full by 430ms */
  var EASE_RISE = "cubic-bezier(0.45, 0, 0.85, 0.55)"; /* sheet -> home: slow first, fastest at the end */
  var EASE_POP = "cubic-bezier(0.2, 0.7, 0.3, 1)";    /* the quick final scale-up */
  var DATA_URL = "./assets/design-playground/playground-data.json?v=2";
  var FACE = "./assets/craft/avatar/head/face.webp";
  var DIR = "./assets/design-playground/";

  function reduced() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ───────── Content ─────────
     Grid order follows the reference: image, number, video, image / image, image, type, number.
     stops: x centres (0..1) of the phones in each mockup, used to pan the story in frames. */
  var LAYOUT = [
    { id: "nomad", look: "image", label: "Interface", focus: 0.5, stops: [0.276, 0.5, 0.73] },
    { id: "loading-range", look: "duration", label: "Motion", objpos: "30% 50%" },
    { id: "space-between", look: "video", label: "Motion", portrait: { video: "./assets/craft/playground/space-between-portrait.mp4?v=1", poster: "./assets/craft/playground/space-between-portrait.jpg?v=1" } },
    { id: "health-karma", look: "image", label: "Interface", focus: 0.66, stops: [0.21, 0.4, 0.6, 0.79] },
    { id: "swaply", look: "image", label: "Interface", focus: 0.33, stops: [0.157, 0.387, 0.61, 0.84] },
    { id: "moov", look: "image", label: "Interface", focus: 0.95, stops: [0.16, 0.41, 0.76] },
    { id: "craft-mode", look: "type", label: "This page", stops: [0.27, 0.5, 0.73] },
    { id: "splitly", look: "live", label: "Live prototype", focus: 0.5, stops: [0.27, 0.5, 0.72] }
  ];

  /* Used until (or if) playground-data.json loads */
  var FALLBACK = {
    nomad: { title: "Nomad", kind: "interface", preview: { src: DIR + "nomad-mobile-mockup.png", width: 1024, height: 665 } },
    "health-karma": { title: "Health Karma", kind: "interface", preview: { src: DIR + "health-karma-mockup.png", width: 1024, height: 576 } },
    swaply: { title: "Swaply", kind: "interface", preview: { src: DIR + "swaply-mockup.png", width: 1024, height: 576 } },
    splitly: { title: "Splitly", kind: "interface", prototype: "https://splitmate-blue-five.vercel.app/", preview: { src: DIR + "splitly-expense-mockup.png", width: 1024, height: 576 } },
    moov: { title: "moov", kind: "interface", preview: { src: DIR + "moov-payment-plan-mockup.png", width: 1024, height: 674 } },
    "space-between": { title: "Space Between", kind: "motion", preview: { src: DIR + "space-between-poster.png", width: 556, height: 556 }, media: { type: "video", src: DIR + "space-between.mp4", poster: DIR + "space-between-poster.png" } },
    "loading-range": { title: "Loading Range", kind: "motion", preview: { src: DIR + "loading-range-poster.png", width: 1280, height: 720 }, media: { type: "video", src: DIR + "loading-range.mp4", poster: DIR + "loading-range-poster.png" } }
  };

  /* The 8th card is this page. No invented project. */
  var CRAFT_ITEM = {
    id: "craft-mode", title: "Craft mode", kind: "prototype", category: "This page",
    description: "The Home view you just came from. Glass widgets on photo wallpapers that change every 15 seconds, and this playground sliding out from under it.",
    objective: "",
    tools: ["React 18, no build step", "CSS backdrop-filter", "Web Animations API"],
    preview: { src: "./assets/craft/playground/craft-board.webp?v=1", width: 1440, height: 900, alt: "The Craft mode Home view: glass cards over a photo wallpaper" }
  };

  var DURATIONS = { "loading-range": 7.8, "space-between": 4.0 };

  var dataPromise = null;
  function preload() {
    if (!dataPromise) {
      dataPromise = fetch(DATA_URL).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    }
    return dataPromise;
  }

  function buildItems(json) {
    var byId = {};
    Object.keys(FALLBACK).forEach(function (k) { byId[k] = Object.assign({ id: k }, FALLBACK[k]); });
    if (json) {
      (json.interface || []).forEach(function (p) { byId[p.id] = Object.assign({}, byId[p.id], p, { kind: "interface" }); });
      (json.motion || []).forEach(function (p) { byId[p.id] = Object.assign({}, byId[p.id], p, { kind: "motion" }); });
    }
    byId["craft-mode"] = CRAFT_ITEM;
    return LAYOUT.map(function (l) {
      var it = Object.assign({}, byId[l.id] || { id: l.id, title: l.id }, l);
      var vid = it.media && it.media.type === "video";
      it.video = vid ? it.media.src : null;
      it.poster = vid ? it.media.poster : (it.preview && it.preview.src);
      it.openSrc = vid ? it.media.src : (it.preview && it.preview.src);
      /* A portrait cut of the video (made with ffmpeg) so the story reads full-bleed */
      if (vid && it.portrait) { it.video = it.portrait.video; it.poster = it.portrait.poster; }
      it.image = it.preview && it.preview.src;
      it.ratio = it.preview ? it.preview.width / it.preview.height : 1.6;
      it.duration = DURATIONS[it.id] || null;
      it.meta = it.duration ? fmtTime(it.duration) : it.look === "live" ? "Live" : it.id === "craft-mode" ? "Now" : "Concept";
      it.frames = vid ? 1 : (it.stops || [0.5]).length;
      it.alt = (it.preview && it.preview.alt) || it.title;
      return it;
    });
  }

  function fmtTime(s) { s = Math.round(s); return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60); }

  /* ───────── Tabs: case studies, the playground, AI works ─────────
     Case studies and AI works come in as props (app.js owns the facts); each entry is one
     project: { id, title, href, image, icon, tone, sub, domain, year, summary, metric,
     description, facts: [[label, value]], live?, prototype? }. */
  var TABS = [
    { id: "cases", label: "Case studies", plural: "case studies" },
    { id: "ai", label: "AI works", plural: "AI works" }
  ];
  var PG_TAB = { id: "playground", label: "Design Playground", plural: "explorations" };
  var TAB_KEY = "ga-craft-pg-tab";
  var lastTab = null;
  function rememberedTab() {
    if (lastTab) return lastTab;
    try { lastTab = window.sessionStorage.getItem(TAB_KEY); } catch (err) { lastTab = null; }
    return lastTab;
  }
  function rememberTab(id) {
    lastTab = id;
    try { window.sessionStorage.setItem(TAB_KEY, id); } catch (err) { /* ignore */ }
  }
  function validTab(id) { return TABS.some(function (t) { return t.id === id; }) ? id : null; }

  function projectItems(arr, tab) {
    return (arr || []).map(function (p) {
      return Object.assign({}, p, {
        look: "case", group: tab, label: p.sub || (tab === "ai" ? "AI work" : "Case study"),
        frames: 1, video: null, image: p.image, openSrc: p.href, alt: p.alt || (p.title + " cover")
      });
    });
  }

  /* Case study / AI work card size: four across on wide screens, two on tablets, one on phones.
     Height keeps the story slide's proportion (456 x 710) so the grow has no stretch. */
  function caseGrid(W, n) {
    var cols = W >= 1240 ? 4 : W > 700 ? 2 : 1;
    var w = cols === 4 ? Math.min(268, Math.floor((W - 280 - 60) / 4))
      : cols === 2 ? Math.min(330, Math.floor((W - 192 - 20) / 2))
      : W - 32;
    return { cols: Math.max(1, Math.min(cols, n || 1)), w: w, h: Math.round(w * 710 / 456) };
  }
  var CS_FONT = 16 / 268; /* the card face is drawn in em: 16px at a 268px card */

  /* ───────── Icons ───────── */
  var PATHS = {
    back: "M14.5 6l-6 6 6 6",
    close: "M6 6l12 12M18 6L6 18",
    grid: "M5 5h5.5v5.5H5zM13.5 5H19v5.5h-5.5zM5 13.5h5.5V19H5zM13.5 13.5H19V19h-5.5z",
    folder: "M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z",
    download: "M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14",
    chat: "M5 5.5h14v10H10l-4 3v-3H5z",
    plus: "M12 5v14M5 12h14",
    search: "M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-3.5-3.5",
    phone: "M8 3.5h8a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V5A1.5 1.5 0 0 1 8 3.5zM11 17.5h2",
    play: "M8 5.5v13l10.5-6.5z",
    pause: "M8 5.5v13M16 5.5v13",
    cursor: "M5 4l13 5.5-5.6 1.8L10.6 17z",
    open: "M7 17L17 7M9 7h8v8",
    up: "M12 19V5M6 11l6-6 6 6",
    down: "M12 5v14M6 13l6 6 6-6",
    share: "M14 5l6 6-6 6M20 11H10a6 6 0 0 0-6 6v1",
    home: "M4 11l8-6.5 8 6.5M6.5 9.5V19h11V9.5",
    arrow: "M5 12h14M13 6l6 6-6 6"
  };
  function Icon(props) {
    return h("svg", { viewBox: "0 0 24 24", width: props.size || 20, height: props.size || 20, fill: props.fill ? "currentColor" : "none", stroke: props.fill ? "none" : "currentColor", strokeWidth: props.stroke || 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" },
      h("path", { d: PATHS[props.name] || "" }));
  }

  /* Decorative waveform, seeded so it never jumps between renders */
  function Wave(props) {
    var n = props.bars || 38, out = [];
    for (var i = 0; i < n; i++) {
      var v = Math.abs(Math.sin(i * 1.7 + (props.seed || 1)) * 0.6 + Math.sin(i * 0.43) * 0.4);
      out.push(h("i", { key: i, style: { height: Math.round(10 + v * 90) + "%" } }));
    }
    return h("span", { className: "cpg-wave", "aria-hidden": "true" }, out);
  }

  /* ───────── Home card: Design Playground (replaces "Open a folder") ───────── */
  function PlaygroundCard(props) {
    var _o = useState(false), over = _o[0], setOver = _o[1];
    var thumbs = props.thumbs || [];
    return h("button", {
      type: "button",
      className: cx("cr-card cr-glass cr-drop cpg-boardcard", over && "is-over"),
      "data-cr-enter": "", "data-pg-card": "",
      "aria-label": "Open Design Playground, " + (props.count || 8) + " explorations",
      onClick: props.onOpen,
      onDragOver: function (ev) { ev.preventDefault(); setOver(true); },
      onDragLeave: function () { setOver(false); },
      onDrop: function (ev) { ev.preventDefault(); setOver(false); if (props.onDrop) props.onDrop(ev.dataTransfer.getData("text/plain")); }
    },
      h("span", { className: "cpg-boardcard-fan", "aria-hidden": "true" },
        thumbs.slice(0, 3).map(function (src, i) {
          return h("span", { key: i, className: "cpg-fan cpg-fan--" + i }, h("img", { src: src, alt: "", decoding: "async", draggable: false }));
        })),
      h("span", { className: "cpg-boardcard-text" },
        h("span", { className: "cpg-boardcard-title" }, "Design Playground"),
        h("span", { className: "cpg-boardcard-hint" }, over ? "Drop to open its folder" : (props.count || 8) + " explorations")));
  }

  /* ───────── Grid card faces ───────── */
  function CardHead(props) {
    return h("span", { className: "cpg-card-head" },
      h("img", { className: "cpg-card-av", src: FACE, alt: "", decoding: "async" }),
      h("span", { className: "cpg-card-name" }, props.item.title),
      h("span", { className: "cpg-card-meta" }, props.item.meta));
  }
  function Segs(props) {
    var out = [];
    for (var i = 0; i < props.n; i++) out.push(h("i", { key: i }));
    return h("span", { className: "cpg-card-segs", "aria-hidden": "true" }, out);
  }

  function CardFace(props) {
    var it = props.item;
    if (it.look === "duration") {
      return h(React.Fragment, null,
        h(CardHead, { item: it }),
        h("span", { className: "cpg-num" }, it.meta),
        h(Wave, { seed: 2 }),
        h("span", { className: "cpg-dur-row", "aria-hidden": "true" },
          h("span", { className: "cpg-mini" }, h(Icon, { name: "download", size: 14 })),
          h("span", { className: "cpg-playbtn" }, h(Icon, { name: "play", fill: true, size: 22 })),
          h("span", { className: "cpg-mini cpg-mini--txt" }, "Aa")));
    }
    if (it.look === "live") {
      return h(React.Fragment, null,
        h(CardHead, { item: it }),
        h("span", { className: "cpg-num cpg-num--live" }, h("i", { className: "cpg-live-dot", "aria-hidden": "true" }), "Live"),
        h("span", { className: "cpg-live-url" }, "Splitly prototype"),
        h(Wave, { seed: 5, bars: 34 }));
    }
    if (it.look === "type") {
      return h(React.Fragment, null,
        h("span", { className: "cpg-type-bg cr-wp-thumb craft-wp--" + (props.wallpaper || "fuji"), "aria-hidden": "true" }),
        h(CardHead, { item: it }),
        h("span", { className: "cpg-type-poster", "aria-hidden": "true" },
          h("span", { className: "cpg-type-cap" }, "Inter, the Craft face"),
          h("span", { className: "cpg-type-abc" }, "ABCD", h("br"), "EFGHIJK", h("br"), "LMNOP", h("br"), "QRSTUV", h("br"), "WXYZ")),
        h(Segs, { n: 3 }));
    }
    var media = it.video
      ? h("video", { className: "cpg-card-media", src: it.video, poster: it.poster, muted: true, loop: true, playsInline: true, preload: "auto", "aria-hidden": "true", ref: props.videoRef, style: it.objpos ? { objectPosition: it.objpos } : null })
      : h("img", { className: "cpg-card-media", src: it.image, alt: "", decoding: "async", draggable: false, style: { objectPosition: Math.round((it.focus != null ? it.focus : 0.5) * 100) + "% 50%" } });
    return h(React.Fragment, null, media, h("span", { className: "cpg-card-shade", "aria-hidden": "true" }), h(CardHead, { item: it }), h(Segs, { n: it.frames > 1 ? 3 : 3 }));
  }

  /* Case study / AI work face, in the All work card format: cover, orb + name + one-liner,
     tags, and the metric in big regular numerals. Drawn in em, so the grid card and the
     story slide are the same picture at two sizes. */
  function CaseFace(props) {
    var it = props.item, m = it.metric;
    return h(React.Fragment, null,
      h("span", { className: "cpg-cs-media" },
        h("img", { src: it.image, alt: props.active ? it.alt : "", decoding: "async", draggable: false, style: it.coverPos ? { objectPosition: it.coverPos } : null })),
      h("span", { className: "cpg-cs-body" },
        h("span", { className: "cpg-cs-head" },
          h("span", { className: "cpg-cs-name" }, h("b", null, it.title), h("span", null, it.summary))),
        h("span", { className: "cpg-cs-foot" },
          h("span", { className: "cpg-cs-tags" },
            it.domain ? h("span", { className: "cpg-cs-chip" }, it.domain) : null,
            it.year ? h("span", { className: "cpg-cs-chip" }, it.year) : null),
          m ? h("span", { className: cx("cpg-cs-metric", m.word && "is-word") }, h("b", null, m.value), h("span", null, m.label)) : h("span", { className: "cpg-cs-metric" }),
          props.go ? h("span", { className: "cpg-cs-go", "aria-hidden": "true" }, h(Icon, { name: "arrow", size: 16, stroke: 1.8 })) : null)));
  }

  /* ───────── Story layout (px, from the viewport) ───────── */
  /* The right edge keeps a column free for the up/down buttons (and, when the panel
     sits inside the story, for the Home thumbnail at the top right). */
  function storyLayout(W, H) {
    if (W <= 700) return { mobile: true, compact: true, left: 0, top: 0, w: W, h: H, r: 0, pitch: H };
    var railR = 104, act = 54 + 20, gap = 32;
    var navCol = 28 + 54 + 18, pipCol = 28 + (W >= 1100 ? 140 : 112) + 14;
    var panelW = W >= 1200 ? 320 : 280;
    var hgt = Math.min(710, H - 150), w = Math.round(hgt * 456 / 710);
    var compact = false, right = W - navCol;
    if (act + w + gap + panelW > right - railR) {
      var w2 = right - railR - act - gap - panelW;
      if (w2 >= 340) { w = w2; hgt = Math.round(w * 710 / 456); }
      else {
        compact = true; panelW = 0; gap = 0; right = W - Math.max(navCol, pipCol);
        w = Math.min(w, right - railR - act); hgt = Math.round(w * 710 / 456);
      }
    }
    var left = Math.round(W / 2 - w / 2);
    if (left + w + gap + panelW > right) left = right - panelW - gap - w;
    if (left - act < railR) left = railR + act;
    var top = Math.round(clamp((H - hgt) / 2 - 40, 16, 40));
    return { mobile: false, compact: compact, left: left, top: top, w: w, h: hgt, r: Math.max(28, Math.round(40 * w / 456)), pitch: hgt + 44, panelW: panelW, gap: gap, pipBottom: W >= 1100 ? 136 : 118 };
  }

  /* Frame pan for an image inside a box */
  function panX(it, seg, boxW, boxH, center) {
    var imgW = boxH * it.ratio;
    if (imgW <= boxW) return { imgW: boxW, x: 0, fit: true };
    var f = boxW / imgW;
    var c = center != null ? center : (it.stops ? it.stops[seg] : 0.5);
    var p = clamp((c - f / 2) / (1 - f), 0, 1);
    return { imgW: imgW, x: Math.round(p * (imgW - boxW)) };
  }

  function SlideMedia(props) {
    var it = props.item, L = props.L;
    if (it.look === "case") {
      /* Same face as the grid card, scaled to the slide (compact screens cap the type size) */
      var fs = L.w * CS_FONT;
      if (L.compact) fs = Math.min(fs, L.mobile ? 19 : 20);
      return h("span", { className: "cpg-cs cpg-cs--slide", style: { fontSize: fs.toFixed(2) + "px" } }, h(CaseFace, { item: it, active: props.active }));
    }
    if (it.video) {
      if (props.active) {
        return h("video", {
          className: "cpg-slide-video", src: it.video, poster: it.poster, muted: true, loop: true, playsInline: true,
          autoPlay: !props.still, preload: "auto", ref: props.videoRef, "aria-label": it.title + " motion study",
          style: it.objpos ? { objectPosition: it.objpos } : null
        });
      }
      return h("img", { className: "cpg-slide-video", src: it.poster, alt: "", decoding: "async", style: it.objpos ? { objectPosition: it.objpos } : null });
    }
    var src = it.image;
    var pan = panX(it, props.seg, L.w, L.h, props.active ? null : (it.focus != null ? it.focus : 0.5));
    /* A peek only shows its top strip, which is mostly empty backdrop in these mockups:
       lift it so the phones show through instead */
    var lift = props.peek ? "-34%" : "0";
    return h("img", {
      className: "cpg-pan", src: src, alt: props.active ? it.alt : "", decoding: "async", draggable: false,
      style: { width: Math.ceil(pan.imgW) + "px", transform: "translate3d(" + (-pan.x) + "px," + lift + ",0)" }
    });
  }

  /* ───────── Home sheet motion (the Craft stage itself moves) ───────── */
  /* The stage's untransformed top in the viewport. Layout offsets, so a running
     animation on the stage can't skew it. */
  function stageGeom(stage) {
    var y = 0, n = stage;
    while (n) { y += n.offsetTop; n = n.offsetParent; }
    return y - (window.scrollY || window.pageYOffset || 0);
  }
  /* Poses. The stage scales from its top edge (transform-origin 50% 0), so "lift" poses
     shift it to keep the scale centred on the viewport. */
  /* DIR_UP: Design Playground mirrors Projects. Home slides UP to a bar at the top instead of down. */
  var DIR_UP = false;
  function stagePose(name, base, m) {
    var W = window.innerWidth, H = window.innerHeight;
    var bar = W <= 700 ? 84 : 96, s = W <= 700 ? 0.94 : 0.96;
    if (name === "home") return { t: "translate3d(0,0,0) scale(1)", r: "0px" };
    if (name === "lift") { m = m || 0.97; return { t: "translate3d(0," + ((H / 2 - base) * (1 - m)).toFixed(1) + "px,0) scale(" + m + ")", r: "34px" }; }
    if (DIR_UP) {
      if (name === "sheet") return { t: "translate3d(0," + (bar - H * s - base).toFixed(1) + "px,0) scale(" + s + ")", r: "36px" };
      return { t: "translate3d(0," + (-40 - H * s - base).toFixed(1) + "px,0) scale(" + s + ")", r: "36px" }; /* away */
    }
    if (name === "sheet") return { t: "translate3d(0," + (H - bar - base).toFixed(1) + "px,0) scale(" + s + ")", r: "36px" };
    return { t: "translate3d(0," + (H + 40 - base).toFixed(1) + "px,0) scale(" + s + ")", r: "36px" }; /* away */
  }
  /* Where the stage is right now, even mid-animation. Stops whatever is running so a new
     move starts from the live position instead of jumping. */
  function livePose(stage) {
    var cs = getComputedStyle(stage);
    var pose = { t: cs.transform && cs.transform !== "none" ? cs.transform : "translate3d(0,0,0) scale(1)", r: cs.borderTopLeftRadius || "0px" };
    stage.getAnimations().forEach(function (a) { a.cancel(); });
    return pose;
  }
  /* steps: [{ pose, at, easing }]; the first step's easing applies from the live pose */
  function moveStage(stage, base, to, opts) {
    opts = opts || {};
    var a = livePose(stage), b = stagePose(to, base);
    stage.style.transform = b.t; stage.style.borderRadius = b.r;
    if (reduced()) {
      return stage.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 180 }).finished.catch(function () {});
    }
    var steps = opts.steps || [];
    var frames = [{ transform: a.t, borderRadius: a.r, easing: steps.length ? steps[0].easing : (opts.easing || EASE) }];
    steps.forEach(function (st, i) {
      var p = stagePose(st.pose, base, st.scale);
      frames.push({ transform: p.t, borderRadius: p.r, offset: st.at, easing: (steps[i + 1] && steps[i + 1].easing) || opts.last || EASE });
    });
    frames.push({ transform: b.t, borderRadius: b.r });
    var anim = stage.animate(frames, { duration: opts.duration || 700, easing: "linear" });
    return anim.finished.catch(function () {});
  }

  /* ───────── Gallery view ───────── */
  function PlaygroundView(props) {
    var _i = useState(function () { return buildItems(null); }), items = _i[0], setItems = _i[1];
    var _v = useState("grid"), view = _v[0], setView = _v[1];
    var _x = useState(0), index = _x[0], setIndex = _x[1];
    /* Which tab: the opener's pick, else the last one this session, else the playground */
    var _t = useState(function () {
      if (props.mode === "playground") return "playground";
      var t = validTab(props.tab) || validTab(rememberedTab()) || "cases";
      rememberTab(t);
      return t;
    }), tab = _t[0], setTab = _t[1];
    var up = props.mode === "playground";
    DIR_UP = up;
    var _s = useState(0), seg = _s[0], setSeg = _s[1];
    var still = reduced();
    var _p = useState(still), paused = _p[0], setPaused = _p[1];
    var _m = useState(false), more = _m[0], setMore = _m[1];
    var _in = useState(false), storyIn = _in[0], setStoryIn = _in[1];
    var _vp = useState({ W: window.innerWidth, H: window.innerHeight }), vp = _vp[0], setVp = _vp[1];
    var _c = useState(false), closing = _c[0], setClosing = _c[1];

    var rootRef = useRef(null), galleryRef = useRef(null), scrollRef = useRef(null), storyRef = useRef(null);
    var cardRefs = useRef({}), gridVideos = useRef({}), storyVideo = useRef(null);
    var stageBase = useRef(0), stageState = useRef("home");
    var busy = useRef(true), pending = useRef(null), rects = useRef({}), cardAnims = useRef([]);
    var closingRef = useRef(false), queued = useRef(null), needsPose = useRef(false), handlers = useRef({});
    var wheelAcc = useRef(0), lastNav = useRef(0), touchY = useRef(null);
    var tabRefs = useRef([]), pillRef = useRef(null), ghostRef = useRef(null);

    var cases = React.useMemo(function () { return projectItems(props.cases, "cases"); }, [props.cases]);
    var ai = React.useMemo(function () { return projectItems(props.aiWorks, "ai"); }, [props.aiWorks]);
    var list = tab === "cases" ? cases : tab === "ai" ? ai : items;
    var isCase = tab !== "playground";
    var cur = list[index] || list[0];
    var L = storyLayout(vp.W, vp.H);
    var CG = caseGrid(vp.W, list.length);

    useEffect(function () { preload().then(function (j) { if (j) setItems(buildItems(j)); }); }, []);
    useEffect(function () {
      var on = function () { setVp({ W: window.innerWidth, H: window.innerHeight }); };
      window.addEventListener("resize", on);
      return function () { window.removeEventListener("resize", on); };
    }, []);
    /* Keep the home sheet glued to the bottom when the window changes. Mid-animation,
       wait for it to end and then re-pose (see release). */
    function applyPose() {
      var stage = props.stageRef.current;
      if (!stage || closingRef.current) return;
      needsPose.current = false;
      stageBase.current = stageGeom(stage);
      var pose = stagePose(stageState.current, stageBase.current);
      stage.style.transform = pose.t; stage.style.borderRadius = pose.r;
    }
    useEffect(function () {
      if (busy.current) { needsPose.current = true; return; }
      applyPose();
    }, [vp.W, vp.H]);

    /* Animations done: accept input again, and run the last thing the user asked for meanwhile */
    function release() {
      if (closingRef.current) return;
      busy.current = false;
      if (needsPose.current) applyPose();
      var q = queued.current; queued.current = null;
      if (q && handlers.current[q[0]]) handlers.current[q[0]](q[1]);
    }

    /* ── Enter: Home dips, then slides down to a bar; the gallery is already there under it ── */
    useLayoutEffect(function () {
      var stage = props.stageRef.current;
      var root = document.documentElement;
      root.classList.add("ga-pg-open");
      if (!stage) { busy.current = false; return undefined; }
      /* The cards lean toward whatever opened this (Projects tab, All chip, View all, +), else the Playground card */
      var from = props.from && props.from.isConnected && stage.contains(props.from) ? (props.from.closest(".cr-card") || props.from) : null;
      var src = from || stage.querySelector("[data-pg-card]");
      var sr = (src || stage).getBoundingClientRect();
      stageBase.current = stageGeom(stage);
      stage.style.setProperty("--pg-scroll", Math.max(0, -stageBase.current) + "px");
      stage.classList.add("is-pg");
      stage.classList.toggle("is-pg-up", up);
      stage.setAttribute("inert", "");
      stage.style.transformOrigin = "50% 0";
      stageState.current = "sheet";
      /* Opened from search with a pick: expand that card once the gallery lands */
      if (props.startId) {
        var si = list.findIndex(function (it) { return it.id === props.startId; });
        if (si >= 0) queued.current = ["startStory", si];
      }
      moveStage(stage, stageBase.current, "sheet", {
        duration: 860,
        steps: [{ pose: "lift", scale: 0.97, at: 0.24, easing: "cubic-bezier(0.3, 0, 0.3, 1)" }],
        last: EASE_SLIDE
      }).then(release);

      var cards = Array.prototype.slice.call(galleryRef.current.querySelectorAll(".cpg-cell"));
      cards.forEach(function (el, i) {
        var r = el.getBoundingClientRect();
        if (still) { el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 80 + i * 20, fill: "backwards" }); return; }
        /* A short lean toward the Playground card, not a flight from it */
        var dx = sr.left + sr.width / 2 - (r.left + r.width / 2), dy = sr.top + sr.height / 2 - (r.top + r.height / 2);
        var d = Math.hypot(dx, dy) || 1, k = Math.min(56, d * 0.12) / d;
        el.animate([
          { opacity: 0, transform: "translate3d(" + (dx * k).toFixed(1) + "px," + (dy * k).toFixed(1) + "px,0) scale(0.92)" },
          { opacity: 1, offset: 0.4 },
          { opacity: 1, transform: "none" }
        ], { duration: 560, delay: 110 + i * 30, easing: EASE, fill: "backwards" });
      });
      Array.prototype.slice.call(galleryRef.current.querySelectorAll("[data-cpg-chrome]")).forEach(function (el, i) {
        el.animate([{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }], { duration: still ? 160 : 460, delay: still ? 0 : 220 + i * 40, easing: EASE, fill: "backwards" });
      });
      var t = setTimeout(function () {
        var first = galleryRef.current && galleryRef.current.querySelector(".cpg-card");
        if (first) first.focus({ preventScroll: true });
      }, 60);
      return function () {
        clearTimeout(t);
        root.classList.remove("ga-pg-open");
        resetStage(stage);
      };
    }, []);

    function resetStage(stage) {
      if (!stage) return;
      stage.getAnimations().forEach(function (a) { a.cancel(); });
      stage.classList.remove("is-pg", "is-pg-up");
      stage.removeAttribute("inert");
      ["transform", "border-radius", "transform-origin", "--pg-scroll"].forEach(function (p) { stage.style.removeProperty(p); });
    }

    /* ── Back to Home: it rises at near full width, then snaps up to full size.
       The gallery (or story) stays put underneath; nothing fades. ── */
    var closeHome = useCallback(function (then) {
      if (closingRef.current) return;
      closingRef.current = true;
      busy.current = true;
      queued.current = null;
      setClosing(true);
      if (props.onClosing) props.onClosing();
      var stage = props.stageRef.current;
      Object.keys(gridVideos.current).forEach(function (k) { var v = gridVideos.current[k]; if (v) v.pause(); });
      stageState.current = "home";
      var done = function () {
        if (rootRef.current) rootRef.current.style.display = "none";
        resetStage(stage);
        document.documentElement.classList.remove("ga-pg-open");
        props.onClose(then);
      };
      if (!stage) { done(); return; }
      moveStage(stage, stageBase.current, "home", {
        duration: 720,
        steps: [{ pose: "lift", scale: 0.965, at: 0.8, easing: EASE_RISE }],
        last: EASE_POP
      }).then(done);
    }, [props.onClose]);

    /* ── Open a card into the story viewer ── */
    function openStory(i) {
      if (closingRef.current || view !== "grid" || !list[i]) return;
      if (busy.current) { queued.current = ["openStory", i]; return; }
      busy.current = true;
      var map = {};
      list.forEach(function (it) { var el = cardRefs.current[it.id]; if (el) map[it.id] = el.getBoundingClientRect(); });
      rects.current = map;
      pending.current = { id: list[i].id };
      setSeg(0); setPaused(still); setMore(false);
      setIndex(i);
      setView("story");
    }

    useLayoutEffect(function () {
      if (view !== "story" || !pending.current) return;
      var id = pending.current.id; pending.current = null;
      var src = rects.current[id];
      var slide = storyRef.current && storyRef.current.querySelector(".cpg-slide.is-current");
      var stage = props.stageRef.current;
      Object.keys(gridVideos.current).forEach(function (k) { var v = gridVideos.current[k]; if (v) v.pause(); });
      if (stage) { stageState.current = "away"; moveStage(stage, stageBase.current, "away", { duration: 520, easing: EASE_IN }); }
      var srcCard = cardRefs.current[id];
      var c0 = src ? { x: src.left + src.width / 2, y: src.top + src.height / 2 } : { x: 0, y: 0 };
      cardAnims.current.forEach(function (a) { a.cancel(); });
      cardAnims.current = [];
      var DUR = 580;
      /* Neighbours shrink and drift outward, staying visible for most of the grow */
      list.forEach(function (it) {
        var el = cardRefs.current[it.id];
        if (!el) return;
        var cell = el.parentNode;
        if (it.id === id) { cardAnims.current.push(cell.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 10, fill: "forwards" })); return; }
        var r = rects.current[it.id] || el.getBoundingClientRect();
        var dx = r.left + r.width / 2 - c0.x, dy = r.top + r.height / 2 - c0.y, d = Math.hypot(dx, dy) || 1;
        if (still) { cardAnims.current.push(cell.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" })); return; }
        var push = 200, ux = dx / d * push, uy = dy / d * push;
        cardAnims.current.push(cell.animate([
          { opacity: 1, transform: "none" },
          { opacity: 1, transform: "translate3d(" + (ux * 0.8).toFixed(1) + "px," + (uy * 0.8).toFixed(1) + "px,0) scale(0.88)", offset: 0.9 },
          { opacity: 0, transform: "translate3d(" + ux.toFixed(1) + "px," + uy.toFixed(1) + "px,0) scale(0.85)" }
        ], { duration: DUR + 100, easing: EASE_GROW, fill: "forwards" }));
      });
      if (slide && src && !still) {
        var r = slide.getBoundingClientRect();
        slide.animate([
          { transformOrigin: "0 0", transform: "translate3d(" + (src.left - r.left) + "px," + (src.top - r.top) + "px,0) scale(" + (src.width / r.width) + "," + (src.height / r.height) + ")", borderRadius: (30 * r.width / src.width).toFixed(1) + "px" },
          { transformOrigin: "0 0", transform: "none", borderRadius: L.r + "px" }
        ], { duration: DUR, easing: EASE_GROW });
      } else if (slide) {
        slide.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180 });
      }
      requestAnimationFrame(function () { setStoryIn(true); });
      setTimeout(function () {
        if (closingRef.current) return;
        var back = galleryRef.current && galleryRef.current.querySelector(".cpg-back");
        if (back && !rootRef.current.contains(document.activeElement)) back.focus({ preventScroll: true });
        else if (back && document.activeElement && document.activeElement.classList.contains("cpg-card")) back.focus({ preventScroll: true });
        release();
      }, still ? 200 : DUR + 20);
      if (srcCard && srcCard === document.activeElement) srcCard.blur();
    }, [view]);

    /* ── Story back to the grid ── */
    function closeStory() {
      if (closingRef.current || view !== "story") return;
      if (busy.current) { queued.current = ["closeStory"]; return; }
      busy.current = true;
      var it = cur;
      var el = cardRefs.current[it.id];
      var sc = scrollRef.current;
      var target = rects.current[it.id] || (el && el.getBoundingClientRect());
      /* Bring the card into view first so the story has somewhere visible to land */
      if (target && sc) {
        var bar = vp.W <= 700 ? 84 : 96;
        var topSafe = vp.W <= 700 ? 80 : 110;
        var delta = 0;
        if (target.bottom > vp.H - bar - 16) delta = target.bottom - (vp.H - bar - 16);
        if (target.top - delta < topSafe) delta = target.top - topSafe;
        if (delta) {
          var before = sc.scrollTop;
          sc.scrollTop = before + delta;
          var moved = sc.scrollTop - before;
          Object.keys(rects.current).forEach(function (k) {
            var q = rects.current[k];
            rects.current[k] = { left: q.left, top: q.top - moved, width: q.width, height: q.height, bottom: q.bottom - moved, right: q.right };
          });
          target = rects.current[it.id];
        }
      }
      setStoryIn(false);
      var slide = storyRef.current && storyRef.current.querySelector(".cpg-slide.is-current");
      var stage = props.stageRef.current;
      if (stage) { stageState.current = "sheet"; moveStage(stage, stageBase.current, "sheet", { duration: 640 }); }
      var anims = [];
      if (slide && target && !still) {
        var r = slide.getBoundingClientRect();
        /* Pan the frame back to the crop the grid card shows, so the landing has no jump */
        var pan = slide.querySelector(".cpg-pan");
        if (pan && it.focus != null) {
          var px = panX(it, 0, L.w, L.h, it.focus);
          pan.style.transition = "transform 520ms " + EASE;
          pan.style.transform = "translate3d(" + (-px.x) + "px,0,0)";
        }
        anims.push(slide.animate([
          { transformOrigin: "0 0", transform: "none", borderRadius: L.r + "px" },
          { transformOrigin: "0 0", transform: "translate3d(" + (target.left - r.left) + "px," + (target.top - r.top) + "px,0) scale(" + (target.width / r.width) + "," + (target.height / r.height) + ")", borderRadius: (30 * r.width / target.width).toFixed(1) + "px" }
        ], { duration: 520, easing: EASE, fill: "forwards" }).finished);
      }
      var outs = cardAnims.current; cardAnims.current = [];
      outs.forEach(function (a) { a.cancel(); });
      list.forEach(function (x, i) {
        var c = cardRefs.current[x.id];
        if (!c) return;
        var cell = c.parentNode;
        if (x.id === it.id) { cell.animate([{ opacity: 0 }, { opacity: 0, offset: 0.92 }, { opacity: 1 }], { duration: still ? 160 : 540 }); return; }
        var q = rects.current[x.id], t0 = target || q;
        var dx = q && t0 ? q.left + q.width / 2 - (t0.left + t0.width / 2) : 0, dy = q && t0 ? q.top + q.height / 2 - (t0.top + t0.height / 2) : 0;
        var d = Math.hypot(dx, dy) || 1, push = still ? 0 : 140;
        cell.animate([
          { opacity: 0, transform: "translate3d(" + (dx / d * push) + "px," + (dy / d * push) + "px,0) scale(0.82)" },
          { opacity: 1, transform: "none" }
        ], { duration: still ? 160 : 600, delay: still ? 0 : 60 + (i % 4) * 30, easing: EASE, fill: "backwards" });
      });
      var wait = new Promise(function (res) { setTimeout(res, still ? 170 : 540); });
      Promise.all(anims.concat([wait])).then(function () {
        if (closingRef.current) return;
        backTo.current = it.id;
        setView("grid");
      });
    }
    /* Back on the grid: focus the card the story came from once the grid is interactive again
       (an effect, so React has dropped the grid's inert first) */
    var backTo = useRef(null);
    useEffect(function () {
      if (view !== "grid" || backTo.current == null) return;
      var id = backTo.current; backTo.current = null;
      var c = cardRefs.current[id];
      if (c) c.focus({ preventScroll: true });
      playVisible();
      release();
    }, [view]);

    function go(d) {
      if (view !== "story" || busy.current || closingRef.current) return;
      var ni = clamp(index + d, 0, list.length - 1);
      if (ni === index) return;
      lastNav.current = Date.now();
      setSeg(0); setPaused(still); setMore(false);
      setIndex(ni);
    }
    /* Scroll the cell into view first (instantly) so the expand starts from where the card really is */
    function startStory(i) {
      var el = list[i] && cardRefs.current[list[i].id], sc = scrollRef.current;
      if (el && sc) {
        var r = el.getBoundingClientRect(), bar = vp.W <= 700 ? 84 : 96, topSafe = up ? bar + (vp.W <= 700 ? 70 : 90) : (vp.W <= 700 ? 80 : 110);
        var low = up ? vp.H - 16 : vp.H - bar - 16, delta = 0;
        if (r.bottom > low) delta = r.bottom - low;
        if (r.top - delta < topSafe) delta = r.top - topSafe;
        if (delta) sc.scrollTop += delta;
      }
      openStory(i);
    }
    handlers.current = { openStory: openStory, closeStory: closeStory, startStory: startStory };

    /* ── Videos in the grid only play while visible ── */
    var visible = useRef({});
    function playVisible() {
      if (still) return;
      Object.keys(gridVideos.current).forEach(function (k) {
        var v = gridVideos.current[k];
        if (v && visible.current[k]) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      });
    }
    useEffect(function () {
      if (!("IntersectionObserver" in window)) return undefined;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var id = en.target.getAttribute("data-id");
          visible.current[id] = en.isIntersecting;
          var v = gridVideos.current[id];
          if (!v) return;
          if (en.isIntersecting && view === "grid" && !closing && !still) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
          else v.pause();
        });
      }, { root: scrollRef.current, threshold: 0.2 });
      Object.keys(gridVideos.current).forEach(function (k) { var v = gridVideos.current[k]; if (v) io.observe(v.closest(".cpg-cell")); });
      return function () { io.disconnect(); };
    }, [view, tab, items, closing]);

    /* ── Tabs ──
       The old grid is copied into a layer that fades out while the new cards stagger in. */
    function switchTab(id) {
      if (id === tab || view !== "grid" || closingRef.current) return;
      var ul = scrollRef.current && scrollRef.current.querySelector(".cpg-grid");
      var host = ghostRef.current;
      if (ul && host && !still) {
        var r = ul.getBoundingClientRect();
        var ghost = ul.cloneNode(true);
        ghost.removeAttribute("aria-label");
        ghost.setAttribute("aria-hidden", "true");
        ghost.setAttribute("inert", "");
        /* WebGL orbs don't survive a copy: show their gradient stand-in instead */
        Array.prototype.forEach.call(ghost.querySelectorAll(".is-lit"), function (n) { n.classList.remove("is-lit"); });
        ghost.style.cssText = "position:absolute;margin:0;left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;" + (ul.getAttribute("style") || "");
        host.textContent = "";
        host.appendChild(ghost);
        ghost.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.97)" }], { duration: 260, easing: EASE, fill: "forwards" })
          .finished.then(function () { if (ghost.parentNode) ghost.parentNode.removeChild(ghost); }, function () {});
      }
      rememberTab(id);
      setIndex(0);
      setTab(id);
    }
    function onTabKey(ev, i) {
      var n = TABS.length, j = null;
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") j = (i + 1) % n;
      else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") j = (i - 1 + n) % n;
      else if (ev.key === "Home") j = 0;
      else if (ev.key === "End") j = n - 1;
      if (j == null) return;
      ev.preventDefault();
      switchTab(TABS[j].id);
      if (tabRefs.current[j]) tabRefs.current[j].focus();
    }
    /* New tab: back to the top, cards stagger in (same lean as the opening burst, shorter) */
    var firstTab = useRef(true);
    useLayoutEffect(function () {
      if (firstTab.current) { firstTab.current = false; return; }
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      Array.prototype.slice.call(scrollRef.current.querySelectorAll(".cpg-cell")).forEach(function (el, i) {
        el.animate(still ? [{ opacity: 0 }, { opacity: 1 }] : [
          { opacity: 0, transform: "translate3d(0,16px,0) scale(0.95)" },
          { opacity: 1, offset: 0.5 },
          { opacity: 1, transform: "none" }
        ], { duration: still ? 160 : 400, delay: still ? 0 : 40 + i * 35, easing: EASE, fill: "backwards" });
      });
    }, [tab]);
    /* The pill under the selected tab follows it (measured, the labels differ in width) */
    var pillReady = useRef(false);
    function placePill() {
      var i = TABS.map(function (t) { return t.id; }).indexOf(tab);
      var b = tabRefs.current[i], p = pillRef.current;
      if (!b || !p) return;
      var snap = !pillReady.current || still;
      if (snap) p.style.transition = "none";
      p.style.width = b.offsetWidth + "px";
      p.style.transform = "translate3d(" + b.offsetLeft + "px,0,0)";
      if (snap) { void p.offsetWidth; p.style.transition = ""; }
      pillReady.current = true;
    }
    var pillFn = useRef(placePill);
    pillFn.current = placePill;
    useLayoutEffect(placePill, [tab, vp.W, vp.H]);
    useEffect(function () {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { pillFn.current(); });
    }, []);

    /* Story frames advance on their own (not under reduced motion, not when paused) */
    function onSegEnd() {
      if (!cur || cur.video) return;
      if (seg < cur.frames - 1) setSeg(seg + 1);
    }
    useEffect(function () {
      var v = storyVideo.current;
      if (!v) return;
      if (paused) v.pause(); else { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    }, [paused, index, view]);

    /* ── Keyboard: focus trap, Escape, arrows ──
       Listens on the document, so it keeps working after a click on a non-focusable spot
       (focus falls back to <body>). Keys aimed at something outside the playground are left alone. */
    function onKeyDown(ev) {
      var root = rootRef.current;
      if (!root || closingRef.current) return;
      var t = ev.target;
      var inside = root.contains(t) || t === document.body || t === document.documentElement;
      if (!inside) return;
      if (ev.key === "Tab") {
        var nodes = Array.prototype.slice.call(rootRef.current.querySelectorAll("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"))
          .filter(function (n) { return !n.closest("[inert]") && !n.closest("[aria-hidden='true']") && n.getClientRects().length > 0 && getComputedStyle(n).visibility !== "hidden"; });
        if (!nodes.length) return;
        var first = nodes[0], last = nodes[nodes.length - 1];
        var away = !root.contains(document.activeElement);
        if (ev.shiftKey && (document.activeElement === first || away)) { ev.preventDefault(); last.focus(); }
        else if (!ev.shiftKey && (document.activeElement === last || away)) { ev.preventDefault(); first.focus(); }
        return;
      }
      if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); if (view === "story") closeStory(); else closeHome(); return; }
      if (view !== "story") return;
      var dir = (ev.key === "ArrowDown" || ev.key === "ArrowRight" || ev.key === "PageDown") ? 1
        : (ev.key === "ArrowUp" || ev.key === "ArrowLeft" || ev.key === "PageUp") ? -1 : 0;
      if (!dir) return;
      ev.preventDefault();
      if (Date.now() - lastNav.current < 700) return; /* same gate as the wheel */
      go(dir);
    }
    var keyRef = useRef(onKeyDown);
    keyRef.current = onKeyDown;
    useEffect(function () {
      var fn = function (ev) { keyRef.current(ev); };
      document.addEventListener("keydown", fn);
      return function () { document.removeEventListener("keydown", fn); };
    }, []);
    function inScrollablePanel(t) {
      var p = t && t.closest && t.closest(".cpg-panel-body");
      return p && p.scrollHeight > p.clientHeight + 2;
    }
    function onWheel(ev) {
      if (view !== "story" || inScrollablePanel(ev.target)) return;
      if (Date.now() - lastNav.current < 700) { wheelAcc.current = 0; return; }
      wheelAcc.current += ev.deltaY;
      if (Math.abs(wheelAcc.current) > 60) { var d = wheelAcc.current > 0 ? 1 : -1; wheelAcc.current = 0; go(d); }
    }
    function onTouchStart(ev) { if (view === "story" && !inScrollablePanel(ev.target)) touchY.current = ev.touches[0].clientY; }
    function onTouchEnd(ev) {
      if (touchY.current == null) return;
      var dy = ev.changedTouches[0].clientY - touchY.current; touchY.current = null;
      if (Math.abs(dy) > 50) go(dy < 0 ? 1 : -1);
    }

    /* ── Render ── */
    var isStory = view === "story";
    function roundBtn(o) {
      var cls = cx("cpg-round", o.className);
      var inner = h(Icon, { name: o.icon, size: o.size || 20, fill: o.fill });
      if (o.href) return h("a", { key: o.key || o.label, className: cls, href: o.href, target: o.external ? "_blank" : undefined, rel: o.external ? "noopener" : undefined, "aria-label": o.label, title: o.label, "data-cpg-chrome": o.chrome ? "" : undefined }, inner);
      return h("button", { key: o.key || o.label, type: "button", className: cls, "aria-label": o.label, title: o.label, onClick: o.onClick, disabled: o.disabled, "aria-current": o.current ? "page" : undefined, "aria-pressed": o.pressed, "data-cpg-chrome": o.chrome ? "" : undefined }, inner);
    }

    var tabInfo = up ? PG_TAB : (TABS.filter(function (t) { return t.id === tab; })[0] || TABS[0]);
    var grid = h("div", {
      className: "cpg-scroll", ref: scrollRef, inert: isStory ? "" : undefined, "aria-hidden": isStory ? "true" : undefined,
      role: up ? undefined : "tabpanel", id: "cpg-tabpanel", "aria-labelledby": up ? undefined : "cpg-tab-" + tab
    },
      h("ul", {
        className: cx("cpg-grid", isCase && "cpg-grid--cs"), "aria-label": tabInfo.label,
        style: isCase ? { gridTemplateColumns: "repeat(" + CG.cols + ", " + CG.w + "px)", "--csw": CG.w + "px", "--csh": CG.h + "px" } : null
      },
        list.map(function (it, i) {
          var caseCard = it.look === "case";
          return h("li", { key: tab + "-" + it.id, className: "cpg-cell cpg-cell--" + it.look, "data-id": it.id },
            h("span", { className: "cpg-date", "aria-hidden": "true" }, it.label),
            h("button", {
              type: "button", className: "cpg-card cpg-card--" + it.look, "data-href": caseCard ? it.href : undefined,
              ref: function (n) { cardRefs.current[it.id] = n; },
              "aria-label": caseCard
                ? it.title + ", " + it.label + ". " + (it.metric ? it.metric.value + " " + it.metric.label + ". " : "") + "Open case study"
                : it.title + ", " + it.label + (it.video ? ", video" : "") + ". Open",
              onClick: function () { if (caseCard && it.href) window.location.href = it.href; else openStory(i); }
            }, caseCard
              ? h("span", { className: "cpg-cs" }, h(CaseFace, { item: it, go: true }))
              : h(CardFace, { item: it, wallpaper: props.wallpaper, videoRef: it.video ? function (n) { gridVideos.current[it.id] = n; } : undefined })));
        })));

    var story = null;
    if (isStory && cur) {
      var segs = [];
      for (var s = 0; s < cur.frames; s++) {
        var state = s < seg ? "is-done" : s === seg ? "is-on" : "";
        segs.push(h("i", { key: cur.id + s, className: state },
          h("b", {
            style: s === seg ? { animationDuration: (cur.video ? (cur.duration || 6) : 3.8) + "s", animationIterationCount: cur.video ? "infinite" : 1, animationPlayState: paused || still ? "paused" : "running" } : null,
            onAnimationEnd: s === seg ? onSegEnd : undefined
          })));
      }
      var curCase = cur.look === "case";
      var liveBtn = curCase && cur.live && props.onLive
        ? h("button", { key: "l", type: "button", className: "cpg-proto cpg-proto--ghost", onClick: function () { closeHome({ live: cur.live }); } }, "Open the live prototype", h(Icon, { name: "play", fill: true, size: 14 }))
        : null;
      /* Compact screens: the slide already shows the name, tags and metric, so the panel keeps
         to the kicker and the buttons; More opens the write-up and facts */
      var panelKids = curCase ? [
        h("p", { key: "k", className: "cpg-panel-kicker" }, cur.label + " · " + (index + 1) + " of " + list.length),
        h("h3", { key: "t", className: L.compact ? "cr-visually-hidden" : "cpg-panel-title", id: "cpgStoryTitle" }, cur.title),
        L.compact && !more ? null : h("div", { key: "b", className: "cpg-panel-body" },
          h("p", null, cur.description || cur.summary),
          cur.facts && cur.facts.length ? h("dl", { className: "cpg-facts" }, cur.facts.map(function (f) {
            return h("div", { key: f[0] }, h("dt", null, f[0]), h("dd", null, f[1]));
          })) : null),
        L.compact ? h("button", { key: "m", type: "button", className: "cpg-more", "aria-expanded": more ? "true" : "false", onClick: function () { setMore(!more); } }, more ? "Less" : "More") : null,
        h("div", { key: "a", className: "cpg-panel-actions" },
          cur.href ? h("a", { className: "cpg-proto cpg-proto--primary", href: cur.href }, "Read case study", h(Icon, { name: "arrow", size: 16 })) : null,
          liveBtn,
          cur.prototype ? h("a", { className: "cpg-proto cpg-proto--ghost", href: cur.prototype, target: "_blank", rel: "noopener" }, "Open live prototype", h(Icon, { name: "open", size: 16 })) : null)
      ] : [
        h("p", { key: "k", className: "cpg-panel-kicker" }, cur.label + " · " + (index + 1) + " of " + list.length),
        h("h3", { key: "t", className: "cpg-panel-title", id: "cpgStoryTitle" }, cur.title),
        h("div", { key: "b", className: cx("cpg-panel-body", L.compact && !more && "is-clamped") },
          cur.description ? h("p", null, cur.description) : h("p", null, "A short motion study, no write-up yet."),
          cur.objective ? h(React.Fragment, null, h("h4", null, "Objective"), h("p", null, cur.objective)) : null,
          cur.tools && cur.tools.length ? h("ul", { className: "cpg-tools-list", "aria-label": "Tools" }, cur.tools.map(function (t) { return h("li", { key: t }, t); })) : null),
        L.compact ? h("button", { key: "m", type: "button", className: "cpg-more", "aria-expanded": more ? "true" : "false", onClick: function () { setMore(!more); } }, more ? "Less" : "More") : null,
        cur.prototype ? h("a", { key: "p", className: "cpg-proto", href: cur.prototype, target: "_blank", rel: "noopener" }, "Open live prototype", h(Icon, { name: "open", size: 16 })) : null
      ];
      /* Up/down: the right column on wider screens, the panel's top corner on phones (never over the media) */
      var navEl = h("div", { key: "nav", className: cx("cpg-nav", L.mobile && "cpg-nav--panel") },
        roundBtn({ icon: "up", label: "Previous project", onClick: function () { go(-1); }, disabled: index === 0 }),
        roundBtn({ icon: "down", label: "Next project", onClick: function () { go(1); }, disabled: index >= list.length - 1 }));
      if (L.mobile) panelKids.push(navEl);
      var third = curCase && cur.live && props.onLive
        ? { icon: "play", fill: true, label: "Open the " + cur.title + " live prototype", onClick: function () { closeHome({ live: cur.live }); }, className: "cpg-round--white" }
        : cur.prototype
        ? { icon: "share", label: "Open the " + cur.title + " live prototype", href: cur.prototype, external: true, className: "cpg-round--white" }
        : cur.id === "craft-mode"
          ? { icon: "home", label: "Back to Home", onClick: function () { closeHome(); }, className: "cpg-round--white" }
          : cur.video
            ? { icon: paused ? "play" : "pause", fill: paused, label: paused ? "Play video" : "Pause video", onClick: function () { setPaused(!paused); }, className: "cpg-round--white", pressed: paused ? "true" : "false" }
            : { icon: "chat", label: "Ask the assistant about " + cur.title, onClick: props.onAssistant, className: "cpg-round--white" };

      var actLeft = L.mobile ? null : L.left - 74;
      story = h("section", {
        className: cx("cpg-story", storyIn && "is-in", L.compact && "is-compact", L.mobile && "is-mobile"),
        ref: storyRef, "aria-roledescription": "story viewer", "aria-labelledby": "cpgStoryTitle",
        onWheel: onWheel, onTouchStart: onTouchStart, onTouchEnd: onTouchEnd
      },
        h("div", { className: "cpg-track", style: { transform: "translate3d(0," + (-index * L.pitch) + "px,0)" } },
          list.map(function (it, i) {
            if (Math.abs(i - index) > 1) return null;
            var current = i === index, next = i === index + 1;
            var style = { top: L.top + i * L.pitch, left: L.left, width: L.w, height: L.h, borderRadius: L.r };
            var media = h(SlideMedia, { item: it, L: L, active: current, peek: next, seg: current ? seg : 0, still: still || paused, videoRef: current ? storyVideo : undefined });
            if (current) {
              if (it.look === "case") return h("div", { key: it.id, className: "cpg-slide is-current is-case", style: style }, media);
              return h("div", { key: it.id, className: cx("cpg-slide is-current", it.video && "is-video"), style: style },
                media,
                h("span", { className: "cpg-slide-shade", "aria-hidden": "true" }),
                cur.frames > 1 ? h("button", { type: "button", className: "cpg-tap cpg-tap--prev", "aria-label": "Previous frame", disabled: seg === 0, onClick: function () { setSeg(Math.max(0, seg - 1)); } }) : null,
                cur.frames > 1 ? h("button", { type: "button", className: "cpg-tap cpg-tap--next", "aria-label": "Next frame", disabled: seg >= cur.frames - 1, onClick: function () { setSeg(Math.min(cur.frames - 1, seg + 1)); } }) : null,
                h("span", { className: "cpg-segs", role: "progressbar", "aria-label": "Frame", "aria-valuemin": 1, "aria-valuemax": cur.frames, "aria-valuenow": seg + 1 }, segs));
            }
            if (next) {
              return h("button", { key: it.id, type: "button", className: cx("cpg-slide cpg-slide--peek", it.look === "case" && "is-case"), style: style, "aria-label": "Next: " + it.title, onClick: function () { go(1); } }, media);
            }
            return h("div", { key: it.id, className: cx("cpg-slide", it.look === "case" && "is-case"), style: style, "aria-hidden": "true" }, media);
          })),
        h("div", { className: "cpg-actions", style: L.mobile ? null : { left: actLeft, top: L.top + 26 } },
          h("img", { className: "cpg-actions-av", src: FACE, alt: "Gaurav Avinash", decoding: "async" }),
          curCase
            ? roundBtn({ icon: "open", label: "Read the " + cur.title + " case study", href: cur.href })
            : roundBtn({ icon: "open", label: "Open " + (cur.video ? "video" : "image") + " in a new tab", href: cur.openSrc || cur.video || cur.image, external: true }),
          roundBtn(third)),
        h("div", {
          className: cx("cpg-panel", curCase && "is-case-panel"), key: "panel-" + cur.id,
          style: L.compact
            ? (L.mobile ? null : { left: L.left, width: L.w, top: L.top + L.h, "--pg-r": L.r + "px" })
            : { left: L.left + L.w + L.gap, width: L.panelW, top: L.top + L.h, maxHeight: Math.min(L.h, L.top + L.h - L.pipBottom) }
        }, panelKids),
        L.mobile ? null : navEl,
        L.mobile ? null : h("button", { type: "button", className: "cpg-pip", "aria-label": "Back to Home", title: "Back to Home", onClick: function () { closeHome(); } },
          h("span", { className: "cpg-pip-photo cr-wp-thumb craft-wp--" + (props.wallpaper || "fuji"), "aria-hidden": "true" }),
          h("span", { className: "cpg-pip-label", "aria-hidden": "true" }, h(Icon, { name: "home", size: 14 }), "Home")),
        h("p", { className: "cr-visually-hidden", "aria-live": "polite" }, cur.title + ", " + (index + 1) + " of " + list.length));
    }

    return h("div", {
      className: cx("cpg", up && "cpg--up", isStory && "is-story", closing && "is-closing"), ref: rootRef,
      role: "dialog", "aria-modal": "true", "aria-label": up ? "Design Playground" : "Projects", tabIndex: -1
    },
      h("div", { className: "cpg-gallery", ref: galleryRef },
        h("h2", { className: "cr-visually-hidden" }, up ? "Design Playground" : "Projects"),
        roundBtn({ icon: "back", label: isStory ? "Back to all " + tabInfo.plural : "Back to Home", className: "cpg-back", chrome: true, onClick: function () { if (isStory) closeStory(); else closeHome(); } }),
        up ? h("p", { className: "cpg-title", "data-cpg-chrome": "", inert: isStory ? "" : undefined }, "Design Playground") :
        h("div", { className: "cpg-tabs", role: "tablist", "aria-label": "Projects", "data-cpg-chrome": "", inert: isStory ? "" : undefined },
          h("span", { className: "cpg-tabs-pill", ref: pillRef, "aria-hidden": "true" }),
          TABS.map(function (t, i) {
            var on = t.id === tab;
            return h("button", {
              key: t.id, type: "button", role: "tab", id: "cpg-tab-" + t.id, className: "cpg-tab",
              "aria-selected": on ? "true" : "false", "aria-controls": "cpg-tabpanel", tabIndex: on ? 0 : -1,
              ref: function (n) { tabRefs.current[i] = n; },
              onClick: function () { switchTab(t.id); }, onKeyDown: function (ev) { onTabKey(ev, i); }
            }, t.label);
          })),
        h("div", { className: "cpg-ghosts", ref: ghostRef, "aria-hidden": "true" }),
        grid,
        story),
      h("button", { type: "button", className: "cpg-homebar", "aria-label": "Back to Home", title: "Back to Home", onClick: function () { closeHome(); }, tabIndex: isStory ? -1 : 0 },
        h("span", { className: "cr-visually-hidden" }, "Back to Home")));
  }


  /* ───────── Design Playground on the Home board ─────────
     The dashboard cards blur away and the explorations blur in, in the same spot, on the same wallpaper.
     Rows are justified so every project keeps its real aspect ratio. A card opens in a sheet. */
  function justify(list, W, gap, target) {
    var rows = [], row = [], sum = 0;
    list.forEach(function (it, i) {
      row.push(it); sum += it.ratio;
      var natural = sum * target + gap * (row.length - 1);
      if (natural >= W || i === list.length - 1) {
        var hgt = natural >= W ? (W - gap * (row.length - 1)) / sum : target;
        rows.push({ items: row, h: Math.floor(hgt) });
        row = []; sum = 0;
      }
    });
    /* A lone item on the last row looks stranded: pull it up into the row before */
    if (rows.length > 1 && rows[rows.length - 1].items.length === 1) {
      var last = rows.pop(), prev = rows[rows.length - 1], items = prev.items.concat(last.items);
      var sm = items.reduce(function (a, it) { return a + it.ratio; }, 0);
      rows[rows.length - 1] = { items: items, h: Math.floor((W - gap * (items.length - 1)) / sm) };
    }
    return rows;
  }

  /* Motion pieces sized from the real video, not the poster. Space Between is cropped to the design
     itself (the source frame is mostly empty canvas). */
  var BOARD_MEDIA = {
    "space-between": { src: DIR + "space-between-crop.mp4", poster: DIR + "space-between-crop.jpg", w: 572, h: 332 },
    "loading-range": { w: 1216, h: 664 }
  };
  function boardItem(it) {
    var vid = it.media && it.media.type === "video", bm = BOARD_MEDIA[it.id] || {};
    return Object.assign({}, it, {
      ratio: bm.w ? bm.w / bm.h : it.ratio,
      src: vid ? (bm.src || it.media.src) : null,
      still: vid ? (bm.poster || it.media.poster || it.image) : it.image,
      kindLabel: it.kind === "motion" ? "Motion" : it.kind === "prototype" ? "Prototype" : "Interface"
    });
  }

  function PlaygroundBoard(props) {
    var _i = useState(function () { return buildItems(null).map(boardItem); }), items = _i[0], setItems = _i[1];
    var _w = useState(0), W = _w[0], setW = _w[1];
    var _o = useState(null), open = _o[0], setOpen = _o[1];
    var rootRef = useRef(null), gridRef = useRef(null), sheetRef = useRef(null), leaving = useRef(false), opener = useRef(null);
    var still = reduced();

    useEffect(function () { preload().then(function (j) { if (j) setItems(buildItems(j).map(boardItem)); }); }, []);
    useLayoutEffect(function () {
      var el = gridRef.current; if (!el) return undefined;
      var on = function () { setW(el.clientWidth); };
      on();
      var ro = window.ResizeObserver ? new ResizeObserver(on) : null;
      if (ro) ro.observe(el); else window.addEventListener("resize", on);
      return function () { if (ro) ro.disconnect(); else window.removeEventListener("resize", on); };
    }, []);

    /* Arrive: each card comes out of a blur, leaning in from the board's centre */
    var arrived = useRef(false);
    useLayoutEffect(function () {
      if (arrived.current || !W || !gridRef.current) return;
      arrived.current = true;
      var box = gridRef.current.getBoundingClientRect(), cx0 = box.left + box.width / 2, cy0 = box.top + box.height / 2;
      Array.prototype.slice.call(gridRef.current.querySelectorAll(".cpb-card")).forEach(function (el, i) {
        if (still) { el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: i * 20, fill: "backwards" }); return; }
        var r = el.getBoundingClientRect(), dx = (r.left + r.width / 2 - cx0) * 0.18, dy = (r.top + r.height / 2 - cy0) * 0.18;
        el.animate([
          { opacity: 0, filter: "blur(16px)", transform: "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0) scale(0.86)" },
          { opacity: 1, offset: 0.5 },
          { opacity: 1, filter: "blur(0px)", transform: "none" }
        ], { duration: 680, delay: 170 + i * 45, easing: EASE, fill: "backwards" });
      });
      var head = rootRef.current && rootRef.current.querySelector(".cpb-head");
      if (head) head.animate([{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }], { duration: 460, delay: 140, easing: EASE, fill: "backwards" });
      if (props.startId) {
        var hit = items.filter(function (x) { return x.id === props.startId; })[0];
        if (hit) setTimeout(function () { setOpen(hit.id); }, still ? 0 : 520);
      }
      var back = rootRef.current && rootRef.current.querySelector(".cpb-back");
      if (back) back.focus({ preventScroll: true });
    }, [W]);

    /* Leave: the cards blur away, then Home brings its own cards back */
    var close = useCallback(function () {
      if (leaving.current) return;
      leaving.current = true;
      if (props.onClosing) props.onClosing();
      var cards = rootRef.current ? Array.prototype.slice.call(rootRef.current.querySelectorAll(".cpb-card, .cpb-head")) : [];
      if (still || !cards.length) { props.onClose(); return; }
      var anims = cards.map(function (el, i) {
        return el.animate([{ opacity: 1, filter: "blur(0px)", transform: "none" }, { opacity: 0, filter: "blur(14px)", transform: "scale(0.9)" }],
          { duration: 300, delay: i * 18, easing: EASE_IN, fill: "forwards" }).finished;
      });
      Promise.all(anims).then(props.onClose, props.onClose);
    }, [props.onClose]);

    var idx = items.findIndex(function (x) { return x.id === open; });
    var cur = idx >= 0 ? items[idx] : null;
    function step(d) { if (!cur) return; setOpen(items[(idx + d + items.length) % items.length].id); }
    function closeSheet() {
      var sh = sheetRef.current;
      var done = function () { setOpen(null); var o = opener.current; if (o && o.isConnected) o.focus({ preventScroll: true }); };
      if (!sh || still) { done(); return; }
      sh.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.96)" }], { duration: 220, easing: EASE_IN, fill: "forwards" }).finished.then(done, done);
    }
    useEffect(function () {
      var fn = function (ev) {
        if (ev.key === "Escape") { ev.preventDefault(); if (cur) closeSheet(); else close(); }
        else if (cur && ev.key === "ArrowRight") step(1);
        else if (cur && ev.key === "ArrowLeft") step(-1);
      };
      document.addEventListener("keydown", fn);
      return function () { document.removeEventListener("keydown", fn); };
    });
    useLayoutEffect(function () {
      var sh = sheetRef.current; if (!sh || !cur) return;
      var from = opener.current && opener.current.isConnected ? opener.current.getBoundingClientRect() : null, r = sh.getBoundingClientRect();
      if (still || !from) { sh.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180 }); return; }
      var k = r.width / sh.offsetWidth || 1;
      sh.animate([
        { clipPath: "inset(" + ((from.top - r.top) / k) + "px " + ((r.right - from.right) / k) + "px " + ((r.bottom - from.bottom) / k) + "px " + ((from.left - r.left) / k) + "px round 22px)", opacity: 0.6 },
        { clipPath: "inset(0px 0px 0px 0px round 28px)", opacity: 1 }
      ], { duration: 560, easing: EASE });
    }, [open && !!cur]);

    var gap = W < 520 ? 12 : 16, target = W < 520 ? 120 : W < 760 ? 150 : 168;
    var rows = W ? justify(items, W, gap, target) : [];

    var media = function (it, big) {
      if (it.src) return h("video", { className: "cpb-media", src: it.src, poster: it.still, muted: true, loop: true, playsInline: true, autoPlay: !still, preload: big ? "auto" : "metadata", "aria-hidden": big ? undefined : "true", "aria-label": big ? it.title + ", silent loop" : undefined });
      return h("img", { className: "cpb-media", src: it.still, alt: big ? it.alt : "", decoding: "async", draggable: false });
    };

    var sheet = null;
    if (cur) {
      var desc = cur.description || (cur.kind === "motion" ? "A short motion study, no write-up yet." : "");
      sheet = h("section", { className: "cr-sheet cpb-sheet", ref: sheetRef, role: "dialog", "aria-modal": "true", "aria-label": cur.title, key: "sheet" },
        h("div", { className: "cpb-sheet-media", style: { "--r": cur.ratio } }, media(cur, true)),
        h("div", { className: "cpb-sheet-body" },
          h("div", { className: "cpb-sheet-top" },
            h("span", { className: "cr-chip" }, cur.kindLabel + " · " + (idx + 1) + " of " + items.length),
            h("button", { type: "button", className: "cr-iconbtn cr-iconbtn--solid", "aria-label": "Close " + cur.title, onClick: closeSheet }, h(Icon, { name: "close", size: 18 }))),
          h("p", { className: "cr-sheet-title" }, cur.title),
          desc ? h("p", { className: "cr-t-body" }, desc) : null,
          cur.tools && cur.tools.length ? h("ul", { className: "cpb-tools", "aria-label": "Tools" }, cur.tools.map(function (t) { return h("li", { key: t, className: "cr-chip" }, t); })) : null,
          h("div", { className: "cpb-sheet-foot" },
            cur.prototype ? h("a", { className: "cr-chip cpb-cta", href: cur.prototype, target: "_blank", rel: "noopener" }, "Open live prototype", h(Icon, { name: "open", size: 15 })) : h("span"),
            h("span", { className: "cpb-steps" },
              h("button", { type: "button", className: "cr-iconbtn cr-iconbtn--solid", "aria-label": "Previous project", onClick: function () { step(-1); } }, h(Icon, { name: "back", size: 18 })),
              h("button", { type: "button", className: "cr-iconbtn cr-iconbtn--solid cpb-next", "aria-label": "Next project", onClick: function () { step(1); } }, h(Icon, { name: "back", size: 18 }))))));
    }

    return h("div", { className: cx("cpb", cur && "has-sheet"), ref: rootRef, role: "region", "aria-label": "Design Playground" },
      h("div", { className: "cpb-head", inert: cur ? "" : undefined },
        h("button", { type: "button", className: "cr-chip cr-glass-light cpb-back", onClick: close, "aria-label": "Back to Home" }, h(Icon, { name: "back", size: 16, stroke: 2 }), "Home"),
        h("h2", { className: "cr-chip cr-glass-light cpb-title" }, "Design Playground")),
      h("div", { className: "cpb-grid", ref: gridRef, inert: cur ? "" : undefined },
        rows.map(function (row, ri) {
          return h("div", { key: ri, className: "cpb-row", style: { gap: gap + "px" } }, row.items.map(function (it) {
            return h("button", {
              key: it.id, type: "button", className: "cr-card cr-solid cpb-card", style: { width: Math.round(it.ratio * row.h) + "px" },
              "aria-label": it.title + ", " + it.kindLabel + ". Open",
              onClick: function (ev) { opener.current = ev.currentTarget; setOpen(it.id); }
            },
              h("span", { className: "cpb-frame", style: { height: row.h + "px" } }, media(it, false)),
              h("span", { className: "cpb-cap" }, h("b", null, it.title), h("span", null, it.kindLabel)));
          }));
        })),
      cur ? h("div", { className: "cpb-scrim", onClick: closeSheet, "aria-hidden": "true" }) : null,
      sheet);
  }

  window.CraftPlayground = { PlaygroundBoard: PlaygroundBoard, PlaygroundCard: PlaygroundCard, PlaygroundView: PlaygroundView, preload: preload, items: function () { return buildItems(null); } };
})();
