/* Resonance case study: the live prototype in the phone (craft-resonance.html).
   Same behaviour as ResonanceSheet in assets/craft/craft.js and resonance-short.html:
   the phone starts on the iOS home screen, and tapping Spotify launches the app from the top
   (splash, first-time education, Now Playing with Resonance). Nothing loads before that tap.
   Primary source is the copy bundled in assets/resonance/app (same origin, runs rs-bridge.js untouched);
   the hosted build is the fallback. The 390px-wide app is scaled to fit the screen cutout. */
(function () {
  "use strict";
  var DESIGN_W = 390;
  var LOCAL = "./assets/resonance/app/";
  var ICON_W = 0.156; /* Spotify icon width on the home-screen export, as a share of the screen */
  var onGitHubPages = /\.github\.io$/i.test(location.hostname);
  var HOSTED = onGitHubPages ? "https://gauravavinash44-blip.github.io/drop-mode/" : "https://drop-mode.vercel.app/";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  function fresh(base, embed) { return base + "?fresh=1&t=" + Date.now() + (embed ? "&embed=1" : ""); }

  /* Open full screen: hosted build on the matching host, a fresh session on every click */
  [].forEach.call(document.querySelectorAll("[data-rs-full]"), function (a) {
    a.href = HOSTED + "?fresh=1";
    a.addEventListener("click", function () { a.href = fresh(HOSTED, false); });
  });

  var screen = document.getElementById("rs-screen");
  var home = document.getElementById("rs-home");
  var app = document.getElementById("rs-app");
  var hint = document.getElementById("rs-hint");
  var ctls = document.getElementById("rs-ctls");
  var back = document.getElementById("rs-back");
  var again = document.getElementById("rs-restart");
  var live = document.getElementById("rs-status");
  if (!screen || !home || !app) return;

  var run = 0, timers = [], frame = null;
  function say(t) { if (live) live.textContent = t; }
  function status(s) { screen.setAttribute("data-status", s); }
  function clear() { timers.forEach(clearTimeout); timers = []; }

  /* Fit: scale the 390px app to the screen width, and give it the screen's height in design pixels */
  function fit() {
    if (!frame) return;
    var w = screen.clientWidth, h = screen.clientHeight;
    if (!w || !h) return;
    var k = w / DESIGN_W;
    frame.style.width = DESIGN_W + "px";
    frame.style.height = Math.round(h / k) + "px";
    frame.style.transform = "scale(" + k + ")";
  }
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(fit).observe(screen);
  else window.addEventListener("resize", fit);

  function makeFrame(src, from) {
    if (frame) frame.remove();
    frame = document.createElement("iframe");
    frame.title = "Resonance live prototype";
    frame.setAttribute("allow", "autoplay; encrypted-media");
    frame.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    frame.setAttribute("tabindex", "-1");
    frame.setAttribute("aria-hidden", "true");
    frame.setAttribute("data-source", from);
    frame.src = src;
    app.appendChild(frame);
    fit();
    return frame;
  }
  function ready(f) {
    clear();
    status("ready");
    f.removeAttribute("tabindex");
    f.removeAttribute("aria-hidden");
    say("Prototype ready. It's inside the phone frame.");
  }

  /* Load one source and decide whether it really arrived.
     Bundled copy: same origin, so read the page and wait for the app to mount.
     Hosted build: a cross-origin frame fires load even on an error page, so a no-cors probe decides. */
  function load(from) {
    clear();
    var id = ++run;
    var src = fresh(from === "local" ? LOCAL : HOSTED, true);
    var f = makeFrame(src, from);
    status("loading");
    say("Opening Spotify");
    function later(fn, ms) { timers.push(setTimeout(function () { if (run === id) fn(); }, ms)); }
    function fail() {
      clear();
      if (from === "local") { load("hosted"); return; }
      status("failed");
      say("The prototype didn't load here. Open full screen instead.");
      var l = screen.querySelector(".rs-state-link");
      if (l) l.focus({ preventScroll: true });
    }
    if (from === "local") {
      var t0 = Date.now();
      var poll = function () {
        var doc = null;
        try { doc = f.contentDocument; } catch (err) { doc = null; }
        var root = doc && doc.getElementById("root");
        if (root && root.childElementCount) { ready(f); return; }
        /* loaded, but not the app (a 404 page, or the folder isn't deployed) */
        if (doc && doc.readyState === "complete" && !root && doc.location.href !== "about:blank") { fail(); return; }
        if (Date.now() - t0 > 7000) { fail(); return; }
        later(poll, 120);
      };
      later(poll, 120);
    } else {
      var loaded = false, probe = "pending";
      var settle = function () {
        if (run !== id) return;
        if (probe === "fail") fail();
        else if (loaded && probe === "ok") ready(f);
      };
      f.addEventListener("load", function () { loaded = true; settle(); }, { once: true });
      later(fail, 9000);
      try {
        fetch(src, { mode: "no-cors", cache: "no-store", credentials: "omit" })
          .then(function () { probe = "ok"; settle(); }, function () { probe = "fail"; settle(); });
      } catch (err) { probe = "ok"; }
    }
  }

  /* Tap Spotify: the app opens out of the icon, like iOS, then the frame loads */
  function launch() {
    if (screen.getAttribute("data-phase") === "app") return;
    screen.setAttribute("data-phase", "app");
    app.hidden = false;
    home.setAttribute("tabindex", "-1");
    home.setAttribute("aria-hidden", "true");
    hint.hidden = true;
    ctls.hidden = false;
    status("loading");
    var go = function () { load("local"); };
    if (app.animate && !reduce.matches) {
      app.animate([
        { transform: "scale(" + ICON_W + ")", clipPath: "inset(0 round 22%)", opacity: 0.2 },
        { transform: "none", clipPath: "inset(0 round 0%)", opacity: 1 }
      ], { duration: 460, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }).finished.then(go, go);
    } else go();
    if (back) back.focus({ preventScroll: true });
  }

  /* Back to the home screen: unloading the app stops its audio */
  function goHome() {
    if (screen.getAttribute("data-phase") !== "app") return;
    run++; clear();
    var done = function () {
      if (frame) { frame.remove(); frame = null; }
      app.hidden = true;
      screen.setAttribute("data-phase", "home");
      status("idle");
      home.removeAttribute("tabindex");
      home.removeAttribute("aria-hidden");
      ctls.hidden = true;
      hint.hidden = false;
      say("Back on the home screen");
      home.focus({ preventScroll: true });
    };
    if (app.animate && !reduce.matches) {
      app.animate([{ transform: "none", opacity: 1 }, { transform: "scale(" + ICON_W + ")", opacity: 0 }],
        { duration: 320, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" }).finished.then(function (a) { done(); app.getAnimations().forEach(function (x) { x.cancel(); }); }, done);
    } else done();
  }

  home.addEventListener("click", launch);
  if (back) back.addEventListener("click", goHome);
  if (again) again.addEventListener("click", function () { if (screen.getAttribute("data-phase") === "app") load("local"); });
})();
