/* Craft availability + booking, backed by Cal.com.
   1. AvailabilityCard: the date card on the board. Shows the date, the status pill and the next
      free slot (Cal.com public slots API, cached 5 minutes in sessionStorage). The whole card is a button.
   2. BookingSheet: a liquid-glass sheet that grows out of the card. Meeting type, the next working
      days, free times in the visitor's timezone (or IST). Picking a time loads Cal.com's embed script
      (only then) and opens its booking popup on that day. If the script can't load, the Cal.com page
      opens in a new tab instead.
   No keys, no tracking: the slots API is public and called without credentials.
   Exposes window.CraftBooking = { AvailabilityCard, BookingSheet, readBooking }. */
(function () {
  var React = window.React, ReactDOM = window.ReactDOM;
  if (!React || !ReactDOM) return;
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef,
    useLayoutEffect = React.useLayoutEffect, useMemo = React.useMemo;

  var API = "https://api.cal.com/v2/slots";
  var API_VERSION = "2024-09-04"; /* without this header the v2 slots route 404s */
  var EMBED_SRC = "https://app.cal.com/embed/embed.js";
  var CAL_ORIGIN = "https://cal.com";
  var NS = "ga-book"; /* our Cal embed namespace */
  var IST = "Asia/Kolkata";
  var CACHE_MS = 5 * 60 * 1000, RANGE_DAYS = 14, STRIP_DAYS = 10, FETCH_MS = 9000, EMBED_MS = 9000;
  var BOOKED_KEY = "ga-cal-booking";
  var BRAND = "#2b55f6", BRAND_STRONG = "#2044d8"; /* Craft blue (--blue, --blue-strong) */
  var OPEN_MS = 520, CLOSE_MS = 440;
  var EASE_ARRIVE = "cubic-bezier(0.16, 1, 0.3, 1)", EASE_FOLD = "cubic-bezier(0.32, 0.72, 0, 1)";

  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }
  function reduced() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }

  /* ───────── Time ───────── */
  var fmts = {};
  function fmt(locale, opts) {
    var k = (locale || "") + JSON.stringify(opts);
    return fmts[k] || (fmts[k] = new Intl.DateTimeFormat(locale, opts));
  }
  function visitorTz() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz) return IST;
      fmt("en-US", { timeZone: tz });
      /* Chrome still reports India as the legacy "Asia/Calcutta"; send the canonical name */
      return tz === "Asia/Calcutta" ? IST : tz;
    } catch (e) { return IST; }
  }
  function parts(d, tz, opts) {
    var o = {};
    fmt("en-US", Object.assign({ timeZone: tz }, opts)).formatToParts(d).forEach(function (p) { o[p.type] = p.value; });
    return o;
  }
  function dayKey(d, tz) { var p = parts(d, tz, { year: "numeric", month: "2-digit", day: "2-digit" }); return p.year + "-" + p.month + "-" + p.day; }
  /* Same wall clock as India now and in six months (catches zones that only match part of the year) */
  function isIst(tz) {
    if (tz === IST || tz === "Asia/Calcutta") return true;
    var o = { day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" };
    return [Date.now(), Date.now() + 182 * 864e5].every(function (t) {
      var d = new Date(t);
      return fmt("en-GB", Object.assign({ timeZone: tz }, o)).format(d) === fmt("en-GB", Object.assign({ timeZone: IST }, o)).format(d);
    });
  }
  function timeStr(d, tz) { return fmt(undefined, { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(d); }
  /* "10:30" + "AM" apart, so the period can be set smaller (locales without one give "") */
  function timeBits(d, tz) {
    var main = "", period = "";
    fmt(undefined, { timeZone: tz, hour: "numeric", minute: "2-digit" }).formatToParts(d).forEach(function (p) {
      if (p.type === "dayPeriod") period = p.value; else main += p.value;
    });
    return { main: main.trim(), period: period };
  }
  function longDay(d, tz) { var p = parts(d, tz, { weekday: "long", day: "numeric", month: "long" }); return p.weekday + " " + p.day + " " + p.month; }
  function shortDay(d, tz) { var p = parts(d, tz, { weekday: "short", day: "numeric", month: "short" }); return p.weekday + " " + p.day + " " + p.month; }
  function weekday(d, tz) { return parts(d, tz, { weekday: "short" }).weekday; }
  function tzCity(tz) { return String(tz).split("/").pop().replace(/_/g, " "); }

  /* ───────── Slots (Cal.com v2, public) ───────── */
  var mem = {};
  function slotKey(cfg, slug, tz) { return "ga-cal-slots:" + cfg.calUsername + ":" + slug + ":" + tz; }
  function future(d) { var now = Date.now(); return { at: d.at, slots: d.slots.filter(function (s) { return Date.parse(s) > now; }) }; }
  function peekSlots(cfg, slug) {
    var k = slotKey(cfg, slug, visitorTz());
    var m = mem[k];
    if (m && m.data && Date.now() - m.data.at < CACHE_MS) return future(m.data);
    try {
      var s = JSON.parse(window.sessionStorage.getItem(k) || "null");
      if (s && Array.isArray(s.slots) && Date.now() - s.at < CACHE_MS) { mem[k] = { data: s }; return future(s); }
    } catch (e) { /* private mode */ }
    return null;
  }
  /* {"data":{"2026-11-10":[{"start":"2026-11-10T09:00:00.000+05:30"}, ...]}}. Also takes the older
     {"data":{"slots":{...}}} shape and plain strings, in case the API answers that way. */
  function parseSlots(json) {
    var data = json && json.data;
    if (data && data.slots && typeof data.slots === "object" && !Array.isArray(data.slots)) data = data.slots;
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Unexpected slots response");
    var seen = {}, out = [];
    Object.keys(data).forEach(function (k) {
      var list = data[k];
      if (!Array.isArray(list)) return;
      list.forEach(function (it) {
        var s = typeof it === "string" ? it : it && (it.start || it.time);
        var t = s ? Date.parse(s) : NaN;
        if (!isFinite(t) || seen[t]) return;
        seen[t] = true; out.push(t);
      });
    });
    out.sort(function (a, b) { return a - b; });
    return out.map(function (t) { return new Date(t).toISOString(); });
  }
  function loadSlots(cfg, slug, force) {
    var tz = visitorTz(), k = slotKey(cfg, slug, tz);
    if (!force) { var hit = peekSlots(cfg, slug); if (hit) return Promise.resolve(hit); }
    if (mem[k] && mem[k].pending) return mem[k].pending;
    var now = new Date();
    var q = [
      "username=" + encodeURIComponent(cfg.calUsername),
      "eventTypeSlug=" + encodeURIComponent(slug),
      "start=" + dayKey(now, tz),
      "end=" + dayKey(new Date(now.getTime() + RANGE_DAYS * 864e5), tz),
      "timeZone=" + encodeURIComponent(tz)
    ].join("&");
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, FETCH_MS);
    var pending = fetch(API + "?" + q, {
      headers: { "cal-api-version": API_VERSION }, credentials: "omit", cache: "no-store",
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error("Slots HTTP " + r.status);
      return r.json();
    }).then(function (json) {
      if (json && json.status && json.status !== "success") throw new Error("Slots status " + json.status);
      var d = { at: Date.now(), slots: parseSlots(json) };
      mem[k] = { data: d };
      try { window.sessionStorage.setItem(k, JSON.stringify(d)); } catch (e) { /* private mode */ }
      return future(d);
    });
    mem[k] = Object.assign({}, mem[k], { pending: pending });
    pending.then(function () { clearTimeout(timer); }, function () { clearTimeout(timer); if (mem[k]) delete mem[k].pending; });
    return pending;
  }

  /* ───────── This visitor's booking (localStorage, this browser only) ───────── */
  var bookingSubs = [];
  function readBooking() {
    try {
      var b = JSON.parse(window.localStorage.getItem(BOOKED_KEY) || "null");
      if (b && isFinite(Date.parse(b.start)) && Date.parse(b.start) > Date.now() - 60 * 60 * 1000) return b;
    } catch (e) { /* ignore */ }
    return null;
  }
  function saveBooking(b) {
    try { window.localStorage.setItem(BOOKED_KEY, JSON.stringify(b)); } catch (e) { /* private mode */ }
    bookingSubs.slice().forEach(function (fn) { fn(b); });
  }
  function useBooking() {
    var s = useState(readBooking);
    useEffect(function () {
      var fn = function (b) { s[1](b); };
      bookingSubs.push(fn);
      return function () { bookingSubs = bookingSubs.filter(function (f) { return f !== fn; }); };
    }, []);
    return s[0];
  }

  /* ───────── Status ───────── */
  function statusOf(cfg) { return cfg.status === "booked" || cfg.status === "not-looking" ? cfg.status : "open"; }
  function untilText(cfg) {
    if (!cfg.until) return null;
    var d = new Date(cfg.until);
    if (!isFinite(d.getTime())) return String(cfg.until);
    var p = parts(d, "UTC", { day: "numeric", month: "short" });
    return p.day + " " + p.month;
  }
  function statusLabel(cfg) {
    var s = statusOf(cfg);
    if (s === "booked") return untilText(cfg) ? "Booked until " + untilText(cfg) : "Booked for now";
    if (s === "not-looking") return "Not looking right now";
    return "Open to new roles";
  }
  function typesFor(cfg) {
    var all = cfg.eventTypes || [];
    return statusOf(cfg) === "booked" ? all.slice(0, 1) : all;
  }
  function splitHours(text) {
    var i = String(text || "").indexOf(", ");
    return i < 0 ? [text || "", ""] : [text.slice(0, i), text.slice(i + 2)];
  }

  /* ───────── Cal.com embed: loaded on the first pick, never before ───────── */
  var embed = { p: null, broken: false, wired: false, lastPick: null, hook: null };
  /* The official queue stub (Cal.com's snippet), minus its own script tag: we add the script
     ourselves so a blocked or failed load is caught and falls back to the booking page. */
  function installStub() {
    var w = window;
    if (w.Cal) return;
    var push = function (api, args) { api.q.push(args); };
    var Cal = function () {
      var cal = w.Cal, args = arguments;
      if (args[0] === "init") {
        var api = function () { push(api, arguments); };
        var ns = args[1];
        api.q = api.q || [];
        if (typeof ns === "string") {
          cal.ns[ns] = cal.ns[ns] || api;
          push(cal.ns[ns], args);
          push(cal, ["initNamespace", ns]);
        } else push(cal, args);
        return;
      }
      push(cal, args);
    };
    Cal.ns = {}; Cal.q = []; Cal.loaded = true;
    w.Cal = Cal;
  }
  function onCalEvent(kind, e) {
    var data = e && e.detail ? e.detail.data : null;
    if (kind === "linkFailed") { if (embed.hook) embed.hook("failed", null); return; }
    var pick = embed.lastPick || {};
    var start = null;
    [data && data.startTime, data && data.booking && data.booking.startTime, data && data.date, pick.start].some(function (s) {
      if (s && isFinite(Date.parse(s))) { start = new Date(Date.parse(s)).toISOString(); return true; }
      return false;
    });
    if (!start) return;
    var minutes = pick.minutes || 15;
    if (data && isFinite(Number(data.duration)) && Number(data.duration) > 0) minutes = Number(data.duration);
    else if (data && data.endTime && data.startTime && isFinite(Date.parse(data.endTime) - Date.parse(data.startTime))) minutes = Math.round((Date.parse(data.endTime) - Date.parse(data.startTime)) / 60000);
    var b = { start: start, minutes: minutes, slug: pick.slug || null, at: Date.now() };
    /* bookingSuccessful and bookingSuccessfulV2 both fire for one booking: keep the first */
    var prev = readBooking();
    if (!(prev && prev.start === b.start && Date.now() - (prev.at || 0) < 60000)) saveBooking(b);
    if (embed.hook) embed.hook("booked", b);
  }
  function ensureEmbed() {
    if (embed.p) return embed.p;
    embed.p = new Promise(function (resolve, reject) {
      try {
        installStub();
        var Cal = window.Cal;
        Cal("init", NS, { origin: CAL_ORIGIN });
        var api = Cal.ns[NS];
        if (!embed.wired) {
          embed.wired = true;
          api("ui", {
            theme: "light",
            hideEventTypeDetails: false,
            layout: "month_view",
            styles: { branding: { brandColor: BRAND } },
            cssVarsPerTheme: {
              light: { "cal-brand": BRAND, "cal-brand-emphasis": BRAND_STRONG, "cal-brand-text": "#ffffff" },
              dark: { "cal-brand": BRAND, "cal-brand-emphasis": BRAND_STRONG, "cal-brand-text": "#ffffff" }
            }
          });
          ["bookingSuccessfulV2", "bookingSuccessful", "linkFailed"].forEach(function (a) {
            api("on", { action: a, callback: function (e) { onCalEvent(a, e); } });
          });
        }
      } catch (err) { reject(err); return; }
      var s = document.createElement("script");
      s.src = EMBED_SRC; s.async = true;
      var t = setTimeout(function () { reject(new Error("Cal embed timed out")); }, EMBED_MS);
      s.onload = function () { clearTimeout(t); if (window.Cal && window.Cal.ns && window.Cal.ns[NS]) resolve(window.Cal); else reject(new Error("Cal embed missing")); };
      s.onerror = function () { clearTimeout(t); reject(new Error("Cal embed failed to load")); };
      document.head.appendChild(s);
    });
    embed.p.catch(function () { embed.broken = true; });
    return embed.p;
  }
  /* Cal's popup is open on top of our sheet: leave Escape and Tab to it */
  function calModalOpen() {
    var boxes = document.querySelectorAll("cal-modal-box");
    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i];
      if (b.isConnected && b.getAttribute("state") !== "closed" && b.style.display !== "none") return true;
    }
    return false;
  }
  function bookingUrl(cfg, slug, iso, tz) {
    var d = new Date(iso), k = dayKey(d, tz);
    return CAL_ORIGIN + "/" + cfg.calUsername + "/" + slug + "?date=" + k + "&month=" + k.slice(0, 7) + "&slot=" + encodeURIComponent(d.toISOString());
  }

  /* ───────── Bits ───────── */
  function Time(props) {
    var b = timeBits(props.date, props.tz);
    return h(React.Fragment, null, b.main, b.period ? h("small", null, " " + b.period) : null);
  }
  function Spinner() { return h("i", { className: "cb-spin", "aria-hidden": "true" }); }
  function svg(d, sw) {
    return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: sw || 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" }, h("path", { d: d }));
  }
  var PATH = {
    arrow: "M7 17L17 7M9 7h8v8",
    check: "M5 12.5l4.5 4.5L19 7.5",
    mail: "M4 6.5h16v11H4zM4.5 7l7.5 6 7.5-6",
    link: "M7 17L17 7M9 7h8v8",
    retry: "M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4"
  };

  /* ───────── The date card ───────── */
  function AvailabilityCard(props) {
    var Craft = window.Craft;
    var cfg = props.config, status = statusOf(cfg);
    var tz = useMemo(visitorTz, []), ist = useMemo(function () { return isIst(tz); }, [tz]);
    var slug = (typesFor(cfg)[0] || {}).slug;
    var booking = useBooking();
    var phaseOf = function (r) { return r.slots.length ? { phase: "ready", next: r.slots[0] } : { phase: "empty" }; };
    var _s = useState(function () {
      if (status === "not-looking" || !slug) return { phase: "off" };
      var hit = peekSlots(cfg, slug);
      return hit ? phaseOf(hit) : { phase: "loading" };
    }), st = _s[0], setSt = _s[1];
    useEffect(function () {
      if (status === "not-looking" || !slug) return undefined;
      var alive = true;
      var run = function () {
        loadSlots(cfg, slug).then(function (r) { if (alive) setSt(phaseOf(r)); },
          function () { if (alive) setSt(function (s) { return s.phase === "ready" || s.phase === "empty" ? s : { phase: "failed" }; }); });
      };
      run();
      /* keep "next free" honest if the page stays open */
      var id = setInterval(function () { if (!document.hidden) run(); }, CACHE_MS + 1000);
      return function () { alive = false; clearInterval(id); };
    }, [status, slug]);

    var label = statusLabel(cfg);
    var k, v, sub = null, say;
    var bookAction = "Book a call with Gaurav";
    if (booking) {
      var bd = new Date(booking.start);
      var soon = Date.parse(booking.start) - Date.now() < 6 * 864e5;
      var bToday = dayKey(bd, tz) === dayKey(new Date(), tz);
      k = bToday ? "See you today" : "See you";
      v = soon ? (bToday ? h(Time, { date: bd, tz: tz }) : h(React.Fragment, null, weekday(bd, tz), ", ", h(Time, { date: bd, tz: tz }))) : shortDay(bd, tz);
      sub = soon ? null : timeStr(bd, tz) + " your time";
      say = "You're booked with Gaurav on " + longDay(bd, tz) + ", " + timeStr(bd, tz) + " your time. Open booking";
    } else if (status === "not-looking") {
      k = props.day || "Today"; v = "Say hello";
      say = "Gaurav is not looking for new roles right now. Contact him by email or LinkedIn";
    } else if (st.phase === "loading") {
      k = status === "booked" ? "Still free" : "Next free";
      v = h("span", { className: "cb-skel", "aria-hidden": "true" });
      sub = h("span", { className: "cb-skel cb-skel--sub", "aria-hidden": "true" });
      say = label + ". Checking Gaurav's calendar. " + bookAction;
    } else if (st.phase === "ready") {
      var nd = new Date(st.next), today = dayKey(nd, tz) === dayKey(new Date(), tz);
      k = status === "booked" ? (today ? "Still free today" : "Still free") : (today ? "Free today" : "Next free");
      v = today ? h(Time, { date: nd, tz: tz }) : h(React.Fragment, null, weekday(nd, tz), ", ", h(Time, { date: nd, tz: tz }));
      if (!ist) sub = "(" + timeStr(nd, IST) + " IST)";
      say = label + ". Next free slot " + longDay(nd, tz) + ", " + timeStr(nd, tz) + (ist ? " IST" : " your time") + ". " + bookAction;
    } else if (st.phase === "empty") {
      k = "Next 2 weeks"; v = "Fully booked"; sub = "Email me instead";
      say = label + ". Fully booked for 2 weeks. Email " + cfg.email + " or see later dates";
    } else {
      var fh = splitHours(cfg.fallbackHours);
      k = "Usually free"; v = fh[0]; sub = fh[1] || null;
      say = label + ". Usually free " + cfg.fallbackHours + ". " + bookAction;
    }

    return h("button", {
      type: "button",
      className: cx("cr-card cr-glass cr-agenda cb-card", "is-" + (booking ? "mine" : st.phase), "cb-card--" + status),
      "data-cr-enter": "", "data-cb-card": "",
      "aria-label": say, "aria-haspopup": "dialog",
      "aria-busy": st.phase === "loading" && !booking ? "true" : undefined,
      onClick: function (ev) { if (props.onOpen) props.onOpen(ev.currentTarget); }
    },
      h("span", { className: "cb-top", "aria-hidden": "true" },
        h("span", { className: "cb-meta" }, props.meta),
        h("span", { className: "cb-go", title: status === "not-looking" ? "Say hello" : "Book a call" }, svg(status === "not-looking" ? PATH.mail : PATH.arrow, 2))),
      h("span", { className: "cb-body", "aria-hidden": "true" },
        h("span", { className: "cb-k" }, k),
        h("span", { className: "cb-v" }, v),
        sub ? h("span", { className: "cb-sub" }, sub) : null),
      h("span", { className: "cb-status", "aria-hidden": "true" },
        /* the small card has no room for "Not looking right now"; the sheet and the label say it in full */
        Craft && Craft.LiveStatus ? h(Craft.LiveStatus, { className: "cb-live cb-live--" + status, label: status === "not-looking" ? "Not looking now" : label }) : label));
  }

  /* ───────── The booking sheet ───────── */
  function buildDays(slots, tz) {
    var byDay = {};
    slots.forEach(function (s) { var k = dayKey(new Date(s), tz); (byDay[k] = byDay[k] || []).push(s); });
    var out = [], seen = {}, now = Date.now();
    for (var i = 0; i <= RANGE_DAYS + 2 && out.length < STRIP_DAYS; i++) {
      var d = new Date(now + i * 864e5), k = dayKey(d, tz);
      if (seen[k]) continue;
      seen[k] = true;
      var p = parts(d, tz, { weekday: "short", day: "numeric", month: "short" });
      var list = byDay[k] || [];
      if ((p.weekday === "Sat" || p.weekday === "Sun") && !list.length) continue;
      out.push({ key: k, wd: i === 0 ? "Today" : p.weekday, num: p.day, mon: p.month, long: longDay(d, tz), slots: list });
    }
    return out;
  }

  function BookingSheet(props) {
    var Craft = window.Craft, Icon = Craft.Icon;
    var cfg = props.config, status = statusOf(cfg), types = typesFor(cfg);
    var propsRef = useRef(props); propsRef.current = props;
    var tz = useMemo(visitorTz, []), ist0 = useMemo(function () { return isIst(tz); }, [tz]);
    var host = useState(function () {
      var d = document.createElement("div");
      d.className = "cb-host";
      document.body.appendChild(d);
      return d;
    })[0];
    var panelRef = useRef(null), scrimRef = useRef(null), closeRef = useRef(null), doneRef = useRef(null);
    var dayRefs = useRef([]), typeRefs = useRef([]);
    var closing = useRef(false), alive = useRef(true);

    var _t = useState(0), ti = _t[0], setTi = _t[1];
    var type = types[ti] || types[0] || { slug: "15min", label: "15 min", minutes: 15 };
    var _d = useState({}), data = _d[0], setData = _d[1];
    var _tick = useState(0), tick = _tick[0], setTick = _tick[1];
    var _day = useState(null), dayPick = _day[0], setDayPick = _day[1];
    var _ist = useState(false), inIst = _ist[0], setInIst = _ist[1];
    var _b = useState(null), busy = _b[0], setBusy = _b[1];
    var _n = useState(null), notice = _n[0], setNotice = _n[1];
    var _done = useState(null), done = _done[0], setDone = _done[1];
    var showTz = inIst ? IST : tz;

    /* Slots for the chosen meeting type */
    useEffect(function () {
      if (status === "not-looking") return undefined;
      var live = true, slug = type.slug;
      var put = function (v) { setData(function (d) { var n = Object.assign({}, d); n[slug] = v; return n; }); };
      var hit = tick ? null : peekSlots(cfg, slug);
      if (hit) { put({ phase: hit.slots.length ? "ready" : "empty", slots: hit.slots }); return undefined; }
      put({ phase: "loading", slots: [] });
      loadSlots(cfg, slug, tick > 0).then(function (r) { if (live) put({ phase: r.slots.length ? "ready" : "empty", slots: r.slots }); },
        function () { if (live) put({ phase: "failed", slots: [] }); });
      return function () { live = false; };
    }, [type.slug, tick]);

    var cur = data[type.slug] || { phase: "loading", slots: [] };
    var days = useMemo(function () { return buildDays(cur.slots || [], showTz); }, [cur.slots, showTz]);
    var sel = (function () {
      var f = days.filter(function (x) { return x.key === dayPick; })[0];
      if (f && f.slots.length) return f;
      return days.filter(function (x) { return x.slots.length; })[0] || f || days[0];
    })();

    /* Embed events reach the open sheet */
    useEffect(function () {
      embed.hook = function (kind, b) {
        if (!alive.current) return;
        if (kind === "booked") { setBusy(null); setNotice(null); setDone(b); }
        else if (kind === "failed" && embed.lastPick) setNotice({ url: embed.lastPick.url, failed: true });
      };
      return function () { embed.hook = null; };
    }, []);
    useEffect(function () { if (done && doneRef.current) doneRef.current.focus({ preventScroll: true }); }, [done]);

    /* ── Open: scrim fades, the sheet grows out of the card, contents rise ── */
    useLayoutEffect(function () {
      alive.current = true;
      var root = document.documentElement;
      root.classList.add("ga-bk-open");
      var prev = props.opener && props.opener.isConnected ? props.opener : document.activeElement;
      var panel = panelRef.current, still = reduced();
      var src = props.opener && Craft.motion && Craft.motion.sourceOf ? Craft.motion.sourceOf(props.opener) : null;
      if (src && (src.rect.bottom < 0 || src.rect.top > window.innerHeight)) src = null;
      if (scrimRef.current) scrimRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: still ? 160 : OPEN_MS, easing: "cubic-bezier(0.33, 1, 0.68, 1)", fill: "backwards" });
      if (still || !src) {
        panel.animate(still ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: "translateY(24px) scale(0.98)" }, { opacity: 1, transform: "none" }],
          { duration: still ? 160 : 420, easing: EASE_ARRIVE, fill: "backwards" });
      } else {
        var fr = Craft.motion.growFrames(panel, src);
        fr[0].opacity = 0.55; fr[1].opacity = 1;
        panel.style.willChange = "clip-path, transform";
        panel.animate(fr, { duration: OPEN_MS, easing: EASE_ARRIVE, fill: "backwards" }).finished.then(function () { panel.style.willChange = ""; }, function () {});
      }
      if (!still) Array.prototype.slice.call(panel.querySelectorAll("[data-cb-chrome]")).forEach(function (n, i) {
        n.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 480, delay: OPEN_MS * 0.32 + i * 50, easing: EASE_ARRIVE, fill: "backwards" });
      });
      var t = setTimeout(function () { if (closeRef.current) closeRef.current.focus({ preventScroll: true }); }, 60);
      return function () {
        alive.current = false;
        clearTimeout(t);
        root.classList.remove("ga-bk-open");
        if (host.parentNode) host.parentNode.removeChild(host);
        if (prev && prev.isConnected && prev.focus) prev.focus({ preventScroll: true });
      };
    }, []);

    function close() {
      if (closing.current) return;
      closing.current = true;
      var p = propsRef.current, panel = panelRef.current, called = false;
      var finish = function () { if (called) return; called = true; p.onClose(); };
      if (!panel) { finish(); return; }
      setTimeout(finish, CLOSE_MS + 400);
      document.documentElement.classList.remove("ga-bk-open");
      if (p.onClosing) p.onClosing();
      var still = reduced();
      var src = p.opener && p.opener.isConnected && Craft.motion && Craft.motion.sourceOf ? Craft.motion.sourceOf(p.opener) : null;
      if (src && (src.rect.bottom < 0 || src.rect.top > window.innerHeight)) src = null;
      if (scrimRef.current) scrimRef.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: still ? 140 : CLOSE_MS, easing: "cubic-bezier(0.33, 0, 0.67, 1)", fill: "forwards" });
      Array.prototype.slice.call(panel.querySelectorAll("[data-cb-chrome]")).forEach(function (n) {
        n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: still ? 120 : 160, easing: "ease-out", fill: "forwards" });
      });
      var anim;
      if (still || !src) {
        anim = panel.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: still ? "none" : "translateY(16px) scale(0.98)" }], { duration: still ? 140 : 300, easing: EASE_FOLD, fill: "forwards" });
      } else {
        var fr = Craft.motion.growFrames(panel, src).reverse();
        fr[0].opacity = 1; fr[1].opacity = 0;
        anim = panel.animate(fr, { duration: CLOSE_MS, easing: EASE_FOLD, fill: "forwards" });
      }
      anim.finished.then(finish, finish);
    }

    /* Escape closes, Tab stays inside. While Cal's popup is up, both are its business. */
    useEffect(function () {
      function onKey(ev) {
        if (calModalOpen() || !panelRef.current) return;
        if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); close(); return; }
        if (ev.key !== "Tab") return;
        var f = Array.prototype.slice.call(panelRef.current.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"))
          .filter(function (n) { return n.getClientRects().length; });
        if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (!panelRef.current.contains(document.activeElement)) { ev.preventDefault(); a.focus(); return; }
        if (ev.shiftKey && document.activeElement === a) { ev.preventDefault(); z.focus(); }
        else if (!ev.shiftKey && document.activeElement === z) { ev.preventDefault(); a.focus(); }
      }
      window.addEventListener("keydown", onKey, true);
      return function () { window.removeEventListener("keydown", onKey, true); };
    }, []);

    /* Arrow keys inside a radio group (roving tabindex) */
    function rove(ev, i, count, enabled, go, refs) {
      var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      var list = [];
      for (var j = 0; j < count; j++) if (enabled(j)) list.push(j);
      if (!list.length) return;
      var pos = list.indexOf(i), next = null;
      if (keys[ev.key]) next = list[(pos + keys[ev.key] + list.length) % list.length];
      else if (ev.key === "Home") next = list[0];
      else if (ev.key === "End") next = list[list.length - 1];
      if (next == null) return;
      ev.preventDefault();
      go(next);
      var el = refs.current[next];
      if (el) { el.focus({ preventScroll: true }); if (el.scrollIntoView) el.scrollIntoView({ block: "nearest", inline: "nearest" }); }
    }

    function pick(iso) {
      if (busy) return;
      var url = bookingUrl(cfg, type.slug, iso, tz);
      var k = dayKey(new Date(iso), tz);
      embed.lastPick = { start: new Date(iso).toISOString(), minutes: type.minutes, slug: type.slug, url: url };
      setNotice(null);
      var toTab = function () {
        var w = null;
        try { w = window.open(url, "_blank"); if (w) w.opener = null; } catch (e) { /* blocked */ }
        setNotice({ url: url, blocked: !w });
      };
      if (embed.broken) { toTab(); return; }
      setBusy(iso);
      ensureEmbed().then(function (Cal) {
        if (!alive.current) return;
        setBusy(null);
        Cal.ns[NS]("modal", {
          calLink: cfg.calUsername + "/" + type.slug,
          config: { layout: "month_view", theme: "light", date: k, month: k.slice(0, 7), slot: new Date(iso).toISOString() }
        });
      }, function () {
        if (!alive.current) return;
        setBusy(null);
        toTab();
      });
    }

    /* ── Live message ── */
    var live = "";
    if (done) live = "Booked. " + shortDay(new Date(done.start), tz) + ", " + timeStr(new Date(done.start), tz) + " your time. Invite sent to your inbox.";
    else if (status !== "not-looking") {
      if (busy) live = "Opening the booking form";
      else if (cur.phase === "loading") live = "Loading free times";
      else if (cur.phase === "failed") live = "Couldn't load live times. Usually free " + cfg.fallbackHours;
      else if (cur.phase === "empty") live = "Fully booked for the next 2 weeks";
      else if (sel) live = sel.slots.length + (sel.slots.length === 1 ? " time" : " times") + " on " + sel.long;
    }

    var whereText = inIst ? "Times in IST (India)." : ist0 ? "Times in IST." : "Times in your timezone (" + tzCity(tz) + ").";
    var title = done ? "Booked." : status === "not-looking" ? "Not looking right now" : "Book a call with Gaurav";
    var subText = done
      ? shortDay(new Date(done.start), tz) + ", " + timeStr(new Date(done.start), tz) + " your time. Invite sent to your inbox."
      : status === "not-looking" ? "I'm not taking on new roles at the moment. Still happy to hear from you."
      : status === "booked" ? statusLabel(cfg) + ". Still happy to chat. " + whereText
      : "Pick a time that suits you. " + whereText;

    var body;
    if (done) {
      body = h("div", { className: "cb-done", "data-cb-chrome": "" },
        h("p", { className: "cb-done-note" }, "It's in Gaurav's calendar too. Need to change it? The email from Cal.com has reschedule and cancel links."),
        h("button", { type: "button", className: "cb-btn cb-btn--primary", ref: doneRef, onClick: close }, "Done"));
    } else if (status === "not-looking") {
      body = h("div", { className: "cb-actions", "data-cb-chrome": "" },
        h("a", { className: "cb-btn cb-btn--primary", href: "mailto:" + cfg.email }, svg(PATH.mail), "Email Gaurav"),
        cfg.linkedin ? h("a", { className: "cb-btn", href: cfg.linkedin, target: "_blank", rel: "noreferrer" }, "LinkedIn", svg(PATH.link)) : null);
    } else {
      var loading = cur.phase === "loading", noPick = cur.phase === "failed" || cur.phase === "empty";
      var slotsBody;
      if (loading) {
        slotsBody = h("div", { className: "cb-slots", "aria-hidden": "true" },
          [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return h("span", { key: i, className: "cb-slot cb-slot--skel" }); }));
      } else if (cur.phase === "failed") {
        var fh = splitHours(cfg.fallbackHours);
        slotsBody = h("div", { className: "cb-state" },
          h("p", { className: "cb-state-title" }, "Live times didn't load."),
          h("p", { className: "cb-state-text" }, "Gaurav is usually free " + fh[0] + (fh[1] ? ", " + fh[1] : "") + "."),
          h("div", { className: "cb-actions" },
            h("a", { className: "cb-btn cb-btn--primary", href: CAL_ORIGIN + "/" + cfg.calUsername + "/" + type.slug, target: "_blank", rel: "noreferrer" }, "Open Cal.com", svg(PATH.link)),
            h("button", { type: "button", className: "cb-btn", onClick: function () { setTick(function (n) { return n + 1; }); } }, svg(PATH.retry), "Try again")));
      } else if (cur.phase === "empty") {
        slotsBody = h("div", { className: "cb-state" },
          h("p", { className: "cb-state-title" }, "Fully booked for the next 2 weeks."),
          h("p", { className: "cb-state-text" }, "Email me and I'll find a time, or see later dates on Cal.com."),
          h("div", { className: "cb-actions" },
            h("a", { className: "cb-btn cb-btn--primary", href: "mailto:" + cfg.email }, svg(PATH.mail), "Email Gaurav"),
            h("a", { className: "cb-btn", href: CAL_ORIGIN + "/" + cfg.calUsername + "/" + type.slug, target: "_blank", rel: "noreferrer" }, "Later dates", svg(PATH.link))));
      } else if (sel && sel.slots.length) {
        slotsBody = h("div", { className: "cb-slots", role: "group", "aria-label": "Free times on " + sel.long },
          sel.slots.map(function (iso) {
            var d = new Date(iso), b = timeBits(d, showTz), isBusy = busy === iso;
            return h("button", {
              key: iso, type: "button", className: cx("cb-slot", isBusy && "is-busy"),
              "aria-label": longDay(d, showTz) + ", " + timeStr(d, showTz) + (inIst && !ist0 ? " IST" : " your time") + ", " + type.minutes + " minutes",
              "aria-busy": isBusy ? "true" : undefined, "aria-disabled": busy && !isBusy ? "true" : undefined,
              onClick: function () { pick(iso); }
            }, isBusy ? h(Spinner) : null, h("span", null, b.main, b.period ? h("small", null, " " + b.period) : null));
          }));
      } else {
        slotsBody = h("div", { className: "cb-state" }, h("p", { className: "cb-state-text" }, "No free times this day."));
      }

      body = h(React.Fragment, null,
        h("div", { className: "cb-row", "data-cb-chrome": "" },
          h("div", { className: "cb-types", role: "radiogroup", "aria-label": "Meeting type" },
            types.map(function (t, i) {
              var on = i === ti;
              return h("button", {
                key: t.slug, type: "button", role: "radio", "aria-checked": on ? "true" : "false", tabIndex: on ? 0 : -1,
                className: cx("cb-type", on && "is-on"), ref: function (n) { typeRefs.current[i] = n; },
                onClick: function () { setTi(i); },
                onKeyDown: function (ev) { rove(ev, i, types.length, function () { return true; }, setTi, typeRefs); }
              }, t.label);
            })),
          ist0 ? null : h("button", {
            type: "button", role: "switch", "aria-checked": inIst ? "true" : "false", className: cx("cb-switch", inIst && "is-on"),
            onClick: function () { setInIst(function (v) { return !v; }); }
          }, h("span", { className: "cb-switch-track", "aria-hidden": "true" }, h("span", { className: "cb-switch-knob" })), "Show in IST")),
        /* no strip or day heading when there is nothing to pick: the state block says why */
        noPick ? null : h("div", { className: "cb-strip-wrap", "data-cb-chrome": "" },
          h("div", { className: cx("cb-strip", loading && "is-loading"), role: "radiogroup", "aria-label": "Day", "aria-busy": loading ? "true" : undefined },
            days.map(function (d, i) {
              var on = !loading && sel && sel.key === d.key, off = loading || !d.slots.length;
              return h("button", {
                key: d.key, type: "button", role: "radio",
                "aria-checked": on ? "true" : "false", "aria-disabled": off ? "true" : undefined,
                "aria-label": d.long + (loading ? "" : d.slots.length ? ", " + d.slots.length + (d.slots.length === 1 ? " free time" : " free times") : ", no free times"),
                tabIndex: on ? 0 : -1,
                className: cx("cb-day", on && "is-on", off && "is-off"),
                ref: function (n) { dayRefs.current[i] = n; },
                onClick: function () { if (!off) setDayPick(d.key); },
                onKeyDown: function (ev) {
                  rove(ev, i, days.length, function (j) { return !loading && days[j].slots.length > 0; }, function (j) { setDayPick(days[j].key); }, dayRefs);
                }
              },
                h("span", { className: "cb-day-wd" }, d.wd),
                h("span", { className: "cb-day-num" }, d.num),
                h("span", { className: "cb-day-mon" }, d.mon));
            }))),
        h("div", { className: "cb-times", "data-cb-chrome": "" },
          noPick ? null : h("p", { className: "cb-times-head" }, loading ? h("span", { className: "cb-skel cb-skel--head" }) : sel && cur.phase === "ready" ? sel.long : " "),
          slotsBody,
          notice ? h("div", { className: "cb-notice", role: "alert" },
            h("p", null, notice.failed ? "The booking form didn't load here." : notice.blocked ? "The booking form didn't load here, and the new tab was blocked." : "Opened Cal.com in a new tab."),
            h("a", { href: notice.url, target: "_blank", rel: "noreferrer" }, "Open the booking page", svg(PATH.link))) : null));
    }

    var content = h("div", { className: "cr cb-root" },
      h("div", { className: "cb-scrim", ref: scrimRef, "aria-hidden": "true", onClick: close }),
      h("section", { className: cx("cb-panel", done && "is-done", "cb-panel--" + status), ref: panelRef, role: "dialog", "aria-modal": "true", "aria-labelledby": "cb-title", "aria-describedby": "cb-sub" },
        h("button", { type: "button", className: "cr-iconbtn cr-iconbtn--solid cb-close", ref: closeRef, "aria-label": "Close booking", title: "Close", onClick: close, "data-cb-chrome": "" },
          h(Icon, { name: "close" })),
        h("header", { className: "cb-head", "data-cb-chrome": "" },
          done ? h("span", { className: "cb-check", "aria-hidden": "true" }, svg(PATH.check, 2.2))
            : h(Craft.LiveStatus, { className: "cb-live cb-live--" + status, label: statusLabel(cfg) }),
          h("h2", { id: "cb-title", className: "cb-title" }, title),
          h("p", { id: "cb-sub", className: "cb-lede" }, subText)),
        h("div", { className: "cb-scroll" }, body),
        done ? null : h("footer", { className: "cb-foot", "data-cb-chrome": "" },
          "Prefer email? ", h("a", { href: "mailto:" + cfg.email }, cfg.email)),
        h("p", { className: "cr-visually-hidden", role: "status", "aria-live": "polite" }, live)));

    return ReactDOM.createPortal(content, host);
  }

  window.CraftBooking = { AvailabilityCard: AvailabilityCard, BookingSheet: BookingSheet, readBooking: readBooking };
})();
