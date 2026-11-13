/* Opening a case study from the Craft dashboard.
   Same motion as the profile sheet: a circle grows out of whatever was tapped (ease-arrive) in the
   case page's own colour, then the browser goes to the real case-study page, whose content rises in.
   It is a normal page load: the case study has its own URL, Back returns to the dashboard. */
(function () {
  var CASES = /(^|\/)craft-(contextual-chat(-detailed)?|deal-room|white-label|easyeat|resonance|splitly)\.html$/;
  var EASE_ARRIVE = "cubic-bezier(0.16, 1, 0.3, 1)";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var going = false, cover = null;

  function craftOn() { return document.documentElement.classList.contains("ga-craft") || !!document.querySelector(".cr-hero"); }
  function caseUrl(href) {
    var u;
    try { u = new URL(href, location.href); } catch (e) { return null; }
    return u.origin === location.origin && CASES.test(u.pathname) ? u : null;
  }

  function go(u, from) {
    if (going) return;
    if (window.GAAccess && window.GAAccess.intercept(u.href, from)) return;
    going = true;
    if (reduce.matches) { location.href = u.href; return; }
    cover = document.createElement("div");
    cover.className = "cs-cover";
    cover.setAttribute("aria-hidden", "true");
    document.body.appendChild(cover);
    var r = from.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var r0 = Math.max(12, Math.min(r.width, r.height) / 2);
    var far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    var anim = cover.animate([
      { clipPath: "circle(" + r0 + "px at " + cx + "px " + cy + "px)" },
      { clipPath: "circle(" + far + "px at " + cx + "px " + cy + "px)" }
    ], { duration: 620, easing: EASE_ARRIVE, fill: "both" });
    var left = false;
    var leave = function () { if (left) return; left = true; location.href = u.href; };
    /* go once the circle has covered the screen (the curve is nearly there by ~70%) */
    setTimeout(leave, 440);
    anim.finished.then(leave, leave);
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!craftOn()) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || (a.target && a.target !== "_self")) return;
    var u = caseUrl(a.getAttribute("href"));
    if (!u) return;
    e.preventDefault();
    e.stopPropagation();
    go(u, a);
  }, true);

  /* Coming Back to the dashboard: clear the cover if the page was restored from cache */
  window.addEventListener("pageshow", function () {
    going = false;
    if (cover) { cover.remove(); cover = null; }
  });

  /* Warm the page on hover so it arrives fast */
  var warmed = {};
  document.addEventListener("pointerover", function (e) {
    if (!craftOn()) return;
    var a = e.target.closest && e.target.closest("a[href]");
    var u = a && caseUrl(a.getAttribute("href"));
    if (!u || warmed[u.pathname]) return;
    warmed[u.pathname] = 1;
    var l = document.createElement("link"); l.rel = "prefetch"; l.href = u.pathname; document.head.appendChild(l);
  }, { passive: true });
})();
