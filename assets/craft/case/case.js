/* Craft case study: scroll reveals, cover note placement, polite video playback. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* Cover notes sit right after each title line. */
  var cover = document.querySelector(".cc-cover");
  function placeNotes() {
    if (!cover) return;
    var a = cover.querySelector(".cc-title-a");
    var b = cover.querySelector(".cc-title-b");
    if (a) cover.style.setProperty("--aw", a.offsetWidth + "px");
    if (b) cover.style.setProperty("--bw", b.offsetWidth + "px");
  }
  placeNotes();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeNotes);
  window.addEventListener("resize", placeNotes, { passive: true });

  /* Reveal on scroll. Items in the same row share a stagger via --i. */
  var items = [].slice.call(document.querySelectorAll(".cc-rv"));
  function showAll() { items.forEach(function (el) { el.classList.add("is-in"); }); }
  if (reduce.matches || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0 });
    items.forEach(function (el) { io.observe(el); });
    /* Safety net: never leave content hidden. */
    window.addEventListener("load", function () {
      setTimeout(function () {
        items.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < innerHeight && r.bottom > 0) el.classList.add("is-in");
        });
      }, 200);
    });
  }
  reduce.addEventListener && reduce.addEventListener("change", function (m) { if (m.matches) showAll(); });

  /* Videos: play only in view and only without reduced motion. Always pausable. */
  var vids = [].slice.call(document.querySelectorAll(".cc-video"));
  vids.forEach(function (v) {
    var btn = v.parentNode.querySelector(".cc-play");
    var userPaused = reduce.matches;
    function sync() {
      var paused = v.paused;
      if (!btn) return;
      btn.classList.toggle("is-paused", paused);
      btn.setAttribute("aria-label", paused ? "Play video" : "Pause video");
    }
    if (btn) {
      btn.hidden = false;
      btn.addEventListener("click", function () {
        if (v.paused) { userPaused = false; v.play().catch(function () {}); }
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
        } else if (!e.isIntersecting && !v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.35 }).observe(v);
  });

  doc.classList.add("cc-ready");
})();
