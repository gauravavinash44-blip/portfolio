/* Live profile character for the Craft board orb.
   Ten aligned renders of the same character (eyes registered to one point) are stacked in one rig.
   The rig never stops moving: breathing, a slow sway, head turns that follow the pointer, and a
   spring that carries every pose change. Expressions swap under that motion with a short
   layered dissolve, and the idle renders blink from their own closed-eye versions.
   window.CraftLiveAvatar.mount(el, { base, onOpen }) returns { destroy, react }. */
(function () {
  "use strict";

  /* id: file, pose offsets for the rig (deg / % of height / scale), blink available */
  var FRAMES = {
    rest:   { f: "f4", b: "b4", pose: {} },
    grin:   { f: "f1", b: "b1", pose: { rot: 2.2, ry: 3 } },
    think:  { f: "f2", pose: { rx: -6, ty: -1.2, rot: -1.2 } },
    wow:    { f: "f3", pose: { ry: 7, rot: 1.5, ty: -0.6 } },
    laugh:  { f: "f5", pose: { ty: -1.4, s: 1.02, rx: -3 } },
    chat:   { f: "f6", pose: { ry: 6, rot: -1.2 } },
    giggle: { f: "f7", pose: { ty: -2.2, s: 1.03, rot: -3, rx: -4 } },
    gentle: { f: "f8", b: "b8", pose: { ry: -2 } },
    glance: { f: "f9", pose: { ry: -5, rot: -1 } }
  };
  /* idle moments: which expression, how long it holds, how often it's picked */
  var ACTS = [["think", 1900, 3], ["glance", 1500, 3], ["gentle", 2600, 3], ["grin", 1900, 3], ["chat", 1300, 1]];

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(list) {
    var t = 0, i; for (i = 0; i < list.length; i++) t += list[i][2];
    var r = Math.random() * t;
    for (i = 0; i < list.length; i++) { r -= list[i][2]; if (r <= 0) return list[i]; }
    return list[0];
  }

  function mount(root, opts) {
    opts = opts || {};
    var base = opts.base || "./assets/craft/avatar/live/";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var host = root.closest ? root.closest("button, .cr-orb") || root : root;

    var rig = document.createElement("div"); rig.className = "cr-avl-rig";
    root.appendChild(rig);
    var layers = {}, z = 1;
    Object.keys(FRAMES).forEach(function (id) {
      var d = FRAMES[id], wrap = document.createElement("div");
      wrap.className = "cr-avl-layer"; wrap.dataset.id = id;
      var img = new Image(); img.alt = ""; img.decoding = "async"; img.draggable = false;
      img.src = base + d.f + ".webp"; wrap.appendChild(img);
      var blink = null;
      if (d.b) { blink = new Image(); blink.alt = ""; blink.decoding = "async"; blink.draggable = false; blink.className = "cr-avl-blink"; blink.src = base + d.b + ".webp"; wrap.appendChild(blink); }
      rig.appendChild(wrap);
      layers[id] = { wrap: wrap, img: img, blink: blink, ready: false };
      img.addEventListener("load", function () { layers[id].ready = true; if (id === cur) wrap.classList.add("is-on"); });
      if (img.complete && img.naturalWidth) layers[id].ready = true;
    });

    var cur = "rest";
    layers.rest.wrap.classList.add("is-on"); layers.rest.wrap.style.zIndex = z;

    /* ── expression swap: new layer dissolves in on top, the old one drops once it's covered ── */
    var swapT = null;
    function show(id, ms) {
      if (!layers[id] || id === cur) return;
      if (!layers[id].ready) return;
      var prev = layers[cur], next = layers[id];
      cur = id; target.pose = FRAMES[id].pose;
      clearTimeout(swapT);
      if (prev.blink) prev.blink.style.opacity = "";
      next.wrap.style.zIndex = ++z;
      next.wrap.style.transitionDuration = (reduce ? 200 : (ms || 300)) + "ms";
      next.wrap.classList.add("is-on");
      kick(reduce ? 0 : 0.012);
      swapT = setTimeout(function () {
        Object.keys(layers).forEach(function (k) { if (k !== cur) layers[k].wrap.classList.remove("is-on"); });
      }, (ms || 220) + 40);
    }

    /* ── blinking ── */
    var blinkT = null;
    function blink(twice) {
      var L = layers[cur];
      if (L.blink && L.blink.complete && L.blink.naturalWidth && L.blink.animate) {
        L.blink.animate([{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 1, offset: 0.55 }, { opacity: 0 }],
          { duration: 210, easing: "ease-in-out" });
        if (twice) setTimeout(function () { blink(false); }, 300);
      }
    }
    function scheduleBlink() {
      clearTimeout(blinkT);
      blinkT = setTimeout(function () { if (running) blink(Math.random() < 0.18); scheduleBlink(); }, rnd(2200, 5600));
    }

    /* ── behaviour: idle moments, hover and press reactions ── */
    var mode = "idle", actT = null, hoverT = null;
    function idleLoop() {
      clearTimeout(actT);
      if (reduce) return;
      actT = setTimeout(function () {
        if (!running || mode !== "idle") return idleLoop();
        var a = pick(ACTS);
        show(a[0], 240);
        actT = setTimeout(function () { if (mode === "idle") show("rest", 260); idleLoop(); }, a[1]);
      }, rnd(3800, 7500));
    }
    function onEnter() {
      if (mode === "press") return;
      mode = "hover"; clearTimeout(actT); clearTimeout(hoverT);
      if (reduce) { show("grin", 200); return; }
      show("chat", 180);
      target.hop = 1;
      hoverT = setTimeout(function () { if (mode === "hover") show("grin", 220); hoverLoop(); }, 650);
    }
    function hoverLoop() {
      clearTimeout(hoverT);
      hoverT = setTimeout(function () {
        if (mode !== "hover") return;
        show(Math.random() < 0.5 ? "laugh" : "wow", 200);
        hoverT = setTimeout(function () { if (mode === "hover") show("grin", 220); hoverLoop(); }, 1100);
      }, rnd(2400, 4200));
    }
    function onLeave() {
      if (mode === "press") return;
      mode = "idle"; clearTimeout(hoverT);
      show(reduce ? "rest" : "gentle", 260);
      clearTimeout(actT);
      if (!reduce) actT = setTimeout(function () { if (mode === "idle") show("rest", 260); idleLoop(); }, 900);
    }
    function react() {
      mode = "press"; clearTimeout(actT); clearTimeout(hoverT);
      show("giggle", 160);
      target.hop = 2.2; kick(-0.03);
      setTimeout(function () { show("laugh", 200); }, 420);
      setTimeout(function () { mode = "idle"; show("rest", 260); idleLoop(); }, 2600);
    }

    /* ── the rig: springs toward idle motion + pose + gaze ── */
    var target = { pose: {}, gx: 0, gy: 0, hop: 0 };
    var st = { rx: 0, ry: 0, rot: 0, ty: 0, s: 1 }, vel = { rx: 0, ry: 0, rot: 0, ty: 0, s: 0 };
    var squash = 0, squashV = 0;
    function kick(v) { squashV += v * 60; }
    var gazeLocal = false, sac = { x: 0, y: 0 }, sacT = 0;
    function onMove(ev) {
      var r = host.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height * 0.42;
      var dx = (ev.clientX - cx) / Math.max(window.innerWidth * 0.5, 1), dy = (ev.clientY - cy) / Math.max(window.innerHeight * 0.5, 1);
      var k = gazeLocal ? 1 : 0.55;
      target.gx = Math.max(-1, Math.min(1, dx * (gazeLocal ? 2.6 : 1))) * k;
      target.gy = Math.max(-1, Math.min(1, dy * (gazeLocal ? 2.6 : 1))) * k;
      lastMove = performance.now();
    }
    var lastMove = 0;

    var raf = 0, running = false, t0 = performance.now(), last = t0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      var t = (now - t0) / 1000, p = target.pose;
      /* when the pointer rests, the gaze wanders on its own */
      if (now - lastMove > 2500 && now > sacT) { sac.x = rnd(-0.35, 0.35); sac.y = rnd(-0.2, 0.25); sacT = now + rnd(1200, 3200); }
      var idleGaze = now - lastMove > 2500;
      var gx = idleGaze ? sac.x : target.gx, gy = idleGaze ? sac.y : target.gy;
      var breathe = Math.sin(t * Math.PI * 2 / 4.6);
      var hop = target.hop; target.hop *= Math.pow(0.02, dt);
      var goal = {
        ry: (p.ry || 0) + gx * 11 + Math.sin(t * 0.53) * 1.6,
        rx: (p.rx || 0) - gy * 7 + Math.sin(t * 0.71 + 1) * 1.1,
        rot: (p.rot || 0) + gx * 2.2 + Math.sin(t * 0.9) * 1.2,
        ty: (p.ty || 0) - breathe * 0.45 - hop * Math.abs(Math.sin(t * 9)) * 1.1,
        s: (p.s || 1) + breathe * 0.004
      };
      ["rx", "ry", "rot", "ty", "s"].forEach(function (k) {
        var kk = k === "s" ? 90 : 60, damp = k === "s" ? 14 : 11;
        var a = (goal[k] - st[k]) * kk - vel[k] * damp;
        vel[k] += a * dt; st[k] += vel[k] * dt;
      });
      var sa = -squash * 220 - squashV * 16; squashV += sa * dt; squash += squashV * dt;
      rig.style.transform = "perspective(900px) translateY(" + st.ty.toFixed(3) + "%) rotateX(" + st.rx.toFixed(2) + "deg) rotateY(" + st.ry.toFixed(2) + "deg) rotate(" + st.rot.toFixed(2) + "deg) scale(" + (st.s * (1 + squash)).toFixed(4) + "," + (st.s * (1 - squash)).toFixed(4) + ")";
    }
    function start() {
      if (running || reduce) return;
      running = true; last = performance.now(); raf = requestAnimationFrame(frame);
      scheduleBlink(); if (mode === "idle") idleLoop();
    }
    function stop() { running = false; cancelAnimationFrame(raf); clearTimeout(blinkT); clearTimeout(actT); }

    var io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && !document.hidden) start(); else stop(); });
    }) : null;
    if (io) io.observe(root); else start();
    function onVis() { if (document.hidden) stop(); else if (!io) start(); else { var r = root.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) start(); } }
    document.addEventListener("visibilitychange", onVis);

    function enter() { gazeLocal = true; onEnter(); }
    function leave() { gazeLocal = false; onLeave(); }
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("focus", onEnter);
    host.addEventListener("blur", onLeave);
    window.addEventListener("pointermove", onMove, { passive: true });

    /* preload the rest after the first frame is up */
    if (reduce) rig.style.transform = "none";

    return {
      react: react,
      destroy: function () {
        stop(); if (io) io.disconnect(); clearTimeout(hoverT); clearTimeout(swapT);
        document.removeEventListener("visibilitychange", onVis);
        host.removeEventListener("pointerenter", enter); host.removeEventListener("pointerleave", leave);
        host.removeEventListener("focus", onEnter); host.removeEventListener("blur", onLeave);
        window.removeEventListener("pointermove", onMove);
        if (rig.parentNode) rig.parentNode.removeChild(rig);
      }
    };
  }

  window.CraftLiveAvatar = { mount: mount };
})();
