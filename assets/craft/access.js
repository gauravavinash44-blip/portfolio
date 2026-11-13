/* Case study access (public helper, loaded on the home page, on every case page and on each lock page).

   - Company link: ?for=Razorpay#k=KEY saves the key (30 days) and the company, then strips #k from the URL.
   - Greeting pill: "Hi Razorpay team 👋", liquid glass, dismissible. One per site, no second greeter.
   - Popup: a click on a locked case study opens the lock card over the blurred page. The password is checked
     against a tiny encrypted page (access-check.html) before we leave, so a wrong one never navigates.
   - GAAccess.mountLock(): the same card on the encrypted page itself (scripts/lock-template.html).
   - GAAccess.track(): GA events only if gtag exists, and only ever the company name.

   The real lock is StatiCrypt (scripts/lock.mjs). This file never decides access on its own. */
(function () {
  "use strict";
  /* Filled in by npm run lock from .env. Public values only, never the key. */
  var CFG = /*cfg*/{"endpoint":"PASTE_APPS_SCRIPT_URL","whatsapp":"918527386404"}/*cfg*/;

  /* Every page of the three locked case studies (keep in step with PAGES in scripts/lock.mjs) */
  var CC = "Contextual Chat Assistant", DR = "Deal Room", WL = "White Label Setup";
  var LOCKED = {
    "craft-contextual-chat-detailed.html": CC, "craft-contextual-chat.html": CC, "craft-contextual-chat-minimal.html": CC,
    "contextual-chat-short.html": CC, "contextual-chat.html": CC, "case-study-systematic-agent.html": CC,
    "prototype-v6/contextual-chat.html": CC, "systematic-agent-case-study/dist/index.html": CC, "systematic-agent.html": CC,
    "craft-deal-room.html": DR, "deal-room-short.html": DR, "deal-room.html": DR, "deal-room-case-study.html": DR, "deal-room-presentation.html": DR,
    "craft-white-label.html": WL, "white-label-short.html": WL
  };

  var DAY = 864e5, KEEP_DAYS = 30;
  var K_ACCESS = "ga-access", K_HASH = "ga-access-hash", K_HASH_EXP = "ga-access-hash-exp";
  var K_COMPANY = "ga-company", K_DISMISSED = "ga-greet-dismissed", K_QUEUE = "ga-event-queue";

  /* Site root, worked out from this file's own address (…/assets/craft/access.js) */
  var me = document.currentScript && document.currentScript.src;
  var ROOT = me ? me.replace(/assets\/craft\/access\.js(\?.*)?$/, "") : new URL("./", location.href).href;

  function get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  function del(k) { try { window.localStorage.removeItem(k); } catch (e) { /* private mode */ } }
  function cleanCompany(s) { return String(s || "").replace(/\s+/g, " ").trim().slice(0, 60); }

  /* ───────── GA (company name only) ───────── */
  function track(name, params) {
    var p = {};
    if (params) {
      if (params.method) p.method = String(params.method);
      if (params.company) p.company = cleanCompany(params.company);
      if (params.case_study) p.case_study = String(params.case_study);
    }
    try {
      if (typeof window.gtag === "function") { window.gtag("event", name, p); return; }
      var q = JSON.parse(window.sessionStorage.getItem(K_QUEUE) || "[]");
      q.push({ name: name, params: p }); window.sessionStorage.setItem(K_QUEUE, JSON.stringify(q.slice(-20)));
    } catch (e) { /* never break the page */ }
  }
  function flushQueue() {
    if (typeof window.gtag !== "function") return;
    var raw; try { raw = window.sessionStorage.getItem(K_QUEUE); } catch (e) { return; }
    if (!raw) return;
    try { window.sessionStorage.removeItem(K_QUEUE); JSON.parse(raw).forEach(function (ev) { track(ev.name, ev.params); }); } catch (e) { /* ignore */ }
  }

  /* ───────── Saved access ───────── */
  function saveKey(k) { set(K_ACCESS, JSON.stringify({ k: k, exp: Date.now() + KEEP_DAYS * DAY })); }
  function savedKey() {
    var raw = get(K_ACCESS); if (!raw) return null;
    try { var o = JSON.parse(raw); if (o && o.k && o.exp > Date.now()) return o.k; } catch (e) { /* bad value */ }
    del(K_ACCESS); return null;
  }
  function unlocked() {
    if (savedKey()) return true;
    var exp = parseInt(get(K_HASH_EXP), 10);
    return !!get(K_HASH) && !(exp && Date.now() > exp);
  }
  function company() { return get(K_COMPANY); }

  /* Company link: ?for= (kept exactly as typed) and #k= (saved, then removed from the address bar) */
  var fromLink = false;
  (function readLink() {
    var q; try { q = new URLSearchParams(window.location.search); } catch (e) { return; }
    var c = cleanCompany(q.get("for"));
    if (c) set(K_COMPANY, c);
    var hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    var keep = [], key = null;
    hash.split("&").forEach(function (p) { if (/^k=/.test(p)) key = decodeURIComponent(p.slice(2)); else if (p) keep.push(p); });
    if (!key) return;
    saveKey(key); fromLink = true;
    try { window.history.replaceState(null, "", window.location.pathname + window.location.search + (keep.length ? "#" + keep.join("&") : "")); } catch (e) { /* old browser */ }
  })();

  /* ───────── Styles ───────── */
  function loadCss() {
    if (document.getElementById("gal-css") || document.querySelector("style[data-gal]")) return;
    var l = document.createElement("link"); l.id = "gal-css"; l.rel = "stylesheet"; l.href = ROOT + "assets/craft/access.css?v=2";
    document.head.appendChild(l);
  }
  var PILL_CSS = ".ga-greet{position:fixed;z-index:2147483000;left:50%;top:max(16px,env(safe-area-inset-top));transform:translateX(-50%);" +
    "display:inline-flex;align-items:center;gap:6px;max-width:calc(100vw - 32px);height:38px;padding:0 6px 0 16px;box-sizing:border-box;border-radius:999px;" +
    "font:500 14px/1 Inter,'Neue Montreal','Helvetica Now Text',system-ui,sans-serif;letter-spacing:-.005em;color:#16121c;" +
    "background:rgba(255,255,255,.62);-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);" +
    "border:1px solid rgba(255,255,255,.7);box-shadow:0 8px 28px rgba(30,15,40,.16),inset 0 1px 0 rgba(255,255,255,.8)}" +
    ".ga-greet-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".ga-greet-x{flex:none;width:28px;height:28px;padding:0;border:0;border-radius:50%;display:grid;place-items:center;cursor:pointer;color:inherit;background:rgba(22,18,28,.07)}" +
    ".ga-greet-x:hover{background:rgba(22,18,28,.13)}.ga-greet-x:focus-visible{outline:2px solid #16121c;outline-offset:2px}" +
    "@media (max-width:700px){.ga-greet{top:auto;bottom:max(16px,env(safe-area-inset-bottom));height:36px;font-size:13px}}" +
    "@media (prefers-reduced-motion:no-preference){.ga-greet{animation:gaGreetIn 520ms cubic-bezier(.16,1,.3,1) 400ms both}" +
    "@keyframes gaGreetIn{from{opacity:0}to{opacity:1}}}";

  function showGreeting() {
    var c = company();
    if (!c || get(K_DISMISSED) === c || document.querySelector(".ga-greet")) return;
    if (!document.getElementById("ga-greet-css")) {
      var st = document.createElement("style"); st.id = "ga-greet-css"; st.textContent = PILL_CSS; document.head.appendChild(st);
    }
    var pill = document.createElement("div");
    pill.className = "ga-greet"; pill.setAttribute("role", "status");
    var t = document.createElement("span"); t.className = "ga-greet-text"; t.textContent = "Hi " + c + " team 👋";
    var x = document.createElement("button"); x.type = "button"; x.className = "ga-greet-x"; x.setAttribute("aria-label", "Dismiss greeting");
    x.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    x.addEventListener("click", function () { set(K_DISMISSED, c); pill.remove(); });
    pill.appendChild(t); pill.appendChild(x);
    document.body.appendChild(pill);
  }

  /* ───────── The lock card ───────── */
  var ICON_LOCK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  var ICON_ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var ICON_CLOSE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var uid = 0;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function waLink(name, comp) {
    var msg = "Hi Gaurav, I'm " + (name || "___") + " from " + (comp || "___") + ". Could I get access to your case studies?";
    return "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(msg);
  }

  /* opts: { title, tryKey(key) -> Promise<boolean>, onClose?, backHref? } */
  function buildCard(opts) {
    var n = ++uid, id = function (s) { return "gal" + n + "-" + s; };
    var card = document.createElement("section");
    card.className = "gal-card"; card.setAttribute("aria-labelledby", id("title"));
    card.innerHTML =
      (opts.onClose ? '<button type="button" class="gal-close" data-close aria-label="Close">' + ICON_CLOSE + "</button>" : "") +
      '<div class="gal-icon">' + ICON_LOCK + "</div>" +
      '<p class="gal-eyebrow">Case study</p>' +
      '<h2 class="gal-title" id="' + id("title") + '">' + esc(opts.title) + "</h2>" +
      '<p class="gal-line">This one\'s under NDA. Pick a way in.</p>' +
      '<div class="gal-view" data-view="main">' +
        '<form class="gal-pass" data-pass novalidate>' +
          '<label class="gal-sr" for="' + id("pw") + '">Password</label>' +
          '<input id="' + id("pw") + '" type="password" autocomplete="current-password" placeholder="Have a password?" enterkeyhint="go">' +
          '<button type="submit" class="gal-go" aria-label="Open case study">' + ICON_ARROW + "</button>" +
        "</form>" +
        '<p class="gal-msg" data-pass-msg role="alert"></p>' +
        '<div class="gal-or">or</div>' +
        '<div class="gal-stack">' +
          '<button type="button" class="gal-btn gal-btn--main" data-go-request>Request access</button>' +
          '<a class="gal-btn" data-wa href="#" target="_blank" rel="noopener">Ask me on WhatsApp</a>' +
        "</div>" +
      "</div>" +
      '<form class="gal-view gal-form gal-hidden" data-view="request" novalidate>' +
        field("name", "Name", "name", "") + field("role", "Role", "organization-title", "Design manager, recruiter…") +
        field("company", "Company", "organization", "") + field("contact", "Email or LinkedIn", "email", "") +
        '<div class="gal-hp" aria-hidden="true"><label for="' + id("website") + '">Website</label><input id="' + id("website") + '" name="website" tabindex="-1" autocomplete="off"></div>' +
        '<p class="gal-msg" data-req-msg role="alert"></p>' +
        '<button type="submit" class="gal-btn gal-btn--main">Send and open</button>' +
      "</form>" +
      '<div class="gal-row">' +
        '<button type="button" class="gal-link gal-hidden" data-back>Back</button>' +
        (opts.backHref ? '<a class="gal-link" href="' + esc(opts.backHref) + '">Back to portfolio</a>' : "<span></span>") +
      "</div>";
    function field(name, label, ac, ph) {
      return '<div class="gal-field"><label for="' + id(name) + '">' + label + '</label><input id="' + id(name) + '" name="' + name + '" autocomplete="' + ac + '"' + (ph ? ' placeholder="' + ph + '"' : "") + "></div>";
    }
    var $ = function (s) { return card.querySelector(s); };
    var main = $('[data-view="main"]'), req = $('[data-view="request"]'), back = $("[data-back]");
    var pass = $("[data-pass]"), pw = pass.querySelector("input"), go = pass.querySelector(".gal-go"), passMsg = $("[data-pass-msg]");
    if (company()) req.company.value = company();
    /* Full hint where it fits, short one on phones */
    if (window.matchMedia && window.matchMedia("(min-width: 560px)").matches) pw.placeholder = "Have a password? Type it here";

    function show(view) {
      main.classList.toggle("gal-hidden", view !== "main");
      req.classList.toggle("gal-hidden", view !== "request");
      back.classList.toggle("gal-hidden", view === "main");
      (view === "main" ? pw : req.name).focus();
    }
    $("[data-go-request]").addEventListener("click", function () { show("request"); });
    back.addEventListener("click", function () { show("main"); });
    if (opts.onClose) $("[data-close]").addEventListener("click", opts.onClose);
    card.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (!req.classList.contains("gal-hidden")) { e.stopPropagation(); show("main"); }
      else if (opts.onClose) { e.stopPropagation(); opts.onClose(); }
    });

    function wireWa(a) {
      var fill = function () { a.href = waLink(req.name.value.trim(), req.company.value.trim() || company()); };
      fill();
      a.addEventListener("click", function () { fill(); track("whatsapp_click", {}); });
    }
    wireWa($("[data-wa]"));

    /* Password: Enter or the arrow */
    pass.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = pw.value.trim();
      pass.classList.remove("is-wrong");
      if (!v) { passMsg.textContent = "Type the password first."; pw.focus(); return; }
      passMsg.textContent = ""; go.disabled = true;
      opts.tryKey(v).then(function (ok) {
        go.disabled = false;
        if (ok) { saveKey(v); track("case_unlock", { method: "password", company: company() }); return; }
        void pass.offsetWidth; pass.classList.add("is-wrong");
        passMsg.textContent = "That's not it. Try again, or request access.";
        pw.select();
      });
    });

    /* Request access */
    req.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $("[data-req-msg]"), btn = req.querySelector('button[type="submit"]');
      var data = {
        name: req.name.value.trim(), role: req.role.value.trim(), company: req.company.value.trim(),
        contact: req.contact.value.trim(), website: req.website.value,
        caseStudy: opts.title, page: location.pathname
      };
      var missing = ["name", "role", "company", "contact"].filter(function (k) { return !data[k]; })[0];
      if (missing) { msg.textContent = "Fill in all four, please."; req[missing].focus(); return; }
      msg.textContent = ""; btn.disabled = true; btn.textContent = "Sending…";
      /* No Content-Type header on purpose: the browser sends text/plain and skips the CORS preflight */
      fetch(CFG.endpoint, { method: "POST", body: JSON.stringify(data) })
        .then(function (r) { return r.json(); })
        .then(function (out) {
          if (!out || !out.ok || !out.key) throw new Error("No key");
          var comp = cleanCompany(out.company || data.company);
          set(K_COMPANY, comp); del(K_DISMISSED);
          track("access_request_submitted", { company: comp, case_study: opts.title });
          saveKey(out.key);
          return opts.tryKey(out.key).then(function (ok) {
            if (!ok) throw new Error("Key didn't open the page");
            track("case_unlock", { method: "request", company: comp });
          });
        })
        .catch(function () {
          btn.disabled = false; btn.textContent = "Send and open";
          msg.innerHTML = 'Couldn\'t send that right now. <a data-wa href="#" target="_blank" rel="noopener">Message me on WhatsApp</a> instead.';
          wireWa(msg.querySelector("[data-wa]"));
        });
    });

    card.focusFirst = function () { pw.focus(); };
    return card;
  }

  /* ───────── Popup on the site ───────── */
  /* Checks a key without leaving the page: access-check.html is encrypted with the same key */
  function checkKey(key) {
    return new Promise(function (resolve) {
      var prev = get(K_ACCESS);
      saveKey(key);
      var f = document.createElement("iframe"), done = false;
      f.setAttribute("aria-hidden", "true"); f.tabIndex = -1;
      f.style.cssText = "position:absolute;width:1px;height:1px;border:0;opacity:0;pointer-events:none;left:-9999px";
      function finish(ok) {
        if (done) return; done = true;
        window.removeEventListener("message", onMsg); f.remove();
        if (!ok) { if (prev) set(K_ACCESS, prev); else del(K_ACCESS); }
        resolve(ok);
      }
      function onMsg(e) { if (e.source === f.contentWindow && e.data && e.data.gaAccessCheck) finish(!!e.data.ok); }
      window.addEventListener("message", onMsg);
      setTimeout(function () { finish(false); }, 8000);
      f.src = ROOT + "access-check.html";
      document.body.appendChild(f);
    });
  }

  var openPop = null;
  function openPopup(title, href, opener) {
    if (openPop) return;
    loadCss();
    var overlay = document.createElement("div");
    overlay.className = "gal-overlay";
    overlay.setAttribute("role", "dialog"); overlay.setAttribute("aria-modal", "true");
    var htmlOverflow = document.documentElement.style.overflow;
    function close() {
      if (!openPop) return;
      openPop = null;
      document.removeEventListener("keydown", trap, true);
      document.documentElement.style.overflow = htmlOverflow;
      var gone = function () { overlay.remove(); if (opener && opener.focus) opener.focus(); };
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
        overlay.classList.add("is-leaving"); setTimeout(gone, 200);
      } else gone();
    }
    var card = buildCard({
      title: title, onClose: close,
      tryKey: function (k) { return checkKey(k).then(function (ok) { if (ok) location.href = href; return ok; }); }
    });
    overlay.setAttribute("aria-labelledby", card.getAttribute("aria-labelledby"));
    overlay.appendChild(card);
    overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) close(); });
    function trap(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      var f = Array.prototype.filter.call(card.querySelectorAll("a[href],button:not([disabled]),input:not([tabindex='-1'])"),
        function (el) { return el.offsetWidth || el.offsetHeight; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", trap, true);
    document.documentElement.style.overflow = "hidden";
    document.body.appendChild(overlay);
    openPop = overlay;
    setTimeout(function () { card.focusFirst(); }, 60);
  }

  function lockedTitle(a) {
    var url; try { url = new URL(a.getAttribute("href"), location.href); } catch (e) { return null; }
    var root; try { root = new URL(ROOT); } catch (e) { return null; }
    if (url.origin !== root.origin || url.pathname.indexOf(root.pathname) !== 0) return null;
    return LOCKED[url.pathname.slice(root.pathname.length)] || null;
  }
  /* Capture phase, so it runs before the app's own handlers */
  document.addEventListener("click", function (e) {
    if (window.GA_LOCK_PAGE || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var title = lockedTitle(a);
    if (!title || unlocked()) return;
    e.preventDefault(); e.stopPropagation();
    openPopup(title, a.href, a);
  }, true);

  /* ───────── On the encrypted page itself ───────── */
  function mountLock(host, opts) {
    loadCss();
    var card = buildCard({ title: opts.title, tryKey: opts.tryKey, backHref: opts.backHref });
    host.appendChild(card);
    setTimeout(function () { card.focusFirst(); }, 60);
    return card;
  }

  window.GAAccess = { unlocked: unlocked, company: company, track: track, key: savedKey, saveKey: saveKey, open: openPopup, mountLock: mountLock };

  function ready() {
    showGreeting();
    flushQueue();
    if (fromLink && !window.GA_LOCK_PAGE) track("case_unlock", { method: "link", company: company() });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
  window.addEventListener("load", function () { setTimeout(flushQueue, 1500); });
})();
