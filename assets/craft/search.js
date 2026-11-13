/* Craft search: one liquid-glass popup with two modes.
   1. Search: instant results across case studies, their sections, Design Playground
      explorations and quick actions.
   2. Ask: the Portfolio Assistant (same knowledge base and topic matching as the green
      site's assets/portfolio-assistant), rebuilt in the Craft look.
   Exposes window.CraftSearch = { SearchPopup, useShortcut, findTopicId, search, buildStaticIndex }.
   The green assistant is untouched; this file only reads its knowledge-base.json. */
(function () {
  var React = window.React, ReactDOM = window.ReactDOM;
  if (!React || !ReactDOM) return;
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef,
    useLayoutEffect = React.useLayoutEffect, useMemo = React.useMemo, useCallback = React.useCallback;

  var KB_URL = "./assets/portfolio-assistant/knowledge-base.json?v=5";
  var RECENT_KEY = "ga-craft-search-recent";
  var EMAIL = "gauravavinash3@gmail.com";
  var LINKEDIN = "https://www.linkedin.com/in/gauravavinash";
  var EASE_ARRIVE = "cubic-bezier(0.16, 1, 0.3, 1)";
  var EASE_BACK = "cubic-bezier(0.5, 0, 0.75, 0)";
  var TYPE_MS = 14, TYPE_CHUNK = 3;
  var GROUP_LIMIT = { section: 5 };
  var SUGGESTED = ["AI search", "Deal Room", "Motion", "Fintech", "Resume", "Contact"];
  /* The KB links to the green site's pages; Craft has its own version of each case study */
  var LINK_MAP = {
    "./deal-room.html": "./craft-deal-room.html", "./deal-room-short.html": "./craft-deal-room.html", "./deal-room-case-study.html": "./craft-deal-room.html",
    "./contextual-chat.html": "./craft-contextual-chat-detailed.html", "./contextual-chat-short.html": "./craft-contextual-chat-detailed.html",
    "./white-label-short.html": "./craft-white-label.html",
    "./easyeat-case-study.html": "./craft-easyeat.html",
    "./resonance-short.html": "./craft-resonance.html"
  };
  /* KB topics that belong to one of the five case studies: show that case study under the answer */
  var TOPIC_CASE = {
    deal_room: "deal-room", deal_room_problem: "deal-room", deal_room_research: "deal-room", deal_room_decisions: "deal-room", deal_room_outcome: "deal-room",
    ai_assistant: "contextual-chat", ai_assistant_problem: "contextual-chat", ai_assistant_decisions: "contextual-chat", ai_assistant_outcome: "contextual-chat",
    previous_experience: "easyeat"
  };
  /* Search-only words for each case study (never shown, only matched) */
  var CASE_WORDS = {
    "contextual-chat": "ai assistant systematic agent chat search investors discovery openai vector conversational",
    "deal-room": "deals deal execution fundraising nda investors commitments company profile systematic",
    "white-label": "white label branding brand subdomain url logo sender email settings hub systematic",
    "easyeat": "easy eat food restaurant ordering qr mobile customization monetisation monetization",
    "resonance": "spotify music playback songs drop moment ai concept personal",
    "splitly": "split bill expenses money group trip friends claude cursor ai agents prototype live"
  };
  var PG_WORDS = {
    "craft-mode": "this page glass widgets wallpaper home board",
    "splitly": "expenses split money group trip prototype live",
    "moov": "fitness subscription checkout payment plan",
    "health-karma": "credit health finance score",
    "nomad": "travel trip destination",
    "swaply": "marketplace exchange swap community",
    "space-between": "video loop animation",
    "loading-range": "loader loading video animation"
  };

  function reduced() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }

  /* ───────── Icons: Craft's set plus a few of our own, same 1.5px line ───────── */
  var OWN = {
    send: "M12 19V5.5M6.5 11L12 5.5 17.5 11",
    clock: "M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zM12 8v4.5l3 1.6",
    hash: "M9.5 4.5l-2 15M16.5 4.5l-2 15M5 9h14.5M4.5 15H19",
    linkedin: "M6 10v8.5M6 5.6v.01M10.5 18.5v-5a3 3 0 0 1 6 0v5M10.5 10v8.5",
    swapView: "M4.5 12a7.5 7.5 0 0 1 13-5.1M19.5 12a7.5 7.5 0 0 1-13 5.1M17.8 3.6v3.6h-3.6M6.2 20.4v-3.6h3.6",
    speakerOn: "M4 9.5h3.5L12 6v12l-4.5-3.5H4zM15.5 9.2a4 4 0 0 1 0 5.6M18 6.8a7.5 7.5 0 0 1 0 10.4",
    speakerOff: "M4 9.5h3.5L12 6v12l-4.5-3.5H4zM15.5 10l4 4M19.5 10l-4 4",
    sparkle: "M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7zM18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z",
    enter: "M19 5.5v6a3 3 0 0 1-3 3H6M9.5 11L6 14.5 9.5 18",
    play: "M8 5.5v13l10-6.5z"
  };
  function Icon(props) {
    if (!OWN[props.name] && window.Craft && window.Craft.Icon) return h(window.Craft.Icon, props);
    return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: props.stroke || 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false", className: props.className },
      h("path", { d: OWN[props.name] || "" }));
  }
  function Well(props) {
    /* projects (case studies, playground explorations) show their orb from craft.js */
    if (props.orb && window.Craft && window.Craft.ProjectWell) return h(window.Craft.ProjectWell, { icon: props.icon, tone: props.tone, className: "cs-well" });
    return h("span", { className: cx("cr-pwell", "cr-pwell--" + (props.tone || "plain"), "cs-well"), "aria-hidden": "true" }, h(Icon, { name: props.icon }));
  }

  /* ───────── Text helpers ───────── */
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^\w\s]/g, " ").replace(/_/g, " ").replace(/\s+/g, " ").trim();
  }
  function words(s) { return s ? s.split(" ") : []; }
  /* one edit apart (insert, delete or swap a letter): enough for "resonnce" or "dela" */
  function near(a, b) {
    if (a === b) return true;
    var la = a.length, lb = b.length;
    if (Math.abs(la - lb) > 1) return false;
    var i = 0, j = 0, edits = 0;
    while (i < la && j < lb) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++edits > 1) return false;
      if (la > lb) i++; else if (lb > la) j++; else {
        if (a[i + 1] === b[j] && a[i] === b[j + 1]) { i += 2; j += 2; continue; }
        i++; j++;
      }
    }
    return edits + (la - i) + (lb - j) <= 1;
  }
  function escapeHtml(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function formatAnswer(text) {
    var html = escapeHtml(text);
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, href) {
      var to = LINK_MAP[href] || href;
      var ext = /\.pdf/i.test(to);
      return "<a href=\"" + to + "\"" + (ext ? " target=\"_blank\" rel=\"noopener\"" : "") + ">" + label + "</a>";
    });
    return html;
  }
  function speechText(text) {
    return String(text || "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/[→•▪︎]/g, ". ").replace(/\n+/g, ". ").replace(/\s*([:;])\s*/g, ". ")
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "").replace(/\s{2,}/g, " ").replace(/(\.\s*)+\./g, ".").trim();
  }
  function isQuestion(q) {
    var t = q.trim();
    if (t.length < 3) return false;
    return /\?$/.test(t) || /^(what|how|why|who|can|does|do|is|are|tell|where|which)\b/i.test(t);
  }

  /* ───────── Knowledge base: same matching order as portfolio-assistant.js,
     with two fixes: whole-word containment, and the longest matching alias wins ───────── */
  var kbPromise = null, KB = null;
  function loadKB() {
    if (!kbPromise) {
      kbPromise = fetch(KB_URL).then(function (r) { if (!r.ok) throw new Error("kb " + r.status); return r.json(); })
        .then(function (j) { KB = j; return j; })
        .catch(function (err) { kbPromise = null; throw err; });
    }
    return kbPromise;
  }
  function findTopicId(query, kb) {
    kb = kb || KB;
    if (!kb) return null;
    var q = norm(query);
    if (!q) return null;
    var topics = kb.topics, ids = Object.keys(topics);
    var i, j, id, aliases;
    for (i = 0; i < ids.length; i++) if (norm(ids[i]) === q) return ids[i];
    for (i = 0; i < ids.length; i++) {
      aliases = topics[ids[i]].aliases || [];
      for (j = 0; j < aliases.length; j++) if (norm(aliases[j]) === q) return ids[i];
    }
    /* alias inside the question (as whole words), or the question inside an alias */
    var best = null, bestLen = 0, padded = " " + q + " ";
    for (i = 0; i < ids.length; i++) {
      id = ids[i]; aliases = topics[id].aliases || [];
      for (j = 0; j < aliases.length; j++) {
        var a = norm(aliases[j]);
        if (!a) continue;
        var hit = padded.indexOf(" " + a + " ") >= 0 || (q.length >= 4 && (" " + a + " ").indexOf(" " + q + " ") >= 0);
        if (hit && a.length > bestLen) { best = id; bestLen = a.length; }
      }
    }
    if (best) return best;
    /* every word of a multi-word alias appears somewhere */
    var qw = words(q);
    for (i = 0; i < ids.length; i++) {
      aliases = topics[ids[i]].aliases || [];
      for (j = 0; j < aliases.length; j++) {
        var aw = words(norm(aliases[j]));
        if (aw.length > 1 && aw.every(function (w) { return qw.indexOf(w) >= 0; })) return ids[i];
      }
    }
    return null;
  }

  /* ───────── Search index ───────── */
  function buildStaticIndex(opts) {
    var items = [];
    (opts.cases || []).forEach(function (c) {
      items.push({
        id: "case-" + c.id, group: "case", caseId: c.id, title: c.title, href: c.href, icon: c.icon, tone: c.tone,
        sub: ["Case study", c.domain, c.metric && !c.metric.word ? c.metric.value + " " + c.metric.label : null].filter(Boolean).join(" · "),
        keys: [c.domain, c.year, CASE_WORDS[c.id]].join(" "), body: c.summary || ""
      });
    });
    (opts.playground || []).forEach(function (p) {
      var j = (opts.pgJson && opts.pgJson[p.pgId]) || {};
      items.push({
        id: "pg-" + p.pgId, group: "playground", pgId: p.pgId, title: p.title, icon: p.icon || "grid", tone: "plain",
        sub: ["Design Playground", p.domain].filter(Boolean).join(" · "),
        keys: [p.domain, j.category, (j.tools || []).join(" "), PG_WORDS[p.pgId]].join(" "),
        body: [p.summary, j.description, j.objective].filter(Boolean).join(" ")
      });
    });
    var nCase = (opts.cases || []).length, nPg = (opts.playground || []).length;
    [
      { id: "resume", title: "Download resume", sub: "PDF, opens in a new tab", icon: "download", keys: "cv resume pdf download hire" },
      { id: "email", title: "Email Gaurav", sub: EMAIL, icon: "mail", keys: "contact email mail hire reach message talk" },
      { id: "linkedin", title: "LinkedIn", sub: "linkedin.com/in/gauravavinash", icon: "linkedin", keys: "contact linkedin profile social connect" },
      { id: "allwork", title: "Open Projects", sub: nCase + " case studies, " + nPg + " explorations", icon: "grid", keys: "all work projects case studies portfolio browse" },
      { id: "playground", title: "Open Design Playground", sub: "Interface and motion explorations", icon: "layers", keys: "playground explorations interface motion concepts experiments" },
      { id: "assistant", title: "Ask the portfolio assistant", sub: "Questions about Gaurav and his work", icon: "chat", keys: "assistant chat ask question help bot" },
      { id: "classic", title: "Switch to the classic portfolio", sub: "Leaves Craft mode", icon: "swapView", keys: "classic green old portfolio exit craft mode switch back" }
    ].forEach(function (a) { items.push(Object.assign({ group: "action", action: a.id, tone: "plain", body: "" }, a, { id: "act-" + a.id })); });
    return items;
  }

  /* Sections: headings of each case study page, fetched once, linked with #anchors */
  var SKIP_HEAD = /^(next projects|let.s build smarter products together\.?|credits)$/i;
  var sectionPromise = null;
  function loadSections(cases) {
    if (sectionPromise) return sectionPromise;
    sectionPromise = Promise.all((cases || []).map(function (c) {
      if (!c.href) return [];
      return fetch(c.href).then(function (r) { return r.ok ? r.text() : ""; }).then(function (html) {
        if (!html) return [];
        var doc = new DOMParser().parseFromString(html, "text/html");
        var out = [], seen = {};
        Array.prototype.forEach.call(doc.querySelectorAll("main h2, main h3, article h2, article h3, section h2, section h3"), function (hd) {
          if (hd.closest(".mc-next, .mc-cta, footer, nav, [aria-hidden='true']")) return;
          var text = hd.textContent.replace(/\s+/g, " ").trim();
          if (!text || SKIP_HEAD.test(text) || hd.id === "h-next") return;
          var sec = hd.closest("section") || hd.parentElement;
          var anchorEl = hd.id ? hd : hd.closest("[id]:not(main):not(body):not(html)");
          var anchor = anchorEl ? anchorEl.id : "";
          if (!anchor && sec && sec.getAttribute("aria-labelledby") && doc.getElementById(sec.getAttribute("aria-labelledby"))) anchor = sec.getAttribute("aria-labelledby");
          var key = anchor + "|" + text;
          if (seen[key]) return;
          seen[key] = true;
          var kicker = "";
          if (hd.tagName === "H3") {
            var parentHead = sec && sec.querySelector("h2");
            if (parentHead) kicker = parentHead.textContent.replace(/\s+/g, " ").trim();
          }
          if (!kicker && sec) {
            var eb = sec.querySelector(".mc-eyebrow-bar, [class*='eyebrow'], .cc-meta > span:first-child");
            kicker = eb ? eb.textContent.replace(/^\s*\d+\s*[·.\-]\s*/, "").trim() : (sec.id || "").replace(/[-_]+/g, " ");
            if (kicker && kicker === kicker.toUpperCase()) kicker = kicker.toLowerCase();
            kicker = kicker ? kicker.charAt(0).toUpperCase() + kicker.slice(1) : "";
          }
          if (kicker.length > 48) kicker = kicker.slice(0, 46).replace(/\s+\S*$/, "") + "\u2026";
          var scope = hd.tagName === "H3" ? hd.parentElement : sec;
          var body = scope ? Array.prototype.map.call(scope.querySelectorAll("p, li"), function (p) { return p.textContent; }).join(" ").replace(/\s+/g, " ").slice(0, hd.tagName === "H3" ? 300 : 700) : "";
          out.push({
            id: "sec-" + c.id + "-" + out.length, group: "section", caseId: c.id, title: text, level: hd.tagName === "H3" ? 3 : 2,
            href: c.href + (anchor ? "#" + anchor : ""), icon: c.icon, tone: c.tone,
            sub: c.title + (kicker && norm(kicker) !== norm(text) ? " · " + kicker : ""),
            keys: kicker + " " + c.title, body: body
          });
        });
        return out;
      }).catch(function () { return []; });
    })).then(function (lists) { return [].concat.apply([], lists); });
    return sectionPromise;
  }

  var GROUP_BONUS = { "case": 8, playground: 5, action: 4, section: 0 };
  function scoreItem(it, toks, phrase) {
    var t = it._t || (it._t = norm(it.title)), tw = it._tw || (it._tw = words(t));
    var k = it._k || (it._k = norm(it.sub + " " + (it.keys || ""))), kw = it._kw || (it._kw = words(k));
    var b = it._b != null ? it._b : (it._b = norm(it.body)), bw = it._bw || (it._bw = words(b));
    var total = 0;
    for (var i = 0; i < toks.length; i++) {
      var tok = toks[i], s = 0;
      var pre = function (w) { return w.indexOf(tok) === 0; };
      if (tw.indexOf(tok) >= 0) s = 40;
      else if (tw.some(pre)) s = 32;
      else if (tok.length >= 2 && t.indexOf(tok) >= 0) s = 18;
      else if (kw.indexOf(tok) >= 0) s = 14;
      else if (kw.some(pre)) s = 11;
      else if (tok.length >= 3 && k.indexOf(tok) >= 0) s = 7;
      else if (tok.length >= 4 && tw.some(function (w) { return w.length >= 4 && near(w, tok); })) s = 10;
      else if (tok.length >= 3 && bw.some(pre)) s = 4;
      else if (tok.length >= 5 && kw.some(function (w) { return w.length >= 4 && near(w, tok); })) s = 4;
      if (!s) return 0;
      total += s;
    }
    if (t.indexOf(phrase) === 0) total += 30;
    else if (toks.length > 1 && t.indexOf(phrase) >= 0) total += 20;
    if (it.level === 3) total -= 2;
    return total + (GROUP_BONUS[it.group] || 0);
  }
  var STOP = " a an the of to in on for and or about what whats how why who can could does do did is are was tell me you your his he him show find where which with my i it its this that ";
  /* drop filler words ("what does", "tell me about") unless nothing else is left */
  function queryTokens(query) {
    var toks = words(norm(query));
    var kept = toks.filter(function (t) { return STOP.indexOf(" " + t + " ") < 0; });
    return kept.length ? kept : toks;
  }
  function search(items, query) {
    var toks = queryTokens(query), phrase = toks.join(" ");
    if (!toks.length) return [];
    var out = [];
    items.forEach(function (it) { var s = scoreItem(it, toks, phrase); if (s > 0) out.push({ item: it, score: s }); });
    out.sort(function (a, b) { return b.score - a.score; });
    return out;
  }

  /* Highlight the query's words where they start a word (else anywhere) */
  function marks(text, query) {
    var toks = queryTokens(query);
    if (!toks.length || !text) return text;
    var low = text.toLowerCase(), ranges = [];
    toks.forEach(function (tok) {
      var found = false, re = new RegExp("(^|[^a-z0-9])" + tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), m;
      while ((m = re.exec(low))) { var st = m.index + m[1].length; ranges.push([st, st + tok.length]); found = true; if (re.lastIndex === m.index) re.lastIndex++; }
      if (!found && tok.length >= 2) { var at = low.indexOf(tok); if (at >= 0) ranges.push([at, at + tok.length]); }
    });
    if (!ranges.length) return text;
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [ranges[0]];
    for (var i = 1; i < ranges.length; i++) {
      var last = merged[merged.length - 1];
      if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1]); else merged.push(ranges[i]);
    }
    var parts = [], pos = 0;
    merged.forEach(function (r, i) {
      if (r[0] > pos) parts.push(text.slice(pos, r[0]));
      parts.push(h("mark", { key: i }, text.slice(r[0], r[1])));
      pos = r[1];
    });
    if (pos < text.length) parts.push(text.slice(pos));
    return parts;
  }

  /* ───────── Recent searches ───────── */
  function readRecent() {
    try { var v = JSON.parse(window.localStorage.getItem(RECENT_KEY) || "[]"); return Array.isArray(v) ? v.filter(function (s) { return typeof s === "string"; }).slice(0, 5) : []; }
    catch (err) { return []; }
  }
  function writeRecent(list) { try { window.localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch (err) { /* private mode */ } }

  /* ───────── Motion: grow out of the button that opened it ───────── */
  function sourceOf(el) {
    if (!el || !el.isConnected || !el.getBoundingClientRect) return null;
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    var rad = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 24;
    return { rect: r, radius: Math.min(rad, r.height / 2) };
  }
  function growFrames(panel, src) {
    var r = panel.getBoundingClientRect(), s = src.rect;
    var w = Math.min(s.width, r.width), hh = Math.min(s.height, r.height);
    var cl = Math.max(0, Math.min(s.left - r.left, r.width - w));
    var ct = Math.max(0, Math.min(s.top - r.top, r.height - hh));
    var tx = s.left - (r.left + cl), ty = s.top - (r.top + ct);
    var R = getComputedStyle(panel).borderTopLeftRadius || "0px";
    return [
      { clipPath: "inset(" + ct + "px " + (r.width - cl - w) + "px " + (r.height - ct - hh) + "px " + cl + "px round " + src.radius + "px)", transform: "translate(" + tx + "px," + ty + "px)" },
      { clipPath: "inset(0px 0px 0px 0px round " + R + ")", transform: "translate(0px,0px)" }
    ];
  }
  function focusables(root) {
    return Array.prototype.slice.call(root.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])"))
      .filter(function (n) { return n.offsetWidth || n.offsetHeight || n.getClientRects().length; });
  }

  /* ───────── Assistant state lives here, so a conversation survives closing the popup ───────── */
  var chat = { messages: [], seq: 0 };
  var voice = { on: false, preferred: null };
  function pickVoice() {
    if (!window.speechSynthesis) return null;
    var vs = window.speechSynthesis.getVoices();
    if (!vs.length) return null;
    function score(v) {
      var n = (v.name || "") + " " + (v.lang || ""), s = 0;
      if (/en[-_]?us/i.test(n)) s += 40; else if (/en[-_]?gb/i.test(n)) s += 28; else if (/^en/i.test(v.lang || "")) s += 18;
      if (/neural|natural|premium|enhanced|studio/i.test(n)) s += 55;
      if (/google/i.test(n)) s += 30;
      if (/samantha|karen|moira|daniel|alex|zoe|ava|aria|jenny|sonia/i.test(n)) s += 25;
      if (/compact|eloquence|whisper|robot|novelty/i.test(n)) s -= 40;
      return s;
    }
    return vs.slice().sort(function (a, b) { return score(b) - score(a); })[0] || null;
  }
  function stopSpeech() { try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (err) { /* ignore */ } }
  function speak(text) {
    if (!voice.on || !window.speechSynthesis || !text) return;
    stopSpeech();
    var u = new SpeechSynthesisUtterance(speechText(text));
    if (!voice.preferred) voice.preferred = pickVoice();
    if (voice.preferred) { u.voice = voice.preferred; u.lang = voice.preferred.lang; }
    u.rate = 0.92; u.pitch = 0.95;
    window.speechSynthesis.speak(u);
  }

  /* ───────── The popup ───────── */
  function SearchPopup(props) {
    var _host = useState(function () {
      var d = document.createElement("div");
      d.className = "cs-host";
      document.body.appendChild(d);
      return d;
    }), host = _host[0];
    var rootRef = useRef(null), panelRef = useRef(null), scrimRef = useRef(null), inputRef = useRef(null), askRef = useRef(null);
    var listRef = useRef(null), logRef = useRef(null), tabRefs = useRef([]);
    var closing = useRef(false), kbFailed = useRef(false);

    var _m = useState(props.mode === "ask" ? "ask" : "search"), mode = _m[0], setMode = _m[1];
    var _q = useState(props.query || ""), query = _q[0], setQuery = _q[1];
    var _a = useState(0), active = _a[0], setActive = _a[1];
    var _s = useState([]), sections = _s[0], setSections = _s[1];
    var _j = useState(null), pgJson = _j[0], setPgJson = _j[1];
    var _e = useState({}), expanded = _e[0], setExpanded = _e[1];
    var _r = useState(readRecent), recent = _r[0], setRecent = _r[1];
    var _c = useState(chat.messages), messages = _c[0], setMessagesState = _c[1];
    var _t = useState(null), typing = _t[0], setTyping = _t[1]; /* { id, n } ; n = -1 while the dots show */
    var _d = useState(""), draft = _d[0], setDraft = _d[1];
    var _v = useState(voice.on), voiceOn = _v[0], setVoiceOn = _v[1];
    var _k = useState(false), keyNav = _k[0], setKeyNav = _k[1];
    var busy = !!typing;

    function setMessages(fn) {
      setMessagesState(function (prev) { var next = typeof fn === "function" ? fn(prev) : fn; chat.messages = next; return next; });
    }

    /* Data: static items now, sections and playground details when they arrive */
    useEffect(function () {
      var live = true;
      loadSections(props.cases).then(function (s) { if (live) setSections(s); });
      var CP = window.CraftPlayground;
      if (CP && CP.preload) CP.preload().then(function (j) {
        if (!live || !j) return;
        var by = {};
        ["interface", "motion"].forEach(function (k) { (j[k] || []).forEach(function (p) { by[p.id] = p; }); });
        setPgJson(by);
      });
      loadKB().catch(function () { kbFailed.current = true; });
      return function () { live = false; };
    }, []);
    var staticItems = useMemo(function () {
      return buildStaticIndex({ cases: props.cases, playground: props.playground, pgJson: pgJson });
    }, [props.cases, props.playground, pgJson]);
    var allItems = useMemo(function () { return staticItems.concat(sections); }, [staticItems, sections]);

    /* ── Results, grouped, with a flat option list for the keyboard ── */
    var trimmed = query.trim();
    var view = useMemo(function () {
      var groups = [], flat = [];
      function push(opt) { opt.index = flat.length; flat.push(opt); return opt; }
      if (!trimmed) {
        var cases = staticItems.filter(function (it) { return it.group === "case"; });
        var acts = staticItems.filter(function (it) { return it.group === "action" && it.action !== "assistant"; });
        groups.push({ id: "case", label: "Case studies", count: cases.length, opts: cases.map(function (it) { return push({ kind: "item", item: it }); }) });
        groups.push({ id: "action", label: "Quick actions", count: acts.length, opts: acts.map(function (it) { return push({ kind: "item", item: it }); }) });
        return { groups: groups, flat: flat, ask: null, total: 0 };
      }
      var hits = search(allItems, trimmed);
      var question = isQuestion(trimmed);
      var ask = null;
      if (question) ask = push({ kind: "ask", first: true });
      var order = [], byGroup = {};
      hits.forEach(function (hit) {
        var g = hit.item.group;
        if (!byGroup[g]) { byGroup[g] = []; order.push(g); }
        byGroup[g].push(hit.item);
      });
      var LABEL = { "case": "Case studies", section: "Sections", playground: "Design Playground", action: "Quick actions" };
      order.forEach(function (g) {
        var list = byGroup[g], lim = GROUP_LIMIT[g];
        var shown = lim && !expanded[g] ? list.slice(0, lim) : list;
        var opts = shown.map(function (it) { return push({ kind: "item", item: it }); });
        if (shown.length < list.length) opts.push(push({ kind: "more", group: g, more: list.length - shown.length }));
        groups.push({ id: g, label: LABEL[g], count: list.length, opts: opts });
      });
      if (!question) ask = push({ kind: "ask", first: false });
      return { groups: groups, flat: flat, ask: ask, total: hits.length };
    }, [trimmed, allItems, staticItems, expanded]);

    useEffect(function () { setActive(0); }, [trimmed]);
    useEffect(function () { setExpanded({}); }, [trimmed]);
    useEffect(function () {
      if (!keyNav || !listRef.current) return;
      var el = listRef.current.querySelector("[data-cs-index='" + active + "']");
      if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    }, [active, keyNav]);

    /* ── Open: scrim fades, panel grows out of the opener, contents rise ── */
    useLayoutEffect(function () {
      var root = document.documentElement;
      root.classList.add("ga-cs-open", "ga-cs-dim");
      var prev = props.opener || document.activeElement;
      var panel = panelRef.current, still = reduced(), src = sourceOf(props.opener);
      /* keep the panel above an on-screen keyboard on phones */
      var vv = window.visualViewport;
      function fit() {
        if (!rootRef.current) return;
        if (vv && window.innerWidth <= 700) {
          rootRef.current.style.setProperty("--cs-vh", vv.height + "px");
          rootRef.current.style.setProperty("--cs-vtop", vv.offsetTop + "px");
        } else {
          rootRef.current.style.removeProperty("--cs-vh");
          rootRef.current.style.removeProperty("--cs-vtop");
        }
      }
      fit();
      if (vv) { vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit); }
      if (scrimRef.current) scrimRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: still ? 160 : 420, easing: "ease", fill: "backwards" });
      if (still || !src || window.innerWidth <= 700) {
        panel.animate(still ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: "translateY(24px) scale(0.98)" }, { opacity: 1, transform: "none" }],
          { duration: still ? 160 : 420, easing: EASE_ARRIVE, fill: "backwards" });
      } else {
        panel.animate(growFrames(panel, src), { duration: 480, easing: EASE_ARRIVE, fill: "backwards" });
      }
      if (!still) Array.prototype.slice.call(panel.querySelectorAll("[data-cs-chrome]")).forEach(function (n, i) {
        n.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 480, delay: 120 + i * 50, easing: EASE_ARRIVE, fill: "backwards" });
      });
      /* keys typed inside the popup stay inside it (the playground listens on document) */
      var stop = function (ev) { ev.stopPropagation(); };
      host.addEventListener("keydown", stop);
      var t = setTimeout(function () { focusMain(); }, 40);
      return function () {
        clearTimeout(t);
        host.removeEventListener("keydown", stop);
        if (vv) { vv.removeEventListener("resize", fit); vv.removeEventListener("scroll", fit); }
        root.classList.remove("ga-cs-open", "ga-cs-dim");
        stopSpeech();
        if (host.parentNode) host.parentNode.removeChild(host);
        if (prev && prev.isConnected && prev.focus) prev.focus({ preventScroll: true });
      };
    }, []);

    function focusMain() {
      var el = mode === "ask" ? askRef.current : inputRef.current;
      if (el && !el.disabled) el.focus({ preventScroll: true });
    }
    useEffect(function () { if (!closing.current) focusMain(); }, [mode]);
    useEffect(function () { if (!typing) focusMainSoft(); }, [typing]);
    function focusMainSoft() {
      /* after an answer, put the caret back unless the user moved focus elsewhere in the popup */
      if (mode !== "ask" || !askRef.current) return;
      var a = document.activeElement;
      if (!a || a === document.body || a === askRef.current || (rootRef.current && !rootRef.current.contains(a)) || a.disabled) askRef.current.focus({ preventScroll: true });
    }

    /* Tab can't leave, even if focus was on the page when a key arrived */
    useEffect(function () {
      function onKey(ev) {
        if (ev.key !== "Tab" || !panelRef.current) return;
        if (panelRef.current.contains(document.activeElement)) return;
        ev.preventDefault();
        focusMain();
      }
      window.addEventListener("keydown", onKey, true);
      return function () { window.removeEventListener("keydown", onKey, true); };
    }, [mode]);

    function close(then) {
      if (closing.current) return;
      closing.current = true;
      stopSpeech();
      var panel = panelRef.current, called = false;
      var done = function () { if (called) return; called = true; props.onClose(then); };
      if (!panel) { done(); return; }
      setTimeout(done, 700);
      document.documentElement.classList.remove("ga-cs-dim");
      if (props.onClosing) props.onClosing();
      var still = reduced(), src = then ? null : sourceOf(props.opener);
      if (scrimRef.current) scrimRef.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: still ? 140 : 360, easing: "ease", fill: "forwards" });
      Array.prototype.slice.call(panel.querySelectorAll("[data-cs-chrome]")).forEach(function (n) {
        n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: still ? 120 : 180, easing: "ease", fill: "forwards" });
      });
      var anim;
      if (still || !src || window.innerWidth <= 700) {
        anim = panel.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: still ? "none" : "translateY(16px) scale(0.98)" }], { duration: still ? 140 : 300, easing: EASE_BACK, fill: "forwards" });
      } else {
        var fr = growFrames(panel, src).reverse();
        fr[1].opacity = 0.6;
        anim = panel.animate(fr, { duration: 420, easing: EASE_BACK, fill: "forwards" });
      }
      anim.finished.then(done, done);
    }

    /* ── Picking a result ── */
    function remember(q) {
      q = (q || "").trim();
      if (!q) return;
      var next = [q].concat(recent.filter(function (r) { return r.toLowerCase() !== q.toLowerCase(); })).slice(0, 5);
      setRecent(next); writeRecent(next);
    }
    function clearRecent() { setRecent([]); writeRecent([]); }
    function pick(opt) {
      if (!opt) return;
      if (opt.kind === "more") { setExpanded(function (e) { var n = Object.assign({}, e); n[opt.group] = true; return n; }); return; }
      if (opt.kind === "ask") { remember(trimmed); handOver(trimmed); return; }
      var it = opt.item;
      remember(trimmed);
      if (it.group === "case" || it.group === "section") { if (window.GAAccess && window.GAAccess.intercept(it.href)) { close(function () {}); return; } window.location.href = it.href; return; }
      if (it.group === "playground") { close(function () { if (props.onPlayground) props.onPlayground(it.pgId); }); return; }
      runAction(it.action);
    }
    function runAction(id) {
      if (id === "resume") { window.open(props.resumeHref, "_blank", "noopener"); return; }
      if (id === "email") { window.location.href = "mailto:" + EMAIL; return; }
      if (id === "linkedin") { window.open(LINKEDIN, "_blank", "noopener"); return; }
      if (id === "assistant") { setMode("ask"); return; }
      if (id === "allwork") { close(function () { if (props.onAllWork) props.onAllWork(); }); return; }
      if (id === "playground") { close(function () { if (props.onPlayground) props.onPlayground(null); }); return; }
      if (id === "classic") { close(function () { if (props.onClassic) props.onClassic(); }); return; }
    }

    /* ── Assistant ── */
    function pushBot(payload, extra) {
      var limit = payload.suggestionLimit || 3;
      var msg = Object.assign({ id: ++chat.seq, role: "bot", text: payload.response || payload.message || "", suggestions: (payload.suggestions || []).slice(0, limit), done: false }, extra || {});
      setMessages(function (m) { return m.concat([msg]); });
      if (reduced()) { finish(msg); return; }
      setTyping({ id: msg.id, n: -1 });
    }
    function finish(msg) {
      setMessages(function (m) { return m.map(function (x) { return x.id === msg.id ? Object.assign({}, x, { done: true }) : x; }); });
      setTyping(null);
      if (!msg.welcome) speak(msg.text);
    }
    var KB_DOWN = { response: "The assistant couldn't load its answers just now. Search still works: switch to Search above, or try again in a moment.", suggestions: [] };
    function send(text, topicId) {
      text = (text || "").trim();
      if (!text || busy) return;
      setMessages(function (m) { return m.concat([{ id: ++chat.seq, role: "user", text: text, done: true }]); });
      setTyping({ id: -1, n: -1 });
      loadKB().then(function (kb) {
        var id = topicId || findTopicId(text, kb);
        var payload = (id && kb.topics[id]) || kb.fallback;
        pushBot(payload, { topicId: id || null, query: text, fallback: !id });
      }, function () { pushBot(KB_DOWN, { query: text, fallback: true, failed: true }); });
    }
    function handOver(q) {
      setMode("ask");
      send(q);
    }
    /* first time in Ask: the KB's welcome */
    useEffect(function () {
      if (mode !== "ask" || messages.length || busy) return;
      setTyping({ id: -1, n: -1 });
      loadKB().then(function (kb) { pushBot(kb.welcome, { welcome: true }); },
        function () { pushBot({ response: "Ask about Gaurav's experience, projects, or design process.", suggestions: [] }, { welcome: true, failed: true }); });
    }, [mode]);
    /* typing: dots for a beat, then the text in small chunks */
    useEffect(function () {
      if (!typing || typing.id === -1) return undefined;
      var msg = messages.filter(function (m) { return m.id === typing.id; })[0];
      if (!msg) return undefined;
      if (typing.n >= msg.text.length) { finish(msg); return undefined; }
      var t = setTimeout(function () {
        setTyping(function (ty) { return ty && ty.id === msg.id ? { id: ty.id, n: ty.n < 0 ? 0 : Math.min(msg.text.length, ty.n + TYPE_CHUNK) } : ty; });
      }, typing.n < 0 ? 420 : TYPE_MS);
      return function () { clearTimeout(t); };
    }, [typing, messages]);
    useEffect(function () {
      var el = logRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, [messages.length, typing && typing.n, mode]);
    function skipTyping() {
      if (!typing || typing.id === -1) return;
      var msg = messages.filter(function (m) { return m.id === typing.id; })[0];
      if (msg) finish(msg);
    }
    function toggleVoice() {
      var next = !voice.on;
      voice.on = next; setVoiceOn(next);
      if (!next) { stopSpeech(); return; }
      var lastBot = messages.filter(function (m) { return m.role === "bot" && m.done; }).pop();
      if (lastBot) speak(lastBot.text);
    }

    /* ── Keyboard ── */
    function onPanelKey(ev) {
      if (ev.key === "Escape") { ev.preventDefault(); close(); return; }
      if ((ev.metaKey || ev.ctrlKey) && (ev.key === "k" || ev.key === "K")) {
        ev.preventDefault();
        if (mode !== "search") setMode("search"); else if (inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
        return;
      }
      if (ev.key !== "Tab") return;
      var f = focusables(panelRef.current);
      if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === a) { ev.preventDefault(); z.focus(); }
      else if (!ev.shiftKey && document.activeElement === z) { ev.preventDefault(); a.focus(); }
    }
    function onInputKey(ev) {
      var n = view.flat.length;
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        if (!n) return;
        ev.preventDefault();
        setKeyNav(true);
        setActive(function (i) { return (i + (ev.key === "ArrowDown" ? 1 : -1) + n) % n; });
      } else if (ev.key === "Enter") {
        if (!n) return;
        ev.preventDefault();
        pick(view.flat[Math.min(active, n - 1)]);
      }
    }
    function onTabKey(ev, i) {
      var j = null;
      if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") j = 1 - i;
      else if (ev.key === "Home") j = 0; else if (ev.key === "End") j = 1;
      if (j == null) return;
      ev.preventDefault();
      setMode(j === 0 ? "search" : "ask");
      if (tabRefs.current[j]) tabRefs.current[j].focus();
    }

    /* ── Render ── */
    var MODES = [{ id: "search", label: "Search" }, { id: "ask", label: "Ask assistant" }];
    var mi = mode === "ask" ? 1 : 0;
    var activeId = view.flat.length ? "cs-opt-" + Math.min(active, view.flat.length - 1) : undefined;

    function optionRow(opt, content, extraClass) {
      var on = opt.index === active;
      return h("div", {
        key: opt.index, id: "cs-opt-" + opt.index, role: "option", "aria-selected": on ? "true" : "false",
        className: cx("cs-row", extraClass, on && "is-active"), "data-cs-index": opt.index,
        onMouseMove: function () { if (keyNav) setKeyNav(false); if (active !== opt.index) setActive(opt.index); },
        onMouseDown: function (ev) { ev.preventDefault(); }, /* keep the caret in the field */
        onClick: function () { pick(opt); }
      }, content);
    }
    function itemRow(opt) {
      var it = opt.item;
      var external = it.action === "resume" || it.action === "linkedin";
      var go = it.group === "action" ? (external ? "arrow" : "chevron") : "arrow";
      return optionRow(opt, [
        h(Well, { key: "w", icon: it.group === "section" ? "hash" : it.icon, tone: it.tone, orb: it.group === "case" || it.group === "playground" }),
        h("span", { key: "t", className: "cs-row-text" },
          h("b", null, marks(it.title, trimmed)),
          h("span", null, marks(it.sub, trimmed))),
        h("span", { key: "g", className: "cs-go", "aria-hidden": "true" }, h(Icon, { name: go, stroke: 1.8 }))
      ], "cs-row--" + it.group);
    }
    function askRow(opt) {
      return optionRow(opt, [
        h("span", { key: "w", className: "cr-pwell cs-well cs-well--ask", "aria-hidden": "true" }, h(Icon, { name: "sparkle" })),
        h("span", { key: "t", className: "cs-row-text" },
          h("b", null, opt.first ? "Ask the assistant: " : "Ask the assistant about ", h("q", null, trimmed)),
          h("span", null, "Answers come from what's on this portfolio")),
        h("span", { key: "g", className: "cs-go", "aria-hidden": "true" }, h(Icon, { name: "enter", stroke: 1.8 }))
      ], "cs-row--ask");
    }
    function moreRow(opt) {
      return optionRow(opt, h("span", { className: "cs-more" }, "Show " + opt.more + " more"), "cs-row--more");
    }
    function renderOpt(opt) { return opt.kind === "ask" ? askRow(opt) : opt.kind === "more" ? moreRow(opt) : itemRow(opt); }

    function chipButton(label, onClick, key, extra) {
      return h("button", Object.assign({ key: key || label, type: "button", className: "cs-chip", onClick: onClick }, extra || {}), label);
    }

    var searchBody;
    if (!trimmed) {
      searchBody = h("div", { className: "cs-scroll", ref: listRef },
        recent.length ? h("div", { className: "cs-chips-block" },
          h("div", { className: "cs-label" }, h("span", null, "Recent"),
            h("button", { type: "button", className: "cs-label-btn", onClick: clearRecent }, "Clear")),
          h("div", { className: "cs-chips", role: "group", "aria-label": "Recent searches" },
            recent.map(function (r) { return chipButton([h(Icon, { key: "i", name: "clock" }), r], function () { setQuery(r); if (inputRef.current) inputRef.current.focus(); }, "r-" + r, { "aria-label": "Search again for " + r }); }))) : null,
        h("div", { className: "cs-chips-block" },
          h("div", { className: "cs-label" }, h("span", null, "Try")),
          h("div", { className: "cs-chips", role: "group", "aria-label": "Suggested searches" },
            SUGGESTED.map(function (s) { return chipButton(s, function () { setQuery(s); if (inputRef.current) inputRef.current.focus(); }); }))),
        h("div", { id: "cs-listbox", role: "listbox", "aria-label": "Suggestions" },
          view.groups.map(function (g) {
            return h("div", { key: g.id, role: "group", "aria-labelledby": "cs-g-" + g.id, className: "cs-group" },
              h("div", { className: "cs-label", id: "cs-g-" + g.id }, h("span", null, g.label), h("span", { className: "cs-count" }, g.count)),
              h("div", { className: "cs-card" }, g.opts.map(renderOpt)));
          })));
    } else {
      var noHits = !view.total;
      searchBody = h("div", { className: "cs-scroll", ref: listRef },
        noHits && !(view.ask && view.ask.first) ? h("div", { className: "cs-empty" },
          h("p", { className: "cs-empty-title" }, "Nothing here for ", h("q", null, trimmed)),
          h("p", { className: "cs-empty-sub" }, "Try a project name, a topic like ", h("i", null, "fintech"), " or ", h("i", null, "motion"), ", or ask the assistant.")) : null,
        h("div", { id: "cs-listbox", role: "listbox", "aria-label": "Results" },
          view.ask && view.ask.first ? h("div", { className: "cs-group", role: "group", "aria-label": "Assistant" }, h("div", { className: "cs-card" }, askRow(view.ask))) : null,
          view.groups.map(function (g) {
            return h("div", { key: g.id, role: "group", "aria-labelledby": "cs-g-" + g.id, className: "cs-group" },
              h("div", { className: "cs-label", id: "cs-g-" + g.id }, h("span", null, g.label), h("span", { className: "cs-count" }, g.count)),
              h("div", { className: "cs-card" }, g.opts.map(renderOpt)));
          }),
          view.ask && !view.ask.first ? h("div", { className: "cs-group", role: "group", "aria-label": "Assistant" }, h("div", { className: "cs-card cs-card--soft" }, askRow(view.ask))) : null),
        noHits ? h("div", { className: "cs-chips-block" },
          h("div", { className: "cs-label" }, h("span", null, "Try")),
          h("div", { className: "cs-chips", role: "group", "aria-label": "Suggested searches" },
            SUGGESTED.map(function (s) { return chipButton(s, function () { setQuery(s); if (inputRef.current) inputRef.current.focus(); }); }))) : null);
    }

    var status = !trimmed ? "" : view.total ? view.total + (view.total === 1 ? " result" : " results") : "No results";

    var searchPanel = h("div", { className: "cs-pane", role: "tabpanel", id: "cs-pane-search", "aria-labelledby": "cs-tab-search", hidden: mode !== "search" },
      h("div", { className: "cs-field", "data-cs-chrome": "" },
        h("span", { className: "cs-field-icon", "aria-hidden": "true" }, h(Icon, { name: "search", stroke: 1.6 })),
        h("input", {
          ref: inputRef, className: "cs-input", type: "text", value: query, placeholder: "Search projects, sections, playground",
          role: "combobox", "aria-expanded": "true", "aria-controls": "cs-listbox", "aria-autocomplete": "list",
          "aria-activedescendant": activeId, "aria-label": "Search the portfolio", autoComplete: "off", autoCorrect: "off", autoCapitalize: "off", spellCheck: false, enterKeyHint: "go",
          onChange: function (ev) { setQuery(ev.target.value); setKeyNav(false); }, onKeyDown: onInputKey
        }),
        query ? h("button", { type: "button", className: "cs-clear", "aria-label": "Clear search", onClick: function () { setQuery(""); if (inputRef.current) inputRef.current.focus(); } }, h(Icon, { name: "close", stroke: 1.8 })) : null),
      h("p", { className: "cs-sr", role: "status", "aria-live": "polite" }, status),
      h("div", { className: "cs-body", "data-cs-chrome": "" }, searchBody),
      h("div", { className: "cs-foot", "aria-hidden": "true", "data-cs-chrome": "" },
        h("span", null, h("kbd", null, "↑"), h("kbd", null, "↓"), " to move"),
        h("span", null, h("kbd", null, "Enter"), " to open"),
        h("span", null, h("kbd", null, "Esc"), " to close")));

    var caseById = {};
    (props.cases || []).forEach(function (c) { caseById[c.id] = c; });
    var lastBotId = (messages.filter(function (m) { return m.role === "bot"; }).pop() || {}).id;
    var waiting = typing && typing.id === -1;

    var askPanel = h("div", { className: "cs-pane cs-pane--ask", role: "tabpanel", id: "cs-pane-ask", "aria-labelledby": "cs-tab-ask", hidden: mode !== "ask" },
      h("div", { className: "cs-log", ref: logRef, role: "log", "aria-live": "polite", "aria-label": "Conversation with the portfolio assistant", "data-cs-chrome": "" },
        messages.map(function (m) {
          if (m.role === "user") return h("div", { key: m.id, className: "cs-msg cs-msg--user" }, h("p", { className: "cs-bubble cs-bubble--user" }, m.text));
          var isTyping = typing && typing.id === m.id;
          var shown = isTyping ? (typing.n < 0 ? "" : m.text.slice(0, typing.n)) : m.text;
          var rel = m.done && m.topicId && TOPIC_CASE[m.topicId] ? caseById[TOPIC_CASE[m.topicId]] : null;
          if (rel && formatAnswer(m.text).indexOf("\"" + rel.href + "\"") >= 0) rel = null; /* the answer already links there */
          var showChips = m.done && m.id === lastBotId;
          return h("div", { key: m.id, className: "cs-msg cs-msg--bot" },
            h("span", { className: "cs-avatar", "aria-hidden": "true" }, h(Icon, { name: "sparkle" })),
            h("div", { className: "cs-msg-col" },
              isTyping
                ? h("div", { className: "cs-bubble cs-bubble--bot is-typing", "aria-hidden": "true", onClick: skipTyping },
                    typing.n < 0 ? h("span", { className: "cs-dots" }, h("i"), h("i"), h("i")) : h("span", { dangerouslySetInnerHTML: { __html: formatAnswer(shown) } }), typing.n >= 0 ? h("span", { className: "cs-caret" }) : null)
                : h("div", { className: "cs-bubble cs-bubble--bot", dangerouslySetInnerHTML: { __html: formatAnswer(m.text) } }),
              rel ? h("a", { className: "cs-related", href: rel.href },
                h(Well, { icon: rel.icon, tone: rel.tone, orb: true }),
                h("span", { className: "cs-row-text" }, h("b", null, rel.title), h("span", null, "Read the case study")),
                h("span", { className: "cs-go", "aria-hidden": "true" }, h(Icon, { name: "arrow", stroke: 1.8 }))) : null,
              showChips && (m.suggestions.length || m.fallback) ? h("div", { className: "cs-chips cs-chips--reply", role: "group", "aria-label": "Suggested questions" },
                m.suggestions.map(function (s) { return chipButton(s.label, function () { send(s.label, s.topicId); }, s.topicId + s.label, { disabled: busy }); }),
                m.fallback && m.query ? chipButton([h(Icon, { key: "i", name: "search" }), "Search for “" + m.query + "”"], function () { setQuery(m.query); setMode("search"); }, "sq", { className: "cs-chip cs-chip--search" }) : null) : null));
        }),
        waiting ? h("div", { className: "cs-msg cs-msg--bot", "aria-hidden": "true" },
          h("span", { className: "cs-avatar" }, h(Icon, { name: "sparkle" })),
          h("div", { className: "cs-msg-col" }, h("div", { className: "cs-bubble cs-bubble--bot is-typing" }, h("span", { className: "cs-dots" }, h("i"), h("i"), h("i"))))) : null),
      h("form", { className: "cs-compose", "data-cs-chrome": "", onSubmit: function (ev) { ev.preventDefault(); if (busy) return; var v = draft; setDraft(""); send(v); } },
        h("input", { ref: askRef, className: "cs-ask-input", type: "text", value: draft, placeholder: busy ? "Answering…" : "Ask about projects, process, skills",
          "aria-label": "Ask the portfolio assistant", autoComplete: "off", enterKeyHint: "send",
          onChange: function (ev) { setDraft(ev.target.value); } }),
        h("button", { type: "submit", className: "cs-send", "aria-label": "Send question", disabled: busy || !draft.trim() }, h(Icon, { name: "send", stroke: 1.8 }))),
      h("p", { className: "cs-note", "data-cs-chrome": "" }, "Answers come from a fixed set of notes about Gaurav's work. No live AI."));

    var content = h("div", { className: "cr cs-root" + (mode === "ask" ? " is-ask" : ""), ref: rootRef },
      h("div", { className: "cs-scrim", ref: scrimRef, "aria-hidden": "true", onClick: function () { close(); } }),
      h("section", { className: "cs-panel", ref: panelRef, role: "dialog", "aria-modal": "true", "aria-label": mode === "ask" ? "Ask the portfolio assistant" : "Search the portfolio", onKeyDown: onPanelKey },
        h("header", { className: "cs-top" },
          h("div", { className: "cs-tabs", role: "tablist", "aria-label": "Search or ask", "data-cs-chrome": "" },
            h("span", { className: "cs-tabpill", "aria-hidden": "true", style: { transform: "translateX(" + (mi * 100) + "%)" } }),
            MODES.map(function (m, i) {
              var on = i === mi;
              return h("button", { key: m.id, type: "button", role: "tab", id: "cs-tab-" + m.id, "aria-selected": on ? "true" : "false", "aria-controls": "cs-pane-" + m.id,
                tabIndex: on ? 0 : -1, ref: function (n) { tabRefs.current[i] = n; },
                onClick: function () { setMode(m.id); }, onKeyDown: function (ev) { onTabKey(ev, i); } },
                h(Icon, { name: m.id === "ask" ? "sparkle" : "search", stroke: 1.6 }), h("span", null, m.label));
            })),
          h("div", { className: "cs-top-actions", "data-cs-chrome": "" },
            mode === "ask" && window.speechSynthesis ? h("button", { type: "button", className: "cr-iconbtn cs-roundbtn" + (voiceOn ? " is-on" : ""), "aria-pressed": voiceOn ? "true" : "false",
              "aria-label": voiceOn ? "Voice on. Mute narration" : "Read answers aloud", title: voiceOn ? "Voice on" : "Read answers aloud", onClick: toggleVoice },
              h(Icon, { name: voiceOn ? "speakerOn" : "speakerOff" })) : null,
            h("button", { type: "button", className: "cr-iconbtn cr-iconbtn--solid cs-close", "aria-label": "Close search", title: "Close", onClick: function () { close(); } }, h(Icon, { name: "close" })))),
        searchPanel,
        askPanel));

    return ReactDOM.createPortal(content, host);
  }

  /* "/" or Cmd/Ctrl+K opens search. open(opener) is called with the visible search button, if any. */
  function useShortcut(open, enabled) {
    var ref = useRef(open);
    ref.current = open;
    useEffect(function () {
      if (!enabled) return undefined;
      function onKey(ev) {
        if (ev.defaultPrevented || ev.altKey) return;
        var mod = (ev.metaKey || ev.ctrlKey) && (ev.key === "k" || ev.key === "K");
        var slash = ev.key === "/" && !ev.metaKey && !ev.ctrlKey;
        if (!mod && !slash) return;
        var t = ev.target;
        if (slash && t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        if (document.querySelector(".cs-host")) return; /* already open: the popup handles it */
        if (document.documentElement.classList.contains("ga-aw-open")) return;
        ev.preventDefault();
        var btn = document.querySelector(".cr-hero .cr-topbar-right .cr-iconbtn");
        ref.current(btn && btn.offsetWidth ? btn : null);
      }
      window.addEventListener("keydown", onKey);
      return function () { window.removeEventListener("keydown", onKey); };
    }, [enabled]);
  }

  if (window.speechSynthesis) {
    try { window.speechSynthesis.addEventListener("voiceschanged", function () { voice.preferred = pickVoice(); }); } catch (err) { /* old Safari */ }
  }

  window.CraftSearch = {
    SearchPopup: SearchPopup, useShortcut: useShortcut,
    findTopicId: findTopicId, loadKB: loadKB, search: search, buildStaticIndex: buildStaticIndex, loadSections: loadSections
  };
})();
