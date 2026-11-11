/* Live profile character for the Craft board orb.
   Plays a silent looping clip of Gaurav's character, built by morphing between his nine head renders,
   with a transparent background.
   The clip is one mp4 with the picture on top and its matte underneath; each frame is
   composited onto a canvas, so it works in every browser without alpha-video support.
   On top of the clip a small spring rig leans the character toward the pointer, lifts it on
   hover and bounces it on click. A still of the first frame shows until the clip is ready,
   and stays for people who have asked for reduced motion.
   window.CraftLiveAvatar.mount(el, { base }) returns { destroy, react }. */
(function () {
  "use strict";

  function mount(root, opts) {
    opts = opts || {};
    var base = opts.base || "./assets/craft/avatar/live/";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var host = root.closest ? root.closest("button, .cr-orb") || root : root;

    var rig = document.createElement("div"); rig.className = "cr-avl-rig";
    var poster = new Image(); poster.alt = ""; poster.decoding = "async"; poster.draggable = false;
    poster.className = "cr-avl-poster"; poster.src = base + "poster.webp?v=2";
    var canvas = document.createElement("canvas"); canvas.className = "cr-avl-canvas";
    rig.appendChild(poster); rig.appendChild(canvas); root.appendChild(rig);

    var video = null, ctx = null, work = null, wctx = null, W = 0, H = 0, ready = false, dead = false;
    var running = false, visible = false, vfc = 0, raf = 0;

    function setup() {
      if (reduce || video) return;
      video = document.createElement("video");
      video.muted = true; video.defaultMuted = true; video.loop = true; video.playsInline = true;
      video.setAttribute("muted", ""); video.setAttribute("playsinline", ""); video.preload = "auto";
      video.src = base + "character.mp4?v=2";
      video.addEventListener("loadeddata", function () {
        if (dead) return;
        W = video.videoWidth; H = video.videoHeight >> 1;
        if (!W || !H) return;
        canvas.width = W; canvas.height = H;
        ctx = canvas.getContext("2d");
        work = document.createElement("canvas"); work.width = W; work.height = H * 2;
        wctx = work.getContext("2d", { willReadFrequently: true });
        if (visible) play();
      });
      video.addEventListener("error", function () { video = null; });
    }

    function paint() {
      if (!ctx || video.readyState < 2) return;
      var px;
      try {
        wctx.drawImage(video, 0, 0, W, H * 2);
        px = wctx.getImageData(0, 0, W, H * 2);
      } catch (e) { return; }
      var d = px.data, n = W * H * 4, i;
      for (i = 0; i < n; i += 4) d[i + 3] = d[i + n];
      ctx.putImageData(px, 0, 0, 0, 0, W, H);
      if (!ready) { ready = true; rig.classList.add("is-live"); }
    }
    function loop() {
      if (!running) return;
      paint();
      if (video.requestVideoFrameCallback) vfc = video.requestVideoFrameCallback(loop);
      else raf = requestAnimationFrame(loop);
    }
    function play() {
      if (!video || !ctx || running) return;
      running = true;
      var p = video.play(); if (p && p.catch) p.catch(function () { running = false; });
      loop();
    }
    function pause() {
      running = false;
      if (video) { video.pause(); if (vfc && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(vfc); }
      cancelAnimationFrame(raf);
    }

    /* ── spring rig on top of the clip: lean to the pointer, lift on hover, bounce on click ── */
    var target = { gx: 0, gy: 0, lift: 0 };
    var st = { rx: 0, ry: 0, rot: 0, ty: 0, s: 1 }, vel = { rx: 0, ry: 0, rot: 0, ty: 0, s: 0 };
    var squash = 0, squashV = 0, rigRaf = 0, last = 0, near = false;
    function onMove(ev) {
      var r = host.getBoundingClientRect();
      var dx = (ev.clientX - r.left - r.width / 2) / Math.max(window.innerWidth * 0.5, 1);
      var dy = (ev.clientY - r.top - r.height * 0.42) / Math.max(window.innerHeight * 0.5, 1);
      var k = near ? 2.4 : 1;
      target.gx = Math.max(-1, Math.min(1, dx * k)); target.gy = Math.max(-1, Math.min(1, dy * k));
    }
    function rigFrame(now) {
      rigRaf = requestAnimationFrame(rigFrame);
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      var goal = { ry: target.gx * 7, rx: -target.gy * 5, rot: target.gx * 1.4, ty: -target.lift * 1.6, s: 1 + target.lift * 0.035 };
      ["rx", "ry", "rot", "ty", "s"].forEach(function (k) {
        var a = (goal[k] - st[k]) * 70 - vel[k] * 13;
        vel[k] += a * dt; st[k] += vel[k] * dt;
      });
      var sa = -squash * 240 - squashV * 15; squashV += sa * dt; squash += squashV * dt;
      rig.style.transform = "perspective(900px) translateY(" + st.ty.toFixed(3) + "%) rotateX(" + st.rx.toFixed(2) + "deg) rotateY(" + st.ry.toFixed(2) + "deg) rotate(" + st.rot.toFixed(2) + "deg) scale(" + (st.s * (1 + squash)).toFixed(4) + "," + (st.s * (1 - squash)).toFixed(4) + ")";
    }
    function enter() { near = true; target.lift = 1; }
    function leave() { near = false; target.lift = 0; }
    function react() { if (!reduce) squashV -= 2.4; }

    function show() {
      visible = true; setup(); play();
      if (!reduce && !rigRaf) { last = performance.now(); rigRaf = requestAnimationFrame(rigFrame); }
    }
    function hide() { visible = false; pause(); cancelAnimationFrame(rigRaf); rigRaf = 0; }

    var io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && !document.hidden) show(); else hide(); });
    }) : null;
    if (io) io.observe(root); else show();
    function onVis() {
      if (document.hidden) return hide();
      var r = root.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) show();
    }
    document.addEventListener("visibilitychange", onVis);
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("focus", enter);
    host.addEventListener("blur", leave);
    if (!reduce) window.addEventListener("pointermove", onMove, { passive: true });

    return {
      react: react,
      destroy: function () {
        dead = true; hide(); if (io) io.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        host.removeEventListener("pointerenter", enter); host.removeEventListener("pointerleave", leave);
        host.removeEventListener("focus", enter); host.removeEventListener("blur", leave);
        window.removeEventListener("pointermove", onMove);
        if (video) { video.removeAttribute("src"); video.load(); video = null; }
        if (rig.parentNode) rig.parentNode.removeChild(rig);
      }
    };
  }

  window.CraftLiveAvatar = { mount: mount };
})();
