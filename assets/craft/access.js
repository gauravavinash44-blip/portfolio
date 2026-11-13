/* Case study access (public helper, loaded on the home page and on every case page).

   - Company link: ?for=Razorpay#k=KEY saves the key (30 days) and the company, then strips #k from the URL.
   - Greeting pill: "Hi Razorpay team 👋", liquid glass, dismissible. One per site, no second greeter.
   - window.GAAccess.unlocked() tells the home cards whether to show their lock.
   - window.GAAccess.track() sends GA events only if gtag exists, and only ever the company name.

   The real lock is StatiCrypt (scripts/lock.mjs). This file never decides access on its own. */
(function () {
  "use strict";
  var DAY = 864e5, KEEP_DAYS = 30;
  var K_ACCESS = "ga-access", K_HASH = "ga-access-hash", K_HASH_EXP = "ga-access-hash-exp";
  var K_COMPANY = "ga-company", K_DISMISSED = "ga-greet-dismissed", K_QUEUE = "ga-event-queue";

  function get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  function del(k) { try { window.localStorage.removeItem(k); } catch (e) { /* private mode */ } }

  function cleanCompany(s) { return String(s || "").replace(/\s+/g, " ").trim().slice(0, 60); }

  /* Only GA events, only the company name. Queued events come from the lock screen, which has no GA of its own. */
  function track(name, params) {
    var p = {};
    if (params) {
      if (params.method) p.method = String(params.method);
      if (params.company) p.company = cleanCompany(params.company);
      if (params.case_study) p.case_study = String(params.case_study);
    }
    try {
      if (typeof window.gtag === "function") { window.gtag("event", name, p); return; }
      /* GA not loaded (yet): hold it for this tab, capped */
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

  /* 1. Read the link: ?for= (kept exactly as typed) and #k= (saved, then removed from the address bar) */
  var fromLink = false;
  (function readLink() {
    var q; try { q = new URLSearchParams(window.location.search); } catch (e) { return; }
    var company = cleanCompany(q.get("for"));
    if (company) set(K_COMPANY, company);
    var hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    var parts = hash.split("&"), keep = [], key = null;
    parts.forEach(function (p) { if (/^k=/.test(p)) key = decodeURIComponent(p.slice(2)); else if (p) keep.push(p); });
    if (!key) return;
    set(K_ACCESS, JSON.stringify({ k: key, exp: Date.now() + KEEP_DAYS * DAY }));
    fromLink = true;
    try { window.history.replaceState(null, "", window.location.pathname + window.location.search + (keep.length ? "#" + keep.join("&") : "")); } catch (e) { /* old browser */ }
  })();

  function company() { return get(K_COMPANY); }

  /* 2. Greeting pill */
  var CSS = ".ga-greet{position:fixed;z-index:2147483000;left:50%;top:max(16px,env(safe-area-inset-top));transform:translateX(-50%);" +
    "display:inline-flex;align-items:center;gap:6px;max-width:calc(100vw - 32px);height:38px;padding:0 6px 0 16px;box-sizing:border-box;border-radius:999px;" +
    "font:500 14px/1 Inter,'Neue Montreal','Helvetica Now Text',system-ui,sans-serif;letter-spacing:-.005em;color:#16121c;" +
    "background:rgba(255,255,255,.62);-webkit-backdrop-filter:blur(22px) saturate(1.6);backdrop-filter:blur(22px) saturate(1.6);" +
    "border:1px solid rgba(255,255,255,.7);box-shadow:0 8px 28px rgba(30,15,40,.16),inset 0 1px 0 rgba(255,255,255,.8)}" +
    ".ga-greet-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".ga-greet-x{flex:none;width:28px;height:28px;padding:0;border:0;border-radius:50%;display:grid;place-items:center;cursor:pointer;color:inherit;background:rgba(22,18,28,.07)}" +
    ".ga-greet-x:hover{background:rgba(22,18,28,.13)}.ga-greet-x:focus-visible{outline:2px solid #16121c;outline-offset:2px}" +
    "@media (max-width:700px){.ga-greet{top:auto;bottom:max(16px,env(safe-area-inset-bottom));height:36px;font-size:13px}}" +
    "@media (prefers-reduced-motion:no-preference){.ga-greet{animation:gaGreetIn 520ms cubic-bezier(.16,1,.3,1) 400ms both}" +
    "@keyframes gaGreetIn{from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translate(-50%,0)}}" +
    "@media (max-width:700px){@keyframes gaGreetIn{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}}}";

  function showGreeting() {
    var c = company();
    if (!c || get(K_DISMISSED) === c || document.querySelector(".ga-greet")) return;
    if (!document.getElementById("ga-greet-css")) {
      var st = document.createElement("style"); st.id = "ga-greet-css"; st.textContent = CSS; document.head.appendChild(st);
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

  window.GAAccess = { unlocked: unlocked, company: company, track: track, key: savedKey };

  function ready() {
    showGreeting();
    flushQueue();
    if (fromLink) track("case_unlock", { method: "link", company: company() });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
  /* GA may load after this file; send anything still queued once it does */
  window.addEventListener("load", function () { setTimeout(flushQueue, 1500); });
})();
