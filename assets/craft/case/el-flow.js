/* Persona avatars: mount the project orb behind the person icon */
(function () {
  function go() {
    var O = window.CraftOrb;
    document.querySelectorAll(".el-persona-av[data-orb]").forEach(function (el) {
      var key = el.getAttribute("data-orb");
      if (O && O.fallback) el.style.backgroundImage = O.fallback(key);
      if (O) O.mount(el, key);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();
(function () {
  var wrap = document.querySelector(".el-fl");
  if (!wrap) return;
  var tip = wrap.querySelector(".el-fl-tip"), img = tip.querySelector("img"), cap = tip.querySelector("p"), cur = null;
  function show(n) {
    if (cur) cur.classList.remove("is-on");
    cur = n; n.classList.add("is-on");
    var src = n.getAttribute("data-img");
    tip.classList.toggle("no-img", !src);
    if (src) img.src = src;
    cap.textContent = n.getAttribute("data-cap") || "";
    var w = wrap.getBoundingClientRect(), r = n.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
    var x = r.left - w.left + r.width / 2 - tw / 2;
    x = Math.max(0, Math.min(x, w.width - tw));
    var y = r.top - w.top - th - 10;
    if (r.top - th - 10 < 0) y = r.bottom - w.top + 10;
    tip.style.left = x + "px"; tip.style.top = y + "px";
    tip.classList.add("is-on");
  }
  function hide() { if (cur) cur.classList.remove("is-on"); cur = null; tip.classList.remove("is-on"); }
  wrap.querySelectorAll(".fl-n[tabindex]").forEach(function (n) {
    n.addEventListener("mouseenter", function () { show(n); });
    n.addEventListener("mouseleave", hide);
    n.addEventListener("focus", function () { show(n); });
    n.addEventListener("blur", hide);
    n.addEventListener("click", function (e) { e.stopPropagation(); show(n); });
  });
  var warm = false;
  function preload() {
    if (warm) return; warm = true;
    wrap.querySelectorAll(".fl-n[data-img]").forEach(function (n) { var p = new Image(); p.src = n.getAttribute("data-img"); });
  }
  wrap.addEventListener("pointerenter", preload);
  wrap.addEventListener("touchstart", preload, { passive: true });
  document.addEventListener("click", hide);
  wrap.querySelector(".el-fl-scroll").addEventListener("scroll", hide, { passive: true });
})();

/* Custom video player */
(function () {
  document.querySelectorAll("[data-player]").forEach(function (box) {
    var v = box.querySelector("video"), play = box.querySelector(".el-pl-play"), full = box.querySelector(".el-pl-full");
    var track = box.querySelector(".el-pl-track"), fill = box.querySelector(".el-pl-fill"), raf = 0, idle = 0, user = false;
    function draw() {
      var p = v.duration ? v.currentTime / v.duration : 0;
      fill.style.width = (p * 100) + "%";
      track.setAttribute("aria-valuenow", Math.round(p * 100));
      if (!v.paused) raf = requestAnimationFrame(draw);
    }
    function sync() {
      var on = !v.paused;
      box.classList.toggle("is-playing", on);
      play.setAttribute("aria-label", on ? "Pause" : "Play");
      cancelAnimationFrame(raf); draw(); wake();
    }
    function toggle() { user = true; if (v.paused) v.play(); else v.pause(); }
    function wake() {
      box.classList.remove("is-idle"); clearTimeout(idle);
      if (!v.paused) idle = setTimeout(function () { box.classList.add("is-idle"); }, 2200);
    }
    v.addEventListener("play", sync); v.addEventListener("pause", sync); v.addEventListener("loadedmetadata", draw);
    play.addEventListener("click", toggle);
    v.addEventListener("click", toggle);
    box.addEventListener("pointermove", wake);
    box.addEventListener("pointerleave", function () { if (!v.paused) box.classList.add("is-idle"); });
    function seek(e) {
      var r = track.getBoundingClientRect(), p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      if (v.duration) { v.currentTime = p * v.duration; draw(); }
    }
    track.addEventListener("pointerdown", function (e) {
      track.setPointerCapture(e.pointerId); seek(e);
      function mv(ev) { seek(ev); }
      function up() { track.removeEventListener("pointermove", mv); track.removeEventListener("pointerup", up); }
      track.addEventListener("pointermove", mv); track.addEventListener("pointerup", up);
    });
    track.addEventListener("keydown", function (e) {
      if (!v.duration) return;
      if (e.key === "ArrowRight") { v.currentTime = Math.min(v.duration, v.currentTime + 5); draw(); e.preventDefault(); }
      if (e.key === "ArrowLeft") { v.currentTime = Math.max(0, v.currentTime - 5); draw(); e.preventDefault(); }
    });
    full.addEventListener("click", function () {
      var d = document;
      if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
      if (box.requestFullscreen) box.requestFullscreen();
      else if (box.webkitRequestFullscreen) box.webkitRequestFullscreen();
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    });
    /* Plays on its own while on screen, unless the visitor paused it */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting && en.intersectionRatio > .5) { if (!user && v.paused) v.play().catch(function () {}); }
          else if (!v.paused) v.pause();
        });
      }, { threshold: [0, .5, 1] }).observe(box);
    }
    sync();
  });
})();
