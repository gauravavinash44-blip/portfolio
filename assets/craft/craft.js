/* @ds-bundle: {"format":4,"namespace":"Craft","components":[{"name":"Stage"},{"name":"TopBar"},{"name":"NotificationPill"},{"name":"SegmentedControl"},{"name":"IconButton"},{"name":"Chip"},{"name":"Toggle"},{"name":"AgendaCard"},{"name":"FolderListCard"},{"name":"DropZoneCard"},{"name":"PreviewCard"},{"name":"CursorChip"},{"name":"ProfileOrb"},{"name":"StatCard"},{"name":"AvatarStack"},{"name":"Dock"},{"name":"MetaStrip"},{"name":"HeroBoard"},{"name":"FolderOpen"},{"name":"ProfileOpen"},{"name":"AllWorkSheet"},{"name":"ProjectWell"},{"name":"NowPlayingPill"},{"name":"ResonanceSheet"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useLayoutEffect = React.useLayoutEffect;

  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }
  function reduced() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function token(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue("--" + name).trim();
    return v || fallback;
  }
  var EASE_ARRIVE = "cubic-bezier(0.16, 1, 0.3, 1)";
  var EASE_LEAVE = "cubic-bezier(0.7, 0, 0.84, 0)";
  var EASE_POP = "cubic-bezier(0.34, 1.56, 0.64, 1)";

  /* ───────── Icons (1.5px line, round caps) ───────── */
  var ICONS = {
    search: "M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-3.5-3.5",
    lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
    unlock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 6.8-1.2",
    plus: "M12 5v14M5 12h14",
    close: "M6.5 6.5l11 11M17.5 6.5l-11 11",
    chevron: "M9 6l6 6-6 6",
    pen: "M4 20l4-1 10-10-3-3L5 16zM13.5 6.5l3 3",
    folder: "M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z",
    mail: "M4 6.5h16v11H4zM4.5 7l7.5 6 7.5-6",
    chat: "M5 5.5h14v10H10l-4 3v-3H5z",
    download: "M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14",
    arrow: "M7 17L17 7M9 7h8v8",
    grid: "M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z",
    image: "M4 5.5h16v13H4zM4 15l4.5-4.5 4 4 2.5-2.5 5 5M15.5 9.5a1.2 1.2 0 1 0 0-.01",
    camera: "M3.5 7.5h11v9h-11zM14.5 10.5l5-2.5v8l-5-2.5",
    /* Project icons (same 1.5px line) */
    chatSpark: "M13 4.5H6.5A2.5 2.5 0 0 0 4 7v7a2.5 2.5 0 0 0 2.5 2.5H8V20l4.2-3.5h5.3A2.5 2.5 0 0 0 20 14v-3M18 2.8l.85 2.05 2.05.85-2.05.85L18 8.6l-.85-2.05-2.05-.85 2.05-.85zM8 10.5h6",
    dealDoc: "M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5zM14 3.5v5h5M8.8 14.2l2.2 2.2 4.2-4.4",
    swatch: "M4.5 4.5h5v12.5a2.5 2.5 0 0 1-5 0zM9.5 8.4l3.4-3.4 3.6 3.6-7 7M11.8 19.5h7.7v-5h-4.6M7 17h.01",
    bowl: "M3.5 11.5h17a8.5 6.5 0 0 1-17 0zM9 20.5h6M9 8.5c0-1.4 1-1.6 1-3M12.5 8.5c0-1.4 1-1.6 1-3M16 8.5c0-1.4 1-1.6 1-3",
    wave: "M4 10.5v3M8 7.5v9M12 4.5v15M16 8.5v7M20 10.5v3",
    plane: "M20.5 3.5L3.5 10.5l7 3 3 7zM10.5 13.5l10-10",
    gauge: "M4.5 16.5a7.5 7.5 0 1 1 15 0M12 16.5l3.4-4.4M7 20h10",
    swap: "M6.5 7.5h12M15 4l3.5 3.5L15 11M17.5 16.5h-12M9 13l-3.5 3.5L9 20",
    receipt: "M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3zM9 8h6M9 11.5h6M9 15h3",
    card: "M3.5 6.5h17v11h-17zM3.5 10h17M7 14.5h3",
    orbits: "M4 12a5 5 0 1 0 10 0 5 5 0 1 0-10 0zM10 12a5 5 0 1 0 10 0 5 5 0 1 0-10 0z",
    loader: "M12 4a8 8 0 1 1-7.6 5.5M12 8.5v3.5l2.5 1.5",
    layers: "M12 4l8.5 4.5L12 13 3.5 8.5zM3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5"
  };
  function Icon(props) {
    if (props.name === "dropper") {
      /* Filled dropper with sparkle dots, as on the reference's edit button */
      return h("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", className: props.className },
        h("rect", { x: 9.2, y: 2.6, width: 5.6, height: 17, rx: 2.8, transform: "rotate(45 12 11.1)", fill: "currentColor" }),
        h("circle", { cx: 18.6, cy: 15.4, r: 1.1, fill: "currentColor" }),
        h("circle", { cx: 20.6, cy: 13.2, r: 0.9, fill: "currentColor" }),
        h("circle", { cx: 20.4, cy: 17.4, r: 0.8, fill: "currentColor" }));
    }
    return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: props.stroke || 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false", className: props.className },
      h("path", { d: ICONS[props.name] || "" }));
  }

  /* ───────── Backdrop: painted dusk landscape ───────── */
  function WallpaperLayers(props) {
    var _s = useState([props.wallpaper]), layers = _s[0], setLayers = _s[1];
    useEffect(function () {
      setLayers(function (prev) {
        if (prev[prev.length - 1] === props.wallpaper) return prev;
        return prev.slice(-1).concat([props.wallpaper]);
      });
    }, [props.wallpaper]);
    return h("div", { className: "cr-backdrop cr-backdrop--photo", "aria-hidden": "true" },
      layers.map(function (id, i) {
        var last = i === layers.length - 1;
        return h("div", {
          key: id, className: "cr-wp craft-wp--" + id + (last && layers.length > 1 ? " is-entering" : ""),
          onAnimationEnd: last ? function () { setLayers([id]); } : undefined
        }, h("div", { className: "cr-wp-blur" }), h("div", { className: "cr-wp-photo" }));
      }),
      h("div", { className: "cr-backdrop-veil" }));
  }

  function Backdrop(props) {
    if (props && props.wallpaper) return h(WallpaperLayers, { wallpaper: props.wallpaper });
    return h("div", { className: "cr-backdrop", "aria-hidden": "true" },
      h("svg", { viewBox: "0 0 1600 1000", preserveAspectRatio: "xMidYMid slice" },
        h("defs", null,
          h("linearGradient", { id: "crSky", x1: 0, y1: 0, x2: 0, y2: 1 },
            h("stop", { offset: "0", stopColor: "#b0a8c2" }),
            h("stop", { offset: "0.22", stopColor: "#cabdcc" }),
            h("stop", { offset: "0.55", stopColor: "#e8e1e1" }),
            h("stop", { offset: "0.8", stopColor: "#e2dae0" }),
            h("stop", { offset: "1", stopColor: "#d6cfd9" })),
          h("radialGradient", { id: "crGlow", cx: 0.42, cy: 0.62, r: 0.5 },
            h("stop", { offset: "0", stopColor: "#f6e6df", stopOpacity: 0.9 }),
            h("stop", { offset: "1", stopColor: "#f6e6df", stopOpacity: 0 })),
          h("linearGradient", { id: "crRock", x1: 0, y1: 0, x2: 0, y2: 1 },
            h("stop", { offset: "0", stopColor: "#c8a99a" }),
            h("stop", { offset: "1", stopColor: "#8e7268" })),
          h("filter", { id: "crB1" }, h("feGaussianBlur", { stdDeviation: 10 })),
          h("filter", { id: "crB2" }, h("feGaussianBlur", { stdDeviation: 4 })),
          h("filter", { id: "crB3" }, h("feGaussianBlur", { stdDeviation: 1.4 })),
          h("filter", { id: "crGrain" },
            h("feTurbulence", { type: "fractalNoise", baseFrequency: 0.85, numOctaves: 2, stitchTiles: "stitch" }),
            h("feColorMatrix", { values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" }))),
        h("rect", { width: 1600, height: 1000, fill: "url(#crSky)" }),
        h("rect", { width: 1600, height: 1000, fill: "url(#crGlow)" }),
        /* soft distant hills */
        h("path", { filter: "url(#crB1)", fill: "#cdbfcf", opacity: 0.8, d: "M0 760 C200 720 380 700 560 724 C760 750 920 712 1100 718 C1300 724 1460 740 1600 732 L1600 1000 L0 1000Z" }),
        /* sandstone rock, bottom centre-left */
        h("path", { filter: "url(#crB2)", fill: "url(#crRock)", opacity: 0.9, d: "M520 1000 C540 930 600 880 690 868 C780 856 860 884 900 930 C920 955 930 980 932 1000Z" }),
        /* grass blades */
        h("g", { filter: "url(#crB3)", stroke: "#b49b7a", strokeWidth: 3, strokeLinecap: "round", fill: "none", opacity: 0.75 },
          h("path", { d: "M80 1000 C90 950 70 920 60 890M120 1000 C128 940 150 910 170 880M160 1000 C150 960 120 930 110 905M240 1000 C250 950 280 925 300 900M1180 1000 C1190 950 1170 915 1150 890M1240 1000 C1250 940 1280 915 1300 885M1320 1000 C1310 955 1290 930 1275 900M1420 1000 C1430 950 1460 920 1490 900M1500 1000 C1495 960 1470 935 1455 910" })),
        h("g", { filter: "url(#crB2)", stroke: "#c9b493", strokeWidth: 6, strokeLinecap: "round", fill: "none", opacity: 0.55 },
          h("path", { d: "M30 1000 C40 930 20 890 0 860M330 1000 C345 930 380 900 410 870M1080 1000 C1070 930 1040 900 1010 875M1560 1000 C1570 930 1600 900 1630 880" })),
        h("rect", { width: 1600, height: 1000, filter: "url(#crGrain)" })),
      h("div", { className: "cr-backdrop-veil" }));
  }

  function Stage(props) {
    var style = Object.assign({ width: props.width || "100%", height: props.height || 400 }, props.style || {});
    return h("div", { className: cx("cr", "cr-stage", props.className), style: style, ref: props.stageRef, onClick: props.onClick },
      h(Backdrop, { wallpaper: props.wallpaper }), props.children);
  }

  /* ───────── Primitives ───────── */
  function Avatar(props) {
    var s = props.size || 44;
    return h("img", { className: cx("cr-avatar", props.ring && "cr-avatar--ring"), src: props.src, alt: props.alt || "", width: s, height: s, style: { width: s, height: s }, decoding: "async" });
  }

  function IconButton(props) {
    var v = props.variant || "well";
    var mat = v === "glass" ? "cr-glass-light" : "";
    return h("button", { type: "button", className: cx("cr-iconbtn", "cr-iconbtn--" + v, mat, props.className), "aria-label": props.label, title: props.label, onClick: props.onClick },
      h(Icon, { name: props.icon }));
  }

  function Chip(props) {
    var v = props.variant || "solid";
    return h("span", { className: cx("cr-chip", v !== "solid" && "cr-chip--" + v, props.className) },
      props.children,
      props.live ? h("i", { className: "cr-live", "aria-hidden": "true" }) : null);
  }

  function Toggle(props) {
    var _s = useState(!!props.defaultChecked), on = _s[0], setOn = _s[1];
    var checked = props.checked != null ? props.checked : on;
    return h("label", { className: "cr-toggle" },
      h("input", { type: "checkbox", role: "switch", checked: checked, "aria-label": props.label || "Toggle",
        onChange: function (ev) { setOn(ev.target.checked); if (props.onChange) props.onChange(ev.target.checked); } }),
      h("span", { className: "cr-toggle-track", "aria-hidden": "true" },
        h(Icon, { name: "unlock", stroke: 2 }),
        h("span", { className: "cr-toggle-knob" })));
  }

  function SegmentedControl(props) {
    var items = props.items || [];
    var _s = useState(props.value != null ? props.value : 0), idx = _s[0], setIdx = _s[1];
    var refs = useRef([]);
    useEffect(function () { if (props.value != null) setIdx(props.value); }, [props.value]);
    var _p = useState({ x: 0, w: 0 }), pill = _p[0], setPill = _p[1];
    useLayoutEffect(function () {
      var el = refs.current[idx];
      if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth });
    }, [idx, items.length]);
    return h("div", { className: "cr-seg cr-glass-light", role: "tablist", "aria-label": props.label || "View" },
      h("span", { className: "cr-seg-pill", "aria-hidden": "true", style: { width: pill.w, transform: "translateX(" + pill.x + "px)" } }),
      items.map(function (it, i) {
        return h("button", { key: it, type: "button", role: "tab", "aria-selected": i === idx ? "true" : "false",
          ref: function (n) { refs.current[i] = n; },
          onClick: function (ev) { setIdx(i); if (props.onChange) props.onChange(i, it, ev); } }, it);
      }));
  }

  function useClock(timeZone) {
    function now() {
      try { return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: timeZone || "Asia/Kolkata" }).format(new Date()); }
      catch (e) { return "09:30"; }
    }
    var _s = useState(now), t = _s[0], set = _s[1];
    useEffect(function () { var id = setInterval(function () { set(now()); }, 15000); return function () { clearInterval(id); }; }, []);
    return t;
  }

  function NotificationPill(props) {
    var secs = props.seconds || 12;
    var r = 21, c = 2 * Math.PI * r;
    var _s = useState(true), open = _s[0], setOpen = _s[1];
    if (!open) return null;
    return h("div", { className: "cr-notice", role: "status", "data-cr-enter": props.enter ? "" : undefined },
      h("span", { className: "cr-notice-bar", "aria-hidden": "true" }, h("i"), h("i")),
      props.avatar ? h(Avatar, { src: props.avatar, size: 36 }) : null,
      h("span", { className: "cr-notice-text" }, h("b", null, props.title), h("span", null, props.subtitle)),
      props.meta ? (props.href ? h("a", { className: "cr-chip cr-chip--sub", href: props.href }, props.meta) : h(Chip, { variant: "sub" }, props.meta)) : null,
      h("button", { type: "button", className: "cr-notice-close", "aria-label": "Dismiss", onClick: function () { setOpen(false); if (props.onClose) props.onClose(); } },
        h("svg", { className: "cr-ring", viewBox: "0 0 44 44", "aria-hidden": "true" },
          h("circle", { cx: 22, cy: 22, r: r, strokeDasharray: c, strokeDashoffset: 0,
            style: reduced() ? null : { animation: "crRing " + secs + "s linear infinite" } })),
        h(Icon, { name: "close", className: "cr-x", stroke: 1.8 })),
      h("style", null, "@keyframes crRing{from{stroke-dashoffset:0}to{stroke-dashoffset:" + c.toFixed(1) + "}}"));
  }

  function TopBar(props) {
    var time = useClock(props.timeZone);
    return h("div", { className: "cr-topbar" },
      h("div", { className: "cr-topbar-left", "data-cr-enter": "" },
        props.avatar ? h("span", { className: "cr-brandorb" }, h("img", { src: props.avatar, alt: "" })) : null,
        h("span", { className: "cr-clock" }, props.time || time),
        h("span", { className: "cr-topbar-id" }, h("span", null, props.title), h("span", null, props.subtitle))),
      h("div", { "data-cr-enter": "" }, props.notice ? h(NotificationPill, props.notice) : null),
      h("div", { className: "cr-topbar-right", "data-cr-enter": "" },
        h(SegmentedControl, { items: props.tabs || ["Home", "Projects"], value: props.tab || 0, onChange: props.onTab, label: props.tabsLabel || "Home or projects" }),
        h(IconButton, { variant: "glass", icon: "search", label: props.searchLabel || "Search", onClick: props.onSearch })));
  }

  /* ───────── Widget cards ───────── */
  function AgendaCard(props) {
    return h("article", { className: cx("cr-card cr-glass cr-agenda", props.className), "data-cr-enter": "", "aria-label": props.label },
      h("div", { className: "cr-agenda-top" },
        h("span", { className: "cr-agenda-meta" }, props.meta),
        props.avatar ? h(Avatar, { src: props.avatar, size: 48 }) : null),
      h("div", { className: "cr-agenda-body" }, h("p", null, props.day), h("p", null, props.time)),
      h("p", { className: "cr-agenda-label" }, props.label));
  }

  function FolderRow(props) {
    var r = props.row;
    var linkLabel = "Open " + r.title + " case study";
    return h("li", { className: "cr-row", draggable: props.draggable ? "true" : undefined,
      onDragStart: props.draggable ? function (ev) { ev.dataTransfer.setData("text/plain", r.title); } : undefined },
      h("span", { className: "cr-row-av" },
        r.icon ? h(ProjectWell, { icon: r.icon, tone: r.tone }) : h("img", { className: "cr-row-thumb", src: r.thumb, alt: "" }),
        r.badge ? h("i", { className: "cr-row-badge", "aria-hidden": "true" }, h("b"), h("b"), h("b")) : null),
      h("button", { type: "button", className: "cr-row-text", "aria-label": props.openLabel ? props.openLabel(r) : undefined, onClick: function (ev) { if (props.onOpen) props.onOpen(r, ev); } },
        h("b", null, r.title), h("span", null, r.sub)),
      r.locked
        ? h(IconButton, { icon: "lock", label: r.title + " is under NDA" })
        : r.href && r.pill
          /* Link drawn as the reference's "on" toggle: blue track, glyph left, knob right */
          ? h("a", { className: "cr-row-pill", href: r.href, "aria-label": linkLabel, title: "Open case study" },
              h(Icon, { name: "arrow", stroke: 2 }), h("span", { className: "cr-row-pill-knob" }))
          : r.href
            ? h("a", { className: "cr-iconbtn cr-iconbtn--well", href: r.href, "aria-label": linkLabel, title: "Open case study" }, h(Icon, { name: "arrow" }))
            : h(Toggle, { defaultChecked: r.open !== false, label: "Show " + r.title }));
  }

  function FolderListCard(props) {
    return h("section", { className: cx("cr-card cr-solid cr-list", props.className), "data-cr-enter": "", "aria-label": props.title },
      h("header", { className: "cr-list-head" },
        h("h3", { className: "cr-t-title" }, props.title),
        props.onAll
          ? h("button", { type: "button", className: "cr-chip cr-chip--outline cr-chip--btn", "aria-label": props.allLabel || ("View " + props.count), "aria-haspopup": "dialog", onClick: props.onAll }, props.count)
          : h(Chip, { variant: "outline" }, props.count)),
      h("ul", null, (props.rows || []).slice(0, 3).map(function (r) {
        return h(FolderRow, { key: r.title, row: r, onOpen: props.onOpen, openLabel: props.openLabel, draggable: props.draggable });
      })));
  }

  function DropZoneCard(props) {
    var _s = useState(false), over = _s[0], setOver = _s[1];
    return h("button", { type: "button", className: cx("cr-card cr-glass cr-drop", over && "is-over", props.className), "data-cr-enter": "",
      onClick: props.onClick,
      onDragOver: function (ev) { ev.preventDefault(); setOver(true); },
      onDragLeave: function () { setOver(false); },
      onDrop: function (ev) { ev.preventDefault(); setOver(false); if (props.onDrop) props.onDrop(ev.dataTransfer.getData("text/plain")); } },
      h("span", { className: "cr-drop-inner" },
        h(Icon, { name: "plus", className: "cr-drop-plus", stroke: 1.2 }),
        h("span", { className: "cr-drop-title" }, props.title),
        h("span", { className: "cr-drop-hint" }, props.hint)));
  }

  function CursorChip(props) {
    var style = Object.assign({ left: props.x, top: props.y }, props.style || {});
    if (props.wander && !reduced()) style.animation = "crWander" + (props.wander) + " " + (props.speed || 7) + "s ease-in-out infinite alternate";
    return h("span", { className: "cr-cursor", style: style, "aria-hidden": "true" },
      h("svg", { viewBox: "0 0 16 16" }, h("path", { d: "M2 1.5l11 5.2-4.6 1.4-1.9 4.6z", fill: props.color, strokeLinejoin: "round" })),
      h("span", { className: "cr-cursor-av", style: { boxShadow: "0 0 0 2px " + props.color } },
        props.avatar ? h("img", { src: props.avatar, alt: "" }) : h("span", { style: { color: props.color } }, (props.name || "?").charAt(0))),
      h("span", { className: "cr-cursor-tag", style: { background: props.color } }, props.name));
  }

  function PreviewCard(props) {
    return h("article", { className: cx("cr-card cr-solid cr-preview", props.className), "data-cr-enter": "" },
      h("div", { className: "cr-preview-chips" },
        h(Chip, { variant: "label" }, props.label || "Live preview"),
        props.timer ? h(Chip, { variant: "timer", live: true }, props.timer) : null),
      h(props.href ? "a" : "div", { className: cx("cr-preview-shot", props.slides && "cr-preview-shot--strip"), href: props.href, "aria-label": props.href ? "Open " + props.title + " case study" : undefined },
        props.slides
          /* Three-slide strip like the reference: partial left, main, partial right, tiny labels above */
          ? h("span", { className: "cr-strip", "aria-hidden": "true" },
              props.slides.map(function (sl, i) {
                return h("span", { key: i, className: "cr-strip-slide cr-strip-slide--" + ["left", "main", "right"][i] },
                  sl.label ? h("span", { className: "cr-strip-label" }, sl.label) : null,
                  h("img", { src: sl.image, alt: "" }));
              }))
          : h("img", { src: props.image, alt: props.alt || "" }),
        (props.cursors || []).map(function (c, i) { return h(CursorChip, Object.assign({ key: c.name, wander: (i % 2) + 1 }, c)); })),
      h("div", { className: "cr-preview-foot" + (props.avatar ? "" : " cr-preview-foot--noavatar") },
        props.avatar ? h(Avatar, { src: props.avatar, size: 50 }) : null,
        h("span", { className: "cr-row-text" }, h("b", null, props.title), h("span", null, props.subtitle)),
        props.count != null ? h(Chip, { variant: "count" }, String(props.count))
          : props.countIcon ? h("span", { className: "cr-chip cr-chip--count", "aria-hidden": "true" }, h(Icon, { name: props.countIcon })) : null),
      h("style", null, "@keyframes crWander1{0%{transform:translate(0,0)}50%{transform:translate(18px,-10px)}100%{transform:translate(-8px,12px)}}@keyframes crWander2{0%{transform:translate(0,0)}50%{transform:translate(-16px,8px)}100%{transform:translate(10px,-14px)}}"));
  }

  /* 3D head: one front view with a gentle 3D tilt toward the pointer; chrome droplets orbit on their own */
  function HeadOrb(props) {
    var head = props.head;
    var _p = useState(false), paused = _p[0], setPaused = _p[1];
    var tilt = useRef(null), back = useRef(null), front = useRef(null);
    function onMove(ev) {
      if (reduced() || !tilt.current) return;
      var r = ev.currentTarget.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
      tilt.current.style.transform = "rotateY(" + (x * 18).toFixed(2) + "deg) rotateX(" + (-y * 14).toFixed(2) + "deg) scale(1.03)";
      if (front.current) front.current.style.transform = "translate(" + (x * 10).toFixed(1) + "px," + (y * 8).toFixed(1) + "px)";
      if (back.current) back.current.style.transform = "translate(" + (-x * 8).toFixed(1) + "px," + (-y * 6).toFixed(1) + "px)";
    }
    function onLeave() {
      [tilt.current, front.current, back.current].forEach(function (n) { if (n) n.style.transform = ""; });
    }
    return h("div", { className: cx("cr-orb-slot cr-head-slot", paused && "is-paused", props.className), "data-cr-enter": "", "data-cr-orb": "" },
      h("button", {
        type: "button", className: "cr-orb cr-glass cr-head-orb",
        "aria-label": "Open profile of " + (props.name || ""),
        onMouseMove: onMove, onMouseLeave: onLeave, onClick: props.onOpen
      },
        h("span", { className: "cr-liquid cr-liquid--back", ref: back, "aria-hidden": "true" }, h("i"), h("i")),
        h("span", { className: "cr-head-stack", "aria-hidden": "true" },
          h("span", { className: "cr-head-tilt", ref: tilt },
            h("img", { className: "cr-head-frame is-on", src: head.front, srcSet: head.front2x ? head.front + " 1x, " + head.front2x + " 2x" : undefined, alt: "", draggable: false, decoding: "async" }))),
        h("span", { className: "cr-liquid cr-liquid--front", ref: front, "aria-hidden": "true" }, h("i"), h("i"), h("i"))),
      props.onEdit ? h("span", { className: "cr-orb-edit" }, h(IconButton, { variant: "solid", icon: props.editIcon || "pen", label: props.editLabel || "Edit profile", onClick: props.onEdit })) : null,
      h("button", { type: "button", className: "cr-liquid-toggle", "aria-pressed": paused ? "true" : "false",
        "aria-label": paused ? "Resume the liquid animation" : "Pause the liquid animation", title: paused ? "Resume liquid" : "Pause liquid",
        onClick: function () { setPaused(!paused); } },
        paused
          ? h("svg", { viewBox: "0 0 24 24", width: 12, height: 12, "aria-hidden": "true" }, h("path", { d: "M8 5.5v13l11-6.5z", fill: "currentColor" }))
          : h("svg", { viewBox: "0 0 24 24", width: 12, height: 12, "aria-hidden": "true" }, h("rect", { x: 6, y: 5, width: 4, height: 14, rx: 1, fill: "currentColor" }), h("rect", { x: 14, y: 5, width: 4, height: 14, rx: 1, fill: "currentColor" }))));
  }

  function ProfileOrb(props) {
    if (props.head) return h(HeadOrb, props);
    var ref = useRef(null);
    function onMove(ev) {
      if (reduced() || !ref.current) return;
      var r = ref.current.getBoundingClientRect();
      var dx = (ev.clientX - r.left - r.width / 2) / r.width, dy = (ev.clientY - r.top - r.height / 2) / r.height;
      ref.current.style.transform = "perspective(800px) rotateY(" + (dx * 8).toFixed(2) + "deg) rotateX(" + (-dy * 8).toFixed(2) + "deg)";
    }
    function onLeave() { if (ref.current) ref.current.style.transform = ""; }
    return h("div", { className: cx("cr-orb-slot", props.className), "data-cr-enter": "", "data-cr-orb": "" },
      h("button", { type: "button", className: "cr-orb cr-glass", ref: ref, onMouseMove: onMove, onMouseLeave: onLeave,
        onClick: props.onOpen, "aria-label": "Open profile of " + (props.name || "") },
        props.cutout
          ? h("span", { className: "cr-orb-figure" }, h("img", { className: "cr-orb-avatar", src: props.image, alt: "", decoding: "async" }))
          : h("img", { className: "cr-orb-photo", src: props.image, alt: "" }),
        props.name ? h("span", { className: "cr-orb-name" }, props.name) : null),
      props.onEdit ? h("span", { className: "cr-orb-edit" }, h(IconButton, { variant: "solid", icon: props.editIcon || "pen", label: props.editLabel || "Edit profile", onClick: props.onEdit })) : null);
  }

  function useCountUp(to, decimals, run) {
    var _s = useState(run ? 0 : to), v = _s[0], set = _s[1];
    useEffect(function () {
      if (!run || reduced()) { set(to); return undefined; }
      var start = performance.now(), dur = 1400, raf;
      function tick(t) {
        var p = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - p, 4);
        set(to * e);
        if (p < 1) raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
      return function () { cancelAnimationFrame(raf); };
    }, [to, run]);
    return v.toFixed(decimals || 0);
  }

  function StatCard(props) {
    var segs = props.segments || [];
    var total = segs.reduce(function (a, s) { return a + s.value; }, 0) || 1;
    var val = useCountUp(props.value, props.decimals != null ? props.decimals : 1, props.animate !== false);
    var acc = 0;
    return h("section", { className: cx("cr-card cr-solid cr-stat", props.className), "data-cr-enter": "", "aria-label": props.title },
      h("header", { className: "cr-stat-head" },
        h("h3", { className: "cr-t-title" }, props.title),
        props.link ? h("a", { className: "cr-stat-link", href: props.href || "#", "aria-haspopup": props.onLink ? "dialog" : undefined, "aria-label": props.linkLabel, onClick: props.onLink ? function (ev) { ev.preventDefault(); props.onLink(ev); } : undefined }, props.link, h(Icon, { name: "chevron", stroke: 2 })) : null),
      h("p", { className: "cr-stat-value cr-t-xl" }, val, h("span", null, props.unit || "")),
      h("div", { className: "cr-stat-legs" },
        segs.map(function (s, i) {
          var left = (acc / total) * 100; acc += s.value;
          /* Captions step down 22px each, ticks run from under the caption to just above the bar */
          return h("span", { key: s.label, className: "cr-stat-leg", style: { left: left + "%", top: (i * 22) + "px" } },
            h("span", null, s.caption || ""), h("i", { className: "cr-stat-tick" }));
        })),
      h("div", { className: "cr-stat-bars", "aria-hidden": "true" },
        segs.map(function (s, i) {
          var anim = props.animate === false || reduced() ? null : { animation: "crBar 1.2s " + (0.3 + i * 0.12) + "s " + EASE_ARRIVE + " both" };
          return h("i", { key: s.label, style: Object.assign({ flex: s.value, background: s.color }, anim) });
        })),
      h("div", { className: "cr-stat-keys" },
        segs.map(function (s) { return h("span", { key: s.label }, h("i", { style: { background: s.color } }), s.label); })),
      h("style", null, "@keyframes crBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}"));
  }

  function AvatarStack(props) {
    return h("button", { type: "button", className: "cr-stack cr-glass-light", "aria-label": props.label || "Open playground", onClick: props.onClick, "data-cr-enter": "" },
      (props.images || []).slice(0, 4).map(function (src, i) { return h("img", { key: i, src: src, alt: "" }); }));
  }

  function Dock(props) {
    return h("div", { className: "cr-dock cr-glass-light", "data-cr-enter": "" },
      (props.actions || []).map(function (a) {
        return h(IconButton, { key: a.label, icon: a.icon, label: a.label, variant: a.accent ? "accent" : "ghost", onClick: a.onClick });
      }));
  }

  function MetaStrip(props) {
    return h("div", { className: "cr-meta", style: props.style },
      h("span", null, props.left), h("span", null, props.center), h("span", null, props.right));
  }

  /* ───────── Motion: entry from the camera, exit past it ───────── */
  function rankByDistance(root, nodes) {
    var rr = root.getBoundingClientRect();
    var ox = rr.left + rr.width / 2, oy = rr.top + rr.height * 0.3;
    return nodes.map(function (n) {
      var r = n.getBoundingClientRect();
      return { n: n, d: Math.hypot(r.left + r.width / 2 - ox, r.top + r.height / 2 - oy), r: r };
    }).sort(function (a, b) { return a.d - b.d; });
  }

  function enter(root, opts) {
    if (!root) return;
    opts = opts || {};
    var nodes = Array.prototype.slice.call(root.querySelectorAll("[data-cr-enter]"));
    var gap = opts.stagger || 70, wait = opts.delay || 0;
    if (reduced()) {
      nodes.forEach(function (n) { n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: "both" }); });
      return;
    }
    var rr = root.getBoundingClientRect();
    var ox = rr.left + rr.width / 2, oy = rr.top + rr.height * 0.45;
    rankByDistance(root, nodes).forEach(function (o, i) {
      var cx0 = o.r.left + o.r.width / 2, cy0 = o.r.top + o.r.height / 2;
      var dx = (cx0 - ox) * 0.6, dy = (cy0 - oy) * 0.6;
      o.n.animate([
        { opacity: 0, transform: "translate(" + dx + "px," + dy + "px) scale(2.4)", filter: "blur(14px)" },
        { opacity: 1, offset: 0.35 },
        { opacity: 1, transform: "translate(0,0) scale(1)", filter: "blur(0px)" }
      ], { duration: opts.duration || 1000, delay: wait + i * gap, easing: EASE_ARRIVE, fill: "both" });
    });
  }

  function exit(root, opts) {
    if (!root) return Promise.resolve();
    opts = opts || {};
    var nodes = Array.prototype.slice.call(root.querySelectorAll("[data-cr-enter]"));
    if (reduced()) return Promise.all(nodes.map(function (n) { return n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "both" }).finished; }));
    var rr = root.getBoundingClientRect();
    var ox = rr.left + rr.width / 2, oy = rr.top + rr.height * 0.45;
    var ranked = rankByDistance(root, nodes).reverse();
    return Promise.all(ranked.map(function (o, i) {
      var dx = (o.r.left + o.r.width / 2 - ox) * 0.9, dy = (o.r.top + o.r.height / 2 - oy) * 0.9;
      return o.n.animate([
        { opacity: 1, transform: "translate(0,0) scale(1)", filter: "blur(0px)" },
        { opacity: 0, transform: "translate(" + dx + "px," + dy + "px) scale(2.6)", filter: "blur(16px)" }
      ], { duration: opts.duration || 620, delay: i * 40, easing: EASE_LEAVE, fill: "both" }).finished;
    }));
  }

  /* Burst: items fly out of a source rect to their own rects, curved, staggered */
  function localScale(el) { var w = el.offsetWidth; return w ? el.getBoundingClientRect().width / w : 1; }

  function burst(sourceRect, items, opts) {
    opts = opts || {};
    items.forEach(function (el, i) {
      var r = el.getBoundingClientRect(), k = localScale(el) || 1;
      var dx = (sourceRect.left + sourceRect.width / 2 - (r.left + r.width / 2)) / k;
      var dy = (sourceRect.top + sourceRect.height / 2 - (r.top + r.height / 2)) / k;
      if (reduced()) { el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, delay: i * 20, fill: "both" }); return; }
      var rot = (i % 2 ? 1 : -1) * (8 + (i * 7) % 12);
      el.animate([
        { opacity: 0, transform: "translate(" + dx + "px," + dy + "px) scale(0.18) rotate(" + rot + "deg)" },
        { opacity: 1, transform: "translate(" + (dx * 0.35) + "px," + (dy * 0.35 - 40) + "px) scale(0.75) rotate(" + (rot / 2) + "deg)", offset: 0.45 },
        { opacity: 1, transform: "translate(0,0) scale(1) rotate(0deg)" }
      ], { duration: opts.duration || 760, delay: (opts.delay || 0) + i * (opts.stagger || 45), easing: EASE_ARRIVE, fill: "both" });
    });
  }

  /* FLIP-expand a sheet from a source rect (inside a stage) */
  function expandFrom(sheet, srcRect, stageRect, radius) {
    var r = sheet.getBoundingClientRect(), k = localScale(sheet) || 1;
    var sx = srcRect.width / r.width, sy = srcRect.height / r.height;
    var tx = (srcRect.left - r.left) / k, ty = (srcRect.top - r.top) / k;
    if (reduced()) return sheet.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: "both" });
    return sheet.animate([
      { transformOrigin: "0 0", transform: "translate(" + tx + "px," + ty + "px) scale(" + sx + "," + sy + ")", borderRadius: radius || "40px" },
      { transformOrigin: "0 0", transform: "translate(0,0) scale(1,1)", borderRadius: "48px" }
    ], { duration: 560, easing: EASE_ARRIVE, fill: "both" });
  }

  /* ───────── Compositions ───────── */
  var HERO_W = 1280, HERO_H = 860;

  function HeroBoard(props) {
    var d = props.data || {};
    var stageRef = useRef(null);
    var _k = useState(0), run = _k[0], setRun = _k[1];
    var _o = useState(null), sheet = _o[0], setSheet = _o[1];

    useEffect(function () { if (props.autoEnter !== false) enter(stageRef.current, { delay: 350 }); }, [run]);

    function replay() {
      exit(stageRef.current).then(function () { setSheet(null); setRun(run + 1); });
    }

    var grid = h("div", { className: cx("cr-grid", sheet && "cr-dimmed") },
      h("div", { className: "cr-dim" }, h(AgendaCard, d.agenda)),
      h("div", { className: "cr-dim" }, h(FolderListCard, Object.assign({}, d.folders, { draggable: true, onOpen: function (row) { setSheet({ kind: "folder", row: row, from: "list" }); } }))),
      h("div", { className: "cr-dim", "data-cr-drop": "" }, h(DropZoneCard, Object.assign({}, d.drop, { onDrop: function (title) {
        var row = (d.folders.rows || []).filter(function (r) { return r.title === title; })[0] || d.folders.rows[0];
        setSheet({ kind: "folder", row: row, from: "drop" });
      }, onClick: function () { setSheet({ kind: "folder", row: d.folders.rows[0], from: "drop" }); } }))),
      h("div", { className: "cr-dim" }, h(PreviewCard, d.preview)),
      h("div", { className: "cr-dim" }, h(ProfileOrb, Object.assign({}, d.profile, { onOpen: function () { setSheet({ kind: "profile" }); } }))),
      h("div", { className: "cr-dim" }, h(StatCard, Object.assign({ key: "s" + run }, d.stat))));

    return h(Stage, { width: props.width || HERO_W, height: props.height || HERO_H, stageRef: stageRef, className: props.className, key: "stage" + run },
      h(TopBar, d.topbar),
      grid,
      h("div", { className: "cr-corner cr-corner--left" }, h(AvatarStack, d.stack)),
      h("div", { className: "cr-corner cr-corner--right" }, h(Dock, d.dock)),
      sheet && sheet.kind === "folder" ? h(FolderSheet, { stageRef: stageRef, row: sheet.row, folder: d.folder, files: d.files, from: sheet.from, onClose: function () { setSheet(null); } }) : null,
      sheet && sheet.kind === "profile" ? h(ProfileSheet, Object.assign({ stageRef: stageRef, onClose: function () { setSheet(null); } }, d.profileSheet)) : null,
      props.replay !== false ? h("button", { type: "button", className: "cr-replay", onClick: replay }, "Replay entry") : null);
  }

  function useDialogFocus(ref) {
    useEffect(function () {
      var prev = document.activeElement;
      var t = setTimeout(function () {
        var btn = ref.current && ref.current.querySelector("button[aria-label^='Close']");
        if (btn) btn.focus({ preventScroll: true });
      }, 60);
      return function () {
        clearTimeout(t);
        if (prev && prev.isConnected && prev.focus) prev.focus({ preventScroll: true });
      };
    }, []);
  }

  function FolderSheet(props) {
    var ref = useRef(null);
    useDialogFocus(ref);
    useLayoutEffect(function () {
      var stage = props.stageRef.current, sheet = ref.current;
      if (!stage || !sheet) return;
      var src = stage.querySelector(props.from === "drop" ? "[data-cr-drop] .cr-card" : ".cr-list");
      var sr = (src || sheet).getBoundingClientRect();
      expandFrom(sheet, sr, stage.getBoundingClientRect());
      var items = Array.prototype.slice.call(sheet.querySelectorAll(".cr-file"));
      burst(sr, items, { delay: 180 });
      if (!reduced()) Array.prototype.slice.call(sheet.querySelectorAll(".cr-sheet-head > *")).forEach(function (n, i) {
        n.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: 260 + i * 60, easing: EASE_ARRIVE, fill: "both" });
      });
    }, []);
    function close() {
      var sheet = ref.current;
      if (!sheet || reduced()) { props.onClose(); return; }
      sheet.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.94)" }], { duration: 260, easing: EASE_LEAVE, fill: "both" }).finished.then(props.onClose);
    }
    var row = props.folder || props.row || {};
    return h("section", { className: "cr-sheet", ref: ref, role: "dialog", "aria-modal": "true", "aria-label": row.title,
      style: props.style || { left: 184, right: 184, top: 172, height: 600 } },
      h("header", { className: "cr-sheet-head" },
        h("div", null, h("p", { className: "cr-sheet-title" }, row.title), h("p", { className: "cr-sheet-sub" }, row.sub)),
        h(IconButton, { variant: "solid", icon: "close", label: "Close folder", onClick: close })),
      h("div", { className: "cr-sheet-grid" },
        (props.files || []).slice(0, 8).map(function (f) {
          return h("a", { key: f.title, className: "cr-file", href: f.href || "#",
            onClick: f.onClick ? function (ev) { ev.preventDefault(); f.onClick(); } : undefined },
            h("img", { src: f.image, alt: "" }),
            h("span", { className: "cr-file-cap" }, f.title, h("span", null, f.sub)));
        })));
  }

  /* Round icon well for a project: 1.5px line icon on a faint tint */
  function ProjectWell(props) {
    return h("span", { className: cx("cr-pwell", "cr-pwell--" + (props.tone || "plain"), props.className), "aria-hidden": "true" },
      h(Icon, { name: props.icon }));
  }

  /* ───────── All work: every case study and exploration in one liquid-glass sheet ─────────
     Grows out of the element that opened it (clip + translate, so nothing stretches),
     cards burst in, and it folds back into the same element on close. */
  var AW_FILTERS = [{ id: "all", label: "All" }, { id: "case", label: "Case studies" }, { id: "playground", label: "Playground" }];
  var AW_EASE_BACK = "cubic-bezier(0.5, 0, 0.75, 0)";

  function focusables(root) {
    return Array.prototype.slice.call(root.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"))
      .filter(function (n) { return n.offsetWidth || n.offsetHeight || n.getClientRects().length; });
  }

  /* Where the sheet starts and ends: the card around the opener (or the opener itself) */
  function sourceOf(el) {
    if (!el || !el.isConnected) return null;
    var host = (el.closest && (el.closest(".cr-card") || el.closest(".cr-seg"))) || el;
    var r = host.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    var rad = parseFloat(getComputedStyle(host).borderTopLeftRadius) || 24;
    var k = host.offsetWidth ? r.width / host.offsetWidth : 1;
    return { rect: r, radius: Math.min(rad * k, r.height / 2) };
  }

  /* Keyframe pair: the sheet clipped and moved onto the source rect, then fully open */
  function growFrames(sheet, src) {
    var r = sheet.getBoundingClientRect();
    var s = src.rect;
    var w = Math.min(s.width, r.width), hh = Math.min(s.height, r.height);
    /* keep the clip window inside the sheet, then translate so it lands on the source */
    var cl = Math.max(0, Math.min(s.left - r.left, r.width - w));
    var ct = Math.max(0, Math.min(s.top - r.top, r.height - hh));
    var tx = s.left - (r.left + cl), ty = s.top - (r.top + ct);
    var R = getComputedStyle(sheet).borderTopLeftRadius || "0px";
    var from = {
      clipPath: "inset(" + ct + "px " + (r.width - cl - w) + "px " + (r.height - ct - hh) + "px " + cl + "px round " + src.radius + "px)",
      transform: "translate(" + tx + "px," + ty + "px)"
    };
    var to = { clipPath: "inset(0px 0px 0px 0px round " + R + ")", transform: "translate(0px,0px)" };
    return [from, to];
  }

  function AllWorkCard(props) {
    var it = props.item;
    var metric = it.metric;
    var inner = [
      h("span", { key: "m", className: "cr-aw-media" + (it.contain ? " is-contain" : "") },
        it.video
          ? h("video", { src: it.video, poster: it.image, loop: true, playsInline: true, preload: "metadata", "aria-hidden": "true",
              ref: function (n) { if (!n) return; n.muted = true; if (!reduced() && n.paused) { var pr = n.play(); if (pr && pr.catch) pr.catch(function () {}); } } })
          : it.image ? h("img", { src: it.image, alt: "", loading: "lazy", decoding: "async" }) : null,
        it.badge ? h("span", { className: "cr-aw-badge" }, it.badge) : null),
      h("span", { key: "b", className: "cr-aw-body" },
        h("span", { className: "cr-aw-head" },
          h(ProjectWell, { icon: it.icon, tone: it.tone }),
          h("span", { className: "cr-aw-name" },
            h("b", null, it.title),
            h("span", null, it.summary))),
        h("span", { className: "cr-aw-foot" },
          metric
            ? h("span", { className: "cr-aw-metric" + (metric.word ? " is-word" : "") },
                h("b", null, metric.value), h("span", null, metric.label))
            : h("span", { className: "cr-aw-metric" }),
          h("span", { className: "cr-aw-tags" },
            it.domain ? h("span", { className: "cr-chip cr-chip--outline cr-aw-chip" }, it.domain) : null,
            it.year ? h("span", { className: "cr-chip cr-chip--outline cr-aw-chip" }, it.year) : null),
          h("span", { className: "cr-aw-go" }, h(Icon, { name: "arrow", stroke: 1.8 }))))
    ];
    var common = { className: "cr-aw-card", "data-aw-card": "", "aria-label": it.label || it.title };
    if (it.href) return h("a", Object.assign({ href: it.href }, common), inner);
    return h("button", Object.assign({ type: "button", onClick: function (ev) { props.onPick(it, ev); } }, common), inner);
  }

  function AllWorkSheet(props) {
    var ref = useRef(null), scrimRef = useRef(null), gridRef = useRef(null), tabRefs = useRef([]);
    var closing = useRef(false), first = useRef(true);
    var _f = useState(props.filter || "all"), filter = _f[0], setFilter = _f[1];
    var items = props.items || [];
    var list = items.filter(function (it) { return filter === "all" || it.group === filter; });
    var nCase = items.filter(function (it) { return it.group === "case"; }).length;
    var nPg = items.length - nCase;

    /* Open: scrim fades, sheet grows out of the source, header rises, cards burst */
    useLayoutEffect(function () {
      var sheet = ref.current;
      var root = document.documentElement;
      root.classList.add("ga-aw-open");
      var prev = props.opener || document.activeElement;
      var src = sourceOf(props.opener);
      var still = reduced();
      if (scrimRef.current) scrimRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: still ? 160 : 420, easing: "ease", fill: "backwards" });
      if (still || !src) {
        sheet.animate([{ opacity: 0, transform: still ? "none" : "scale(0.97)" }, { opacity: 1, transform: "none" }], { duration: still ? 160 : 420, easing: EASE_ARRIVE, fill: "backwards" });
      } else {
        sheet.animate(growFrames(sheet, src), { duration: 520, easing: EASE_ARRIVE, fill: "backwards" });
        Array.prototype.slice.call(sheet.querySelectorAll("[data-aw-chrome]")).forEach(function (n, i) {
          n.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 520, delay: 110 + i * 50, easing: EASE_ARRIVE, fill: "backwards" });
        });
      }
      var cards = Array.prototype.slice.call(sheet.querySelectorAll("[data-aw-card]"));
      burst(src ? src.rect : sheet.getBoundingClientRect(), cards.filter(function (c) { return inView(c, sheet); }), { delay: 200, stagger: 50, duration: 720 });
      var t = setTimeout(function () {
        var btn = sheet.querySelector(".cr-aw-close");
        if (btn) btn.focus({ preventScroll: true });
      }, 60);
      return function () {
        clearTimeout(t);
        root.classList.remove("ga-aw-open");
        if (prev && prev.isConnected && prev.focus) prev.focus({ preventScroll: true });
      };
    }, []);

    /* Filter change: the visible cards rise in, staggered */
    useLayoutEffect(function () {
      if (first.current) { first.current = false; return; }
      var sheet = ref.current, g = gridRef.current;
      if (!g) return;
      g.scrollTop = 0;
      var cards = Array.prototype.slice.call(g.querySelectorAll("[data-aw-card]")).filter(function (c) { return inView(c, sheet); });
      cards.forEach(function (c, i) {
        if (reduced()) { c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: "backwards" }); return; }
        c.animate([{ opacity: 0, transform: "translateY(18px) scale(0.96)" }, { opacity: 1, transform: "none" }],
          { duration: 520, delay: i * 45, easing: EASE_ARRIVE, fill: "backwards" });
      });
    }, [filter]);

    function inView(el, sheet) {
      var r = el.getBoundingClientRect(), s = (sheet || ref.current).getBoundingClientRect();
      return r.top < s.bottom && r.bottom > s.top;
    }

    function close(then) {
      if (closing.current) return;
      closing.current = true;
      var sheet = ref.current;
      var called = false;
      var done = function () { if (called) return; called = true; props.onClose(then); };
      if (!sheet) { done(); return; }
      setTimeout(done, 700); /* never strand the sheet if frames stall */
      if (props.onClosing) props.onClosing(); /* the board un-dims while the sheet folds back */
      var src = then ? null : sourceOf(props.opener);
      var still = reduced();
      if (scrimRef.current) scrimRef.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: still ? 140 : 380, easing: "ease", fill: "forwards" });
      Array.prototype.slice.call(sheet.querySelectorAll("[data-aw-chrome], [data-aw-card]")).forEach(function (n) {
        n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: still ? 120 : 200, easing: "ease", fill: "forwards" });
      });
      var anim;
      if (still || !src) {
        anim = sheet.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: still ? "none" : "scale(0.96)" }], { duration: still ? 140 : 320, easing: AW_EASE_BACK, fill: "forwards" });
      } else {
        var fr = growFrames(sheet, src).reverse();
        fr[1].opacity = 0.6;
        anim = sheet.animate(fr, { duration: 440, easing: AW_EASE_BACK, fill: "forwards" });
      }
      anim.finished.then(done, done);
    }

    /* Escape closes, Tab stays inside */
    useEffect(function () {
      function onKey(ev) {
        if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); close(); return; }
        if (ev.key !== "Tab" || !ref.current) return;
        var f = focusables(ref.current);
        if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (!ref.current.contains(document.activeElement)) { ev.preventDefault(); a.focus(); return; }
        if (ev.shiftKey && document.activeElement === a) { ev.preventDefault(); z.focus(); }
        else if (!ev.shiftKey && document.activeElement === z) { ev.preventDefault(); a.focus(); }
      }
      window.addEventListener("keydown", onKey, true);
      return function () { window.removeEventListener("keydown", onKey, true); };
    }, []);

    function onTabKey(ev, i) {
      var n = AW_FILTERS.length, j = null;
      if (ev.key === "ArrowRight") j = (i + 1) % n;
      else if (ev.key === "ArrowLeft") j = (i - 1 + n) % n;
      else if (ev.key === "Home") j = 0;
      else if (ev.key === "End") j = n - 1;
      if (j == null) return;
      ev.preventDefault();
      setFilter(AW_FILTERS[j].id);
      if (tabRefs.current[j]) tabRefs.current[j].focus();
    }
    var fi = Math.max(0, AW_FILTERS.map(function (f) { return f.id; }).indexOf(filter));

    return h("div", { className: "cr-aw" },
      h("div", { className: "cr-aw-scrim", ref: scrimRef, "aria-hidden": "true", onClick: function () { close(); } }),
      h("section", { className: "cr-aw-sheet", ref: ref, role: "dialog", "aria-modal": "true", "aria-labelledby": "cr-aw-title" },
        h("header", { className: "cr-aw-top" },
          h("div", { className: "cr-aw-titles" },
            h("h2", { id: "cr-aw-title", className: "cr-aw-title", "data-aw-chrome": "" }, props.title || "All work"),
            h("p", { className: "cr-aw-counts", "data-aw-chrome": "" },
              h("span", { className: "cr-aw-count" }, nCase + " case studies"),
              h("span", { className: "cr-aw-count" }, nPg + " explorations"))),
          h("div", { className: "cr-aw-tabs", role: "tablist", "aria-label": "Filter work", "data-aw-chrome": "" },
            h("span", { className: "cr-aw-tabpill", "aria-hidden": "true", style: { transform: "translateX(" + (fi * 100) + "%)" } }),
            AW_FILTERS.map(function (f, i) {
              var on = f.id === filter;
              return h("button", { key: f.id, type: "button", role: "tab", id: "cr-aw-tab-" + f.id, "aria-selected": on ? "true" : "false", "aria-controls": "cr-aw-panel",
                tabIndex: on ? 0 : -1, ref: function (n) { tabRefs.current[i] = n; },
                onClick: function () { setFilter(f.id); }, onKeyDown: function (ev) { onTabKey(ev, i); } }, f.label);
            })),
          h("button", { type: "button", className: "cr-iconbtn cr-iconbtn--solid cr-aw-close", "aria-label": "Close all work", title: "Close", "data-aw-chrome": "", onClick: function () { close(); } },
            h(Icon, { name: "close" }))),
        h("div", { className: "cr-aw-scroll", ref: gridRef, id: "cr-aw-panel", role: "tabpanel", "aria-labelledby": "cr-aw-tab-" + filter, tabIndex: -1 },
          h("div", { className: "cr-aw-grid" },
            list.map(function (it) {
              return h(AllWorkCard, { key: it.id, item: it, onPick: function (item) { close(function () { if (props.onPick) props.onPick(item); }); } });
            })))));
  }

  function ProfileSheet(props) {
    var ref = useRef(null);
    useDialogFocus(ref);
    useLayoutEffect(function () {
      var stage = props.stageRef.current, sheet = ref.current;
      if (!stage || !sheet) return;
      var orb = stage.querySelector("[data-cr-orb] .cr-orb");
      var r = (orb || sheet).getBoundingClientRect(), s = sheet.getBoundingClientRect(), k = localScale(sheet) || 1;
      var cx0 = (r.left + r.width / 2 - s.left) / k, cy0 = (r.top + r.height / 2 - s.top) / k;
      if (reduced()) { sheet.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: "both" }); return; }
      sheet.animate([
        { clipPath: "circle(" + (r.width / 2 / k) + "px at " + cx0 + "px " + cy0 + "px)" },
        { clipPath: "circle(" + Math.hypot(s.width, s.height) + "px at " + cx0 + "px " + cy0 + "px)" }
      ], { duration: 720, easing: EASE_ARRIVE, fill: "both" });
      Array.prototype.slice.call(sheet.querySelectorAll(".cr-profile-body > *")).forEach(function (n, i) {
        n.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 560, delay: 220 + i * 60, easing: EASE_ARRIVE, fill: "both" });
      });
    }, []);
    function close() {
      var sheet = ref.current;
      if (!sheet || reduced()) { props.onClose(); return; }
      sheet.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(0.96)" }], { duration: 240, easing: EASE_LEAVE, fill: "both" }).finished.then(props.onClose);
    }
    return h("section", { className: "cr-sheet cr-profile-sheet", ref: ref, role: "dialog", "aria-modal": "true", "aria-label": props.name,
      style: props.style || { left: 184, right: 184, top: 172, height: 600 } },
      h("div", { className: "cr-profile-photo" }, h("img", { src: props.image, alt: props.name })),
      h("div", { className: "cr-profile-body" },
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
          h(Chip, null, props.status || "Open to work"),
          h(IconButton, { variant: "solid", icon: "close", label: "Close profile", onClick: close })),
        h("p", { className: "cr-sheet-title" }, props.name),
        h("p", { className: "cr-sheet-sub" }, props.role),
        h("p", { className: "cr-t-body", style: { color: "rgba(255,255,255,.9)", maxWidth: 380 } }, props.bio),
        props.links ? h("div", { className: "cr-profile-links" }, props.links.map(function (l) {
          return l.onClick
            ? h("button", { key: l.label, type: "button", className: "cr-chip", onClick: l.onClick }, l.label)
            : h("a", { key: l.label, className: "cr-chip", href: l.href, target: l.external ? "_blank" : undefined, rel: l.external ? "noreferrer" : undefined }, l.label);
        })) : null,
        h("div", { className: "cr-profile-facts" },
          (props.facts || []).map(function (f) { return h("div", { key: f.label, className: "cr-fact" }, h("b", null, f.value), h("span", null, f.label)); }))));
  }

  function FolderOpen(props) {
    var stageRef = useRef(null);
    var _o = useState(false), open = _o[0], setOpen = _o[1];
    var d = props.data || {};
    return h(Stage, { width: props.width || HERO_W, height: props.height || HERO_H, stageRef: stageRef },
      h("div", { className: cx("cr-grid", open && "cr-dimmed") },
        h("div", { className: "cr-dim" }, h(AgendaCard, d.agenda)),
        h("div", { className: "cr-dim" }, h(FolderListCard, Object.assign({}, d.folders, { onOpen: function () { setOpen(true); } }))),
        h("div", { className: "cr-dim", "data-cr-drop": "" }, h(DropZoneCard, Object.assign({}, d.drop, { onClick: function () { setOpen(true); } })))),
      open ? h(FolderSheet, { stageRef: stageRef, folder: d.folder, files: d.files, from: "list", onClose: function () { setOpen(false); } }) : null,
      h("button", { type: "button", className: "cr-replay", onClick: function () { setOpen(!open); } }, open ? "Close folder" : "Open folder"));
  }

  function ProfileOpen(props) {
    var stageRef = useRef(null);
    var _o = useState(false), open = _o[0], setOpen = _o[1];
    var d = props.data || {};
    return h(Stage, { width: props.width || HERO_W, height: props.height || HERO_H, stageRef: stageRef },
      h("div", { className: cx("cr-grid", open && "cr-dimmed") },
        h("div", { className: "cr-dim" }, h(PreviewCard, d.preview)),
        h("div", { className: "cr-dim" }, h(ProfileOrb, Object.assign({}, d.profile, { onOpen: function () { setOpen(true); } }))),
        h("div", { className: "cr-dim" }, h(StatCard, d.stat))),
      open ? h(ProfileSheet, Object.assign({ stageRef: stageRef, onClose: function () { setOpen(false); } }, d.profileSheet)) : null,
      h("button", { type: "button", className: "cr-replay", onClick: function () { setOpen(!open); } }, open ? "Close profile" : "Open profile"));
  }

  /* ───────── Now Playing pill + Resonance prototype sheet ─────────
     The pill is a quiet loop of the product idea: the line creeps from the start,
     then skips ahead to "your moment". All of its motion is CSS on one 12s clock,
     so play/pause just flips animation-play-state and everything stays in sync. */
  var NP_ART = "./assets/resonance/np-art.jpg";
  var NP_POSTER = "./assets/resonance/np-art-lg.jpg";
  var NP_FRAME = "./assets/resonance/mockup/iphone-frame.png";
  var NP_DESIGN_W = 390;
  /* Same host rule as resonance-short.html: GitHub Pages build next to the GitHub Pages portfolio */
  function resonanceBase() {
    return /\.github\.io$/i.test(location.hostname) ? "https://gauravavinash44-blip.github.io/drop-mode/" : "https://drop-mode.vercel.app/";
  }
  var NP_ICON = {
    play: "M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.1-6.4a.8.8 0 0 0 0-1.4L9.2 4.9a.8.8 0 0 0-1.2.7z",
    pause: "M7 5h3.4v14H7zM13.6 5H17v14h-3.4z"
  };

  function NowPlayingPill(props) {
    var _p = useState(true), playing = _p[0], setPlaying = _p[1];
    var ref = useRef(null);
    function open(ev) {
      if (ev) ev.stopPropagation(); /* the stage treats bare taps as "change wallpaper" */
      if (ev && ev.target.closest && ev.target.closest(".cr-np-play")) return;
      if (props.onOpen) props.onOpen(ref.current);
    }
    var title = props.title || "Resonance";
    return h("div", { className: cx("cr-np", playing ? "is-playing" : "is-paused"), ref: ref, onClick: open, "data-cr-enter": "", "data-np-pill": "" },
      h("button", { type: "button", className: "cr-np-open", "aria-haspopup": "dialog",
        "aria-label": props.label || (title + " for Spotify. Open the live prototype") },
        h("span", { className: "cr-np-art", "aria-hidden": "true" }, h("img", { src: props.art || NP_ART, alt: "", decoding: "async" })),
        h("span", { className: "cr-np-text", "aria-hidden": "true" },
          h("span", { className: "cr-np-title" }, title),
          h("span", { className: "cr-np-sub" },
            h("span", { className: "cr-np-sub-a" }, h("i", { className: "cr-np-dot" }), props.sub || "For Spotify"),
            h("span", { className: "cr-np-sub-b" }, props.moment || "Your moment")),
          h("span", { className: "cr-np-track" },
            h("i", { className: "cr-np-fill" }),
            h("i", { className: "cr-np-mark" }))),
        h("span", { className: "cr-np-eq", "aria-hidden": "true" }, h("i"), h("i"), h("i"), h("i"))),
      h("button", { type: "button", className: "cr-np-play", "aria-label": playing ? "Pause preview" : "Play preview", "aria-pressed": playing ? "false" : "true",
        onClick: function (ev) { ev.stopPropagation(); setPlaying(!playing); } },
        h("svg", { viewBox: "0 0 24 24", width: 16, height: 16, "aria-hidden": "true", fill: "currentColor" },
          h("path", { d: playing ? NP_ICON.pause : NP_ICON.play }))));
  }

  function ResonanceSheet(props) {
    var ref = useRef(null), scrimRef = useRef(null), screenRef = useRef(null), frameRef = useRef(null);
    var closing = useRef(false);
    var base = props.base || resonanceBase();
    var full = props.fullHref || base + "?fresh=1";
    var _s = useState(""), src = _s[0], setSrc = _s[1];
    var _st = useState("loading"), status = _st[0], setStatus = _st[1]; /* loading | ready | failed */
    var _k = useState(null), fit = _k[0], setFit = _k[1];

    /* Open: scrim fades, the sheet grows out of the pill, copy rises */
    useLayoutEffect(function () {
      var sheet = ref.current, root = document.documentElement;
      root.classList.add("ga-np-open");
      var prev = props.opener && props.opener.querySelector ? (props.opener.querySelector(".cr-np-open") || props.opener) : document.activeElement;
      var src0 = sourceOf(props.opener), still = reduced();
      if (scrimRef.current) scrimRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: still ? 160 : 420, easing: "ease", fill: "backwards" });
      if (still || !src0) {
        sheet.animate([{ opacity: 0, transform: still ? "none" : "scale(0.97)" }, { opacity: 1, transform: "none" }], { duration: still ? 160 : 420, easing: EASE_ARRIVE, fill: "backwards" });
      } else {
        sheet.animate(growFrames(sheet, src0), { duration: 520, easing: EASE_ARRIVE, fill: "backwards" });
        Array.prototype.slice.call(sheet.querySelectorAll("[data-np-chrome]")).forEach(function (n, i) {
          n.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 520, delay: 120 + i * 50, easing: EASE_ARRIVE, fill: "backwards" });
        });
      }
      var t = setTimeout(function () {
        var btn = sheet.querySelector(".cr-np-close");
        if (btn) btn.focus({ preventScroll: true });
      }, 60);
      return function () {
        clearTimeout(t);
        root.classList.remove("ga-np-open");
        if (prev && prev.isConnected && prev.focus) prev.focus({ preventScroll: true });
      };
    }, []);

    /* Fit the 390px-wide app into whatever size the phone screen ends up */
    useLayoutEffect(function () {
      var el = screenRef.current;
      if (!el) return undefined;
      function measure() {
        var w = el.clientWidth, hh = el.clientHeight;
        if (!w || !hh) return;
        var k = w / NP_DESIGN_W;
        setFit({ k: k, h: Math.round(hh / k) });
      }
      measure();
      if (typeof ResizeObserver === "undefined") { window.addEventListener("resize", measure); return function () { window.removeEventListener("resize", measure); }; }
      var ro = new ResizeObserver(measure);
      ro.observe(el);
      return function () { ro.disconnect(); };
    }, []);

    /* Load the prototype only now. A cross-origin frame fires load even on an error page,
       so a no-cors probe of the same URL decides whether it really arrived. */
    useEffect(function () {
      var url = props.src || (base + "?fresh=1&embed=1&t=" + Date.now());
      var alive = true, loaded = false, probe = "pending";
      function settle() {
        if (!alive) return;
        if (probe === "fail") setStatus("failed");
        else if (loaded && probe === "ok") setStatus("ready");
      }
      frameRef.current = { onLoad: function () { loaded = true; settle(); } };
      var start = setTimeout(function () { if (alive) setSrc(url); }, reduced() ? 0 : 280); /* let the grow animation run first */
      var give = setTimeout(function () { if (!alive) return; setStatus(function (s) { return s === "ready" ? s : "failed"; }); }, 8000);
      try {
        fetch(url, { mode: "no-cors", cache: "no-store", credentials: "omit" }).then(
          function () { probe = "ok"; settle(); },
          function () { probe = "fail"; settle(); });
      } catch (err) { probe = "ok"; }
      return function () { alive = false; clearTimeout(start); clearTimeout(give); };
    }, []);

    function close() {
      if (closing.current) return;
      closing.current = true;
      var sheet = ref.current, called = false;
      var done = function () { if (called) return; called = true; props.onClose(); };
      if (!sheet) { done(); return; }
      setTimeout(done, 700);
      document.documentElement.classList.remove("ga-np-open");
      if (props.onClosing) props.onClosing();
      var src0 = sourceOf(props.opener), still = reduced();
      if (scrimRef.current) scrimRef.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: still ? 140 : 380, easing: "ease", fill: "forwards" });
      Array.prototype.slice.call(sheet.querySelectorAll("[data-np-chrome]")).forEach(function (n) {
        n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: still ? 120 : 200, easing: "ease", fill: "forwards" });
      });
      var anim;
      if (still || !src0) {
        anim = sheet.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: still ? "none" : "scale(0.96)" }], { duration: still ? 140 : 320, easing: AW_EASE_BACK, fill: "forwards" });
      } else {
        var fr = growFrames(sheet, src0).reverse();
        fr[1].opacity = 0.6;
        anim = sheet.animate(fr, { duration: 440, easing: AW_EASE_BACK, fill: "forwards" });
      }
      anim.finished.then(done, done);
    }

    /* Escape closes, Tab stays inside */
    useEffect(function () {
      function onKey(ev) {
        if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); close(); return; }
        if (ev.key !== "Tab" || !ref.current) return;
        var f = focusables(ref.current);
        if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (!ref.current.contains(document.activeElement)) { ev.preventDefault(); a.focus(); return; }
        if (ev.shiftKey && document.activeElement === a) { ev.preventDefault(); z.focus(); }
        else if (!ev.shiftKey && document.activeElement === z) { ev.preventDefault(); a.focus(); }
      }
      window.addEventListener("keydown", onKey, true);
      return function () { window.removeEventListener("keydown", onKey, true); };
    }, []);

    var frameStyle = fit ? { width: NP_DESIGN_W + "px", height: fit.h + "px", transform: "scale(" + fit.k + ")" } : { visibility: "hidden" };
    return h("div", { className: "cr-np-modal" },
      h("div", { className: "cr-np-scrim", ref: scrimRef, "aria-hidden": "true", onClick: function () { close(); } }),
      h("section", { className: "cr-np-sheet", ref: ref, role: "dialog", "aria-modal": "true", "aria-labelledby": "cr-np-title", "aria-describedby": "cr-np-desc" },
        h("button", { type: "button", className: "cr-iconbtn cr-iconbtn--solid cr-np-close", "aria-label": "Close Resonance prototype", title: "Close", "data-np-chrome": "", onClick: function () { close(); } },
          h(Icon, { name: "close" })),
        h("div", { className: "cr-np-device", "data-np-chrome": "" },
          h("div", { className: "cr-np-phone" },
            h("div", { className: "cr-np-screen", ref: screenRef, "data-status": status },
              src ? h("iframe", { src: src, title: "Resonance live prototype", allow: "autoplay; encrypted-media", referrerPolicy: "no-referrer-when-downgrade",
                style: frameStyle, tabIndex: status === "ready" ? 0 : -1, "aria-hidden": status === "ready" ? undefined : "true",
                onLoad: function () { if (frameRef.current) frameRef.current.onLoad(); } }) : null,
              h("div", { className: "cr-np-poster", "aria-hidden": status === "ready" ? "true" : undefined },
                /* Poster: the pill's album art grown into a Now Playing screen */
                h("img", { className: "cr-np-poster-bg", src: props.poster || NP_POSTER, alt: "", "aria-hidden": "true", decoding: "async" }),
                h("div", { className: "cr-np-poster-np", "aria-hidden": "true" },
                  h("img", { src: props.poster || NP_POSTER, alt: "", decoding: "async" }),
                  h("b", null, props.title || "Resonance"),
                  h("span", null, h("i", { className: "cr-np-dot" }), "For Spotify"),
                  h("span", { className: "cr-np-track" }, h("i", { className: "cr-np-fill" }), h("i", { className: "cr-np-mark" }))),
                status === "failed"
                  ? h("div", { className: "cr-np-state is-failed", role: "status" },
                      h("p", null, "The prototype didn't load here."),
                      h("a", { className: "cr-np-state-link", href: full, target: "_blank", rel: "noreferrer" }, "Open full screen", h(Icon, { name: "arrow", stroke: 1.8 })))
                  : h("div", { className: "cr-np-state", role: "status" }, h("i", { className: "cr-np-spin", "aria-hidden": "true" }), "Loading prototype"))),
            h("img", { className: "cr-np-frame", src: props.frame || NP_FRAME, alt: "", "aria-hidden": "true", decoding: "async" }))),
        h("div", { className: "cr-np-copy" },
          h("p", { className: "cr-np-eyebrow", "data-np-chrome": "" }, h("i", { className: "cr-np-dot" }), "For Spotify · Personal project"),
          h("h2", { id: "cr-np-title", className: "cr-np-heading", "data-np-chrome": "" }, props.title || "Resonance"),
          h("p", { id: "cr-np-desc", className: "cr-np-desc", "data-np-chrome": "" },
            props.description || "A speculative Spotify playback feature that starts songs closer to the moments you actually want to hear."),
          h("p", { className: "cr-np-note", "data-np-chrome": "" }, "Live Resonance build. Try it in the phone. Prefer full screen on a real phone if you want more room."),
          h("div", { className: "cr-np-actions", "data-np-chrome": "" },
            h("a", { className: "cr-np-btn cr-np-btn--primary", href: full, target: "_blank", rel: "noreferrer" }, "Open full screen", h(Icon, { name: "arrow", stroke: 1.8 })),
            h("a", { className: "cr-np-btn", href: props.caseHref || "./resonance-short.html" }, "Read the case study")))));
  }

  window.Craft = {
    Stage: Stage, Backdrop: Backdrop, Icon: Icon, Avatar: Avatar,
    TopBar: TopBar, NotificationPill: NotificationPill, SegmentedControl: SegmentedControl,
    IconButton: IconButton, Chip: Chip, Toggle: Toggle,
    AgendaCard: AgendaCard, FolderListCard: FolderListCard, DropZoneCard: DropZoneCard,
    PreviewCard: PreviewCard, CursorChip: CursorChip, ProfileOrb: ProfileOrb, HeadOrb: HeadOrb, StatCard: StatCard,
    AvatarStack: AvatarStack, Dock: Dock, MetaStrip: MetaStrip,
    HeroBoard: HeroBoard, FolderOpen: FolderOpen, ProfileOpen: ProfileOpen,
    FolderSheet: FolderSheet, ProfileSheet: ProfileSheet, AllWorkSheet: AllWorkSheet, ProjectWell: ProjectWell, useClock: useClock,
    NowPlayingPill: NowPlayingPill, ResonanceSheet: ResonanceSheet,
    motion: { enter: enter, exit: exit, burst: burst, expandFrom: expandFrom, growFrames: growFrames, sourceOf: sourceOf },
    sample: sample
  };

  /* Portfolio sample content. img = { profile, logo, chat, dealRoom, easyeat, whiteLabel, resonance, nomad, health, swaply, splitly } */
  function sample(img) {
    var face = img.avatar || img.profile;
    var now = new Date();
    var day, date;
    try {
      day = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "Asia/Kolkata" }).format(now);
      date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: "Asia/Kolkata" }).format(now);
    } catch (e) { day = "Monday"; date = "27 April"; }
    var rows = [
      { title: "Contextual Chat", sub: "AI search", thumb: img.chat, icon: "chatSpark", tone: "blue" },
      { title: "Deal Room", sub: "B2B SaaS", thumb: img.dealRoom, icon: "dealDoc", tone: "orange", pill: true, badge: true },
      { title: "White Label", sub: "Fintech", thumb: img.whiteLabel, icon: "swatch", tone: "pink" }
    ];
    return {
      topbar: {
        avatar: face, title: "Gaurav Avinash", subtitle: "Product Designer",
        notice: { avatar: img.chat, title: "Latest case study", subtitle: "Contextual Chat", meta: "Open", seconds: 14 },
        tabs: ["Home", "Projects"]
      },
      agenda: { meta: date, avatar: face, day: day, time: "Available", label: "Open to new roles" },
      folders: { title: "Case studies", count: "All 5", rows: rows },
      folder: { title: "Case studies", sub: "4 shipped, 1 concept, 3 explorations" },
      drop: { title: "Open a folder", hint: "Drag a case study here" },
      preview: {
        image: img.chat, label: "Featured", timer: "<30s",
        slides: [
          { image: img.dealRoom },
          { image: img.chat, label: "Contextual Chat" },
          { image: img.whiteLabel, label: "Next" }
        ],
        cursors: [
          { name: "Gaurav", color: "#ec6533", avatar: face, x: 175, y: 2 },
          { name: "You", color: "#e42a9e", x: 69, y: 92 }
        ],
        avatar: face, title: "Contextual Chat", subtitle: "AI search", count: null, countIcon: "arrow"
      },
      profile: { image: img.avatarHero || img.profile, cutout: !!img.avatarHero, name: "Gaurav Avinash" },
      stat: {
        title: "Experience", link: "View all", value: 5, unit: "+ yrs", decimals: 0,
        segments: [
          { label: "Fintech AI", value: 3.7, color: "#ec7756", caption: "3.7 yrs" },
          { label: "Food, Health", value: 1, color: "#2b55f6", caption: "1 yr" },
          { label: "Visual", value: 1, color: "#e4e4e4", caption: "1 yr" }
        ]
      },
      stack: { images: [img.nomad, img.health, img.swaply, img.splitly], label: "Open Design Playground" },
      dock: { actions: [{ icon: "download", label: "Download resume" }, { icon: "chat", label: "Ask the portfolio assistant", accent: true }] },
      files: [
        { title: "Contextual Chat", sub: "AI search", image: img.chat },
        { title: "Deal Room", sub: "B2B SaaS", image: img.dealRoom },
        { title: "White Label", sub: "Fintech", image: img.whiteLabel },
        { title: "EasyEat", sub: "FoodTech", image: img.easyeat },
        { title: "Resonance", sub: "AI · Music", image: img.resonance },
        { title: "Nomad", sub: "Playground", image: img.nomad },
        { title: "Health Karma", sub: "Playground", image: img.health },
        { title: "Swaply", sub: "Playground", image: img.swaply }
      ],
      profileSheet: {
        image: img.profile, name: "Gaurav Avinash", role: "Product Designer · Delhi, India", status: "Open to work",
        bio: "I design products that make complex things feel simple. AI search, deal workflows and fintech setup flows, end to end.",
        facts: [{ value: "5+", label: "years designing" }, { value: "+25%", label: "engagement, Contextual Chat" }, { value: "+32%", label: "adoption, Deal Room" }, { value: "4", label: "industries: fintech, AI, food, health" }]
      }
    };
  }
})();
