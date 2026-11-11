/* Craft minimal case study template (case-min): project orbs, polite video, section nav.
   Shared by every Craft case study page that uses case-min.css. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var html = document.documentElement;

  /* Always open at the top. The browser must not restore an old scroll, and smooth scrolling must not glide there. */
  function toTop() {
    if (location.hash && document.getElementById(location.hash.slice(1))) return;
    var prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  }
  try { history.scrollRestoration = "manual"; } catch (e) {}
  toTop();
  window.addEventListener("load", function () { toTop(); setTimeout(toTop, 60); });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) { document.body.classList.remove("is-leaving"); toTop(); }
  });

  /* Pictures: hold the space with a flat colour, then fade in when decoded */
  [].forEach.call(document.querySelectorAll(".cm img"), function (img) {
    if (img.complete && img.naturalWidth) return;
    img.classList.add("lq-wait");
    var done = function () { img.classList.remove("lq-wait"); };
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });

  /* Sections ease in as they arrive (never hides anything if scripting or motion is off) */
  if ("IntersectionObserver" in window && !reduce.matches) {
    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); rev.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.04 });
    [].forEach.call(document.querySelectorAll("main .cm-sec"), function (sec) {
      if (sec.getBoundingClientRect().top < innerHeight * 0.9) return;
      sec.classList.add("cm-reveal");
      rev.observe(sec);
    });
  }


  /* Stagger reveal for media stages and tiles */
  if ("IntersectionObserver" in window && !reduce.matches) {
    var rv = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); rv.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    [].forEach.call(document.querySelectorAll("main .cm-shot-frame, main .cm-pair-row > div, main .cm-evidence, main .cm-hero--proj .cm-cover"), function (el, i) {
      if (el.closest(".cm-hero-top") || el.getBoundingClientRect().top < innerHeight * 0.9) return;
      el.style.setProperty("--d", (el.matches(".cm-pair-row > div:nth-child(2)") ? ".12s" : "0s"));
      el.classList.add("cm-rv"); rv.observe(el);
    });
  }


  /* Inside the dashboard's case sheet: Home closes the sheet, Esc too */
  var embedded = false;
  try { embedded = window.self !== window.top && window.parent.location.origin === location.origin; } catch (x) { embedded = false; }
  if (embedded) {
    document.documentElement.classList.add("cm-embed");
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.origin !== location.origin) return;
      if (/\/(index\.html)?$/.test(u.pathname) && !u.hash) {
        e.preventDefault(); e.stopImmediatePropagation();
        window.parent.postMessage({ type: "case-close" }, location.origin);
      } else if (u.pathname !== location.pathname && /craft-[a-z-]+\.html$/.test(u.pathname)) {
        /* next case: swap in place so the sheet doesn't stack browser history */
        e.preventDefault(); e.stopImmediatePropagation();
        location.replace(u.href);
      }
    }, true);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !document.querySelector(".el-zoom")) window.parent.postMessage({ type: "case-key", key: "Escape" }, location.origin);
    });
  }

  /* Leaving: where the browser has no cross-page transition, fade the page out first, then go */
  if (!("onpageswap" in window) && !reduce.matches) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      var u;
      try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
      e.preventDefault();
      document.body.classList.add("is-leaving");
      setTimeout(function () { location.href = a.href; }, 200);
    });
  }

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
