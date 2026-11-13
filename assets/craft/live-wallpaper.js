/* Craft mode live wallpapers.
   One WebGL canvas draws the active photo with gentle per-region motion:
   sky drift, water shimmer, waterfall flow, wind in grass and trees, passing cloud shadows.
   Regions come from hand-tuned masks in wallpapers/live/ (mask: R sky, G water, B vegetation;
   flow: RG direction, B strength). The still photo underneath always shows first; the canvas
   fades in once it has drawn a frame, and motion eases in after that.
   Hooked from Craft.WallpaperLayers via CraftLiveWallpaper.sync(backdropEl). */
(function () {
  "use strict";

  var BASE = "./assets/craft/wallpapers/";
  var LIVE = BASE + "live/";
  var FPS = 30;
  var EASE_IN = 2.6; /* seconds for motion to ease in after the canvas appears */

  /* Per photo. Units: displacement in fractions of photo height; speeds in noise tiles per second.
     sky.dir is the sampling offset, so clouds travel the other way ([-1, 0] = drifting right, with the wind). */
  var SCENES = {
    fuji: {
      veg: { amp: 0.0045, sheen: 0.06, scale: 2.2, speed: 0.09, dir: [1, 0.12] },
      water: { amp: 0.0022, glint: 0.6, scale: 1.0, speed: 3.0 },
      shadow: 0
    },
    barley: {
      sky: { drift: 0.032, period: 64, morph: 0.006, dir: [-1, 0] },
      veg: { amp: 0.0065, sheen: 0.12, scale: 1.8, speed: 0.12, dir: [1, 0.18] },
      shadow: 0.07
    },
    dike: {
      sky: { drift: 0.028, period: 64, morph: 0.005, dir: [-1, 0] },
      veg: { amp: 0.0028, sheen: 0.05, scale: 3.2, speed: 0.09, dir: [1, 0.05] },
      water: { amp: 0.0012, glint: 0.3, scale: 1.0, speed: 2.0 },
      shadow: 0.05
    }
  };

  var VS = "attribute vec2 aPos; varying vec2 vUv;" +
    "void main(){ vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); gl_Position = vec4(aPos, 0.0, 1.0); }";

  var FS = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "varying vec2 vUv;",
    "uniform sampler2D uImg, uMask, uFlow, uNoise;",
    "uniform vec4 uCover;",          /* image uv = vUv * xy + zw */
    "uniform float uAspect;",        /* photo width / height */
    "uniform float uAmp;",           /* 0..1 ease-in */
    "uniform vec4 uVeg;",            /* amp, sheen, scale, - */
    "uniform vec2 uWindDir;",
    "uniform vec2 uOffA, uOffB;",    /* gust noise offsets */
    "uniform vec4 uWater;",          /* amp, glint, scale, - */
    "uniform vec2 uOffW1, uOffW2;",
    "uniform vec4 uSky;",            /* current drift (height units), morph amp, -, - */
    "uniform vec2 uSkyDir, uOffM;",
    "uniform vec4 uFlowP;",          /* len, phase, flicker, - */
    "uniform float uShadow;",
    "uniform vec2 uOffS;",
    "float N(vec2 p){ return texture2D(uNoise, p).r; }",
    "vec4 N4(vec2 p){ return texture2D(uNoise, p); }",
    "vec3 img(vec2 uv){ return texture2D(uImg, clamp(uv, vec2(0.0005), vec2(0.9995))).rgb; }",
    "void main(){",
    "  vec2 uv = vUv * uCover.xy + uCover.zw;",
    "  vec3 m = texture2D(uMask, uv).rgb;",
    "  vec3 fl = texture2D(uFlow, uv).rgb;",
    "  vec2 q = vec2(uv.x * uAspect, uv.y);",       /* isotropic coords, photo-height units */
    "  vec2 toUv = vec2(1.0 / uAspect, 1.0);",
    "  vec2 d = vec2(0.0);",
    "  float lift = 0.0;",
    /* wind: broad gust fronts plus a finer flutter, both sliding with the wind */
    "  float gust = 0.0;",
    "  if (m.b > 0.003) {",
    "    float gA = N(q * uVeg.z * 0.35 + uOffA);",
    "    float gB = N4(q * uVeg.z * 1.4 + uOffB).g;",
    "    gust = smoothstep(0.3, 0.8, gA);",
    "    float sway = (gust - 0.35) + (gB - 0.5) * 0.45;",
    "    vec2 dir = normalize(uWindDir);",
    "    d += dir * toUv * sway * uVeg.x * m.b;",
    "    lift += (gust - 0.4) * uVeg.y * m.b;",
    "  }",
    /* water: two stretched noise layers against each other, mostly vertical displacement */
    "  float rip = 0.0;",
    "  if (m.g > 0.003) {",
    "    vec2 wq = q * uWater.z;",
    "    float a = N4(wq * vec2(2.2, 16.0) + uOffW1).b;",
    "    float b = N4(wq * vec2(3.1, 23.0) + uOffW2).a;",
    "    rip = a + b - 1.0;",
    "    d += vec2(rip * 0.35, rip) * toUv * uWater.x * m.g;",
    "  }",
    "  d *= uAmp;",
    /* sky: a slow ping-pong drift (eased, ~70s) plus soft billowing; clouds stay crisp */
    "  vec3 c;",
    "  if (m.r > 0.003) {",
    "    vec2 morph = (N4(q * 1.3 + uOffM).rg - 0.5) * uSky.y;",
    "    vec2 o = (uSkyDir * uSky.x + morph) * m.r * toUv * uAmp;",
    "    vec2 s = uv + d + o;",
    /* guard: never pull pixels from below the horizon */
    "    s = mix(uv + d, s, smoothstep(0.02, 0.25, texture2D(uMask, s).r));",
    "    c = img(s);",
    "  } else if (fl.b > 0.004) {",
    /* waterfalls and rapids: two-phase flow, two offset samples crossfaded */
    "    vec2 L = (fl.rg - 0.5) * 2.0 * uFlowP.x * fl.b * toUv * uAmp;",
    "    float ph = uFlowP.y + N4(q * 1.2).a * 0.35;",
    "    float p0 = fract(ph), p1 = fract(ph + 0.5);",
    "    float w0 = 1.0 - abs(1.0 - 2.0 * p0);",
    "    vec2 s0 = uv + d - L * (p0 - 0.5), s1 = uv + d - L * (p1 - 0.5);",
    "    s0 = mix(uv + d, s0, smoothstep(0.02, 0.3, texture2D(uFlow, s0).b));",
    "    s1 = mix(uv + d, s1, smoothstep(0.02, 0.3, texture2D(uFlow, s1).b));",
    "    c = img(s0) * w0 + img(s1) * (1.0 - w0);",
    "  } else {",
    "    c = img(uv + d);",
    "  }",
    /* light: wind sheen, water glints, foam flicker, passing cloud shadows */
    "  float lum = dot(c, vec3(0.299, 0.587, 0.114));",
    "  c *= 1.0 + lift * uAmp;",
    "  c += uWater.y * m.g * uAmp * pow(max(rip, 0.0), 3.0) * smoothstep(0.35, 0.85, lum);",
    "  c *= 1.0 + uFlowP.z * fl.b * uAmp * (N4(q * vec2(9.0, 3.0) + vec2(0.0, -uFlowP.y)).r - 0.5);",
    "  float sh = smoothstep(0.42, 0.78, N4(q * 0.55 + uOffS).g);",
    "  c *= 1.0 - uShadow * sh * (1.0 - m.r) * uAmp;",
    "  gl_FragColor = vec4(c, 1.0);",
    "}"
  ].join("\n");

  /* ── state ── */
  var gl = null, canvas = null, prog = null, U = {}, noiseTex = null, neutralTex = null, failed = false;
  var root = null, host = null, sceneId = null, scene = null;
  var tex = {}; /* id -> { img, mask, flow, w, h, ready } */
  var raf = 0, lastFrame = 0, simTime = 0, ampTime = 0, running = false;
  var coverPoll = 0, covered = false, hold = false, stats = { frames: 0, gpuMs: 0, avgMs: 0, fps: 0, w: 0, h: 0 };
  var mqReduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  function reducedMotion() { return !!(mqReduce && mqReduce.matches); }

  function createGL() {
    if (gl || failed) return !!gl;
    canvas = document.createElement("canvas");
    canvas.className = "cr-wp-live";
    canvas.setAttribute("aria-hidden", "true");
    var opts = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: "low-power" };
    try { gl = canvas.getContext("webgl", opts) || canvas.getContext("experimental-webgl", opts); } catch (e) { gl = null; }
    if (!gl) { failed = true; canvas = null; return false; }
    var vs = shader(gl.VERTEX_SHADER, VS), fs = shader(gl.FRAGMENT_SHADER, FS);
    prog = gl.createProgram();
    if (vs && fs) { gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); }
    if (!vs || !fs || !gl.getProgramParameter(prog, gl.LINK_STATUS)) { failed = true; gl = null; canvas = null; return false; }
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ["uImg", "uMask", "uFlow", "uNoise", "uCover", "uAspect", "uAmp", "uVeg", "uWindDir", "uOffA", "uOffB", "uWater", "uOffW1", "uOffW2",
      "uSky", "uSkyDir", "uOffM", "uFlowP", "uShadow", "uOffS"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    gl.uniform1i(U.uImg, 0); gl.uniform1i(U.uMask, 1); gl.uniform1i(U.uFlow, 2); gl.uniform1i(U.uNoise, 3);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    noiseTex = makeNoise();
    neutralTex = texFrom(new Uint8Array([128, 128, 0, 255]), 1, 1, false);
    canvas.addEventListener("webglcontextlost", function (ev) { ev.preventDefault(); lose(); }, false);
    return true;
  }

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }

  function texFrom(src, w, h, repeat) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    if (src instanceof Uint8Array) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, src);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    return t;
  }

  /* Tileable smooth value noise, 4 independent channels, 128x128 (power of two so it can repeat in WebGL1) */
  function makeNoise() {
    var S = 128, n = S * S, out = new Uint8Array(n * 4), seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var c = 0; c < 4; c++) {
      var a = new Float32Array(n), b = new Float32Array(n);
      for (var i = 0; i < n; i++) a[i] = rnd();
      for (var pass = 0; pass < 3; pass++) { blur(a, b, S, 4, 1, 0); blur(b, a, S, 4, 0, 1); }
      var lo = 1, hi = 0;
      for (i = 0; i < n; i++) { if (a[i] < lo) lo = a[i]; if (a[i] > hi) hi = a[i]; }
      for (i = 0; i < n; i++) out[i * 4 + c] = Math.round((a[i] - lo) / (hi - lo) * 255);
    }
    return texFrom(out, S, S, true);
  }
  function blur(src, dst, S, r, dx, dy) {
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var s = 0;
      for (var k = -r; k <= r; k++) s += src[((y + k * dy + S) % S) * S + ((x + k * dx + S) % S)];
      dst[y * S + x] = s / (2 * r + 1);
    }
  }

  function loadImage(src, fallback) {
    return new Promise(function (resolve, reject) {
      var im = new Image();
      im.decoding = "async";
      im.onload = function () { resolve(im); };
      im.onerror = function () {
        if (!fallback) { reject(new Error("load " + src)); return; }
        loadImage(fallback).then(resolve, reject);
      };
      im.src = src;
    });
  }

  function photoSize() {
    return (window.innerWidth >= 1600 || (window.devicePixelRatio || 1) >= 1.5) ? "2560" : "1440";
  }

  function load(id) {
    if (tex[id]) return tex[id].promise;
    var entry = tex[id] = { ready: false };
    var size = photoSize();
    var sc = SCENES[id];
    entry.promise = Promise.all([
      loadImage(BASE + id + "-" + size + ".webp", BASE + id + "-" + size + ".jpg"),
      loadImage(LIVE + id + "-mask.png"),
      sc && sc.flow ? loadImage(LIVE + id + "-flow.png") : Promise.resolve(null)
    ]).then(function (r) {
      if (!gl || tex[id] !== entry) return entry;
      var photo = r[0];
      entry.w = photo.naturalWidth; entry.h = photo.naturalHeight;
      entry.img = texFrom(scaled(photo), 0, 0, false);
      entry.mask = texFrom(r[1], 0, 0, false);
      entry.flow = r[2] ? texFrom(r[2], 0, 0, false) : null;
      entry.ready = true;
      prune(id);
      return entry;
    });
    return entry.promise;
  }

  /* Downscale big photos to roughly the drawn size: less GPU memory, and no aliasing without mipmaps */
  function scaled(photo) {
    var limit = Math.max(canvas.width, canvas.height) * 1.15;
    if (photo.naturalWidth <= limit * 1.1) return photo;
    var k = limit / photo.naturalWidth;
    var c = document.createElement("canvas");
    c.width = Math.round(photo.naturalWidth * k); c.height = Math.round(photo.naturalHeight * k);
    var x = c.getContext("2d");
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
    x.drawImage(photo, 0, 0, c.width, c.height);
    return c;
  }

  /* Keep the current wallpaper's textures plus one other */
  function prune(keep) {
    var ids = Object.keys(tex);
    if (ids.length <= 2) return;
    ids.forEach(function (id) {
      if (id === keep || id === sceneId || !tex[id].ready) return;
      ["img", "mask", "flow"].forEach(function (k) { if (tex[id][k]) gl.deleteTexture(tex[id][k]); });
      delete tex[id];
    });
  }

  function lose() {
    stop();
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    gl = null; canvas = null; tex = {}; failed = true; host = null; sceneId = null;
  }

  /* ── sizing ── */
  function resize() {
    if (!host || !canvas) return;
    var w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var small = Math.min(window.innerWidth, window.innerHeight) < 700 || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    var budget = small ? 900000 : 2100000; /* pixels */
    var k = Math.min(dpr, Math.sqrt(budget / (w * h)));
    var cw = Math.max(1, Math.round(w * k)), ch = Math.max(1, Math.round(h * k));
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    stats.w = cw; stats.h = ch;
  }

  function coverUniform(entry) {
    var W = canvas.width, H = canvas.height, s = Math.max(W / entry.w, H / entry.h);
    var dw = entry.w * s, dh = entry.h * s;
    var pos = (getComputedStyle(host).backgroundPosition || "50% 50%").split(" ");
    var px = parseFloat(pos[0]), py = parseFloat(pos[1]);
    px = isNaN(px) ? 0.5 : px / 100; py = isNaN(py) ? 0.5 : py / 100;
    var ox = (W - dw) * px, oy = (H - dh) * py;
    gl.uniform4f(U.uCover, W / dw, H / dh, -ox / dw, -oy / dh);
    gl.uniform1f(U.uAspect, entry.w / entry.h);
  }

  /* ── drawing ── */
  function fract(x) { return x - Math.floor(x); }
  function f2(loc, x, y) { gl.uniform2f(loc, fract(x), fract(y)); }

  function draw(amp) {
    var e = tex[sceneId];
    if (!gl || !e || !e.ready || !scene) return;
    var t = simTime, sc = scene;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, e.img);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, e.mask);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, e.flow || neutralTex);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, noiseTex);
    coverUniform(e);
    gl.uniform1f(U.uAmp, amp);
    var v = sc.veg || { amp: 0, sheen: 0, scale: 1, speed: 0, dir: [1, 0] };
    var dl = Math.hypot(v.dir[0], v.dir[1]) || 1, dx = v.dir[0] / dl, dy = v.dir[1] / dl;
    gl.uniform4f(U.uVeg, v.amp, v.sheen, v.scale, 0);
    gl.uniform2f(U.uWindDir, dx, dy);
    f2(U.uOffA, -dx * v.speed * t, -dy * v.speed * t);
    f2(U.uOffB, -dx * v.speed * 2.6 * t + 0.37, -dy * v.speed * 2.6 * t + 0.11);
    var w = sc.water || { amp: 0, glint: 0, scale: 1, speed: 0 };
    gl.uniform4f(U.uWater, w.amp, w.glint, w.scale, 0);
    f2(U.uOffW1, 0.011 * w.speed * t, 0.045 * w.speed * t);
    f2(U.uOffW2, -0.014 * w.speed * t + 0.5, 0.032 * w.speed * t + 0.25);
    var s = sc.sky || { drift: 0, period: 70, morph: 0, dir: [1, 0] };
    /* sky time restarts per wallpaper: drift is fastest while it's on screen and slows by the next shuffle */
    gl.uniform4f(U.uSky, s.drift * Math.sin(ampTime * 2 * Math.PI / s.period), s.morph, 0, 0);
    gl.uniform2f(U.uSkyDir, s.dir[0], s.dir[1]);
    f2(U.uOffM, 0.0045 * t, 0.0025 * t);
    var f = sc.flow || { len: 0, cycle: 1, flicker: 0 };
    gl.uniform4f(U.uFlowP, f.len, fract(t / f.cycle), f.flicker, 0);
    gl.uniform1f(U.uShadow, sc.shadow || 0);
    f2(U.uOffS, -dx * 0.0065 * t, -dy * 0.0065 * t); /* cloud shadows travel with the wind */
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function ease(x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); }

  function frame(now) {
    raf = 0;
    if (!running) return;
    raf = requestAnimationFrame(frame);
    var minGap = 1000 / FPS - 2;
    if (lastFrame && now - lastFrame < minGap) return;
    var dt = lastFrame ? Math.min(0.1, (now - lastFrame) / 1000) : 0;
    lastFrame = now;
    simTime += dt; ampTime += dt;
    var t0 = performance.now();
    draw(ease(ampTime / EASE_IN));
    var cost = performance.now() - t0;
    stats.frames++;
    stats.avgMs = stats.avgMs ? stats.avgMs * 0.95 + cost * 0.05 : cost;
    stats.fps = stats.fps ? stats.fps * 0.95 + (dt ? 1 / dt : FPS) * 0.05 : FPS;
  }

  function shouldRun() {
    return !!(host && host.isConnected && gl && tex[sceneId] && tex[sceneId].ready && !document.hidden && !covered && !hold && !reducedMotion());
  }
  function start() {
    if (running || !shouldRun()) return;
    running = true; lastFrame = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  function update() { if (shouldRun()) start(); else stop(); }

  /* A sheet, popup or the playground dims or covers the board: pause under it */
  function checkCovered() {
    var c = !!document.querySelector("[aria-modal='true']:not([aria-hidden='true']), .cr-dimmed, .cpg");
    if (c !== covered) { covered = c; update(); }
  }

  /* ── mounting ── */
  function detach() {
    stop();
    if (canvas) { canvas.classList.remove("is-on"); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); }
    host = null; sceneId = null; scene = null;
    if (coverPoll) { clearInterval(coverPoll); coverPoll = 0; }
  }

  function attach(photo, id) {
    if (!createGL()) return;
    stop();
    canvas.classList.remove("is-on");
    host = photo; sceneId = id; scene = SCENES[id];
    photo.appendChild(canvas);
    resize();
    ampTime = 0;
    if (!coverPoll) coverPoll = setInterval(checkCovered, 400);
    checkCovered();
    load(id).then(function () {
      if (sceneId !== id || host !== photo || !gl) return;
      draw(0); /* identical to the still, so the swap is invisible */
      requestAnimationFrame(function () {
        if (sceneId !== id || !canvas) return;
        canvas.classList.add("is-on");
        update();
      });
    }, function () { /* assets missing: stay on the still photo */ });
  }

  function sync(el) {
    root = el || null;
    if (!root || reducedMotion() || !SCENES || failed) { detach(); return; }
    var layers = root.querySelectorAll(".cr-wp");
    /* mid crossfade: keep animating the outgoing layer until the new one has settled */
    if (layers.length !== 1) { if (host && !host.isConnected) detach(); return; }
    var m = /craft-wp--([\w-]+)/.exec(layers[0].className);
    var id = m && m[1];
    var photo = layers[0].querySelector(".cr-wp-photo");
    if (!id || !photo || !SCENES[id]) { detach(); return; }
    if (host === photo && sceneId === id && canvas && canvas.parentNode === photo) return;
    attach(photo, id);
  }

  document.addEventListener("visibilitychange", update);
  var rz = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rz);
    rz = setTimeout(function () { resize(); if (!running && canvas && canvas.classList.contains("is-on")) draw(ease(ampTime / EASE_IN)); }, 120);
  });
  if (mqReduce) {
    var onMq = function () { sync(root); };
    if (mqReduce.addEventListener) mqReduce.addEventListener("change", onMq); else if (mqReduce.addListener) mqReduce.addListener(onMq);
  }

  window.CraftLiveWallpaper = {
    sync: sync,
    scenes: SCENES,
    stats: function () { return { running: running, covered: covered, scene: sceneId, fps: Math.round(stats.fps), cpuMsPerFrame: +stats.avgMs.toFixed(2), frames: stats.frames, canvas: [stats.w, stats.h], webgl: !!gl }; },
    /* testing: jump the clock so frames can be captured deterministically */
    _bench: function (n) {
      if (!gl) return null;
      n = n || 20; gl.finish();
      var t0 = performance.now();
      var px = new Uint8Array(4);
      for (var i = 0; i < n; i++) { simTime += 1 / FPS; draw(1); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); }
      return +((performance.now() - t0) / n).toFixed(2);
    },
    _hold: function (on) { hold = !!on; update(); },
    _step: function (sec) { simTime += sec; ampTime = Math.max(ampTime + sec, EASE_IN); draw(1); }
  };
})();
