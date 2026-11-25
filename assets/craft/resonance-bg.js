/* SAVED FOR LATER, not loaded on the site yet (Kabir, 25 Nov 2026): ElevenLabs-style dashboard background.
   To turn it on:
   1. index.html: <script src="./assets/craft/resonance-bg.js?v=2"></script> after orb.js.
   2. app.js CRAFT_WALLPAPERS: add { id: "resonance", label: "Resonance" } first; skip it in preloadWallpaper;
      skip the 15s auto shuffle while wallpaper === "resonance" (add wallpaper to that effect's deps).
   3. craft.js WallpaperLayers: for id "resonance" call go() at once (no photo to load) and render
      RsWallpaper (a div.cr-wp-rs that calls CraftResonanceBg.mount(el)) instead of the blur + photo divs.
   4. wallpapers.css, add:
      /* Resonance: the Resonance card's swirl, full screen, colour looping slowly (resonance-bg.js).
         Dark at every hue, so white text and neutral glass work the whole way round. */
      .craft-wp--resonance {
        --wp-glass: rgba(255, 255, 255, 0.10);
        --wp-glass-light: rgba(255, 255, 255, 0.12);
        --wp-glass-strong: rgba(20, 20, 28, 0.52);
        --wp-topbar-ink: #ffffff;
        --wp-accent: #3b6f9a;
        --g-date: var(--g-sheen), linear-gradient(rgba(20, 20, 28, 0.34), rgba(20, 20, 28, 0.4));
      }
      .cr-wp-rs { position: absolute; inset: 0; background: #0d1430; overflow: hidden; }
      .cr-wp-rs canvas { display: block; width: 100%; height: 100%; opacity: 0; transition: opacity 900ms ease; }
      .cr-wp-rs.is-lit canvas { opacity: 1; }
      .cr-wp-thumb.craft-wp--resonance { background: linear-gradient(135deg, #3e6f8f, #7a4f9a 50%, #b0644a); }
*/
/* Resonance background for the dashboard: the Resonance card's grainy swirl (orb.js shader, flat),
   full screen, with its colour drifting slowly round the wheel in a loop
   (blue, purple, pink, red, orange, yellow, green, teal, back to blue).
   Own small WebGL canvas, drawn at reduced resolution and scaled up (the swirl is soft anyway).
   Paused on hidden tabs; reduced motion draws one still frame. */
(function () {
  "use strict";

  var LOOP = 360;      /* seconds for the palette to travel once round the colour wheel (6 min) */
  var START_HUE = 222; /* starts on Deal Room's cobalt */
  var FPS = 30;

  var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  var FRAG = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec2 uRes;uniform float uT;uniform float uGrain;",
    "uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;uniform vec3 uD;",
    "float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
    " return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}",
    "float fbm(vec2 p){float s=0.,a=.62;for(int i=0;i<3;i++){s+=a*vn(p);p=p*1.9+vec2(1.7,9.2);a*=.36;}return s/.95;}",
    "void main(){",
    " vec2 uv=(gl_FragCoord.xy/uRes)*2.-1.;",
    " uv.x*=uRes.x/uRes.y;",              /* keep the swirl round on a wide screen */
    " vec2 q=uv*1.15;",
    " float t=uT*.045;",                  /* slow drift, like the orbs at rest */
    " vec2 w=vec2(fbm(q*.55+vec2(t,-t*.7)),fbm(q*.55+vec2(5.2-t*.8,1.3+t)));",
    " vec2 w2=vec2(fbm(q*.4-vec2(t*.6,2.1)),fbm(q*.4+vec2(3.7,t*.5)));",
    " float n=fbm(q*.62+1.35*w+vec2(0.,t*.35));",          /* dark vs colour */
    " float k=fbm(q*.5+1.6*w2-vec2(t*.3,-t*.2)+11.);",      /* which colour: A or B */
    " float m=fbm(q*.8-1.4*w.yx+7.3-vec2(t*.45,0.));",      /* light streaks */
    " vec3 body=mix(uB,uC,smoothstep(.32,.68,k));",
    " vec3 col=mix(uA,body,smoothstep(.28,.72,n));",
    " col=mix(col,uD,smoothstep(.6,.86,m)*smoothstep(.4,.7,n)*.7);",
    /* darker toward the bottom and the edges, so cards and white text sit well */
    " vec2 s=gl_FragCoord.xy/uRes;",
    " col*=mix(.7,1.,smoothstep(0.,.9,s.y));",
    " col*=1.-.28*smoothstep(.6,1.6,length(uv*vec2(.55,1.)));",
    " float g=h21(gl_FragCoord.xy+fract(uT*3.1)*61.)-.5;",
    " col+=g*uGrain;",
    " gl_FragColor=vec4(clamp(col,0.,1.),1.);",
    "}"
  ].join("\n");

  function reduced() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }

  function hsl(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    function f(n) { var k = (n + h * 12) % 12; return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }
    return [f(0), f(8), f(4)];
  }
  function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
  /* Four tones, like the project orbs: a near-black deep of the hue, two neighbouring body colours
     (the hue and one 45deg on), and a pale highlight that shows only as soft streaks */
  function palette(hue) {
    return [hsl(hue - 10, 0.55, 0.09), hsl(hue, 0.68, 0.36), hsl(hue + 45, 0.6, 0.32), hsl(hue + 15, 0.75, 0.78)];
  }

  function mount(el) {
    if (!el) return function () {};
    var cv = document.createElement("canvas");
    cv.className = "cr-wp-rs-canvas";
    cv.setAttribute("aria-hidden", "true");
    var gl = null;
    try { gl = cv.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return function () {};
    var U = {};
    try {
      var sh = function (type, src) {
        var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      };
      var prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
      gl.useProgram(prog);
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ["uRes", "uT", "uGrain", "uA", "uB", "uC", "uD"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k); });
    } catch (e) { return function () {}; }
    el.appendChild(cv);

    /* clock: the hue keeps going from where it was across reloads in the same tab */
    var t0 = 0;
    try { t0 = parseFloat(sessionStorage.getItem("ga-rs-bg-t")) || 0; } catch (e) { t0 = 0; }
    var phase = t0, raf = 0, last = 0, acc = 0, alive = true, lit = false;

    function resize() {
      var w = el.clientWidth || window.innerWidth, hgt = el.clientHeight || window.innerHeight;
      var k = Math.min(0.6, 900 / Math.max(w, hgt)); /* soft swirl: ~half resolution is enough */
      var pw = Math.max(64, Math.round(w * k)), ph = Math.max(64, Math.round(hgt * k));
      if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }
    }
    function draw() {
      if (!alive || gl.isContextLost()) return;
      var p = palette(START_HUE + (phase / LOOP) * 360);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(U.uRes, cv.width, cv.height);
      gl.uniform1f(U.uT, phase + 185);
      gl.uniform1f(U.uGrain, 0.045);
      gl.uniform3fv(U.uA, p[0]); gl.uniform3fv(U.uB, p[1]); gl.uniform3fv(U.uC, p[2]); gl.uniform3fv(U.uD, p[3]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!lit) { lit = true; el.classList.add("is-lit"); }
    }
    function frame(now) {
      raf = 0;
      if (!alive || document.hidden || reduced()) return;
      var dt = last ? Math.min(0.1, (now - last) / 1000) : 0.016;
      last = now; acc += dt;
      raf = requestAnimationFrame(frame);
      if (acc < 1 / FPS) return;
      phase += acc; acc = 0;
      draw();
    }
    function kick() {
      if (!alive || raf || document.hidden) return;
      if (reduced()) { draw(); return; }
      last = 0;
      raf = requestAnimationFrame(frame);
    }
    function save() { try { sessionStorage.setItem("ga-rs-bg-t", String(phase)); } catch (e) { /* ignore */ } }
    var onVis = function () { if (document.hidden) save(); kick(); };
    var rz = 0;
    var onResize = function () { clearTimeout(rz); rz = setTimeout(function () { resize(); draw(); }, 100); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);
    window.addEventListener("pagehide", save);
    resize(); draw(); kick();

    return function () {
      alive = false; save();
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pagehide", save);
      var lose = gl.getExtension("WEBGL_lose_context"); if (lose) lose.loseContext();
      if (cv.parentNode) cv.parentNode.removeChild(cv);
    };
  }

  window.CraftResonanceBg = { mount: mount };
})();
