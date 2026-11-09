/* Resonance bridge. Loaded by index.html before the app bundle; the bundle itself stays untouched.
   1. Now Playing: follows the app's audio element and its player state, tells the portfolio page
      (window.parent, same origin only) what is playing, and takes play / pause / next / prev / seek back.
   2. Media Session: title, artist, artwork and position for OS media controls (lock screen, media keys).
   3. Blocked hosts: a cover that fails to load becomes a generated cover (gradient from the title, initials);
      a song that can't stream skips to the next song that can, with a short note, and never sits on
      "playing" at 0:00. */
(function () {
  "use strict";
  if (window.__RS_BRIDGE__) return;
  var W = window, D = document;
  var ORIGIN = location.origin;
  var EMBEDDED = W.parent && W.parent !== W;
  var LOCAL = W.__RS_LOCAL__ || {};
  var MSG_STREAM = "This song can't stream here. Try Open full screen.";
  var MSG_TAP = "Tap play to start the song.";
  var log = [];
  function note(kind, data) { log.push([Math.round(performance.now()), kind, data]); if (log.length > 400) log.shift(); }

  /* ───── generated covers ───── */
  function hash(s) {
    var h = 2166136261;
    s = String(s || "");
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function initials(title) {
    var words = String(title || "").replace(/\((?:feat|ft|from)[^)]*\)/gi, "").match(/[A-Za-z0-9À-ɏ]+/g) || [];
    if (!words.length) return "";
    var s = words.length > 1 ? words[0].charAt(0) + words[1].charAt(0) : words[0].slice(0, 2);
    return s.toUpperCase();
  }
  var covers = {};
  function hueOf(seed) { return hash(seed) % 360; }
  function makeCover(title, seed) {
    var key = (title || "") + "|" + (seed || "");
    if (covers[key]) return covers[key];
    var h = hueOf(title || seed), h2 = (h + 42) % 360, txt = initials(title);
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0' stop-color='hsl(" + h + ",56%,50%)'/><stop offset='1' stop-color='hsl(" + h2 + ",48%,20%)'/></linearGradient>" +
      "<radialGradient id='r' cx='.22' cy='.18' r='.85'><stop offset='0' stop-color='#fff' stop-opacity='.24'/><stop offset='1' stop-color='#fff' stop-opacity='0'/></radialGradient></defs>" +
      "<rect width='600' height='600' fill='url(#g)'/><rect width='600' height='600' fill='url(#r)'/>" +
      (txt
        ? "<text x='300' y='300' dy='.35em' text-anchor='middle' font-family='Helvetica Neue,Helvetica,Arial,sans-serif' font-size='200' font-weight='700' letter-spacing='-4' fill='#fff' fill-opacity='.9'>" + txt + "</text>"
        : "<path d='M262 190v170a46 46 0 1 0 22 39V250l90-22v100a46 46 0 1 0 22 39V170z' fill='#fff' fill-opacity='.85'/>") +
      "</svg>";
    return (covers[key] = "data:image/svg+xml," + encodeURIComponent(svg));
  }

  /* The app's song list (Metro module of src/data/songs.ts), for titles behind cover URLs.
     Checked by shape, so a rebuild with other module ids just falls back to untitled covers. */
  var SONGS_MODULE = 1039, songIndex = null;
  function songByArt(url) {
    if (!songIndex) {
      try {
        var m = typeof W.__r === "function" ? W.__r(SONGS_MODULE) : null;
        var list = m && m.SONGS;
        if (Array.isArray(list) && list.length && list[0] && "artworkUrl" in list[0]) {
          songIndex = {};
          list.forEach(function (s) { if (s && s.artworkUrl) songIndex[s.artworkUrl] = s; });
        }
      } catch (err) { songIndex = null; }
    }
    return songIndex ? songIndex[url] || null : null;
  }
  function coverFor(url, title) {
    var s = title ? null : songByArt(url);
    return makeCover(title || (s && s.title) || "", url);
  }
  function isExternal(url) {
    try { var u = new URL(url, location.href); return /^https?:$/.test(u.protocol) && u.origin !== ORIGIN; } catch (err) { return false; }
  }

  /* RN Web loads every <Image> through `new Image()` with an onerror property handler. Wrap that
     setter: when an outside image fails, load the generated cover instead, so the loader reports
     success; then point the element's background at the generated cover too (failedArt). */
  var failedArt = {}, failedCount = 0;
  var errDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "onerror");
  if (errDesc && errDesc.set) {
    var onImgError = function (ev) {
      var img = this, url = img.getAttribute("src") || "";
      if (!img.__rsSwapped && isExternal(url)) {
        img.__rsSwapped = true;
        if (!failedArt[url]) { failedArt[url] = coverFor(url); failedCount++; note("cover-fail", url.slice(-40)); scheduleFix(true); }
        img.src = failedArt[url];
        return undefined;
      }
      var fn = img.__rsOnError;
      return typeof fn === "function" ? fn.call(img, ev) : undefined;
    };
    Object.defineProperty(HTMLImageElement.prototype, "onerror", {
      configurable: true, enumerable: true,
      get: function () { return this.__rsOnError || null; },
      set: function (fn) { this.__rsOnError = fn; errDesc.set.call(this, fn ? onImgError : null); }
    });
  }
  var URL_RE = /url\(["']?([^"')]+)["']?\)/;
  function fixEl(el) {
    var st = el.style, bg = st && st.backgroundImage;
    if (!bg || bg.indexOf("url(") < 0) return;
    var m = bg.match(URL_RE), ph = m && failedArt[m[1]];
    if (ph) st.backgroundImage = 'url("' + ph + '")';
  }
  var fixQueued = false, fixAll = false, fixNodes = [];
  function runFix() {
    fixQueued = false;
    if (fixAll) {
      fixAll = false; fixNodes = [];
      Array.prototype.forEach.call(D.querySelectorAll('[style*="url("]'), fixEl);
      return;
    }
    var list = fixNodes; fixNodes = [];
    for (var i = 0; i < list.length; i++) {
      var n = list[i];
      if (n.nodeType !== 1) continue;
      fixEl(n);
      if (n.firstElementChild) Array.prototype.forEach.call(n.querySelectorAll('[style*="url("]'), fixEl);
    }
  }
  function scheduleFix(all) {
    if (all) fixAll = true;
    if (!fixQueued) { fixQueued = true; setTimeout(runFix, 0); }
  }
  new MutationObserver(function (recs) {
    if (!failedCount) return;
    for (var i = 0; i < recs.length; i++) {
      var r = recs[i];
      if (r.type === "attributes") { if (r.target.style && r.target.style.backgroundImage) fixNodes.push(r.target); }
      else for (var j = 0; j < r.addedNodes.length; j++) fixNodes.push(r.addedNodes[j]);
    }
    if (fixNodes.length) scheduleFix(false);
  }).observe(D.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["style"] });

  /* ───── the app's player (React context value: current, isPlaying, togglePlay, next, ...) ───── */
  var provFiber = null;
  function isPlayer(v) { return !!v && typeof v === "object" && typeof v.togglePlay === "function" && typeof v.playTrack === "function" && "current" in v; }
  function findProvider() {
    var el = D.getElementById("root");
    if (!el) return null;
    var key = Object.keys(el).filter(function (k) { return k.indexOf("__reactContainer$") === 0; })[0];
    var host = key && el[key];
    var root = host && host.stateNode && host.stateNode.current ? host.stateNode.current : host;
    var stack = root ? [root] : [], n = 0;
    while (stack.length && n < 30000) {
      var f = stack.pop(); n++;
      var p = f.memoizedProps;
      if (p && isPlayer(p.value)) return f;
      if (f.sibling) stack.push(f.sibling);
      if (f.child) stack.push(f.child);
    }
    return null;
  }
  function app() {
    if (!provFiber) provFiber = findProvider();
    if (!provFiber) return null;
    /* read the committed copy of the fiber, not the work-in-progress one */
    var f = provFiber, top = f;
    while (top.return) top = top.return;
    var cur = top.stateNode && top.stateNode.current;
    if (cur && cur !== top && f.alternate) f = f.alternate;
    var v = f.memoizedProps && f.memoizedProps.value;
    if (!isPlayer(v)) { provFiber = null; return null; }
    return v;
  }

  /* ───── audio: follow the element the app's player actually plays ───── */
  var active = null, failedTracks = {}, streamBlocked = false;
  var MP = HTMLMediaElement.prototype, nativePlay = MP.play, nativePause = MP.pause;
  var EVENTS = ["play", "playing", "pause", "ended", "timeupdate", "durationchange", "loadedmetadata", "waiting", "seeked", "error"];
  function adopt(el) {
    if (active === el) return;
    if (active) EVENTS.forEach(function (t) { active.removeEventListener(t, onMedia); });
    active = el;
    EVENTS.forEach(function (t) { el.addEventListener(t, onMedia); });
    note("adopt", srcName(el));
  }
  function srcName(el) { var s = el && el.getAttribute("src") || ""; return s.slice(s.lastIndexOf("/") + 1, s.lastIndexOf("/") + 30); }

  MP.play = function () {
    var el = this;
    if (el instanceof HTMLAudioElement || el.tagName === "AUDIO") adopt(el);
    el.__rsWant = true;
    if (el.__rsDead) {
      /* the app retrying a song that already failed: don't hammer the network; settle the UI after this call */
      setTimeout(function () { settleStopped(el); }, 0);
      return Promise.resolve();
    }
    var p = nativePlay.apply(el, arguments);
    if (p && typeof p.then === "function") p.then(null, function (err) { onPlayRejected(el, err); });
    return p;
  };
  MP.pause = function () {
    this.__rsWant = false;
    return nativePause.apply(this, arguments);
  };

  function onPlayRejected(el, err) {
    var name = err && err.name;
    note("play-rejected", name);
    if (el !== active || name === "AbortError") return; /* play() interrupted by pause() or a new source: normal */
    if (name === "NotAllowedError") {
      /* autoplay refused (no tap yet): show paused, not a frozen "playing" */
      el.__rsWant = true;
      settleStopped(el, MSG_TAP);
      return;
    }
    if (name === "NotSupportedError") onStreamFail(el);
  }

  var lastPost = 0, postTimer = 0, sessionKey = "", posAt = 0;
  function onMedia(ev) {
    var el = ev.target;
    if (el !== active) return;
    if (ev.type === "error") { note("error", el.error && el.error.code); onStreamFail(el); return; }
    if (ev.type !== "timeupdate") note(ev.type, Math.round(el.currentTime * 10) / 10);
    if (ev.type === "timeupdate") { if (performance.now() - lastPost > 240) post(); }
    else post();
  }

  /* A song that can't load (blocked host, offline, 404): note it, then go to the next song in the
     queue that can play here. On a host that blocks outside media, only the bundled clips can. */
  function isLocalTrack(t) { return !!t && !!LOCAL[t.id]; }
  function onStreamFail(el) {
    if (el !== active || el.__rsDead) return;
    var src = el.getAttribute("src") || "";
    if (!src) return; /* the app clearing a player it's done with */
    el.__rsDead = true;
    var a = app(), cur = a && a.current;
    if (cur) failedTracks[cur.id] = true;
    if (isExternal(src)) streamBlocked = true;
    note("stream-fail", cur && cur.id);
    toast(MSG_STREAM);
    var next = null;
    if (a && cur && Array.isArray(a.queue)) {
      var q = a.queue, i = -1;
      for (var k = 0; k < q.length; k++) if (q[k] && q[k].id === cur.id) { i = k; break; }
      for (var j = i + 1; j < q.length; j++) {
        var t = q[j];
        if (t && !failedTracks[t.id] && (!streamBlocked || isLocalTrack(t))) { next = t; break; }
      }
    }
    post();
    afterLoading(function () {
      if (active !== el) return; /* the listener already moved on */
      var a2 = app();
      if (next && a2) { note("skip-to", next.id); a2.playTrack(next, { enqueueRest: false }); }
      else settleStopped(el);
    }, 900);
  }
  /* Wait for the app's own start-up loop for this song to finish, then act */
  function afterLoading(fn, minDelay) {
    var t0 = Date.now();
    (function wait() {
      var a = app();
      if (Date.now() - t0 >= minDelay && (!a || !a.isAudioLoading || Date.now() - t0 > 4500)) fn();
      else setTimeout(wait, 100);
    })();
  }
  /* Bring the app to "paused" through its own toggle, so its button, its state and the audio agree.
     The app's start-up loop for a song can still call play() and set "playing" after a failure, so for a
     dead song this keeps checking for a few seconds and settles again whenever the app drifts back. */
  function settleStopped(el, msg) {
    if (msg) toast(msg);
    if (el.__rsSettle) return;
    el.__rsSettle = true;
    var t0 = Date.now();
    function fix(a) {
      if (!el.__rsWant) a.togglePlay();      /* player thinks it's stopped: this marks it playing (no sound) */
      if (el.__rsWant) a.togglePlay();       /* ...and this pauses it, so isPlaying ends false */
      note("settled", !!a.isPlaying);
      post();
    }
    (function tick() {
      if (active !== el) { el.__rsSettle = false; return; }
      var a = app();
      /* wait for the app to commit this song (its toggle needs it) and finish its own start-up */
      if (a && a.current && !a.isAudioLoading) {
        if (el.__rsDead) {
          if (a.isPlaying || el.__rsWant) fix(a);
        } else {
          /* autoplay refused: once it really plays (a tap), stop watching */
          if (!el.paused) { el.__rsSettle = false; return; }
          if (el.__rsWant) { a.togglePlay(); note("settled", !!a.isPlaying); post(); }
        }
      }
      if (Date.now() - t0 < 6000) setTimeout(tick, 300);
      else el.__rsSettle = false;
    })();
  }

  /* ───── commands from the portfolio page ───── */
  function control(action, data) {
    var a = app();
    if (!a) return;
    var el = active;
    note("control", action);
    if (action === "pause") { if (el && el.__rsWant) a.togglePlay(); return; }
    if (action === "play") {
      if (el && el.__rsDead && a.current) {
        el.__rsDead = false;
        failedTracks[a.current.id] = false;
        a.playTrack(a.current, { enqueueRest: false }); /* one more try: the network may be back */
        return;
      }
      if (!el || !el.__rsWant) a.togglePlay();
      return;
    }
    if (action === "toggle") { control(el && el.__rsWant ? "pause" : "play"); return; }
    if (action === "next") { a.next(); return; }
    if (action === "prev") { a.previous(); return; }
    if (action === "seek" && data && isFinite(data.time)) { a.seekTo(Math.max(0, data.time * 1000)); }
  }
  W.addEventListener("message", function (ev) {
    if (ev.origin !== ORIGIN || ev.source !== W.parent || !EMBEDDED) return;
    var d = ev.data;
    if (!d || d.type !== "rs-control") return;
    if (d.action === "sync") { post(true); return; }
    control(d.action, d);
  });

  /* ───── state out: parent page + Media Session ───── */
  function snapshot() {
    var a = app(), t = a && a.current, el = active;
    var dur = el && isFinite(el.duration) && el.duration > 0 ? el.duration : (t && t.durationMs ? t.durationMs / 1000 : 0);
    var track = null;
    if (t) {
      track = {
        id: t.id, title: t.title, artist: t.artist, cover: t.artworkUrl || "",
        coverFailed: !!(t.artworkUrl && failedArt[t.artworkUrl]),
        placeholder: makeCover(t.title, t.artworkUrl), hue: hueOf(t.title),
        accent: t.accent || "", momentMs: t.p1Ms || 0
      };
      /* bitmap of the generated cover for OS media controls, once drawn */
      var r = rasters[track.placeholder];
      if (track.coverFailed && r && r !== 1) track.art = r;
    }
    var dead = !!(el && el.__rsDead);
    return {
      type: "rs-now-playing", v: 1, track: track,
      playing: !!(el && !el.paused && !el.ended && !dead),
      loading: !!(a && a.isAudioLoading),
      position: el ? el.currentTime || 0 : 0,
      duration: dur, error: dead ? "stream" : null, at: Date.now()
    };
  }
  var lastSent = "";
  function post(force) {
    lastPost = performance.now();
    clearTimeout(postTimer);
    var s = snapshot();
    session(s);
    if (!EMBEDDED) return;
    var key = JSON.stringify([s.track && s.track.id, s.track && s.track.coverFailed, s.playing, s.loading, s.error, Math.round(s.position * 4), Math.round(s.duration)]);
    if (!force && key === lastSent) return;
    lastSent = key;
    try { W.parent.postMessage(s, ORIGIN); } catch (err) { /* parent gone */ }
  }
  /* catch changes that come without an audio event (a new song picked, still loading) */
  setInterval(function () { if (D.getElementById("root")) post(); }, 700);

  function session(s) {
    var ms = navigator.mediaSession;
    if (!ms || !s.track) return;
    try {
      var key = s.track.id + "|" + s.track.coverFailed;
      if (key !== sessionKey && W.MediaMetadata) {
        sessionKey = key;
        var png = s.track.coverFailed || !s.track.cover ? rasterCover(s.track.placeholder, function () { sessionKey = ""; post(true); }) : null;
        var art = s.track.coverFailed || !s.track.cover
          ? (png ? [{ src: png, sizes: "512x512", type: "image/png" }] : [])
          : [{ src: s.track.cover, sizes: "600x600", type: "image/jpeg" }];
        ms.metadata = new MediaMetadata({ title: s.track.title, artist: s.track.artist, album: "Resonance prototype", artwork: art });
        [["play", function () { control("play"); }], ["pause", function () { control("pause"); }],
         ["nexttrack", function () { control("next"); }], ["previoustrack", function () { control("prev"); }],
         ["seekto", function (d) { if (d && isFinite(d.seekTime)) control("seek", { time: d.seekTime }); }]].forEach(function (h) {
          try { ms.setActionHandler(h[0], h[1]); } catch (err) { /* action not supported */ }
        });
      }
      ms.playbackState = s.playing ? "playing" : "paused";
      var now = performance.now();
      if (s.duration > 0 && (now - posAt > 900 || !s.playing)) {
        posAt = now;
        ms.setPositionState({ duration: s.duration, playbackRate: 1, position: Math.min(s.position, s.duration) });
      }
    } catch (err) { /* older browsers */ }
  }

  /* OS media UIs want a bitmap: draw the generated SVG cover into a PNG once, then refresh */
  var rasters = {};
  function rasterCover(svgUrl, done) {
    if (rasters[svgUrl]) return rasters[svgUrl] === 1 ? null : rasters[svgUrl];
    rasters[svgUrl] = 1;
    var im = new Image();
    im.onload = function () {
      try {
        var c = D.createElement("canvas"); c.width = c.height = 512;
        c.getContext("2d").drawImage(im, 0, 0, 512, 512);
        rasters[svgUrl] = c.toDataURL("image/png");
        done();
      } catch (err) { /* keep the session without artwork */ }
    };
    im.src = svgUrl;
    return null;
  }

  /* ───── a small note at the bottom of the app ───── */
  var toastEl = null, toastTimer = 0;
  function toast(text) {
    if (!D.body) return;
    if (!toastEl) {
      toastEl = D.createElement("div");
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      toastEl.style.cssText = "position:fixed;left:50%;bottom:132px;z-index:2147483647;max-width:calc(100% - 40px);" +
        "box-sizing:border-box;padding:10px 14px;border-radius:12px;background:rgba(40,40,40,.96);color:#fff;" +
        "font:500 13px/1.35 -apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;text-align:center;" +
        "box-shadow:0 8px 24px rgba(0,0,0,.4);pointer-events:none;opacity:0;transform:translate(-50%,8px);" +
        "transition:opacity .22s ease,transform .22s ease;";
      D.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.style.opacity = "1";
    toastEl.style.transform = "translate(-50%,0)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.style.opacity = "0"; toastEl.style.transform = "translate(-50%,8px)"; }, 3400);
  }

  W.__RS_BRIDGE__ = { active: function () { return active; }, log: log, snapshot: snapshot, control: control, app: app, failedArt: failedArt, failedTracks: failedTracks, toast: toast };
})();
