/* Craft minimal case study template (case-min): project orbs, polite video, section nav.
   Shared by every Craft case study page that uses case-min.css. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* Project orbs: <span class="cm-orb" data-orb="chatSpark"></span>, painted by orb.js */
  var O = window.CraftOrb;
  var NS = "http://www.w3.org/2000/svg";
  [].forEach.call(document.querySelectorAll(".cm-orb[data-orb]"), function (el) {
    var key = el.getAttribute("data-orb");
    if (!O || !O.has(key)) return;
    el.style.backgroundImage = O.fallback(key);
    var glyph = O.glyph && O.glyph(key);
    if (glyph) {
      var badge = document.createElement("span");
      badge.className = "cr-orb-badge";
      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "cr-orb-glyph");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("focusable", "false");
      svg.setAttribute("aria-hidden", "true");
      glyph.forEach(function (g) {
        var n = document.createElementNS(NS, g.c ? "circle" : "path");
        if (g.c) { n.setAttribute("cx", g.c[0]); n.setAttribute("cy", g.c[1]); n.setAttribute("r", g.c[2]); } else n.setAttribute("d", g.d);
        n.setAttribute("fill", g.f ? "#fff" : g.kf ? "currentColor" : "none");
        if (g.s || g.k) {
          n.setAttribute("stroke", g.s ? "#fff" : "currentColor");
          n.setAttribute("stroke-width", g.s || g.k);
          n.setAttribute("stroke-linecap", "round");
          n.setAttribute("stroke-linejoin", "round");
        }
        if (g.o) n.setAttribute("opacity", g.o);
        svg.appendChild(n);
      });
      badge.appendChild(svg);
      el.appendChild(badge);
    }
    O.mount(el, key);
  });

  /* Videos: muted, play only while in view and only without reduced motion. Always pausable. */
  [].forEach.call(document.querySelectorAll(".cm-media video"), function (v) {
    var btn = v.parentNode.querySelector(".cm-play");
    var userPaused = reduce.matches;
    function sync() {
      if (!btn) return;
      btn.classList.toggle("is-paused", v.paused);
      btn.setAttribute("aria-label", v.paused ? "Play video" : "Pause video");
    }
    if (btn) {
      btn.hidden = false;
      btn.addEventListener("click", function () {
        if (v.paused) { userPaused = false; if (v.preload === "none") v.preload = "auto"; v.play().catch(function () {}); }
        else { userPaused = true; v.pause(); }
      });
    }
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    sync();
    if (!("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !userPaused && !reduce.matches) {
          if (v.preload === "none") v.preload = "auto";
          v.play().catch(function () {});
        } else if (!e.isIntersecting && !v.paused) v.pause();
      });
    }, { threshold: 0.35 }).observe(v);
  });

  /* Section nav: mark the section being read, and a thin progress line */
  var links = [].slice.call(document.querySelectorAll(".cm-toc a[href^='#']"));
  var secs = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
  var bar = document.querySelector(".cm-progress");
  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty("--p", max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    var cur = -1;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    links.forEach(function (a, i) { if (i === cur) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
})();
