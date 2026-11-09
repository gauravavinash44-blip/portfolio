/* Project orbs: soft, grainy, iridescent spheres (one colour trio per project).
   One shared WebGL canvas renders every orb in turn and copies it into that orb's own
   2D canvas, so there is only ever one GL context however many orbs are on the page.
   Orbs off screen, on a hidden tab, or with reduced motion don't animate (reduced motion
   draws a single still frame). No WebGL: the span keeps its CSS gradient fallback.
   An orb "wakes" (faster swirl, slight lift) while its host row or card is hovered,
   focused or marked .is-active. */
(function () {
  /* a = deep base, b = body, c = light highlight, d = rim tint. Keyed by project icon name. */
  var PALETTES = {
    chatSpark: ["#8a8af3", "#f79ae4", "#b3d5fb", "#9fb9fa"], /* Contextual Chat: indigo-lilac, pink, ice blue */
    dealDoc: ["#c03f18", "#ef6f2e", "#f8c27c", "#f6b06a"],   /* Deal Room: burnt orange, amber */
    swatch: ["#3d2a28", "#a8665c", "#e49a88", "#b4aef4"],    /* White Label: brown, rose, lilac rim */
    bowl: ["#cf3a2c", "#f5845e", "#ffd3bb", "#ffb59a"],      /* EasyEat: warm red, peach */
    wave: ["#0f7062", "#3cc3a0", "#c9f1dc", "#9fe6d0"],      /* Resonance: green, teal, mint */
    plane: ["#2b64cc", "#71b2f3", "#f5dfc0", "#bfe0ff"],     /* Nomad: sky blue, sand */
    gauge: ["#378e4c", "#b2da68", "#eff5c4", "#d8f09a"],     /* Health Karma: leaf, lime */
    swap: ["#5638cc", "#2ab8d4", "#e2d9ff", "#9fe8f4"],      /* Swaply: violet, cyan */
    receipt: ["#c97c0b", "#f3c246", "#fff0c0", "#ffe08a"],   /* Splitly: gold, butter */
    card: ["#23223a", "#5865d6", "#e7a9cb", "#a9b2f6"],      /* moov: ink, periwinkle, pink */
    orbits: ["#1b2550", "#6a5acd", "#f2b8a0", "#b7a9f2"],    /* Space Between: navy, violet, dusk peach */
    loader: ["#ab2958", "#ef6a8f", "#ffd1da", "#ffb0c4"],    /* Loading Range: raspberry, rose */
    layers: ["#8a789d", "#e2b4a5", "#d0daf3", "#f3d2c4"]     /* Craft mode: the dusk wallpaper's mauve and peach */
  };

  var SEEDS = { chatSpark: 4.6, dealDoc: 2, swatch: 3, bowl: 4, wave: 5, plane: 6, gauge: 7, swap: 8, receipt: 9, card: 10, orbits: 11, loader: 12, layers: 13 };
  var HOSTS = ".cr-row, .cr-aw-card, .cs-row, .cs-related, .cr-preview";

  function reduced() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }

  /* CSS stand-in, painted until the first GL frame lands (and kept if WebGL is missing) */
  function fallback(key) {
    var p = PALETTES[key];
    if (!p) return "";
    return "radial-gradient(circle at 32% 26%, " + p[2] + " 0%, transparent 46%)," +
      "radial-gradient(circle at 70% 72%, " + p[0] + " 0%, transparent 62%)," +
      "radial-gradient(circle at 50% 50%, " + p[1] + " 0%, " + p[0] + " 100%)";
  }

  var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  var FRAG = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec2 uRes;uniform vec2 uOff;uniform float uT;uniform float uWake;uniform float uGrain;",
    "uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;uniform vec3 uD;",
    "float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
    " return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}",
    "float fbm(vec2 p){float s=0.,a=.62;for(int i=0;i<3;i++){s+=a*vn(p);p=p*1.9+vec2(1.7,9.2);a*=.36;}return s/.95;}",
    "void main(){",
    " vec2 uv=((gl_FragCoord.xy-uOff)/uRes)*2.-1.;",
    " float r=length(uv);",
    " float px=2./uRes.x;",
    " float a=1.-smoothstep(1.-px*1.6,1.,r);",
    " if(a<=0.){gl_FragColor=vec4(0.);return;}",
    " float z=sqrt(max(0.,1.-r*r));",
    /* bulge the plane onto the sphere so the swirls wrap round the limb */
    " vec2 q=uv/(.5+.5*z);",
    " float t=uT*(.1+uWake*.05);",
    " vec2 w=vec2(fbm(q*.55+vec2(t,-t*.7)),fbm(q*.55+vec2(5.2-t*.8,1.3+t)));",
    " float sw=1.25+uWake*.6;",
    " float n=fbm(q*.62+sw*w+vec2(0.,t*.35));",
    " float m=fbm(q*.7-sw*w.yx+7.3-vec2(t*.45,0.));",
    " vec3 col=mix(uA,uB,smoothstep(.3,.7,n));",
    " col=mix(col,uC,smoothstep(.44,.8,m)*.82);",
    /* soft key light from the top left, darker lower right, a hint of rim colour */
    " vec3 N=normalize(vec3(uv,z));",
    " float d=dot(N,normalize(vec3(-.5,.6,.62)))*.5+.5;",
    " col*=mix(.78,1.08,smoothstep(.1,.95,d));",
    " col=mix(col,uD,pow(1.-z,2.4)*.4);",
        /* film grain */
    " float g=h21(gl_FragCoord.xy+fract(uT*3.1)*61.)-.5;",
    " col+=g*uGrain;",
    " col=clamp(col,0.,1.);",
    " gl_FragColor=vec4(col*a,a);",
    "}"
  ].join("\n");

  var gl = null, glCanvas = null, prog = null, U = {}, glFailed = false;
  function initGL() {
    if (gl || glFailed) return !!gl;
    try {
      glCanvas = document.createElement("canvas");
      glCanvas.width = glCanvas.height = 192;
      gl = glCanvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true, powerPreference: "low-power" });
      if (!gl) throw new Error("no webgl");
      function sh(type, src) {
        var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      }
      prog = gl.createProgram();
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
      ["uRes", "uOff", "uT", "uWake", "uGrain", "uA", "uB", "uC", "uD"].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k); });
      gl.clearColor(0, 0, 0, 0);
      glCanvas.addEventListener("webglcontextlost", function (ev) { ev.preventDefault(); gl = null; glFailed = true; });
      return true;
    } catch (e) {
      gl = null; glFailed = true;
      return false;
    }
  }

  var orbs = [];        /* every mounted orb */
  var raf = 0, last = 0, acc = 0;
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { var o = e.target.__orb; if (o) o.seen = e.isIntersecting; });
    kick();
  }, { rootMargin: "40px" }) : null;
  var ro = "ResizeObserver" in window ? new ResizeObserver(function (es) {
    es.forEach(function (e) { var o = e.target.__orb; if (o) { size(o); if (!raf) paint(o); } });
  }) : null;

  function size(o) {
    var css = o.el.clientWidth || 50;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var px = Math.max(16, Math.min(256, Math.round(css * dpr)));
    if (o.cv.width !== px) { o.cv.width = o.cv.height = px; o.drawn = false; }
  }

  /* Draw a batch of orbs side by side into the shared GL canvas (simple shelf packing),
     then copy each tile into its own 2D canvas: one GPU flush per frame, however many orbs. */
  var ATLAS_W = 1024;
  function paintAll(list) {
    if (!gl || !list.length) return;
    var x = 0, y = 0, row = 0, pos = [];
    list.forEach(function (o) {
      var sz = o.cv.width;
      if (x + sz > ATLAS_W) { x = 0; y += row; row = 0; }
      pos.push([x, y]); x += sz; row = Math.max(row, sz);
    });
    var needH = y + row;
    if (glCanvas.width !== ATLAS_W || glCanvas.height < needH) { var keepH = glCanvas.height; glCanvas.width = ATLAS_W; glCanvas.height = Math.max(needH, keepH); }
    var H = glCanvas.height;
    gl.viewport(0, 0, ATLAS_W, H);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U.uGrain, 0.07);
    list.forEach(function (o, i) {
      var sz = o.cv.width, px = pos[i][0], py = H - pos[i][1] - sz; /* GL origin is bottom left */
      gl.viewport(px, py, sz, sz);
      gl.uniform2f(U.uRes, sz, sz);
      gl.uniform2f(U.uOff, px, py);
      gl.uniform1f(U.uT, o.phase + o.seed * 37.0);
      gl.uniform1f(U.uWake, o.wake);
      gl.uniform3fv(U.uA, o.c[0]); gl.uniform3fv(U.uB, o.c[1]); gl.uniform3fv(U.uC, o.c[2]); gl.uniform3fv(U.uD, o.c[3]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
    list.forEach(function (o, i) {
      var sz = o.cv.width;
      o.ctx.clearRect(0, 0, sz, sz);
      o.ctx.drawImage(glCanvas, pos[i][0], pos[i][1], sz, sz, 0, 0, sz, sz);
      if (!o.drawn) { o.drawn = true; o.el.classList.add("is-lit"); }
    });
  }
  function paint(o) { paintAll([o]); }

  function awake(o) {
    var host = o.host || (o.host = o.el.closest(HOSTS));
    if (!host) return false;
    return host.classList.contains("is-active") || host.matches(":hover") || host.matches(":focus-within");
  }

  function frame(now) {
    raf = 0;
    if (document.hidden || reduced()) return;
    var live = orbs.filter(function (o) { return o.seen && o.el.isConnected; });
    if (!live.length) return;
    var dt = last ? Math.min(0.1, (now - last) / 1000) : 0.016;
    last = now;
    acc += dt;
    raf = requestAnimationFrame(frame);
    if (acc < 1 / 31) return; /* ~30 fps is plenty for a slow swirl */
    var step = acc; acc = 0;
    live.forEach(function (o) {
      var target = awake(o) ? 1 : 0;
      o.wake += (target - o.wake) * Math.min(1, step * 5);
      if (Math.abs(target - o.wake) < 0.002) o.wake = target;
      o.phase += step * (1 + o.wake * 1.9);
      var sc = 1 + o.wake * 0.06;
      if (o.sc !== sc) { o.sc = sc; o.cv.style.transform = sc === 1 ? "" : "scale(" + sc.toFixed(4) + ")"; }
    });
    paintAll(live);
  }

  function kick() {
    if (raf || document.hidden) return;
    if (reduced()) { paintAll(orbs.filter(function (o) { return o.seen && !o.drawn && o.el.isConnected; })); return; }
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", kick);

  /* Mount: el is the well span, key the palette key. Returns an unmount function. */
  function mount(el, key) {
    var pal = PALETTES[key];
    if (!el || !pal) return function () {};
    if (!initGL()) return function () {};
    var cv = el.querySelector("canvas");
    if (!cv) { cv = document.createElement("canvas"); cv.setAttribute("aria-hidden", "true"); el.appendChild(cv); }
    var o = { el: el, cv: cv, ctx: cv.getContext("2d"), c: pal.map(rgb), seed: SEEDS[key] || 0, phase: 0, wake: 0, sc: 1, seen: !io, drawn: false, host: null };
    el.__orb = o;
    orbs.push(o);
    size(o);
    paint(o); /* first frame right away, even before it is known to be on screen */
    if (io) io.observe(el);
    if (ro) ro.observe(el);
    kick();
    return function () {
      if (io) io.unobserve(el);
      if (ro) ro.unobserve(el);
      orbs = orbs.filter(function (x) { return x !== o; });
      el.__orb = null;
    };
  }

  window.CraftOrb = { mount: mount, has: function (key) { return !!PALETTES[key]; }, fallback: fallback, palettes: PALETTES };
})();
