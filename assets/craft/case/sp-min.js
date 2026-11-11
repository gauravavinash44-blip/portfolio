/* Splitly case study: the live prototype in the phone (craft-splitly.html).
   Same pattern as rs-min.js: a poster of the home screen, and the hosted build loads into the
   screen only after a tap. The 390px-wide app is scaled to fit the cutout. */
(function () {
  "use strict";
  var DESIGN_W = 390;
  var HOSTED = "https://splitmate-blue-five.vercel.app/";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var screen = document.getElementById("sp-screen");
  var home = document.getElementById("sp-home");
  var app = document.getElementById("sp-app");
  var hint = document.getElementById("sp-hint");
  var ctls = document.getElementById("sp-ctls");
  var close = document.getElementById("sp-close");
  var again = document.getElementById("sp-restart");
  var live = document.getElementById("sp-status");
  if (!screen || !home || !app) return;

  var run = 0, timer = null, frame = null;
  function say(t) { if (live) live.textContent = t; }
  function status(s) { screen.setAttribute("data-status", s); }
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

  function load() {
    clearTimeout(timer);
    var id = ++run;
    if (frame) frame.remove();
    frame = document.createElement("iframe");
    frame.title = "Splitly live prototype";
    frame.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    frame.src = HOSTED + "?t=" + Date.now();
    app.appendChild(frame);
    fit();
    status("loading");
    say("Opening Splitly");
    frame.addEventListener("load", function () {
      if (run !== id) return;
      clearTimeout(timer);
      status("ready");
      say("Prototype ready. It's inside the phone frame.");
    }, { once: true });
    timer = setTimeout(function () {
      if (run !== id) return;
      status("failed");
      say("The prototype didn't load here. Open full screen instead.");
    }, 12000);
  }

  function launch() {
    if (screen.getAttribute("data-phase") === "app") return;
    screen.setAttribute("data-phase", "app");
    app.hidden = false;
    home.setAttribute("tabindex", "-1");
    home.setAttribute("aria-hidden", "true");
    hint.hidden = true;
    ctls.hidden = false;
    status("loading");
    if (app.animate && !reduce.matches) {
      app.animate([{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "none" }],
        { duration: 360, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
    }
    load();
    if (close) close.focus({ preventScroll: true });
  }

  function goHome() {
    if (screen.getAttribute("data-phase") !== "app") return;
    run++; clearTimeout(timer);
    if (frame) { frame.remove(); frame = null; }
    app.hidden = true;
    screen.setAttribute("data-phase", "home");
    status("idle");
    home.removeAttribute("tabindex");
    home.removeAttribute("aria-hidden");
    ctls.hidden = true;
    hint.hidden = false;
    say("Prototype closed");
    home.focus({ preventScroll: true });
  }

  home.addEventListener("click", launch);
  if (close) close.addEventListener("click", goHome);
  if (again) again.addEventListener("click", function () { if (screen.getAttribute("data-phase") === "app") load(); });
})();
