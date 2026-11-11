/* Contextual Chat layout behaviour: reveal on scroll, bars and numbers count in, quote carousel.
   Everything is visible without scripting; motion is skipped when reduced motion is on. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = "IntersectionObserver" in window;

  function fmt(el, v) {
    var k = el.getAttribute("data-fmt") || "";
    if (k === "ms") { var m = Math.floor(v / 60), s = Math.round(v % 60); if (s === 60) { m++; s = 0; } return m + "m " + s + "s"; }
    var d = +(el.getAttribute("data-dec") || 0);
    return (el.getAttribute("data-pre") || "") + v.toFixed(d) + (el.getAttribute("data-suf") || "");
  }
  function count(el) {
    var to = parseFloat(el.getAttribute("data-to")), from = parseFloat(el.getAttribute("data-from") || 0);
    var final = el.textContent, t0 = null, dur = 1100;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = p < 1 ? fmt(el, from + (to - from) * e) : final;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (io && !reduce) {
    var rv = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); rv.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    var groups = document.querySelectorAll(".el-grid, .el-feat, .el-outline, .el-steps, .el-stats");
    [].forEach.call(groups, function (g) {
      [].forEach.call(g.children, function (c, i) {
        if (c.classList.contains("el-feat-h")) return;
        if (c.getBoundingClientRect().top < innerHeight * 0.92) return;
        c.style.setProperty("--d", Math.min(i, 5) * 0.06 + "s");
        c.classList.add("el-rv"); rv.observe(c);
      });
    });

    var an = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-on"); an.unobserve(e.target);
        [].forEach.call(e.target.querySelectorAll("[data-to]"), count);
      });
    }, { threshold: 0.3 });
    [].forEach.call(document.querySelectorAll(".el-chart, .el-big"), function (c) { c.classList.add("el-anim"); an.observe(c); });
  }

  /* Quote carousel */
  [].forEach.call(document.querySelectorAll(".el-quote"), function (q) {
    var items = [].slice.call(q.querySelectorAll(".el-quote-list > li"));
    if (items.length < 2) return;
    var pips = q.querySelector(".el-pips"), i = 0, timer = null;
    items.forEach(function (_, n) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-label", "Quote " + (n + 1));
      b.addEventListener("click", function () { go(n); stop(); });
      pips.appendChild(b);
    });
    function go(n) {
      i = (n + items.length) % items.length;
      items.forEach(function (it, k) { it.setAttribute("aria-hidden", k === i ? "false" : "true"); });
      [].forEach.call(pips.children, function (b, k) { b.setAttribute("aria-current", k === i ? "true" : "false"); });
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    q.querySelector(".el-prev").addEventListener("click", function () { go(i - 1); stop(); });
    q.querySelector(".el-next").addEventListener("click", function () { go(i + 1); stop(); });
    go(0);
    if (!reduce) timer = setInterval(function () { go(i + 1); }, 7000);
    q.addEventListener("pointerenter", stop);
  });
})();
