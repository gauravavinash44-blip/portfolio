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
