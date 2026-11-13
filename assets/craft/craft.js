/* @ds-bundle: {"format":4,"namespace":"Craft","components":[{"name":"Stage"},{"name":"TopBar"},{"name":"NotificationPill"},{"name":"SegmentedControl"},{"name":"IconButton"},{"name":"Chip"},{"name":"Toggle"},{"name":"AgendaCard"},{"name":"FolderListCard"},{"name":"DropZoneCard"},{"name":"PreviewCard"},{"name":"CursorChip"},{"name":"ProfileOrb"},{"name":"StatCard"},{"name":"AvatarStack"},{"name":"Dock"},{"name":"MetaStrip"},{"name":"HeroBoard"},{"name":"FolderOpen"},{"name":"ProfileOpen"},{"name":"AllWorkSheet"},{"name":"ProjectWell"},{"name":"NowPlayingPill"},{"name":"ResonanceCard"},{"name":"ResonanceSheet"}]} */
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
    layers: "M12 4l8.5 4.5L12 13 3.5 8.5zM3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5",
    /* Contact card */
    linkedin: "M4.5 7a2.5 2.5 0 0 1 2.5-2.5h10A2.5 2.5 0 0 1 19.5 7v10a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 17zM8.5 11v4.5M8.5 8.4v.01M11.5 15.5V11M11.5 13c0-1.3.8-2 1.9-2s1.9.7 1.9 2v2.5",
    doc: "M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5zM14 3.5v5h5M9 13h6M9 16.5h4",
    send: "M20 4L3.5 10.5l6.8 2.7L13 20zM20 4l-9.7 9.2"
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
    /* Start the dissolve only once the new photo is loaded and decoded, so it never pops in half way through */
    useEffect(function () {
      var id = props.wallpaper, done = false, timer = 0;
      var go = function () {
        if (done) return; done = true; clearTimeout(timer);
        setLayers(function (prev) {
          if (prev[prev.length - 1] === id) return prev;
          return prev.slice(-1).concat([id]);
        });
      };
      var img = new Image();
      img.src = "./assets/craft/wallpapers/" + id + (window.innerWidth >= 1600 || window.devicePixelRatio >= 1.5 ? "-2560" : "-1440") + ".webp";
      timer = setTimeout(go, 1500);
      if (img.decode) img.decode().then(go, go); else img.onload = img.onerror = go;
      return function () { done = true; clearTimeout(timer); };
    }, [props.wallpaper]);
    /* live motion (assets/craft/live-wallpaper.js) follows the settled layer */
    var liveRef = useRef(null);
    useEffect(function () { var L = window.CraftLiveWallpaper; if (L) L.sync(liveRef.current); }, [layers]);
    useEffect(function () { return function () { var L = window.CraftLiveWallpaper; if (L) L.sync(null); }; }, []);
    return h("div", { className: "cr-backdrop cr-backdrop--photo", "aria-hidden": "true", ref: liveRef },
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

  /* ───────── PhilosophyPill: rotating design notes in the top bar ─────────
     props.items: [{ idea, who, work?, mark }], props.marks: { DN: { tone } }, props.seconds (per item).
     One idea at a time; the ring around the close button fills, then the next idea comes in.
     Pauses on mouse hover, keyboard focus, hidden tab, or a click on the text (WCAG 2.2.2 pause control:
     a transparent toggle button over the text; the mark shows pause/play while hovered or paused).
     Close hides it for the session (sessionStorage). */
  function PhilosophyPill(props) {
    var items = props.items || [];
    var secs = props.seconds || 8;
    var STORE = props.storageKey || "ga-craft-philo-closed";
    var SWAP = 420;
    var r = 21, c = 2 * Math.PI * r;
    function wasClosed() { try { return window.sessionStorage.getItem(STORE) === "1"; } catch (e) { return false; } }
    var _o = useState(function () { return wasClosed() ? "closed" : "open"; }), state = _o[0], setState = _o[1];
    var _i = useState({ idx: 0, prev: null, n: 0 }), cur = _i[0], setCur = _i[1];
    var _z = useState(null), size = _z[0], setSize = _z[1];
    var _hv = useState(false), hover = _hv[0], setHover = _hv[1];
    var _fc = useState(false), focus = _fc[0], setFocus = _fc[1];
    var _up = useState(false), userPaused = _up[0], setUserPaused = _up[1];
    var _hd = useState(function () { return typeof document !== "undefined" && document.hidden; }), hidden = _hd[0], setHidden = _hd[1];
    var _ann = useState(""), said = _ann[0], setSaid = _ann[1];
    var ringRef = useRef(null), measureRef = useRef(null), clock = useRef({ t: 0, last: 0 });
    var paused = hover || focus || userPaused || hidden || !!props.hidden || state !== "open";
    var pausedRef = useRef(paused); pausedRef.current = paused;
    var curRef = useRef(cur); curRef.current = cur;

    function advance() {
      if (items.length < 2) return;
      clock.current.t = 0;
      var s = curRef.current, next = (s.idx + 1) % items.length, it = items[next];
      setSaid(it.idea + (/[.!?]$/.test(it.idea) ? " " : ". ") + it.who + (it.work ? ", " + it.work : ""));
      setCur({ idx: next, prev: s.idx, n: s.n + 1 });
    }

    /* Drop the outgoing copy once its exit animation is done */
    useEffect(function () {
      if (cur.prev == null) return;
      var id = setTimeout(function () { setCur(function (s) { return s.n === cur.n ? { idx: s.idx, prev: null, n: s.n } : s; }); }, SWAP + 40);
      return function () { clearTimeout(id); };
    }, [cur.n]);

    /* Timer: one rAF loop; progress only moves while nothing is pausing it */
    useEffect(function () {
      if (state === "closed") return;
      var raf;
      function tick(now) {
        var k = clock.current;
        if (k.last && !pausedRef.current) k.t += Math.min(now - k.last, 1000);
        k.last = now;
        var p = Math.min(1, k.t / (secs * 1000));
        if (ringRef.current) ringRef.current.style.strokeDashoffset = (c * (1 - p)).toFixed(2);
        if (p >= 1) advance();
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
      return function () { cancelAnimationFrame(raf); };
    }, [state, secs, items.length]);

    useEffect(function () {
      function vis() { setHidden(document.hidden); }
      document.addEventListener("visibilitychange", vis);
      return function () { document.removeEventListener("visibilitychange", vis); };
    }, []);

    /* Size the text area to the incoming idea, so the pill eases to its new width and height */
    useLayoutEffect(function () {
      function measure() {
        var m = measureRef.current;
        if (!m) return;
        /* layout sizes, not getBoundingClientRect: the top bar scales in on entry */
        var w = m.offsetWidth + 1, hh = m.offsetHeight;
        setSize(function (s) { return s && s.w === w && s.h === hh ? s : { w: w, h: hh }; });
      }
      measure();
      window.addEventListener("resize", measure);
      var fonts = document.fonts && document.fonts.ready;
      if (fonts) fonts.then(measure);
      return function () { window.removeEventListener("resize", measure); };
    }, [cur.idx, state]);

    if (state === "closed" || !items.length) return null;
    var item = items[cur.idx];
    var mark = (props.marks && props.marks[item.mark]) || {};

    function close() {
      try { window.sessionStorage.setItem(STORE, "1"); } catch (e) { /* private mode */ }
      setState("closing");
      if (reduced()) finish(); else setTimeout(finish, 1500); /* fallback; normally the collapse's animationend */
    }
    function finish() {
      setState(function (s) { if (s === "closing" && props.onClose) props.onClose(); return "closed"; });
    }
    function lines(it) {
      return [
        h("span", { key: "i", className: "cr-philo-idea" }, it.idea),
        h("span", { key: "c", className: "cr-philo-credit" },
          h("span", { className: "cr-philo-who" }, it.who),
          it.work ? h("span", { className: "cr-philo-work" }, ", " + it.work) : null)
      ];
    }
    var glyph = userPaused ? "play" : (hover ? "pause" : null);

    return h("div", {
        className: cx("cr-notice cr-philo", state === "closing" && "is-closing", paused && "is-paused"),
        role: "group", "aria-label": props.label || "Design notes",
        "data-cr-enter": props.enter ? "" : undefined,
        onPointerEnter: function (ev) { if (ev.pointerType === "mouse") setHover(true); },
        onPointerLeave: function (ev) { if (ev.pointerType === "mouse") setHover(false); },
        onAnimationEnd: function (ev) { if (ev.target === ev.currentTarget && state === "closing") finish(); },
        onFocus: function () { setFocus(true); },
        onBlur: function (ev) { if (!ev.currentTarget.contains(ev.relatedTarget)) setFocus(false); }
      },
      h("span", { className: "cr-notice-bar", "aria-hidden": "true" }, h("i"), h("i")),
      h("span", { className: "cr-philo-mark", "data-tone": mark.tone || "ink", "aria-hidden": "true" },
        glyph
          ? h("svg", { key: glyph, viewBox: "0 0 16 16", className: "cr-philo-glyph" },
              glyph === "pause" ? h("path", { d: "M5.5 4v8M10.5 4v8" }) : h("path", { d: "M5.5 3.8v8.4L12 8z" }))
          : h("span", { key: item.mark + cur.n, className: "cr-philo-mono" }, item.mark)),
      h("span", { className: "cr-philo-stage", style: size ? { width: size.w, height: size.h } : null },
        cur.prev != null ? h("span", { key: "o" + (cur.n - 1), className: "cr-philo-item is-out", "aria-hidden": "true",
          style: size ? { width: size.w } : null }, lines(items[cur.prev])) : null,
        h("span", { key: "i" + cur.n, className: cx("cr-philo-item", cur.prev != null && "is-in"),
          style: size ? { width: size.w } : null }, lines(item)),
        h("button", { type: "button", className: "cr-philo-toggle",
          "aria-label": userPaused ? "Play design notes" : "Pause design notes",
          title: userPaused ? "Play" : "Pause",
          onClick: function () { setUserPaused(function (v) { return !v; }); } })),
      h("span", { ref: measureRef, className: "cr-philo-measure", "aria-hidden": "true" }, lines(item)),
      h("button", { type: "button", className: "cr-notice-close", "aria-label": "Hide design notes", onClick: close },
        h("svg", { className: "cr-ring", viewBox: "0 0 44 44", "aria-hidden": "true" },
          h("circle", { ref: ringRef, cx: 22, cy: 22, r: r, strokeDasharray: c, strokeDashoffset: c })),
        h(Icon, { name: "close", className: "cr-x", stroke: 1.8 })),
      h("span", { className: "cr-visually-hidden", "aria-live": "polite", "aria-atomic": "true" }, said));
  }

  function TopBar(props) {
    var time = useClock(props.timeZone);
    return h("div", { className: "cr-topbar" },
      h("div", { className: "cr-topbar-left", "data-cr-enter": "" },
        props.avatar ? h("span", { className: "cr-brandorb" }, h("img", { src: props.avatar, alt: "" })) : null,
        h("span", { className: "cr-clock" }, props.time || time),
        h("span", { className: "cr-topbar-id" }, h("span", null, props.title), h("span", null, props.subtitle))),
      /* noticeHidden: an overlay is open (or phone width). The pill fades out, leaves the tab order and the
         accessibility tree (inert), and its timer pauses until it comes back. */
      h("div", { "data-cr-enter": "", className: cx("cr-topbar-notice", props.noticeHidden && "is-hidden"),
          "aria-hidden": props.noticeHidden ? "true" : undefined, inert: props.noticeHidden ? "" : undefined },
        props.notice ? h(props.notice.items ? PhilosophyPill : NotificationPill, Object.assign({}, props.notice, { hidden: !!props.noticeHidden })) : null),
      h("div", { className: "cr-topbar-right", "data-cr-enter": "" },
        props.resume ? h(ResumeLink, { href: props.resume, className: "cr-resume--bar" }) : null,
        h(SegmentedControl, { items: props.tabs || ["Home", "Projects"], value: props.tab || 0, onChange: props.onTab, label: props.tabsLabel || "Home or projects" }),
        h(IconButton, { variant: "glass", icon: "search", label: props.searchLabel || "Search", onClick: props.onSearch })),
      /* Phone only (CSS): name, role, status and Resume on their own row, since the bar above hides them */
      h("div", { className: "cr-topbar-intro", "data-cr-enter": "" },
        h("div", { className: "cr-intro-id" },
          h("b", null, props.title), h("span", null, props.subtitle),
          h(LiveStatus, { label: props.status || "Open to work" })),
        props.resume ? h(ResumeLink, { href: props.resume, className: "cr-resume--intro" }) : null));
  }

  /* Resume: a plain labelled link, one tap from the board at every width */
  function ResumeLink(props) {
    return h("a", { className: cx("cr-resume", props.className), href: props.href, target: "_blank", rel: "noopener",
        "aria-label": "Resume, PDF, opens in a new tab" },
      h(Icon, { name: "download", stroke: 1.8 }), h("span", null, "Resume"));
  }

  /* ───────── LiveStatus: an "active" availability chip, green dot with a soft pulsing halo ─────────
     The halo is decoration (CSS animation, static under reduced motion); the label carries the meaning. */
  function LiveStatus(props) {
    return h("span", { className: cx("cr-live-status", props.className) },
      h("span", { className: "cr-live-dot", "aria-hidden": "true" }),
      h("span", { className: "cr-live-label" }, props.label || "Open to work"));
  }

  /* ───────── Widget cards ───────── */
  function AgendaCard(props) {
    return h("article", { className: cx("cr-card cr-glass cr-agenda", props.className), "data-cr-enter": "", "aria-label": props.label },
      h("div", { className: "cr-agenda-top" },
        h("span", { className: "cr-agenda-meta" }, props.meta),
        props.avatar ? h(Avatar, { src: props.avatar, size: 48 }) : null),
      h("div", { className: "cr-agenda-body" }, h("p", null, props.day), h("p", null, props.time)),
      props.live
        ? h("p", { className: "cr-agenda-label cr-agenda-label--live" }, h(LiveStatus, { label: props.label }))
        : h("p", { className: "cr-agenda-label" }, props.label));
  }

  /* One case-study row. Every row has the same trailing round arrow link; the row that is
     hovered (mouse/pen) or holds keyboard focus is "active": its arrow fills Craft blue and
     its orb wakes. Only one row is active at a time (the list card owns that state). */
  function FolderRow(props) {
    var r = props.row;
    var linkLabel = "Open " + r.title + " case study";
    return h("li", { className: cx("cr-row", props.active && "is-active"), draggable: props.draggable ? "true" : undefined,
      onDragStart: props.draggable ? function (ev) { ev.dataTransfer.setData("text/plain", r.title); } : undefined,
      onPointerEnter: function (ev) { if (ev.pointerType !== "touch" && props.onActive) props.onActive(r.title, "hover"); },
      onPointerLeave: function (ev) { if (ev.pointerType !== "touch" && props.onActive) props.onActive(null, "hover"); },
      onFocus: function (ev) { if (props.onActive && ev.target.matches && ev.target.matches(":focus-visible")) props.onActive(r.title, "focus"); },
      onBlur: function (ev) { if (props.onActive && !ev.currentTarget.contains(ev.relatedTarget)) props.onActive(null, "focus"); } },
      h("span", { className: "cr-row-av" },
        r.icon ? h(ProjectWell, { icon: r.icon, tone: r.tone, badge: false }) : h("img", { className: "cr-row-thumb", src: r.thumb, alt: "" })),
      h("button", { type: "button", className: "cr-row-text", "aria-label": props.openLabel ? props.openLabel(r) : undefined, onClick: function (ev) { if (props.onOpen) props.onOpen(r, ev); } },
        h("b", null, r.title), h("span", null, r.sub)),
      r.locked
        ? h(IconButton, { icon: "lock", label: r.title + " is under NDA" })
        : r.href
          ? h("a", { className: "cr-row-go", href: r.href, "aria-label": linkLabel, title: "Open case study" },
              h("span", { className: "cr-row-go-fill", "aria-hidden": "true" }), h(Icon, { name: "arrow", stroke: 1.8 }))
          : h(Toggle, { defaultChecked: r.open !== false, label: "Show " + r.title }));
  }

  function FolderListCard(props) {
    /* hover wins over focus; leaving restores whichever row still holds keyboard focus */
    var _h = useState(null), hov = _h[0], setHov = _h[1];
    var _f = useState(null), foc = _f[0], setFoc = _f[1];
    var active = hov || foc;
    function onActive(title, why) { if (why === "hover") setHov(title); else setFoc(title); }
    return h("section", { className: cx("cr-card cr-solid cr-list", props.className), "data-cr-enter": "", "aria-label": props.title },
      h("header", { className: "cr-list-head" },
        h("h2", { className: "cr-t-title" }, props.title),
        props.onAll
          ? h("button", { type: "button", className: "cr-chip cr-chip--outline cr-chip--btn", "aria-label": props.allLabel || ("View " + props.count), "aria-haspopup": "dialog", onClick: props.onAll }, props.count)
          : h(Chip, { variant: "outline" }, props.count)),
      h("ul", null, (props.rows || []).slice(0, 3).map(function (r) {
        return h(FolderRow, { key: r.title, row: r, active: active === r.title, onActive: onActive, onOpen: props.onOpen, openLabel: props.openLabel, draggable: props.draggable });
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
        props.avatar ? h("img", { src: props.avatar, srcSet: props.avatarSet, alt: "", decoding: "async" }) : h("span", { style: { color: props.color } }, (props.name || "?").charAt(0))),
      h("span", { className: "cr-cursor-tag", style: { background: props.color } }, props.name));
  }

  /* A framed product window: poster first, then a muted looping clip once the card is on screen.
     Paused off-screen, on a hidden tab, with reduced motion or Save-Data (poster only). */
  function PreviewClip(props) {
    var box = useRef(null), vid = useRef(null), seen = useRef(false);
    var _w = useState(false), want = _w[0], setWant = _w[1];   /* mount the <video> */
    var _l = useState(false), live = _l[0], setLive = _l[1];   /* first frame painted: fade it in */
    var still = reduced() || !!(navigator.connection && navigator.connection.saveData) || !props.video;
    function sync() {
      var v = vid.current;
      if (!v) return;
      if (seen.current && !document.hidden) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
      else v.pause();
    }
    useEffect(function () {
      if (still || !box.current) return undefined;
      var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
        seen.current = es[es.length - 1].isIntersecting;
        if (seen.current) setWant(true);
        sync();
      }, { threshold: 0.25 }) : null;
      if (io) io.observe(box.current); else { seen.current = true; setWant(true); }
      document.addEventListener("visibilitychange", sync);
      return function () { if (io) io.disconnect(); document.removeEventListener("visibilitychange", sync); if (vid.current) vid.current.pause(); };
    }, [still]);
    useEffect(sync, [want]); /* the <video> just mounted: start it if the card is still in view */
    return h("span", { className: cx("cr-pclip", live && "is-live"), ref: box, "aria-hidden": "true" },
      h("img", { className: "cr-pclip-poster", src: props.poster, alt: "", decoding: "async", draggable: false }),
      want && !still ? h("video", { className: "cr-pclip-video", ref: vid, src: props.video, poster: props.poster,
        muted: true, playsInline: true, loop: true, preload: "auto", disablePictureInPicture: true, tabIndex: -1,
        onPlaying: function () { setLive(true); } }) : null);
  }

  function PreviewCard(props) {
    return h("article", { className: cx("cr-card cr-solid cr-preview", props.className), "data-cr-enter": "" },
      h("div", { className: "cr-preview-chips" },
        h(Chip, { variant: "label" }, props.label || "Live preview"),
        props.timer ? h(Chip, { variant: "timer", live: true }, props.timer) : null),
      h(props.href ? "a" : "div", { className: cx("cr-preview-shot", props.slides && "cr-preview-shot--strip"), href: props.href,
        /* with a footer arrow link, the picture stays clickable but out of the tab order */
        "aria-label": props.href && !props.arrowHref ? "Open " + props.title + " case study" : undefined,
        "data-clip": props.clip ? "" : undefined,
        tabIndex: props.arrowHref ? -1 : undefined, "aria-hidden": props.arrowHref ? "true" : undefined },
        props.clip ? h(PreviewClip, props.clip)
        : props.slides
          /* Three-slide strip like the reference: partial left, main, partial right, tiny labels above */
          ? h("span", { className: "cr-strip", "aria-hidden": "true" },
              props.slides.map(function (sl, i) {
                return h("span", { key: i, className: "cr-strip-slide cr-strip-slide--" + ["left", "main", "right"][i] },
                  sl.label ? h("span", { className: "cr-strip-label" }, sl.label) : null,
                  h("img", { src: sl.image, alt: "" }));
              }))
          : h("img", { src: props.image, alt: props.alt || "" }),
        (props.cursors || []).map(function (c, i) { return h(CursorChip, Object.assign({ key: c.name, wander: (i % 2) + 1 }, c)); })),
      h("div", { className: "cr-preview-foot" + (props.avatar || props.icon ? "" : " cr-preview-foot--noavatar") },
        props.icon ? h(ProjectWell, { icon: props.icon, tone: props.tone, badge: false })
          : props.avatar ? h(Avatar, { src: props.avatar, size: 50 }) : null,
        h("span", { className: "cr-row-text" }, h("b", null, props.title), h("span", null, props.subtitle)),
        props.arrowHref ? h("a", { className: "cr-chip cr-chip--count cr-preview-go", href: props.arrowHref, "aria-label": "Open " + props.title + " case study", title: "Open case study" }, h(Icon, { name: "arrow" }))
        : props.count != null ? h(Chip, { variant: "count" }, String(props.count))
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
    var ref = useRef(null), liveRef = useRef(null), apiRef = useRef(null);
    var live = !!(props.live && window.CraftLiveAvatar);
    useEffect(function () {
      if (!live || !liveRef.current) return undefined;
      apiRef.current = window.CraftLiveAvatar.mount(liveRef.current, { base: props.live.base });
      return function () { if (apiRef.current) apiRef.current.destroy(); apiRef.current = null; };
    }, [live]);
    /* a pointer click lets the character laugh for a beat before the sheet covers it; keys open at once */
    function onClick(ev) {
      if (!live || !apiRef.current || !ev.detail || reduced()) { if (props.onOpen) props.onOpen(ev); return; }
      apiRef.current.react();
      var btn = ev.currentTarget;
      setTimeout(function () { if (props.onOpen) props.onOpen({ currentTarget: btn, target: btn }); }, 280);
    }
    function onMove(ev) {
      if (live || reduced() || !ref.current) return;
      var r = ref.current.getBoundingClientRect();
      var dx = (ev.clientX - r.left - r.width / 2) / r.width, dy = (ev.clientY - r.top - r.height / 2) / r.height;
      ref.current.style.transform = "perspective(800px) rotateY(" + (dx * 8).toFixed(2) + "deg) rotateX(" + (-dy * 8).toFixed(2) + "deg)";
    }
    function onLeave() { if (ref.current) ref.current.style.transform = ""; }
    return h("div", { className: cx("cr-orb-slot", props.className), "data-cr-enter": "", "data-cr-orb": "" },
      h("button", { type: "button", className: "cr-orb cr-glass", ref: ref, onMouseMove: onMove, onMouseLeave: onLeave,
        onClick: onClick, "aria-label": "Open profile of " + (props.name || "") },
        live
          ? h("span", { className: "cr-orb-figure", "data-figure": "live" }, h("span", { className: "cr-avl", ref: liveRef, "aria-hidden": "true" }))
          : props.cutout
          ? h("span", { className: "cr-orb-figure", "data-figure": props.figure }, h("img", { className: "cr-orb-avatar", src: props.image, srcSet: props.imageSet, sizes: props.imageSet ? props.imageSizes : undefined, alt: "", decoding: "async" }))
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
        h("h2", { className: "cr-t-title" }, props.title),
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
          /* Colour in motion: each bar keeps its colour and lets lighter and deeper tints of it flow through.
             It grows in first (--bd), unless the card is static. */
          var still = props.animate === false || reduced();
          return h("i", { key: s.label, className: cx("cr-flow", still && "is-still"), style: { flex: s.value, "--c": s.color, "--d": (i * -2.3) + "s", "--bd": (0.3 + i * 0.12) + "s" } });
        })),
      h("div", { className: "cr-stat-keys" },
        segs.map(function (s) { return h("span", { key: s.label }, h("i", { style: { background: s.color } }), s.label); })),
      h("style", null, "@keyframes crBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}"));
  }

  /* ───────── Small board cards (mindset "Dashboard" screen) ───────── */

  /* "Data" card: title + link, one number, a segmented bar and two keys */
  function MiniStatCard(props) {
    var segs = props.segments || [];
    var val = useCountUp(props.value, props.decimals || 0, props.animate !== false);
    var keys = segs.slice(0, 2);
    var cardProps = props.onCard ? {
      role: "button", tabIndex: 0, "aria-label": props.cardLabel || props.title, "aria-haspopup": "dialog",
      onClick: function (ev) { if (ev.target.closest && ev.target.closest("a")) return; props.onCard(ev); },
      onKeyDown: function (ev) { if (ev.target === ev.currentTarget && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); props.onCard(ev); } }
    } : { "aria-label": props.title };
    return h("section", Object.assign({ className: cx("cr-card cr-solid cr-mstat", props.onCard && "is-clickable", props.className), "data-cr-enter": "" }, cardProps),
      h("header", { className: "cr-mstat-head" },
        h("h2", null, props.title),
        props.link ? h("a", { className: "cr-mstat-link", href: props.href || "#", "aria-haspopup": props.onLink ? "dialog" : undefined, "aria-label": props.linkLabel,
          onClick: props.onLink ? function (ev) { ev.preventDefault(); props.onLink(ev); } : undefined }, props.link, h(Icon, { name: "chevron", stroke: 2 })) : null),
      h("p", { className: "cr-mstat-value" }, val, props.unit || ""),
      h("div", { className: "cr-mstat-bars", role: "img", "aria-label": segs.map(function (s) { return s.label + " " + (s.caption || s.value); }).join(", ") },
        segs.map(function (s, i) {
          /* Colour in motion: each bar keeps its colour and lets lighter and deeper tints of it flow through.
             It grows in first (--bd), unless the card is static. */
          var still = props.animate === false || reduced();
          return h("i", { key: s.label, className: cx("cr-flow", still && "is-still"), style: { flex: s.value, "--c": s.color, "--d": (i * -2.3) + "s", "--bd": (0.3 + i * 0.12) + "s" } });
        })),
      h("p", { className: "cr-mstat-keys", "aria-hidden": "true" },
        keys.map(function (s) { return h("span", { key: s.label, title: s.label + ", " + (s.caption || "") }, h("i", { style: { background: s.color } }), s.short || s.label); })),
      h("style", null, "@keyframes crBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}"));
  }

  /* "Core Product Team" card as a button: title, subtitle, overlapping round thumbs, a count */
  function TeamCard(props) {
    var _o = useState(false), over = _o[0], setOver = _o[1];
    var drop = !!props.onDrop;
    return h("button", Object.assign({
      type: "button", className: cx("cr-card cr-solid cr-team", over && "is-over", props.className), "data-cr-enter": "",
      "aria-label": props.label, onClick: props.onOpen
    }, props.attrs || {}, drop ? {
      onDragOver: function (ev) { ev.preventDefault(); setOver(true); },
      onDragLeave: function () { setOver(false); },
      onDrop: function (ev) { ev.preventDefault(); setOver(false); props.onDrop(ev.dataTransfer.getData("text/plain")); }
    } : {}),
      h("span", { className: "cr-team-title" }, props.title),
      h("span", { className: "cr-team-sub" }, over && props.dropHint ? props.dropHint : props.subtitle),
      h("span", { className: "cr-team-foot", "aria-hidden": "true" },
        h("span", { className: "cr-team-faces" }, (props.thumbs || []).slice(0, 3).map(function (src, i) {
          return h("img", { key: i, src: src, alt: "", decoding: "async", draggable: false });
        })),
        h("span", { className: "cr-team-count" }, String(props.count))));
  }

  /* "Create a room": glass card, plus and one label */
  function ActionCard(props) {
    return h("button", { type: "button", className: cx("cr-card cr-glass cr-action", props.className), "data-cr-enter": "",
      "aria-haspopup": props.haspopup, onClick: props.onClick },
      h(Icon, { name: props.icon || "plus", className: "cr-action-icon", stroke: 1.5 }),
      h("span", { className: "cr-action-label" }, props.title));
  }

  /* "Happy Birthday!" card as a contact carousel. Dots, arrow keys and swipe move between slides;
     it advances on its own every few seconds, paused on hover, focus, hidden tab or reduced motion. */
  function ContactCard(props) {
    var slides = props.slides || [];
    var n = slides.length;
    var _i = useState(0), idx = _i[0], setIdx = _i[1];
    var _h = useState(false), hover = _h[0], setHover = _h[1];
    var _f = useState(false), focus = _f[0], setFocus = _f[1];
    var drag = useRef(null), swiped = useRef(false);
    var paused = hover || focus || reduced();
    function go(i) { setIdx(((i % n) + n) % n); }
    useEffect(function () {
      if (paused || n < 2) return undefined;
      var id = setInterval(function () { if (!document.hidden) setIdx(function (i) { return (i + 1) % n; }); }, props.interval || 5000);
      return function () { clearInterval(id); };
    }, [paused, n]);
    function onKey(ev) {
      if (ev.key === "ArrowRight") { ev.preventDefault(); go(idx + 1); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); go(idx - 1); }
    }
    return h("section", {
      className: cx("cr-card cr-glass cr-hello", props.className), "data-cr-enter": "",
      "aria-roledescription": "carousel", "aria-label": props.label || "Say hello",
      onKeyDown: onKey,
      onMouseEnter: function () { setHover(true); }, onMouseLeave: function () { setHover(false); },
      onFocus: function () { setFocus(true); },
      onBlur: function (ev) { if (!ev.currentTarget.contains(ev.relatedTarget)) setFocus(false); },
      onPointerDown: function (ev) { drag.current = { x: ev.clientX, y: ev.clientY }; swiped.current = false; },
      onPointerUp: function (ev) {
        var d = drag.current; drag.current = null;
        if (!d) return;
        var dx = ev.clientX - d.x, dy = ev.clientY - d.y;
        if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) { swiped.current = true; go(idx + (dx < 0 ? 1 : -1)); }
      },
      onPointerCancel: function () { drag.current = null; },
      onClickCapture: function (ev) { if (swiped.current) { swiped.current = false; ev.preventDefault(); ev.stopPropagation(); } }
    },
      h("div", { className: "cr-hello-track", "aria-live": paused ? "polite" : "off", style: { transform: "translateX(" + (-idx * 100) + "%)" } },
        slides.map(function (s, i) {
          var on = i === idx;
          return h("div", { key: s.id, className: cx("cr-hello-slide", on && "is-on"), role: "group", "aria-roledescription": "slide",
            "aria-label": (i + 1) + " of " + n + ": " + s.title, "aria-hidden": on ? undefined : "true" },
            h(ProjectWell, { icon: s.icon, tone: s.tone, className: "cr-hello-icon" }),
            h("a", { className: "cr-hello-go cr-hello-go--" + (s.tone || "plain"), href: s.href, tabIndex: on ? undefined : -1,
              target: s.external ? "_blank" : undefined, rel: s.external ? "noopener" : undefined,
              "aria-label": s.action, title: s.action, draggable: false },
              h(Icon, { name: s.go || "arrow", stroke: 1.8 })),
            h("span", { className: "cr-hello-title" }, s.title),
            h("span", { className: "cr-hello-sub" }, s.subParts ? [s.subParts[0], h("wbr", { key: "w" }), s.subParts[1]] : s.sub));
        })),
      h("div", { className: "cr-hello-dots", role: "group", "aria-label": "Choose a contact" },
        slides.map(function (s, i) {
          return h("button", { key: s.id, type: "button", className: cx("cr-hello-dot", i === idx && "is-on"),
            "aria-label": "Show " + s.name, "aria-current": i === idx ? "true" : undefined, onClick: function () { go(i); } });
        })));
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

  /* Round well for a project. Projects get their orb (assets/craft/orb.js: a grainy
     iridescent sphere, one colour trio per project, keyed by the project icon); anything
     else (contact slides) keeps the 1.5px line icon on a faint tint. Pass orb: false to force the icon. */
  var ORB_CORE = { chatSpark: "./assets/craft/icons/chat-spark.png", dealDoc: "./assets/craft/icons/deal-room.png", swatch: "./assets/craft/icons/white-label.png" };
  function ProjectWell(props) {
    var O = window.CraftOrb;
    var key = props.orb === false ? null : (typeof props.orb === "string" ? props.orb : props.icon);
    var isOrb = !!(O && key && O.has(key));
    var ref = useRef(null);
    useEffect(function () { return isOrb ? O.mount(ref.current, key) : undefined; }, [isOrb, key]);
    /* Black badge on the orb's bottom edge with a white glyph saying what the project is
       (glyph data in orb.js). Pass badge: false to leave it off. */
    var core = isOrb ? ORB_CORE[key] : null;
    var glyph = isOrb && !core && props.badge !== false && O.glyph ? O.glyph(key) : null;
    /* The three Systematic case studies carry their own icon in a frosted disc at the centre of the orb */
    if (core) return h("span", { className: cx("cr-pwell cr-pwell--orb has-core", props.className), ref: ref, "aria-hidden": "true",
      style: { backgroundImage: O.fallback(key) } },
      h("span", { className: "cr-orb-core" }, h("img", { src: core, alt: "", width: 48, height: 48, decoding: "async" })));
    if (isOrb) return h("span", { className: cx("cr-pwell cr-pwell--orb", glyph && "has-badge", props.className), ref: ref, "aria-hidden": "true",
      style: { backgroundImage: O.fallback(key) } },
      glyph ? h("span", { className: "cr-orb-badge" },
        h("svg", { className: "cr-orb-glyph", viewBox: "0 0 24 24", focusable: "false", "aria-hidden": "true" },
          glyph.map(function (g, i) {
            var p = { key: i, opacity: g.o };
            if (g.f || g.kf) p.fill = g.f ? "#fff" : "currentColor"; else p.fill = "none";
            if (g.s || g.k) { p.stroke = g.s ? "#fff" : "currentColor"; p.strokeWidth = g.s || g.k; p.strokeLinecap = "round"; p.strokeLinejoin = "round"; }
            if (g.c) { p.cx = g.c[0]; p.cy = g.c[1]; p.r = g.c[2]; return h("circle", p); }
            p.d = g.d; return h("path", p);
          }))) : null);
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

  /* One timeline entry in the profile sheet: dot + rail, role and place on the left, dates on the right */
  function ProfileTimeline(props) {
    var rows = props.rows || [];
    if (!rows.length) return null;
    return h("section", { className: "cr-pt", "aria-labelledby": props.id },
      h("h3", { id: props.id, className: "cr-pt-title" }, props.title),
      h("ol", { className: "cr-pt-list" }, rows.map(function (r, i) {
        return h("li", { key: r.title + i, className: cx("cr-pt-row", r.current && "is-current") },
          h("span", { className: "cr-pt-dot", "aria-hidden": "true" }),
          h("div", { className: "cr-pt-main" },
            h("p", { className: "cr-pt-role" }, r.title),
            h("p", { className: "cr-pt-org" }, [r.org, r.place].filter(Boolean).join(" · ")),
            r.note ? h("p", { className: "cr-pt-note" }, r.note) : null),
          h("p", { className: "cr-pt-date" }, r.dates));
      })));
  }

  /* Profile photos: one photo at a time, a round arrow on the right moves to the next (and loops) */
  function ProfilePhotos(props) {
    var list = (props.images && props.images.length) ? props.images : [{ src: props.image, alt: props.name }];
    var _i = useState(0), idx = _i[0], setIdx = _i[1];
    function go(d) { setIdx(function (i) { return (i + d + list.length) % list.length; }); }
    return h("div", { className: "cr-profile-photo" },
      list.map(function (im, i) {
        return h("img", { key: im.src, className: cx("cr-pp-slide", i === idx && "is-on"), src: im.src, alt: i === idx ? (im.alt || props.name) : "", "aria-hidden": i === idx ? undefined : "true",
          style: im.pos ? { objectPosition: im.pos } : undefined, decoding: "async" });
      }),
      list.length > 1 ? h("div", { className: "cr-pp-nav" },
        h("button", { type: "button", className: "cr-pp-btn cr-pp-btn--prev cr-glass-light", "aria-label": "Previous photo", onClick: function () { go(-1); } }, h(Icon, { name: "chevron", stroke: 2 })),
        h("div", { className: "cr-pp-dots", "aria-hidden": "true" }, list.map(function (im, i) { return h("i", { key: im.src, className: i === idx ? "is-on" : "" }); })),
        h("button", { type: "button", className: "cr-pp-btn cr-pp-btn--next cr-glass-light", "aria-label": "Next photo", onClick: function () { go(1); } }, h(Icon, { name: "chevron", stroke: 2 }))) : null);
  }

  function ProfileSheet(props) {
    var ref = useRef(null);
    useDialogFocus(ref);
    /* Opened from the Experience card: glide to the Experience timeline once the sheet has opened */
    useEffect(function () {
      if (props.focus !== "experience") return undefined;
      var t = setTimeout(function () {
        var sheet = ref.current, head = sheet && sheet.querySelector("#cr-pt-exp");
        if (!head) return;
        var sec = head.closest(".cr-pt") || head;
        sec.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
        head.setAttribute("tabindex", "-1");
        try { head.focus({ preventScroll: true }); } catch (e) { head.focus(); }
      }, reduced() ? 60 : 560);
      return function () { clearTimeout(t); };
    }, [props.focus]);
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
      Array.prototype.slice.call(sheet.querySelectorAll(".cr-profile-head, .cr-profile-scroll > *")).forEach(function (n, i) {
        n.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 560, delay: 220 + Math.min(i, 7) * 60, easing: EASE_ARRIVE, fill: "backwards" });
      });
    }, []);
    function close() {
      var sheet = ref.current;
      if (!sheet || reduced()) { props.onClose(); return; }
      sheet.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(0.96)" }], { duration: 240, easing: EASE_LEAVE, fill: "both" }).finished.then(props.onClose);
    }
    return h("section", { className: "cr-sheet cr-profile-sheet", ref: ref, role: "dialog", "aria-modal": "true", "aria-label": props.name,
      style: props.style || { left: 184, right: 184, top: 172, height: 600 } },
      /* Header sits outside the scroll area so status + close stay put (sticky on phones) */
      h("div", { className: "cr-profile-head" },
        h(LiveStatus, { label: props.status || "Open to work" }),
        h(IconButton, { variant: "solid", icon: "close", label: "Close profile", onClick: close })),
      h(ProfilePhotos, { images: props.images, image: props.image, name: props.name }),
      h("div", { className: "cr-profile-body" },
        h("div", { className: "cr-profile-scroll", tabIndex: -1 },
          h("p", { className: "cr-sheet-title" }, props.name),
          h("p", { className: "cr-sheet-sub" }, props.role),
          h("p", { className: "cr-t-body cr-profile-bio" }, props.bio),
          props.ai ? h("section", { className: "cr-profile-ai", "aria-labelledby": "cr-profile-ai-t" },
            h("h3", { id: "cr-profile-ai-t", className: "cr-profile-ai-title" }, props.ai.title),
            h("p", { className: "cr-t-body cr-profile-bio" }, props.ai.text)) : null,
          props.links ? h("div", { className: "cr-profile-links" }, props.links.map(function (l) {
            return l.onClick
              ? h("button", { key: l.label, type: "button", className: "cr-chip", onClick: l.onClick }, l.label)
              : h("a", { key: l.label, className: "cr-chip", href: l.href, target: l.external ? "_blank" : undefined, rel: l.external ? "noreferrer" : undefined }, l.label);
          })) : null,
          h("div", { className: "cr-profile-facts" },
            (props.facts || []).map(function (f) { return h("div", { key: f.label, className: "cr-fact" }, h("b", null, f.value), h("span", null, f.label)); })),
          h(ProfileTimeline, { id: "cr-pt-exp", title: "Experience", rows: props.experience }),
          h(ProfileTimeline, { id: "cr-pt-edu", title: "Education", rows: props.education }))));
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
     The pill plays a short original track (assets/craft/audio, made for this board).
     It starts paused. On the first play the line starts at 0, then jumps to just before
     the drop: the product idea, start at the moment you want. The line follows the audio
     clock, the bars follow real levels (AnalyserNode), and it loops back to the drop. */
  var NP_ART = "./assets/resonance/np-art.jpg";
  var NP_POSTER = "./assets/resonance/np-art-lg.jpg";
  var NP_FRAME = "./assets/resonance/mockup/iphone-frame.webp";
  var NP_DESIGN_W = 390;
  /* Same host rule as resonance-short.html: GitHub Pages build next to the GitHub Pages portfolio */
  function resonanceBase() {
    return /\.github\.io$/i.test(location.hostname) ? "https://gauravavinash44-blip.github.io/drop-mode/" : "https://drop-mode.vercel.app/";
  }
  var NP_ICON = {
    play: "M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.1-6.4a.8.8 0 0 0 0-1.4L9.2 4.9a.8.8 0 0 0-1.2.7z",
    pause: "M7 5h3.4v14H7zM13.6 5H17v14h-3.4z"
  };

  var NP_AUDIO = [
    { src: "./assets/craft/audio/resonance-demo.mp3", type: "audio/mpeg" },
    { src: "./assets/craft/audio/resonance-demo.ogg", type: 'audio/ogg; codecs="vorbis"' }
  ];
  var NP_DUR = 52;          /* seconds, used for layout until the file reports its own */
  var NP_DROP = 16;         /* the drop, found by energy analysis of the track */
  var NP_JUMP_AT = 2.5;     /* first play: let the intro run this long, then skip */
  var NP_JUMP_TO = NP_DROP - 1.5; /* land on the snare roll so the drop hits a beat later */
  var NP_FADE = 250;
  /* Every mounted pill, so the Resonance popup can pause them (the live prototype has its own sound) */
  var npPlayers = [];
  function npPauseAll() { npPlayers.forEach(function (p) { p.pause(); }); }

  /* ───────── Prototype Now Playing ─────────
     The live prototype in the popup (assets/resonance/app, same origin) runs rs-bridge.js, which posts
     { type: "rs-now-playing", track, playing, position, duration, ... } here and takes
     { type: "rs-control", action: play | pause | next | prev | seek } back. Only messages from our own
     origin and from the one prototype frame we mounted count. The board widget turns into the mini
     player for whatever the prototype plays, and only one of the two (demo, prototype) sounds at a time. */
  var RS_IDLE = { track: null, playing: false, loading: false, position: 0, duration: 0, error: null, at: 0 };
  var rsNow = RS_IDLE, rsWin = null, rsSubs = [], rsKey = "";
  var msOwner = null; /* who holds the Media Session: "demo" | "proto" */
  function rsSubscribe(fn) { rsSubs.push(fn); return function () { rsSubs = rsSubs.filter(function (f) { return f !== fn; }); }; }
  function rsEmit() {
    /* position moves every few hundred ms; views redraw only when something they show changes */
    var t = rsNow.track;
    var key = t ? [t.id, t.coverFailed, rsNow.playing, rsNow.loading, rsNow.error, Math.round(rsNow.duration)].join("|") : "";
    if (key === rsKey) return;
    rsKey = key;
    rsSubs.slice().forEach(function (fn) { fn(rsNow); });
  }
  function rsAttach(win) { if (win) rsWin = win; }
  function rsDetach(win) {
    if (!win || rsWin !== win) return;
    rsWin = null;
    rsNow = RS_IDLE;
    rsEmit();
    if (msOwner === "proto") msClear();
  }
  function rsControl(action, extra) {
    if (!rsWin) return false;
    try { rsWin.postMessage(Object.assign({ type: "rs-control", action: action }, extra || {}), location.origin); } catch (err) { return false; }
    return true;
  }
  function rsPositionNow() {
    var n = rsNow;
    if (!n.track) return 0;
    var p = n.position + (n.playing ? (performance.now() - n.at) / 1000 : 0);
    return n.duration > 0 ? Math.min(p, n.duration) : p;
  }
  window.addEventListener("message", function (ev) {
    if (ev.origin !== location.origin || !rsWin || ev.source !== rsWin) return;
    var d = ev.data;
    if (!d || d.type !== "rs-now-playing") return;
    var was = rsNow.playing;
    rsNow = {
      track: d.track && typeof d.track === "object" ? d.track : null,
      playing: !!d.playing, loading: !!d.loading,
      position: +d.position || 0, duration: +d.duration || 0,
      error: d.error || null, at: performance.now()
    };
    if (rsNow.playing && !was) npPauseAll(); /* one source of sound at a time */
    rsSession();
    rsEmit();
  });

  /* Media Session for the prototype's song: OS media controls (lock screen, media keys) show it and
     drive the prototype. The frame sets the same on its side; browsers use whichever frame they route to. */
  var rsSessionKey = "", rsPosAt = 0;
  function msClear() {
    var ms = navigator.mediaSession;
    msOwner = null; rsSessionKey = "";
    if (!ms) return;
    try {
      ["play", "pause", "nexttrack", "previoustrack", "seekto"].forEach(function (a) { try { ms.setActionHandler(a, null); } catch (err) { /* unsupported */ } });
      ms.metadata = null;
      ms.playbackState = "none";
    } catch (err) { /* older browsers */ }
  }
  function rsArt(t) { return t.coverFailed || !t.cover ? t.placeholder : t.cover; }
  function rsSession() {
    var ms = navigator.mediaSession, n = rsNow, t = n.track;
    if (!ms || !t) return;
    /* the demo keeps the session while it plays and the prototype is quiet */
    if (msOwner === "demo" && !n.playing) return;
    try {
      var key = t.id + "|" + t.coverFailed + "|" + !!t.art;
      if (msOwner !== "proto" || key !== rsSessionKey) {
        msOwner = "proto"; rsSessionKey = key;
        if (window.MediaMetadata) {
          var art = t.coverFailed || !t.cover
            ? (t.art ? [{ src: t.art, sizes: "512x512", type: "image/png" }] : [])
            : [{ src: t.cover, sizes: "600x600", type: "image/jpeg" }];
          ms.metadata = new MediaMetadata({ title: t.title || "", artist: t.artist || "", album: "Resonance prototype", artwork: art });
        }
        [["play", function () { rsControl("play"); }], ["pause", function () { rsControl("pause"); }],
         ["nexttrack", function () { rsControl("next"); }], ["previoustrack", function () { rsControl("prev"); }],
         ["seekto", function (d) { if (d && isFinite(d.seekTime)) rsControl("seek", { time: d.seekTime }); }]].forEach(function (h) {
          try { ms.setActionHandler(h[0], h[1]); } catch (err) { /* unsupported action */ }
        });
      }
      ms.playbackState = n.playing ? "playing" : "paused";
      var now = performance.now();
      if (n.duration > 0 && (now - rsPosAt > 900 || !n.playing)) {
        rsPosAt = now;
        ms.setPositionState({ duration: n.duration, playbackRate: 1, position: Math.min(n.position, n.duration) });
      }
    } catch (err) { /* older browsers */ }
  }
  function useRsNow() {
    var _s = useState(rsNow), s = _s[0], set = _s[1];
    useEffect(function () { set(rsNow); return rsSubscribe(function (n) { set(n); }); }, []);
    return s;
  }

  /* One Resonance player: audio element, gain + analyser, the jump to the drop, Media Session.
     Starts paused; pauses itself on a hidden tab, when the popup opens (npPauseAll) and on unmount.
     The view passes fillRef (progress line) and eqRef (four bars); JS writes them from the audio. */
  function useResonancePlayer() {
    var _p = useState(false), playing = _p[0], setPlaying = _p[1];
    var _m = useState(false), moment = _m[0], setMoment = _m[1];
    var _j = useState(false), jumping = _j[0], setJumping = _j[1];
    var _u = useState(false), pulse = _u[0], setPulse = _u[1];
    var _c = useState(false), cssEq = _c[0], setCssEq = _c[1];
    var fillRef = useRef(null), eqRef = useRef(null), waveRef = useRef(null);
    var api = useRef(null);

    useEffect(function () {
      var audio = null, ctx = null, gain = null, analyser = null, bins = null;
      var raf = 0, fadeRaf = 0, jumped = false, want = false, alive = true, seq = 0;
      var waveAt = 0, waveHist = [];
      var timers = [];
      function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
      function clearTimers() { timers.forEach(clearTimeout); timers = []; }
      function dur() { return audio && isFinite(audio.duration) && audio.duration > 0 ? audio.duration : NP_DUR; }

      function ensureAudio() {
        if (audio) return audio;
        audio = document.createElement("audio");
        audio.preload = "none";
        var pick = NP_AUDIO.filter(function (s) { return audio.canPlayType(s.type); })[0] || NP_AUDIO[NP_AUDIO.length - 1];
        audio.src = pick.src;
        audio.addEventListener("ended", function () { if (want) loopBack(); });
        audio.addEventListener("error", function () { stop(true); });
        /* paused from outside (headphones out, OS controls): follow it */
        /* (pause events arrive a task late: one from our own fade-out can land after a quick re-play, so check the element) */
        audio.addEventListener("pause", function () { if (want && audio.paused && !audio.ended) stop(true); });
        /* Real levels for the bars; the audio still plays without it */
        try {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (AC) {
            ctx = new AC();
            var srcNode = ctx.createMediaElementSource(audio);
            gain = ctx.createGain(); gain.gain.value = 0;
            analyser = ctx.createAnalyser(); analyser.fftSize = 64; analyser.smoothingTimeConstant = 0.72;
            bins = new Uint8Array(analyser.frequencyBinCount);
            srcNode.connect(gain); gain.connect(analyser); analyser.connect(ctx.destination);
          }
        } catch (err) { ctx = null; gain = null; analyser = null; }
        if (!analyser && alive) setCssEq(true);
        return audio;
      }

      /* Volume ramps: a GainNode when we have one, element volume otherwise */
      function ramp(to, ms, then) {
        cancelAnimationFrame(fadeRaf);
        if (gain && ctx) {
          var now = ctx.currentTime;
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.linearRampToValueAtTime(to, now + ms / 1000);
          if (then) later(then, ms);
          return;
        }
        var from = audio.volume, t0 = performance.now();
        (function step(t) {
          var k = Math.min(1, (t - t0) / ms);
          try { audio.volume = from + (to - from) * k; } catch (err) { /* iOS: volume is read-only */ }
          if (k < 1) fadeRaf = requestAnimationFrame(step); else if (then) then();
        })(t0);
      }

      function paint() {
        if (!audio) return;
        var k = Math.max(0, Math.min(1, audio.currentTime / dur()));
        if (fillRef.current) fillRef.current.style.transform = "scaleX(" + k.toFixed(4) + ")";
        var bars = eqRef.current ? eqRef.current.children : [];
        var wave = waveRef.current ? waveRef.current.children : [];
        if (!analyser || reduced() || (!bars.length && !wave.length)) return;
        analyser.getByteFrequencyData(bins);
        if (bars.length) {
          /* four bands across the low and mid range, where this track lives */
          var bands = [[1, 2], [3, 5], [6, 9], [10, 16]];
          for (var i = 0; i < bars.length && i < bands.length; i++) {
            var a = bands[i][0], b = bands[i][1], sum = 0;
            for (var j = a; j <= b; j++) sum += bins[j];
            var v = sum / ((b - a + 1) * 255);
            bars[i].style.transform = "scaleY(" + Math.max(0.18, Math.min(1, v * 1.35)).toFixed(3) + ")";
          }
        }
        /* Scrolling waveform (idea from ElevenLabs UI's ScrollingWaveform, our own build): one new
           level every ~70ms enters on the right and the history slides left. Transforms only. */
        if (wave.length && want) {
          var now = performance.now();
          if (now - waveAt >= 70) {
            waveAt = now;
            var s = 0;
            for (var q = 1; q <= 16; q++) s += bins[q];
            var lvl = Math.min(1, Math.pow(s / (16 * 255), 1.6) * 1.45);
            waveHist.push(lvl); if (waveHist.length > wave.length) waveHist.shift();
            var off = wave.length - waveHist.length;
            for (var m = 0; m < wave.length; m++) {
              var hv = m < off ? 0 : waveHist[m - off];
              wave[m].style.transform = "scaleY(" + Math.max(0.12, hv).toFixed(3) + ")";
            }
          }
        }
      }
      function loop() {
        /* don't wait for "ended": some decoders report a longer duration than the audio holds */
        if (want && audio && !audio.seeking && audio.currentTime >= Math.min(dur(), NP_DUR) - 0.3) loopBack();
        paint(); raf = requestAnimationFrame(loop);
      }

      function showMoment() {
        if (!alive) return;
        setMoment(true);
        if (!reduced()) { setPulse(false); requestAnimationFrame(function () { if (alive) setPulse(true); }); }
        later(function () { if (alive) { setMoment(false); setPulse(false); } }, 4200);
      }
      function jumpTo(t) {
        if (!audio || !want) return;
        if (!reduced()) { setJumping(true); later(function () { if (alive) setJumping(false); }, 520); }
        /* dip the volume across the seek so the skip doesn't click */
        ramp(0, 90, function () {
          if (!audio || !want) return;
          try { audio.currentTime = t; } catch (err) { /* not seekable yet */ }
          paint();
          ramp(1, NP_FADE);
          showMoment();
        });
      }
      function loopBack() {
        try { audio.currentTime = NP_JUMP_TO; } catch (err) { /* ignore */ }
        if (!audio.paused) { showMoment(); return; }
        var pr = audio.play();
        if (pr && pr.catch) pr.catch(function () { stop(true); });
        showMoment();
      }

      function play() {
        if (want) return;
        ensureAudio();
        rsControl("pause"); /* the prototype in the popup goes quiet: one source of sound at a time */
        want = true; setPlaying(true);
        var my = ++seq;
        /* resume inside the tap; Safari can also leave it "interrupted" after a call or another tab */
        if (ctx && ctx.state !== "running") ctx.resume().catch(function () {});
        if (!gain) { try { audio.volume = 0; } catch (err) { /* ignore */ } }
        var pr;
        try { pr = audio.play(); } catch (err) { stop(true); return; }
        var started = function () {
          if (!want || my !== seq) return;
          /* the element plays through the AudioContext: if that never runs, the "playing" UI would sit on silence */
          if (ctx && ctx.state !== "running") {
            ctx.resume().catch(function () {});
            later(function () { if (want && my === seq && ctx.state !== "running") stop(true); }, 700);
          }
          ramp(1, NP_FADE);
          cancelAnimationFrame(raf); loop();
          if (!jumped) {
            jumped = true;
            later(function () { if (audio.currentTime < NP_JUMP_TO) jumpTo(NP_JUMP_TO); }, Math.max(0, (NP_JUMP_AT - audio.currentTime) * 1000));
          }
        };
        /* a play() that a later pause or play superseded rejects with AbortError: not this attempt's failure */
        if (pr && pr.then) pr.then(started, function (err) { if (my === seq && !(err && err.name === "AbortError" && !want)) stop(true); });
        else started();
        setMediaSession();
      }
      /* hard = no fade (error, autoplay refused, unmount) */
      function stop(hard) {
        var was = want;
        want = false;
        waveHist = [];
        clearTimers();
        if (alive) { setPlaying(false); setMoment(false); setPulse(false); setJumping(false); }
        if (!audio) return;
        /* a jump scheduled but not yet taken happens on the next play */
        if (audio.currentTime < NP_JUMP_TO) jumped = false;
        var finish = function () { if (want) return; cancelAnimationFrame(raf); audio.pause(); paint(); };
        if (hard || !was) {
          cancelAnimationFrame(fadeRaf);
          if (gain && ctx) { gain.gain.cancelScheduledValues(ctx.currentTime); gain.gain.setValueAtTime(0, ctx.currentTime); }
          finish();
        }
        else ramp(0, NP_FADE, finish);
        if (navigator.mediaSession && msOwner === "demo") try { navigator.mediaSession.playbackState = "paused"; } catch (err) { /* ignore */ }
      }
      function setMediaSession() {
        var ms = navigator.mediaSession;
        if (!ms) return;
        msOwner = "demo"; rsSessionKey = "";
        try {
          if (window.MediaMetadata) ms.metadata = new MediaMetadata({
            title: "Resonance demo", artist: "Gaurav Avinash", album: "Resonance",
            artwork: [{ src: new URL(NP_POSTER, location.href).href, sizes: "512x512", type: "image/jpeg" }]
          });
          ms.setActionHandler("play", function () { play(); });
          ms.setActionHandler("pause", function () { stop(false); });
          ["nexttrack", "previoustrack", "seekto"].forEach(function (a) { try { ms.setActionHandler(a, null); } catch (err) { /* unsupported */ } });
          ms.playbackState = "playing";
          if (ms.setPositionState && audio && isFinite(audio.duration) && audio.duration > 0) ms.setPositionState({ duration: audio.duration, playbackRate: 1, position: Math.min(audio.currentTime, audio.duration) });
        } catch (err) { /* older browsers */ }
      }
      function onVis() { if (document.hidden && want) stop(true); }
      document.addEventListener("visibilitychange", onVis);

      var player = { play: play, pause: function () { if (want) stop(false); }, toggle: function () { if (want) stop(false); else play(); } };
      api.current = player;
      npPlayers.push(player);
      return function () {
        alive = false;
        document.removeEventListener("visibilitychange", onVis);
        npPlayers = npPlayers.filter(function (p) { return p !== player; });
        stop(true);
        cancelAnimationFrame(fadeRaf);
        if (audio) { audio.removeAttribute("src"); try { audio.load(); } catch (err) { /* ignore */ } }
        if (ctx && ctx.close) ctx.close().catch(function () {});
        /* another card instance (or the prototype) may hold the session by now: only clear our own */
        if (msOwner === "demo" && !npPlayers.length) msClear();
      };
    }, []);
    return {
      playing: playing, moment: moment, jumping: jumping, pulse: pulse, cssEq: cssEq,
      fillRef: fillRef, eqRef: eqRef, waveRef: waveRef,
      toggle: function () { if (api.current) api.current.toggle(); }
    };
  }
  function npStateClass(pl) {
    return cx(pl.playing ? "is-playing" : "is-paused", pl.moment && "is-moment", pl.jumping && "is-jumping", pl.pulse && "is-pulse", pl.cssEq && "is-eq-css");
  }
  var NP_MARK_LEFT = (NP_DROP / NP_DUR * 100).toFixed(2) + "%";

  /* Compact pill (kept for other layouts; the board uses ResonanceCard) */
  function NowPlayingPill(props) {
    var pl = useResonancePlayer();
    var ref = useRef(null);
    function open(ev) {
      if (ev) ev.stopPropagation(); /* the stage treats bare taps as "change wallpaper" */
      if (ev && ev.target.closest && ev.target.closest(".cr-np-play")) return;
      npPauseAll();
      if (props.onOpen) props.onOpen(ref.current);
    }
    var title = props.title || "Resonance";
    return h("div", { className: cx("cr-np", npStateClass(pl)),
        ref: ref, onClick: open, "data-cr-enter": "", "data-np-pill": "", "data-drop": NP_DROP },
      h("button", { type: "button", className: "cr-np-open", "aria-haspopup": "dialog",
        "aria-label": props.label || (title + " for Spotify. Open the live prototype") },
        h("span", { className: "cr-np-art", "aria-hidden": "true" }, h("img", { src: props.art || NP_ART, alt: "", decoding: "async" })),
        h("span", { className: "cr-np-text", "aria-hidden": "true" },
          h("span", { className: "cr-np-title" }, title),
          h("span", { className: "cr-np-sub" },
            h("span", { className: "cr-np-sub-a" }, h("i", { className: "cr-np-dot" }), props.sub || "For Spotify"),
            h("span", { className: "cr-np-sub-b" }, props.moment || "Your moment")),
          h("span", { className: "cr-np-track" },
            h("i", { className: "cr-np-fill", ref: pl.fillRef }),
            h("i", { className: "cr-np-mark", style: { left: NP_MARK_LEFT } }))),
        h("span", { className: "cr-np-eq", ref: pl.eqRef, "aria-hidden": "true" }, h("i"), h("i"), h("i"), h("i"))),
      h("button", { type: "button", className: "cr-np-play", "aria-label": pl.playing ? "Pause preview" : "Play preview", "aria-pressed": pl.playing ? "true" : "false",
        onClick: function (ev) { ev.stopPropagation(); pl.toggle(); } },
        h("svg", { viewBox: "0 0 24 24", width: 16, height: 16, "aria-hidden": "true", fill: "currentColor" },
          h("path", { d: pl.playing ? NP_ICON.pause : NP_ICON.play }))));
  }

  /* Board card: an iOS-style music widget. The background is a soft tint sampled from the album
     art (greyscale art falls back to a dusty blue), art top-left, a round mark top-right, title and
     line bottom-left, a big round play button bottom-right, progress along the bottom edge.
     The body opens the Resonance popup, which grows out of this card; the play button only plays. */
  var RP_TINT = "#467ca2";
  var RP_WAVE_BARS = 14;
  var rpTintCache = {};
  function rpSampleTint(src, done, cors, fallback) {
    if (rpTintCache[src]) { done(rpTintCache[src]); return; }
    var fb = fallback || RP_TINT;
    var img = new Image();
    img.decoding = "async";
    /* outside covers (Apple's CDN) can only be read back with CORS; without it the fallback tint stays */
    if (cors) img.crossOrigin = "anonymous";
    img.onload = function () {
      try {
        var c = document.createElement("canvas"); c.width = c.height = 12;
        var g = c.getContext("2d"); g.drawImage(img, 0, 0, 12, 12);
        var d = g.getImageData(0, 0, 12, 12).data, r = 0, gg = 0, b = 0, n = d.length / 4;
        for (var i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
        r /= n * 255; gg /= n * 255; b /= n * 255;
        var mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), l = (mx + mn) / 2, sat = mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1));
        var hue = 0;
        if (mx !== mn) {
          hue = mx === r ? ((gg - b) / (mx - mn)) % 6 : mx === gg ? (b - r) / (mx - mn) + 2 : (r - gg) / (mx - mn) + 4;
          hue = (hue * 60 + 360) % 360;
        }
        /* too grey to carry a colour: keep the dusty blue */
        var tint = sat < 0.14 ? RP_TINT : "hsl(" + Math.round(hue) + " " + Math.round(Math.min(0.46, Math.max(0.26, sat)) * 100) + "% " + Math.round(Math.min(0.42, Math.max(0.33, l)) * 100) + "%)";
        rpTintCache[src] = tint; done(tint);
      } catch (err) { done(fb); }
    };
    img.onerror = function () { done(fb); };
    img.src = src;
  }
  /* Warm the popup's big images on intent (hover, focus, press) so the open morph never waits on a decode */
  var rpWarmed = false;
  function rpWarm() {
    if (rpWarmed) return;
    rpWarmed = true;
    [RS_HOME, NP_FRAME].forEach(function (u) {
      var im = new Image(); im.decoding = "async"; im.src = u;
      if (im.decode) im.decode().catch(function () {});
    });
  }
  var RP_MARK = "M7.5 10v4M10.5 7.5v9M13.5 9v6M16.5 11v2";
  var RP_PAUSE = "M8.3 5h1.4c.7 0 1.3.6 1.3 1.3v11.4c0 .7-.6 1.3-1.3 1.3H8.3c-.7 0-1.3-.6-1.3-1.3V6.3C7 5.6 7.6 5 8.3 5zM14.3 5h1.4c.7 0 1.3.6 1.3 1.3v11.4c0 .7-.6 1.3-1.3 1.3h-1.4c-.7 0-1.3-.6-1.3-1.3V6.3c0-.7.6-1.3 1.3-1.3z";

  /* Mini player mode: while the prototype has a song, the card shows that song (cover, title, artist,
     progress, play state) and its play button drives the prototype, Spotify's mini player style. */
  function useRsProgress(fillRef, now) {
    useEffect(function () {
      if (!now.track) return undefined;
      var raf = 0;
      function paint() {
        var el = fillRef.current, d = rsNow.duration;
        if (el) el.style.transform = "scaleX(" + (d > 0 ? Math.max(0, Math.min(1, rsPositionNow() / d)) : 0).toFixed(4) + ")";
        if (rsNow.playing) raf = requestAnimationFrame(paint);
      }
      paint();
      return function () { cancelAnimationFrame(raf); };
    }, [now]);
  }

  function ResonanceCard(props) {
    var pl = useResonancePlayer();
    var now = useRsNow(), t = now.track, proto = !!t;
    var openRef = useRef(null), protoFillRef = useRef(null);
    var _af = useState(""), artFailed = _af[0], setArtFailed = _af[1];
    var art = proto ? (t.coverFailed || artFailed === t.cover ? t.placeholder : t.cover) : (props.art || NP_ART);
    var _t = useState(rpTintCache[art] || RP_TINT), tint = _t[0], setTint = _t[1];
    useEffect(function () {
      var alive = true;
      if (proto && art === t.placeholder) {
        /* generated cover: its own hue, in the widget's tint range */
        setTint("hsl(" + (t.hue || 0) + " 40% 38%)");
      } else {
        rpSampleTint(art, function (c) { if (alive) setTint(c); }, proto, proto ? "hsl(" + (t.hue || 0) + " 40% 38%)" : null);
      }
      return function () { alive = false; };
    }, [art]);
    useRsProgress(protoFillRef, now);
    var title = proto ? t.title : (props.title || "Resonance");
    var playing = proto ? now.playing : pl.playing;
    function open(ev) {
      if (ev) ev.stopPropagation(); /* the stage treats bare taps as "change wallpaper" */
      if (ev && ev.target.closest && ev.target.closest(".cr-rp-play")) return;
      if (!proto) npPauseAll(); /* the prototype keeps playing while you look at it */
      rpWarm();
      if (props.onOpen) props.onOpen(openRef.current);
    }
    function toggle(ev) {
      ev.stopPropagation();
      if (!proto) { pl.toggle(); return; }
      /* the prototype frame went away (should not happen while it has a song): open it instead */
      if (!rsControl(now.playing ? "pause" : "play")) open(null);
    }
    var momentLeft = proto && now.duration > 0 && t.momentMs > 0 && t.momentMs / 1000 < now.duration
      ? (t.momentMs / 10 / now.duration).toFixed(2) + "%" : null;
    var wave = [];
    for (var i = 0; i < RP_WAVE_BARS; i++) wave.push(h("i", { key: i }));
    var stateClass = proto
      ? cx(playing ? "is-playing" : "is-paused", "is-eq-css", "is-proto", now.loading && "is-loading")
      : npStateClass(pl);
    return h("div", { className: cx("cr-card cr-rp", stateClass, props.className),
        style: { "--rp-tint": tint },
        onClick: open, onPointerEnter: rpWarm, onFocus: rpWarm,
        "data-cr-enter": "", "data-np-card": "", "data-drop": NP_DROP, "data-track": proto ? t.id : undefined },
      h("button", { type: "button", className: "cr-rp-open", ref: openRef, "aria-haspopup": "dialog",
        "aria-label": proto ? (t.title + " by " + t.artist + (playing ? ", playing" : ", paused") + " in the Resonance prototype. Open it")
          : props.label || (title + " for Spotify. Open the live prototype") }),
      h("span", { className: "cr-rp-art", "aria-hidden": "true" },
        proto
          ? h("img", { key: "proto", src: art, alt: "", decoding: "async", draggable: false,
              onError: function () { if (art === t.cover) setArtFailed(t.cover); } })
          : h("img", { key: "demo", src: art, srcSet: art + " 1x, " + (props.artLg || NP_POSTER) + " 2.5x", alt: "", decoding: "async", draggable: false }),
        h("span", { className: "cr-rp-wave", ref: proto ? null : pl.waveRef }, wave)),
      h("span", { className: "cr-rp-mark", "aria-hidden": "true" },
        h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" },
          h("path", { d: RP_MARK }))),
      h("span", { className: "cr-rp-meta", "aria-hidden": "true" },
        h("span", { className: "cr-rp-title" }, title),
        h("span", { className: "cr-np-sub cr-rp-sub" },
          h("span", { className: "cr-np-sub-a" }, proto ? t.artist : (props.sub || "For Spotify")),
          proto ? null : h("span", { className: "cr-np-sub-b" }, props.moment || "Your moment"))),
      h("button", { type: "button", className: "cr-rp-play",
        "aria-label": proto ? (playing ? "Pause " : "Play ") + t.title : (pl.playing ? "Pause Resonance preview" : "Play Resonance preview"),
        "aria-pressed": playing ? "true" : "false", onClick: toggle },
        /* both glyphs stay mounted; CSS crossfades them with a small turn and scale */
        h("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", fill: "currentColor" },
          h("path", { className: "cr-rp-g-play", d: NP_ICON.play }),
          h("path", { className: "cr-rp-g-pause", d: RP_PAUSE }))),
      h("span", { className: "cr-rp-track", "aria-hidden": "true" },
        proto
          ? h("i", { key: "pf", className: "cr-rp-fill", ref: protoFillRef })
          : h("i", { key: "df", className: "cr-rp-fill", ref: pl.fillRef }),
        proto
          ? (momentLeft ? h("i", { key: "pd", className: "cr-rp-drop", style: { left: momentLeft } }) : null)
          : h("i", { key: "dd", className: "cr-rp-drop", style: { left: NP_MARK_LEFT } })));
  }

  /* The phone in the popup runs the real prototype, as on resonance-short.html: it starts on the
     iOS home screen, tapping Spotify launches the app from the start (splash, first-time education,
     Now Playing with Resonance). Primary source is the copy bundled in assets/resonance/app (same
     origin, so it works where outside frames are blocked); the hosted build is the fallback. */
  var RS_HOME = "./assets/resonance/mockup/screen-homescreen.webp";
  var RS_LOCAL = "./assets/resonance/app/";
  /* Spotify icon on the home-screen export (693 × 1502): centre and width as % of the screen */
  var RS_ICON_AT = { x: 61.5, y: 36.8, w: 15.6 };
  var RS_ICON = {
    home: "M4.5 10.5L12 4l7.5 6.5M6.5 9v10.5h11V9M10 19.5v-5h4v5",
    restart: "M5 12a7 7 0 1 0 2.1-5M5 4.5V8h3.5"
  };
  function rsFresh(base, embed) { return base + "?fresh=1&t=" + Date.now() + (embed ? "&embed=1" : ""); }

  var RS_OPEN_MS = 560;
  var RS_CLOSE_MS = 480;
  var RS_EASE_FOLD = "cubic-bezier(0.32, 0.72, 0, 1)";
  function rsCardOf(el) { return el && el.closest ? el.closest(".cr-rp, .cr-np") : null; }
  /* Morph keyframes from the card's rect to the open sheet, plus two layers inside the sheet:
     a copy of the card pinned where the clip window starts, and a full layer in the card's tint.
     Keyframes touch clip-path and transform only. */
  function rsMorph(sheet, src, card) {
    var r = sheet.getBoundingClientRect(), s = src.rect;
    var w = Math.min(s.width, r.width), hh = Math.min(s.height, r.height);
    var cl = Math.max(0, Math.min(s.left - r.left, r.width - w));
    var ct = Math.max(0, Math.min(s.top - r.top, r.height - hh));
    var tx = s.left - (r.left + cl), ty = s.top - (r.top + ct);
    var cs = getComputedStyle(sheet), R = cs.borderTopLeftRadius || "0px";
    var frames = [
      { clipPath: "inset(" + ct + "px " + (r.width - cl - w) + "px " + (r.height - ct - hh) + "px " + cl + "px round " + src.radius + "px)", transform: "translate(" + tx + "px," + ty + "px)" },
      { clipPath: "inset(0px 0px 0px 0px round " + R + ")", transform: "translate(0px,0px)" }
    ];
    var ghost = null, tint = null;
    /* closing before the open morph ended: drop its layers so only one set is ever on screen */
    Array.prototype.slice.call(sheet.querySelectorAll(":scope > .cr-np-ghost, :scope > .cr-np-morph-tint")).forEach(function (n) { n.remove(); });
    if (card) {
      var bl =parseFloat(cs.borderLeftWidth) || 0, bt = parseFloat(cs.borderTopWidth) || 0;
      var tc = getComputedStyle(card).getPropertyValue("--rp-tint").trim();
      if (tc) {
        tint = document.createElement("div");
        tint.className = "cr-np-morph-tint";
        tint.setAttribute("aria-hidden", "true");
        tint.style.background = tc;
        sheet.appendChild(tint);
      }
      ghost = card.cloneNode(true);
      ghost.removeAttribute("data-cr-enter");
      ghost.setAttribute("aria-hidden", "true");
      ghost.setAttribute("inert", "");
      ghost.className = ghost.className.replace(/\bis-playing\b/, "is-paused").replace(/\bis-(moment|pulse|jumping)\b/g, "") + " cr-np-ghost";
      var k = card.offsetWidth ? s.width / card.offsetWidth : 1;
      ghost.style.cssText = card.style.cssText + ";visibility:visible;position:absolute;margin:0;left:" + (cl - bl) + "px;top:" + (ct - bt) +
        "px;width:" + card.offsetWidth + "px;height:" + card.offsetHeight + "px;transform:scale(" + k + ");transform-origin:0 0;translate:none;scale:none;";
      sheet.appendChild(ghost);
    }
    return { frames: frames, ghost: ghost, tint: tint };
  }

  /* Parked: closing the popup while the prototype has a song keeps this component (and its iframe)
     mounted but hidden, so the song plays on and the board card acts as the mini player, as Spotify
     does when you leave the full player. Reopening shows the app where it was. The host (app.js)
     renders it with parked=true between opens; onClose(true) asks for that. */
  function ResonanceSheet(props) {
    var parked = !!props.parked;
    var propsRef = useRef(props); propsRef.current = props;
    var ref = useRef(null), scrimRef = useRef(null), screenRef = useRef(null);
    var appRef = useRef(null), homeRef = useRef(null), iframeRef = useRef(null);
    var closing = useRef(false), run = useRef(0), watch = useRef(null);
    var hosted = props.base || resonanceBase();
    var local = props.localBase || RS_LOCAL;
    var _ph = useState("home"), phase = _ph[0], setPhase = _ph[1];      /* home | app | leaving */
    var _f = useState(null), frame = _f[0], setFrame = _f[1];             /* { key, src, from } */
    var _st = useState("idle"), status = _st[0], setStatus = _st[1];      /* idle | loading | ready | failed */
    var _k = useState(null), fit = _k[0], setFit = _k[1];

    function fullHref() { return props.fullHref || rsFresh(hosted, false); }

    /* Open: a shared-element morph. The sheet is clipped to the card's rect and grows into the
       panel (clip-path + translate, radius interpolated); a copy of the card and a layer in its
       tint sit on top and fade, so the widget itself seems to open. The board dims and blurs in
       step, then the phone and copy rise in. The real card hides until the sheet folds back. */
    var settled = useRef(false), afterSettle = useRef([]), cardRef = useRef(null), launchSeq = useRef(0);
    function whenSettled(fn) { if (settled.current) fn(); else afterSettle.current.push(fn); }
    function settle() {
      if (settled.current) return;
      settled.current = true;
      var q = afterSettle.current; afterSettle.current = [];
      q.forEach(function (fn) { fn(); });
    }
    useLayoutEffect(function () {
      if (parked) return undefined;
      var sheet = ref.current, root = document.documentElement;
      closing.current = false;
      settled.current = false;
      /* a reopen: drop the fills the last close left on the panel, scrim and copy */
      [scrimRef.current, sheet].forEach(function (n) {
        if (n && n.getAnimations) n.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
      });
      root.classList.add("ga-np-open");
      var prev = props.opener && props.opener.querySelector ? (props.opener.querySelector(".cr-np-open") || props.opener) : document.activeElement;
      var card = rsCardOf(props.opener);
      var src0 = sourceOf(card || props.opener), still = reduced();
      var chrome = Array.prototype.slice.call(sheet.querySelectorAll("[data-np-chrome]"));
      var fin;
      if (still || !src0) {
        if (scrimRef.current) scrimRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: still ? 160 : 420, easing: "ease", fill: "backwards" });
        fin = sheet.animate([{ opacity: 0, transform: still ? "none" : "scale(0.97)" }, { opacity: 1, transform: "none" }], { duration: still ? 160 : 420, easing: EASE_ARRIVE, fill: "backwards" });
      } else {
        var D = RS_OPEN_MS;
        var m = rsMorph(sheet, src0, card);
        cardRef.current = card;
        if (card) card.style.visibility = "hidden";
        sheet.style.willChange = "clip-path, transform";
        if (scrimRef.current) scrimRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: D, easing: "cubic-bezier(0.33, 1, 0.68, 1)", fill: "backwards" });
        fin = sheet.animate(m.frames, { duration: D, easing: EASE_ARRIVE, fill: "backwards" });
        if (m.tint) m.tint.animate([{ opacity: 1 }, { opacity: 1, offset: 0.12 }, { opacity: 0 }], { duration: D * 0.72, easing: "ease-out", fill: "forwards" });
        if (m.ghost) m.ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D * 0.34, easing: "ease-out", fill: "forwards" });
        chrome.forEach(function (n, i) {
          n.style.willChange = "transform, opacity";
          n.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
            { duration: 480, delay: D * 0.42 + i * 60, easing: EASE_ARRIVE, fill: "backwards" });
        });
        fin.finished.then(function () {
          if (m.ghost && m.ghost.parentNode) m.ghost.parentNode.removeChild(m.ghost);
          if (m.tint && m.tint.parentNode) m.tint.parentNode.removeChild(m.tint);
        }, function () {});
      }
      var cleanup = function () {
        sheet.style.willChange = "";
        chrome.forEach(function (n) { n.style.willChange = ""; });
        settle();
      };
      /* the chrome's stagger ends a little after the sheet; let both land before any heavy work */
      var settleT = setTimeout(cleanup, still || !src0 ? 200 : RS_OPEN_MS * 0.42 + chrome.length * 60 + 480);
      if (rsNow.playing || phase === "home") npPauseAll(); /* the live prototype makes its own sound */
      var t = setTimeout(function () {
        var btn = sheet.querySelector(".cr-np-close");
        if (btn) btn.focus({ preventScroll: true });
      }, 60);
      return function () {
        clearTimeout(t); clearTimeout(settleT);
        stopWatch();
        root.classList.remove("ga-np-open");
        if (cardRef.current) cardRef.current.style.visibility = "";
        if (prev && prev.isConnected && prev.focus) prev.focus({ preventScroll: true });
      };
    }, [parked]);

    /* The prototype frame reports what it plays (rs-bridge.js); listen to this frame only */
    var frameKey = frame ? frame.key : 0;
    useEffect(function () {
      var f = iframeRef.current, w = f && frame && frame.from === "local" ? f.contentWindow : null;
      if (w) rsAttach(w);
      return function () { if (w) rsDetach(w); };
    }, [frameKey]);

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

    function stopWatch() { if (watch.current) { watch.current(); watch.current = null; } }

    /* Load one source and decide whether it really arrived.
       Bundled copy: same origin, so read the page and wait for the app to mount.
       Hosted build: a cross-origin frame fires load even on an error page, so a no-cors probe decides. */
    function load(from) {
      stopWatch();
      var id = ++run.current;
      var src = rsFresh(from === "local" ? local : hosted, true);
      var alive = true, timers = [];
      function later(fn, ms) { timers.push(setTimeout(function () { if (alive && run.current === id) fn(); }, ms)); }
      watch.current = function () { alive = false; timers.forEach(clearTimeout); };
      setStatus("loading");
      setFrame({ key: id, src: src, from: from, onLoad: null });
      function fail() {
        stopWatch();
        if (from === "local") load("hosted"); else setStatus("failed");
      }
      if (from === "local") {
        var t0 = Date.now();
        var poll = function () {
          var f = iframeRef.current, doc = null;
          try { doc = f && f.contentDocument; } catch (err) { doc = null; }
          var root = doc && doc.getElementById("root");
          if (root && root.childElementCount) { stopWatch(); setStatus("ready"); hookKeys(f); return; }
          /* loaded, but not our app (a 404 page, or the folder isn't deployed) */
          if (doc && doc.readyState === "complete" && !root && doc.location.href !== "about:blank") { fail(); return; }
          if (Date.now() - t0 > 7000) { fail(); return; }
          later(poll, 120);
        };
        later(poll, 120);
      } else {
        var loaded = false, probe = "pending";
        var settle = function () {
          if (!alive || run.current !== id) return;
          if (probe === "fail") fail();
          else if (loaded && probe === "ok") { stopWatch(); setStatus("ready"); }
        };
        setFrame({ key: id, src: src, from: from, onLoad: function () { loaded = true; settle(); } });
        later(fail, 9000);
        try {
          fetch(src, { mode: "no-cors", cache: "no-store", credentials: "omit" }).then(
            function () { probe = "ok"; settle(); },
            function () { probe = "fail"; settle(); });
        } catch (err) { probe = "ok"; }
      }
    }

    /* Escape inside the (same-origin) app still closes the popup */
    function hookKeys(f) {
      try {
        f.contentWindow.addEventListener("keydown", function (ev) {
          if (ev.key === "Escape") { ev.preventDefault(); close(); }
        });
      } catch (err) { /* cross-origin: Escape works once focus is back in the page */ }
    }

    /* Tap Spotify: the app opens out of the icon, like iOS */
    function launch() {
      if (phase === "app") return;
      npPauseAll();
      setPhase("app");
      setStatus("loading");
      var seq = ++launchSeq.current;
      requestAnimationFrame(function () {
        var app = appRef.current, zoom = null;
        if (app && !reduced()) {
          zoom = app.animate([
            { transform: "scale(" + (RS_ICON_AT.w / 100).toFixed(3) + ")", clipPath: "inset(0 round 22%)", opacity: 0.2 },
            { transform: "none", clipPath: "inset(0 round 0%)", opacity: 1 }
          ], { duration: 460, easing: EASE_ARRIVE });
        } else if (app) {
          zoom = app.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: "ease" });
        }
        /* start the iframe only once the popup has landed and the app has zoomed in: loading the
           prototype (a big script) mid-animation is what made frames drop */
        var go = function () { whenSettled(function () { if (appRef.current && launchSeq.current === seq) load("local"); }); };
        if (zoom) zoom.finished.then(go, go); else go();
        var ctl = ref.current && ref.current.querySelector(".cr-np-ctl");
        if (ctl) ctl.focus({ preventScroll: true });
      });
    }
    /* Back to the home screen: the app folds into the icon and stops (unloading it stops its audio) */
    function goHome() {
      if (phase !== "app") return;
      launchSeq.current++;
      stopWatch();
      var app = appRef.current, still = reduced();
      setPhase("leaving");
      var done = function () {
        setFrame(null); setStatus("idle"); setPhase("home");
        requestAnimationFrame(function () { if (homeRef.current) homeRef.current.focus({ preventScroll: true }); });
      };
      if (!app) { done(); return; }
      var anim = app.animate(still
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [{ transform: "none", borderRadius: "0", opacity: 1 }, { transform: "scale(" + (RS_ICON_AT.w / 100).toFixed(3) + ")", borderRadius: "22%", opacity: 0 }],
        { duration: still ? 140 : 360, easing: AW_EASE_BACK, fill: "forwards" });
      anim.finished.then(done, done);
    }
    function restart() { if (phase === "app") load("local"); }

    function close() {
      var props = propsRef.current;
      if (closing.current || props.parked) return;
      closing.current = true;
      var sheet = ref.current, called = false;
      var card = cardRef.current || rsCardOf(props.opener);
      /* keep the app alive while it has a song (playing or paused), like leaving Spotify's full player */
      var keep = !!(rsWin && rsNow.track);
      var done = function () {
        if (called) return; called = true;
        if (card) card.style.visibility = "";
        props.onClose(keep);
        /* parked: the sheet stays in the DOM, so take the morph's card copy out once it's hidden */
        if (keep) requestAnimationFrame(function () { requestAnimationFrame(function () {
          if (sheet) Array.prototype.slice.call(sheet.querySelectorAll(":scope > .cr-np-ghost, :scope > .cr-np-morph-tint")).forEach(function (n) { n.remove(); });
        }); });
      };
      if (!sheet) { done(); return; }
      document.documentElement.classList.remove("ga-np-open");
      if (props.onClosing) props.onClosing();
      if (card) card.style.visibility = "hidden";
      var src0 = sourceOf(card || props.opener), still = reduced();
      var D = still || !src0 ? (still ? 140 : 320) : RS_CLOSE_MS;
      setTimeout(done, D + 400);
      if (scrimRef.current) scrimRef.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D, easing: "cubic-bezier(0.33, 0, 0.67, 1)", fill: "forwards" });
      Array.prototype.slice.call(sheet.querySelectorAll("[data-np-chrome]")).forEach(function (n) {
        n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: still ? 120 : 160, easing: "ease-out", fill: "forwards" });
      });
      var anim;
      if (still || !src0) {
        anim = sheet.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: still ? "none" : "scale(0.96)" }], { duration: D, easing: AW_EASE_BACK, fill: "forwards" });
      } else {
        /* the open morph, backwards: the panel folds into the card, the tint and the card fade back in */
        var m = rsMorph(sheet, src0, card);
        sheet.style.willChange = "clip-path, transform";
        anim = sheet.animate(m.frames.slice().reverse(), { duration: D, easing: RS_EASE_FOLD, fill: "forwards" });
        /* same clock as the fold: the panel takes the card's colour while it shrinks, the card's face lands with it */
        if (m.tint) m.tint.animate([{ opacity: 0 }, { opacity: 1, offset: 0.55 }, { opacity: 1 }], { duration: D, easing: RS_EASE_FOLD, fill: "both" });
        if (m.ghost) m.ghost.animate([{ opacity: 0 }, { opacity: 0, offset: 0.5 }, { opacity: 1, offset: 0.85 }, { opacity: 1 }], { duration: D, easing: RS_EASE_FOLD, fill: "both" });
      }
      anim.finished.then(done, done);
    }

    /* Escape closes, Tab stays inside */
    useEffect(function () {
      if (parked) return undefined;
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
    }, [parked]);

    var inApp = phase !== "home";
    var frameStyle = fit ? { width: NP_DESIGN_W + "px", height: fit.h + "px", transform: "scale(" + fit.k + ")" } : { visibility: "hidden" };
    var svg = function (d) { return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" }, h("path", { d: d })); };
    var openFull = function (ev) { ev.currentTarget.href = fullHref(); };
    var origin = RS_ICON_AT.x + "% " + RS_ICON_AT.y + "%";

    return h("div", { className: cx("cr-np-modal", parked && "is-parked"), "aria-hidden": parked ? "true" : undefined, inert: parked ? "" : undefined },
      h("div", { className: "cr-np-scrim", ref: scrimRef, "aria-hidden": "true", onClick: function () { close(); } }),
      h("section", { className: "cr-np-sheet", ref: ref, role: "dialog", "aria-modal": "true", "aria-labelledby": "cr-np-title", "aria-describedby": "cr-np-desc" },
        h("button", { type: "button", className: "cr-iconbtn cr-iconbtn--solid cr-np-close", "aria-label": "Close Resonance prototype", title: "Close", "data-np-chrome": "", onClick: function () { close(); } },
          h(Icon, { name: "close" })),
        h("div", { className: "cr-np-device", "data-np-chrome": "" },
          h("div", { className: "cr-np-phone" },
            h("div", { className: "cr-np-screen", ref: screenRef, "data-phase": phase, "data-status": status },
              /* iOS home screen: the whole screen opens Spotify, as on the case page */
              h("button", { type: "button", className: "cr-np-home", ref: homeRef, onClick: launch,
                  "aria-label": "Open Spotify to start the Resonance prototype", tabIndex: inApp ? -1 : 0, "aria-hidden": inApp ? "true" : undefined },
                h("img", { src: props.home || RS_HOME, alt: "", width: 693, height: 1502, decoding: "async" }),
                h("i", { className: "cr-np-home-ring", "aria-hidden": "true",
                  style: { left: RS_ICON_AT.x + "%", top: RS_ICON_AT.y + "%", width: RS_ICON_AT.w + "%" } })),
              inApp ? h("div", { className: "cr-np-app", ref: appRef, style: { transformOrigin: origin } },
                frame ? h("iframe", { key: frame.key, ref: iframeRef, src: frame.src, title: "Resonance live prototype",
                  allow: "autoplay; encrypted-media", referrerPolicy: "no-referrer-when-downgrade", style: frameStyle,
                  "data-source": frame.from, tabIndex: status === "ready" ? 0 : -1, "aria-hidden": status === "ready" ? undefined : "true",
                  onLoad: function () { if (frame.onLoad) frame.onLoad(); } }) : null,
                status === "failed"
                  ? h("div", { className: "cr-np-state is-failed", role: "status" },
                      h("p", null, "The prototype didn't load here."),
                      h("a", { className: "cr-np-state-link", href: fullHref(), onClick: openFull, target: "_blank", rel: "noreferrer" }, "Open full screen", h(Icon, { name: "arrow", stroke: 1.8 })))
                  : status === "loading"
                    ? h("div", { className: "cr-np-state is-loading", role: "status" }, h("i", { className: "cr-np-spin", "aria-hidden": "true" }), "Opening Spotify")
                    : null) : null),
            h("img", { className: "cr-np-frame", src: props.frame || NP_FRAME, alt: "", "aria-hidden": "true", decoding: "async" })),
          /* Under the phone: a hint on the home screen, home and restart once the app is open */
          h("div", { className: "cr-np-phonebar" },
            inApp
              ? [h("button", { key: "home", type: "button", className: "cr-np-ctl", onClick: goHome, title: "Back to the home screen" }, svg(RS_ICON.home), "Home screen"),
                 h("button", { key: "restart", type: "button", className: "cr-np-ctl", onClick: restart, title: "Start the prototype again" }, svg(RS_ICON.restart), "Restart")]
              : h("p", { className: "cr-np-hint" }, h("i", { className: "cr-np-dot", "aria-hidden": "true" }), "Tap Spotify to start"))),
        h("div", { className: "cr-np-copy" },
          h("p", { className: "cr-np-eyebrow", "data-np-chrome": "" }, h("i", { className: "cr-np-dot" }), "For Spotify · Personal project"),
          h("h2", { id: "cr-np-title", className: "cr-np-heading", "data-np-chrome": "" }, props.title || "Resonance"),
          h("p", { id: "cr-np-desc", className: "cr-np-desc", "data-np-chrome": "" },
            props.description || "A speculative Spotify playback feature that starts songs closer to the moments you actually want to hear."),
          h("p", { className: "cr-np-note", "data-np-chrome": "" }, "Live Resonance build. Tap Spotify in the phone to start it from the top. Prefer full screen on a real phone if you want more room."),
          h("div", { className: "cr-np-actions", "data-np-chrome": "" },
            h("a", { className: "cr-np-btn cr-np-btn--primary", href: fullHref(), onClick: openFull, target: "_blank", rel: "noreferrer" }, "Open full screen", h(Icon, { name: "arrow", stroke: 1.8 })),
            h("a", { className: "cr-np-btn", href: props.caseHref || "./craft-resonance.html" }, "Read the case study")))));
  }

  window.Craft = {
    Stage: Stage, Backdrop: Backdrop, Icon: Icon, Avatar: Avatar,
    TopBar: TopBar, NotificationPill: NotificationPill, PhilosophyPill: PhilosophyPill, LiveStatus: LiveStatus, SegmentedControl: SegmentedControl,
    IconButton: IconButton, Chip: Chip, Toggle: Toggle,
    AgendaCard: AgendaCard, FolderListCard: FolderListCard, DropZoneCard: DropZoneCard,
    PreviewCard: PreviewCard, CursorChip: CursorChip, ProfileOrb: ProfileOrb, HeadOrb: HeadOrb, StatCard: StatCard,
    MiniStatCard: MiniStatCard, TeamCard: TeamCard, ActionCard: ActionCard, ContactCard: ContactCard,
    AvatarStack: AvatarStack, Dock: Dock, MetaStrip: MetaStrip,
    HeroBoard: HeroBoard, FolderOpen: FolderOpen, ProfileOpen: ProfileOpen,
    FolderSheet: FolderSheet, ProfileSheet: ProfileSheet, AllWorkSheet: AllWorkSheet, ProjectWell: ProjectWell, useClock: useClock,
    NowPlayingPill: NowPlayingPill, ResonanceCard: ResonanceCard, useResonancePlayer: useResonancePlayer, ResonanceSheet: ResonanceSheet,
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
      { title: "Contextual Chat", sub: "AI search · +25%", thumb: img.chat, icon: "chatSpark", tone: "blue" },
      { title: "Deal Room", sub: "B2B SaaS · +32% adoption", thumb: img.dealRoom, icon: "dealDoc", tone: "orange" },
      { title: "White Label Setup", sub: "Fintech · 3 steps to live", thumb: img.whiteLabel, icon: "swatch", tone: "pink" }
    ];
    return {
      topbar: {
        avatar: face, title: "Gaurav Avinash", subtitle: "Product Designer", status: "Open to work",
        notice: { avatar: img.chat, title: "Latest case study", subtitle: "Contextual Chat", meta: "Open", seconds: 14 },
        tabs: ["Home", "Projects"]
      },
      agenda: { meta: date, avatar: face, day: day, time: "Available", label: "Open to new roles", live: true },
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
          { name: "Gaurav", color: "#c94a1c", avatar: face, x: 175, y: 2 },
          { name: "You", color: "#c81f8a", x: 69, y: 92 }
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
        { title: "White Label Setup", sub: "Fintech", image: img.whiteLabel },
        { title: "EasyEat", sub: "FoodTech", image: img.easyeat },
        { title: "Resonance", sub: "AI · Music", image: img.resonance },
        { title: "Nomad", sub: "Playground", image: img.nomad },
        { title: "Health Karma", sub: "Playground", image: img.health },
        { title: "Swaply", sub: "Playground", image: img.swaply }
      ],
      profileSheet: {
        image: img.profile, name: "Gaurav Avinash", role: "Product Designer · Delhi and Bengaluru, India", status: "Open to work",
        bio: "I design products that make complex things feel simple. AI search, deal workflows and fintech setup flows, end to end.",
        ai: {
          title: "How I use AI",
          text: "AI gives me speed. Taste and the final call stay with me. I use Claude to explore wide: ten flows, twenty lines of copy, the edge cases. Most of it never ships. Choosing what does is my work. I designed this site in Figma and built it with Claude."
        },
        facts: [{ value: "5+", label: "years designing" }, { value: "+25%", label: "engagement, Contextual Chat" }, { value: "+32%", label: "adoption, Deal Room" }, { value: "4", label: "industries: fintech, AI, food, health" }]
      }
    };
  }
})();
