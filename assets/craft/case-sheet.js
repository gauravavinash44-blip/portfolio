/* Case study sheet (Craft mode only).
   Any link to a case study opens it in a sheet over the dimmed board instead of leaving the page.
   Same motion as the profile sheet: a circle grows out of whatever was tapped (720ms, ease-arrive),
   the content rises in, and closing fades and shrinks (240ms, ease-leave).
   Close: the close button, Esc, a tap outside, Back, or Home inside the case page. */
(function () {
  var CASES = /(^|\/)craft-(contextual-chat(-detailed)?|deal-room|white-label|easyeat|resonance)\.html$/;
  var EASE_ARRIVE = "cubic-bezier(0.16, 1, 0.3, 1)";
  var EASE_LEAVE = "cubic-bezier(0.7, 0, 0.84, 0)";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var layer = null, sheet = null, frame = null, opener = null, pushed = false, closing = false;

  function craftOn() { return document.documentElement.classList.contains("ga-craft") || !!document.querySelector(".cr-hero"); }
  function caseUrl(href) {
    try { var u = new URL(href, location.href); } catch (e) { return null; }
    if (u.origin !== location.origin || !CASES.test(u.pathname)) return null;
    return u;
  }

  function build() {
    layer = document.createElement("div");
    layer.className = "cr cs-layer";
    layer.innerHTML =
      '<div class="cs-scrim" data-cs-close></div>' +
      '<section class="cs-sheet" role="dialog" aria-modal="true" aria-label="Case study">' +
        '<div class="cs-load" aria-hidden="true"><span></span></div>' +
        '<iframe class="cs-frame" title="Case study"></iframe>' +
        '<button type="button" class="cr-iconbtn cr-iconbtn--solid cs-close" aria-label="Close case study" title="Close case study" data-cs-close>' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
      '</section>';
    sheet = layer.querySelector(".cs-sheet");
    frame = layer.querySelector(".cs-frame");
    layer.addEventListener("click", function (e) { if (e.target.closest("[data-cs-close]")) close(); });
    frame.addEventListener("load", onFrameLoad);
    document.body.appendChild(layer);
  }

  function onFrameLoad() {
    if (!layer) return;
    var doc = null;
    try { doc = frame.contentDocument; } catch (e) { /* cross-origin: leave it */ }
    if (doc && doc.title) sheet.setAttribute("aria-label", doc.title.split("·")[0].trim());
    layer.classList.add("is-loaded");
    if (!reduce.matches && !frame.dataset.shown) {
      frame.dataset.shown = "1";
      frame.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
        { duration: 560, delay: layer.dataset.revealing ? 220 : 0, easing: EASE_ARRIVE, fill: "backwards" });
    }
    /* keep the address bar in step when "Next case study" is followed inside the sheet */
    try {
      var p = frame.contentWindow.location.pathname.split("/").pop();
      if (pushed && p && location.hash !== "#case/" + p) history.replaceState({ cs: p }, "", "#case/" + p);
    } catch (e) { /* ignore */ }
  }

  function open(url, from, fromHistory) {
    if (layer) { try { frame.contentWindow.location.replace("./" + url.pathname.split("/").pop() + url.hash); } catch (e) { frame.src = "./" + url.pathname.split("/").pop(); } return; }
    build();
    opener = from || document.activeElement;
    frame.removeAttribute("data-shown");
    frame.src = "./" + url.pathname.split("/").pop() + url.hash;
    document.documentElement.classList.add("cs-open");
    if (!fromHistory) { history.pushState({ cs: url.pathname.split("/").pop() }, "", "#case/" + url.pathname.split("/").pop()); pushed = true; }
    else pushed = true;

    requestAnimationFrame(function () {
      layer.classList.add("is-open");
      var s = sheet.getBoundingClientRect();
      var r = from && from.getBoundingClientRect ? from.getBoundingClientRect() : null;
      if (!r || !r.width) r = { left: s.left + s.width / 2 - 20, top: s.top + s.height / 2 - 20, width: 40, height: 40 };
      var cx = r.left + r.width / 2 - s.left, cy = r.top + r.height / 2 - s.top;
      var r0 = Math.max(12, Math.min(r.width, r.height) / 2);
      if (reduce.matches) { sheet.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: "both" }); }
      else {
        layer.dataset.revealing = "1";
        sheet.animate([
          { clipPath: "circle(" + r0 + "px at " + cx + "px " + cy + "px)" },
          { clipPath: "circle(" + Math.hypot(s.width, s.height) + "px at " + cx + "px " + cy + "px)" }
        ], { duration: 720, easing: EASE_ARRIVE, fill: "both" }).finished.then(function () {
          if (layer) { delete layer.dataset.revealing; sheet.style.clipPath = "none"; sheet.getAnimations().forEach(function (a) { a.cancel(); }); }
        }).catch(function () {});
      }
      var btn = layer.querySelector(".cs-close");
      setTimeout(function () { if (btn) btn.focus({ preventScroll: true }); }, 60);
    });
  }

  function close(fromHistory) {
    if (!layer || closing) return;
    closing = true;
    var l = layer, s = sheet;
    var done = function () {
      l.remove();
      if (layer === l) { layer = sheet = frame = null; }
      closing = false;
      document.documentElement.classList.remove("cs-open");
      if (opener && opener.isConnected && opener.focus) opener.focus({ preventScroll: true });
      opener = null;
    };
    if (!fromHistory && pushed) { pushed = false; history.back(); }
    pushed = false;
    l.classList.remove("is-open");
    if (reduce.matches) { done(); return; }
    s.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.96)" }],
      { duration: 240, easing: EASE_LEAVE, fill: "both" }).finished.then(done, done);
    setTimeout(done, 600);
  }

  /* Any case link, anywhere on the board, its sheets, search or Projects */
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!craftOn()) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || (a.target && a.target !== "_self") || a.closest(".cs-layer")) return;
    var u = caseUrl(a.getAttribute("href"));
    if (!u) return;
    e.preventDefault();
    e.stopPropagation();
    var card = a.closest("[data-aw-card], .cr-card, .cr-row, li") || a;
    var r = a.getBoundingClientRect();
    open(u, r.width > 8 ? a : card);
  }, true);

  /* Warm the page on hover so the sheet fills fast */
  var warmed = {};
  document.addEventListener("pointerover", function (e) {
    if (!craftOn()) return;
    var a = e.target.closest && e.target.closest("a[href]");
    var u = a && caseUrl(a.getAttribute("href"));
    if (!u || warmed[u.pathname]) return;
    warmed[u.pathname] = 1;
    var l = document.createElement("link"); l.rel = "prefetch"; l.href = u.pathname; document.head.appendChild(l);
  }, { passive: true });

  document.addEventListener("keydown", function (e) {
    if (layer && e.key === "Escape") { e.stopPropagation(); e.preventDefault(); close(); }
  }, true);

  /* Messages from the case page inside the sheet (its Home links) */
  window.addEventListener("message", function (e) {
    if (e.origin !== location.origin || !layer) return;
    if (e.data && e.data.type === "case-close") close();
    if (e.data && e.data.type === "case-key" && e.data.key === "Escape") close();
  });

  window.addEventListener("popstate", function () {
    var m = /^#case\/(.+)$/.exec(location.hash);
    if (m) { var u = caseUrl("./" + m[1]); if (u && craftOn()) open(u, null, true); }
    else if (layer) close(true);
  });

  /* A shared #case/... link opens the sheet once the board is up */
  function deepLink() {
    var m = /^#case\/(.+)$/.exec(location.hash);
    if (!m) return;
    var tries = 0;
    (function wait() {
      if (document.querySelector(".cr-hero")) { var u = caseUrl("./" + m[1]); if (u) open(u, null, true); return; }
      if (++tries < 60) setTimeout(wait, 100);
    })();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", deepLink); else deepLink();
})();
