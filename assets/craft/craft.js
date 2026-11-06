/* @ds-bundle: {"format":4,"namespace":"Craft","components":[{"name":"Stage"},{"name":"TopBar"},{"name":"NotificationPill"},{"name":"SegmentedControl"},{"name":"IconButton"},{"name":"Chip"},{"name":"Toggle"},{"name":"AgendaCard"},{"name":"FolderListCard"},{"name":"DropZoneCard"},{"name":"PreviewCard"},{"name":"CursorChip"},{"name":"ProfileOrb"},{"name":"StatCard"},{"name":"AvatarStack"},{"name":"Dock"},{"name":"MetaStrip"},{"name":"HeroBoard"},{"name":"FolderOpen"},{"name":"ProfileOpen"}]} */
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
    image: "M4 5.5h16v13H4zM4 15l4.5-4.5 4 4 2.5-2.5 5 5M15.5 9.5a1.2 1.2 0 1 0 0-.01"
  };
  function Icon(props) {
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
    return h("div", { className: cx("cr", "cr-stage", props.className), style: style, ref: props.stageRef },
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
          onClick: function () { setIdx(i); if (props.onChange) props.onChange(i, it); } }, it);
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
      h("span", { className: "cr-notice-bar", "aria-hidden": "true" }),
      props.avatar ? h(Avatar, { src: props.avatar, size: 40 }) : null,
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
        h(SegmentedControl, { items: props.tabs || ["Board", "Folders"], value: props.tab || 0, onChange: props.onTab }),
        h(IconButton, { variant: "glass", icon: "search", label: props.searchLabel || "Search", onClick: props.onSearch })));
  }

  /* ───────── Widget cards ───────── */
  function AgendaCard(props) {
    return h("article", { className: cx("cr-card cr-glass cr-agenda", props.className), "data-cr-enter": "", "aria-label": props.label },
      h("div", { className: "cr-agenda-top" },
        h("span", { className: "cr-agenda-meta" }, props.meta),
        props.avatar ? h(Avatar, { src: props.avatar, size: 52 }) : null),
      h("div", { className: "cr-agenda-body" }, h("p", null, props.day), h("p", null, props.time)),
      h("p", { className: "cr-agenda-label" }, props.label));
  }

  function FolderRow(props) {
    var r = props.row;
    return h("li", { className: "cr-row", draggable: props.draggable ? "true" : undefined,
      onDragStart: props.draggable ? function (ev) { ev.dataTransfer.setData("text/plain", r.title); } : undefined },
      h("img", { className: "cr-row-thumb", src: r.thumb, alt: "" }),
      h("button", { type: "button", className: "cr-row-text", onClick: function () { if (props.onOpen) props.onOpen(r); } },
        h("b", null, r.title), h("span", null, r.sub)),
      r.locked
        ? h(IconButton, { icon: "lock", label: r.title + " is under NDA" })
        : h(Toggle, { defaultChecked: r.open !== false, label: "Show " + r.title }));
  }

  function FolderListCard(props) {
    return h("section", { className: cx("cr-card cr-solid cr-list", props.className), "data-cr-enter": "", "aria-label": props.title },
      h("header", { className: "cr-list-head" },
        h("h3", { className: "cr-t-title" }, props.title),
        h(Chip, { variant: "outline" }, props.count)),
      h("ul", null, (props.rows || []).slice(0, 3).map(function (r) {
        return h(FolderRow, { key: r.title, row: r, onOpen: props.onOpen, draggable: props.draggable });
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
      h("svg", { viewBox: "0 0 16 16" }, h("path", { d: "M2 1.5l11 5.2-4.6 1.4-1.9 4.6z", fill: props.color, stroke: "#fff", strokeWidth: 1.2, strokeLinejoin: "round" })),
      h("span", { className: "cr-cursor-tag", style: { background: props.color } },
        props.avatar ? h("img", { src: props.avatar, alt: "" }) : null, props.name));
  }

  function PreviewCard(props) {
    return h("article", { className: cx("cr-card cr-solid cr-preview", props.className), "data-cr-enter": "" },
      h("div", { className: "cr-preview-chips" },
        h(Chip, { variant: "label" }, props.label || "Live preview"),
        props.timer ? h(Chip, { variant: "timer", live: true }, props.timer) : null),
      h(props.href ? "a" : "div", { className: "cr-preview-shot", href: props.href, "aria-label": props.href ? "Open " + props.title + " case study" : undefined },
        h("img", { src: props.image, alt: props.alt || "" }),
        (props.cursors || []).map(function (c, i) { return h(CursorChip, Object.assign({ key: c.name, wander: (i % 2) + 1 }, c)); })),
      h("div", { className: "cr-preview-foot" },
        props.avatar ? h(Avatar, { src: props.avatar, size: 52 }) : h("span"),
        h("span", { className: "cr-row-text" }, h("b", null, props.title), h("span", null, props.subtitle)),
        props.count != null ? h(Chip, { variant: "count" }, String(props.count)) : null),
      h("style", null, "@keyframes crWander1{0%{transform:translate(0,0)}50%{transform:translate(18px,-10px)}100%{transform:translate(-8px,12px)}}@keyframes crWander2{0%{transform:translate(0,0)}50%{transform:translate(-16px,8px)}100%{transform:translate(10px,-14px)}}"));
  }

  function ProfileOrb(props) {
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
        h("img", { className: "cr-orb-photo", src: props.image, alt: "" }),
        props.name ? h("span", { className: "cr-orb-name" }, props.name) : null),
      h("span", { className: "cr-orb-edit" }, h(IconButton, { variant: "solid", icon: "pen", label: "Edit profile" })));
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
        props.link ? h("a", { className: "cr-stat-link", href: props.href || "#", onClick: props.onLink ? function (ev) { ev.preventDefault(); props.onLink(); } : undefined }, props.link, h(Icon, { name: "chevron", stroke: 2 })) : null),
      h("p", { className: "cr-stat-value cr-t-xl" }, val, h("span", null, props.unit || "")),
      h("div", { className: "cr-stat-legs" },
        segs.map(function (s) {
          var left = (acc / total) * 100; acc += s.value;
          return h("span", { key: s.label, className: "cr-stat-leg", style: { left: left + "%" } }, h("span", null, s.caption || ""));
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

  function FolderSheet(props) {
    var ref = useRef(null);
    useLayoutEffect(function () {
      var stage = props.stageRef.current, sheet = ref.current;
      if (!stage || !sheet) return;
      var src = stage.querySelector(props.from === "drop" ? "[data-cr-drop] .cr-card" : ".cr-list");
      var sr = (src || sheet).getBoundingClientRect();
      expandFrom(sheet, sr, stage.getBoundingClientRect());
      var items = Array.prototype.slice.call(sheet.querySelectorAll(".cr-file"));
      burst(sr, items, { delay: 180 });
      Array.prototype.slice.call(sheet.querySelectorAll(".cr-sheet-head > *")).forEach(function (n, i) {
        n.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: 260 + i * 60, easing: EASE_ARRIVE, fill: "both" });
      });
    }, []);
    function close() {
      var sheet = ref.current;
      if (!sheet || reduced()) { props.onClose(); return; }
      sheet.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.94)" }], { duration: 260, easing: EASE_LEAVE, fill: "both" }).finished.then(props.onClose);
    }
    var row = props.folder || props.row || {};
    return h("section", { className: "cr-sheet", ref: ref, role: "dialog", "aria-label": row.title,
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

  function ProfileSheet(props) {
    var ref = useRef(null);
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
    return h("section", { className: "cr-sheet cr-profile-sheet", ref: ref, role: "dialog", "aria-label": props.name,
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

  window.Craft = {
    Stage: Stage, Backdrop: Backdrop, Icon: Icon, Avatar: Avatar,
    TopBar: TopBar, NotificationPill: NotificationPill, SegmentedControl: SegmentedControl,
    IconButton: IconButton, Chip: Chip, Toggle: Toggle,
    AgendaCard: AgendaCard, FolderListCard: FolderListCard, DropZoneCard: DropZoneCard,
    PreviewCard: PreviewCard, CursorChip: CursorChip, ProfileOrb: ProfileOrb, StatCard: StatCard,
    AvatarStack: AvatarStack, Dock: Dock, MetaStrip: MetaStrip,
    HeroBoard: HeroBoard, FolderOpen: FolderOpen, ProfileOpen: ProfileOpen,
    FolderSheet: FolderSheet, ProfileSheet: ProfileSheet, useClock: useClock,
    motion: { enter: enter, exit: exit, burst: burst, expandFrom: expandFrom },
    sample: sample
  };

  /* Portfolio sample content. img = { profile, logo, chat, dealRoom, easyeat, whiteLabel, resonance, nomad, health, swaply, splitly } */
  function sample(img) {
    var now = new Date();
    var day, date;
    try {
      day = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "Asia/Kolkata" }).format(now);
      date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: "Asia/Kolkata" }).format(now);
    } catch (e) { day = "Monday"; date = "27 April"; }
    var rows = [
      { title: "Contextual Chat", sub: "Systematic · AI search", thumb: img.chat, open: true },
      { title: "Deal Room", sub: "Systematic · B2B SaaS", thumb: img.dealRoom, open: true },
      { title: "White Label Setup", sub: "Systematic · Fintech", thumb: img.whiteLabel, locked: true }
    ];
    return {
      topbar: {
        avatar: img.profile, title: "Gaurav Avinash", subtitle: "Product Designer",
        notice: { avatar: img.chat, title: "New case study", subtitle: "Contextual Chat is live", meta: "Open", seconds: 14 },
        tabs: ["Board", "Folders"]
      },
      agenda: { meta: date, avatar: img.profile, day: day, time: "Available", label: "Open to new roles" },
      folders: { title: "Case studies", count: "All 6", rows: rows },
      folder: { title: "Case studies", sub: "5 shipped projects and 3 explorations" },
      drop: { title: "Open a folder", hint: "Drag a case study here" },
      preview: {
        image: img.chat, label: "Live preview", timer: "0:20",
        cursors: [
          { name: "Gaurav", color: "#e96635", avatar: img.profile, x: "54%", y: "18%" },
          { name: "PM", color: "#e534ae", x: "20%", y: "58%" }
        ],
        avatar: img.profile, title: "Contextual Chat", subtitle: "30 min → 30 sec", count: 8
      },
      profile: { image: img.profile, name: "Gaurav Avinash" },
      stat: {
        title: "Experience", link: "View all", value: 5.2, unit: "y", decimals: 1,
        segments: [
          { label: "Fintech", value: 45, color: "#ec7756", caption: "2.4 yrs" },
          { label: "AI SaaS", value: 33, color: "#2b55f6", caption: "1.7 yrs" },
          { label: "Food", value: 22, color: "#e4e4e4", caption: "1.1 yrs" }
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
        facts: [{ value: "5+", label: "years designing" }, { value: "+25%", label: "engagement, Contextual Chat" }, { value: "+32%", label: "adoption, Deal Room" }, { value: "3", label: "domains shipped" }]
      }
    };
  }
})();
