/* SAVED FOR LATER, not loaded on the site yet (Kabir, 25 Nov 2026): hold-to-edit board.
   To turn it on: load this file before app.js in index.html; apply the app.js changes and the CSS
   from assets/craft/saved/ (board-edit.app.patch, board-edit.css). In short, app.js calls
   CraftBoardEdit.useBoardEdit({ enabled: layout === "grid" && !sheet && !playground && !pgBoard, cols: 5 }),
   spreads edit.gridProps on .cr-grid, edit.slotProps(slot) on each .cr-slot (in edit.order),
   adds edit.handle(slot) inside each slot and edit.bar in the stage, sets --cr-rows on .cr-board,
   passes edit.rows to useBoardScale, ends editing on an empty-space tap, and pauses the wallpaper
   shuffle while editing. */
/* Board edit mode, like the iPad home screen.
   Press and hold any card (~0.45s) and the board goes into edit mode: cards shake, each one can be
   dragged to a new place (the others reflow around it), and a corner arc resizes it between the sizes
   that card supports (small 1x1, wide 2x1, large 2x2). The profile can move but not resize.
   Done, Escape, or a tap on empty space leaves edit mode. The layout is saved in this browser.
   Cards are packed in order, first fit, left to right and top to bottom, so the default order and
   sizes reproduce the original board exactly. Desktop grid only; tablet and phone keep their layouts.
   Exposes window.CraftBoardEdit.useBoardEdit(opts), used by app.js. */
(function () {
  "use strict";
  var React = window.React;
  if (!React) return;
  var h = React.createElement, useState = React.useState, useRef = React.useRef, useEffect = React.useEffect, useLayoutEffect = React.useLayoutEffect;

  var KEY = "ga-board-layout-v1";
  var HOLD_MS = 450, SLOP = 8;
  var DEFAULT_ORDER = ["cases", "exp", "date", "orb", "pg", "chat", "np", "hello"];
  var DEFAULT_SIZE = { cases: "l", chat: "l", exp: "s", date: "s", orb: "s", pg: "s", np: "s", hello: "s" };
  var ALLOWED = { cases: ["s", "w", "l"], chat: ["s", "w", "l"], exp: ["s", "w"], date: ["s", "w"], orb: ["s"], pg: ["s", "w"], np: ["s", "l"], hello: ["s", "w"] };
  var DIM = { s: [1, 1], w: [2, 1], l: [2, 2] };
  var NAMES = { cases: "Case studies", chat: "Featured project", exp: "Experience", date: "Book a call", orb: "Profile", pg: "Design Playground", np: "Resonance", hello: "Say hello" };
  var SIZE_NAMES = { s: "small", w: "wide", l: "large" };

  function reduced() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }

  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!v || !Array.isArray(v.order)) return null;
      var order = v.order.filter(function (s) { return DEFAULT_ORDER.indexOf(s) >= 0; });
      DEFAULT_ORDER.forEach(function (s) { if (order.indexOf(s) < 0) order.push(s); });
      var size = {};
      DEFAULT_ORDER.forEach(function (s) { var z = v.size && v.size[s]; size[s] = ALLOWED[s].indexOf(z) >= 0 ? z : DEFAULT_SIZE[s]; });
      return { order: order, size: size };
    } catch (e) { return null; }
  }
  function save(st) {
    try {
      var same = st.order.join() === DEFAULT_ORDER.join() && DEFAULT_ORDER.every(function (s) { return st.size[s] === DEFAULT_SIZE[s]; });
      if (same) localStorage.removeItem(KEY); else localStorage.setItem(KEY, JSON.stringify(st));
    } catch (e) { /* ignore */ }
  }

  /* First-fit packing: each card takes the first free spot, reading left to right, top to bottom */
  function pack(order, size, cols) {
    var taken = [], pos = {}, rows = 0;
    function free(r, c, w, hh) {
      for (var y = r; y < r + hh; y++) for (var x = c; x < c + w; x++) if (taken[y] && taken[y][x]) return false;
      return true;
    }
    order.forEach(function (s) {
      var d = DIM[size[s]], w = Math.min(d[0], cols), hh = d[1];
      for (var r = 0; ; r++) {
        for (var c = 0; c + w <= cols; c++) {
          if (free(r, c, w, hh)) {
            for (var y = r; y < r + hh; y++) { taken[y] = taken[y] || []; for (var x = c; x < c + w; x++) taken[y][x] = s; }
            pos[s] = { c: c, r: r, w: w, h: hh };
            rows = Math.max(rows, r + hh);
            return;
          }
        }
      }
    });
    return { pos: pos, rows: Math.max(rows, 3), taken: taken };
  }

  function metrics(grid) {
    var cs = getComputedStyle(grid);
    var W = parseFloat(cs.getPropertyValue("--widget")) || 160, G = parseFloat(cs.getPropertyValue("--gutter")) || 23;
    var rect = grid.getBoundingClientRect();
    var scale = grid.offsetWidth ? rect.width / grid.offsetWidth : 1;
    return { W: W, G: G, step: W + G, rect: rect, scale: scale || 1 };
  }

  function useBoardEdit(opts) {
    var enabled = !!opts.enabled, cols = opts.cols || 5;
    var _st = useState(function () { return load() || { order: DEFAULT_ORDER.slice(), size: Object.assign({}, DEFAULT_SIZE) }; }),
      st = _st[0], setSt = _st[1];
    var _ed = useState(false), editing = _ed[0], setEditing = _ed[1];
    var _dr = useState(null), drag = _dr[0], setDrag = _dr[1]; /* { slot, x, y } desired top-left in board px */
    var gridRef = useRef(null);
    var hold = useRef(null), swallow = useRef(false), act = useRef(null), prevPos = useRef({}), visual = useRef(null);
    var stRef = useRef(st); stRef.current = st;

    var packed = pack(st.order, st.size, cols);

    useEffect(function () { save(st); }, [st]);
    useEffect(function () { if (!enabled && editing) { setEditing(false); setDrag(null); } }, [enabled]);

    /* Escape leaves edit mode */
    useEffect(function () {
      if (!editing) return undefined;
      var onKey = function (ev) { if (ev.key === "Escape") { ev.preventDefault(); setEditing(false); setDrag(null); } };
      window.addEventListener("keydown", onKey);
      return function () { window.removeEventListener("keydown", onKey); };
    }, [editing]);

    /* While editing, the cards themselves are inert: no links, no playing, no tab stops inside */
    useLayoutEffect(function () {
      var g = gridRef.current; if (!g) return;
      Array.prototype.forEach.call(g.querySelectorAll(":scope > .cr-slot > :first-child"), function (n) {
        if (n.classList.contains("cr-edit-handle")) return;
        if (editing) n.setAttribute("inert", ""); else n.removeAttribute("inert");
      });
    }, [editing]);

    /* Cards glide to their new spots (FLIP on offsetLeft/Top, which ignore the board's scale) */
    var layoutKey = st.order.map(function (s) { var p = packed.pos[s]; return s + p.c + p.r + p.w + p.h; }).join("|");
    useLayoutEffect(function () {
      var g = gridRef.current; if (!g) return;
      var now = {};
      Array.prototype.forEach.call(g.querySelectorAll(":scope > .cr-slot[data-slot]"), function (n) {
        var s = n.getAttribute("data-slot");
        now[s] = { x: n.offsetLeft, y: n.offsetTop };
        var was = prevPos.current[s];
        if (visual.current && visual.current.slot === s) { was = visual.current; visual.current = null; }
        if (!was || (drag && drag.slot === s) || reduced() || !n.animate) return;
        var dx = was.x - now[s].x, dy = was.y - now[s].y;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        n.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }],
          { duration: 420, easing: "cubic-bezier(0.2, 0.9, 0.25, 1.05)" });
      });
      prevPos.current = now;
    }, [layoutKey, enabled, drag ? drag.slot : null]);

    function exit() { setEditing(false); setDrag(null); }
    function reset() { setSt({ order: DEFAULT_ORDER.slice(), size: Object.assign({}, DEFAULT_SIZE) }); }

    function moveTo(slot, index) {
      setSt(function (cur) {
        var o = cur.order.filter(function (s) { return s !== slot; });
        index = Math.max(0, Math.min(o.length, index));
        o.splice(index, 0, slot);
        return o.join() === cur.order.join() ? cur : { order: o, size: cur.size };
      });
    }
    function resize(slot, z) {
      if (ALLOWED[slot].indexOf(z) < 0) return;
      setSt(function (cur) {
        if (cur.size[slot] === z) return cur;
        var size = Object.assign({}, cur.size); size[slot] = z;
        return { order: cur.order, size: size };
      });
    }
    function cycle(slot, dir) {
      var a = ALLOWED[slot], i = a.indexOf(stRef.current.size[slot]);
      var j = dir ? Math.max(0, Math.min(a.length - 1, i + dir)) : (i + 1) % a.length;
      resize(slot, a[j]);
    }

    function slotFrom(target) {
      var g = gridRef.current, n = target && target.closest ? target.closest(".cr-slot[data-slot]") : null;
      return n && n.parentNode === g ? n : null;
    }

    function startDrag(el, ev) {
      var g = gridRef.current, m = metrics(g), slot = el.getAttribute("data-slot");
      var p = pack(stRef.current.order, stRef.current.size, cols).pos[slot];
      var px = (ev.clientX - m.rect.left) / m.scale, py = (ev.clientY - m.rect.top) / m.scale;
      act.current = { kind: "drag", slot: slot, id: ev.pointerId, gx: px - p.c * m.step, gy: py - p.r * m.step, sx: ev.clientX, sy: ev.clientY, live: false, cell: null };
      try { el.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
    }

    function onMoveDrag(ev) {
      var a = act.current; if (!a || a.kind !== "drag" || ev.pointerId !== a.id) return;
      if (!a.live) {
        if (Math.hypot(ev.clientX - a.sx, ev.clientY - a.sy) < 4) return;
        a.live = true;
      }
      var g = gridRef.current, m = metrics(g);
      var x = (ev.clientX - m.rect.left) / m.scale - a.gx, y = (ev.clientY - m.rect.top) / m.scale - a.gy;
      setDrag({ slot: a.slot, x: x, y: y });
      /* which card is under the dragged card's centre: take its place in the order */
      var cur = stRef.current, d = DIM[cur.size[a.slot]];
      var cx = x + (d[0] * m.W + (d[0] - 1) * m.G) / 2, cy = y + (d[1] * m.W + (d[1] - 1) * m.G) / 2;
      var col = Math.floor(cx / m.step), row = Math.floor(cy / m.step);
      var cell = col + "," + row;
      if (cell === a.cell) return;
      a.cell = cell;
      /* like the iPad, the others only make room once the card rests over a spot for a moment */
      clearTimeout(a.wait);
      a.wait = setTimeout(function () { a.apply = null; settle(a.slot, col, row); }, 160);
      a.apply = function () { clearTimeout(a.wait); settle(a.slot, col, row); };
    }
    function settle(slot, col, row) {
      if (col < 0 || row < 0 || col >= cols) return;
      var cur = stRef.current, pk = pack(cur.order, cur.size, cols);
      var under = pk.taken[row] && pk.taken[row][col];
      if (under && under !== slot) moveTo(slot, cur.order.indexOf(under));
      else if (!under && row >= pk.rows - 1) moveTo(slot, cur.order.length); /* empty space at the end */
    }

    function endDrag(ev) {
      var a = act.current; if (!a || a.kind !== "drag" || (ev && ev.pointerId !== a.id)) return;
      act.current = null;
      if (a.apply) a.apply();
      if (a.live) {
        var g = gridRef.current, n = g && g.querySelector(".cr-slot[data-slot='" + a.slot + "']");
        if (n) {
          var r = n.style.transform.match(/-?[\d.]+/g);
          visual.current = { slot: a.slot, x: n.offsetLeft + (r ? +r[0] : 0), y: n.offsetTop + (r ? +r[1] : 0) };
        }
        swallow.current = true;
      }
      setDrag(null);
    }

    /* Resize: drag the corner arc; nearest allowed size wins. A tap on it steps to the next size. */
    function onHandleDown(slot, ev) {
      ev.stopPropagation(); ev.preventDefault();
      var g = gridRef.current, m = metrics(g), d = DIM[stRef.current.size[slot]];
      act.current = { kind: "size", slot: slot, id: ev.pointerId, sx: ev.clientX, sy: ev.clientY,
        w0: d[0] * m.W + (d[0] - 1) * m.G, h0: d[1] * m.W + (d[1] - 1) * m.G, moved: false };
      try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
    }
    function onHandleMove(ev) {
      var a = act.current; if (!a || a.kind !== "size" || ev.pointerId !== a.id) return;
      var m = metrics(gridRef.current);
      var dx = (ev.clientX - a.sx) / m.scale, dy = (ev.clientY - a.sy) / m.scale;
      if (!a.moved && Math.hypot(dx, dy) < 6) return;
      a.moved = true;
      var w = a.w0 + dx, hh = a.h0 + dy, best = null, bd = Infinity;
      ALLOWED[a.slot].forEach(function (z) {
        var D = DIM[z], ww = D[0] * m.W + (D[0] - 1) * m.G, wh = D[1] * m.W + (D[1] - 1) * m.G;
        var dist = Math.abs(ww - w) + Math.abs(wh - hh);
        if (dist < bd) { bd = dist; best = z; }
      });
      resize(a.slot, best);
    }
    function onHandleUp(ev) {
      var a = act.current; if (!a || a.kind !== "size" || ev.pointerId !== a.id) return;
      act.current = null;
      if (!a.moved) cycle(a.slot);
      swallow.current = true;
    }

    /* Press and hold to start editing; the held card is picked up right away */
    function cancelHold() { if (hold.current) { clearTimeout(hold.current.t); hold.current = null; } }
    var gridProps = {
      ref: gridRef,
      onPointerDownCapture: function (ev) {
        if (!enabled || ev.button > 0) return;
        var el = slotFrom(ev.target);
        if (editing) {
          if (!el || (ev.target.closest && ev.target.closest(".cr-edit-handle"))) return;
          startDrag(el, ev);
          return;
        }
        if (!el) return;
        cancelHold();
        var x = ev.clientX, y = ev.clientY, pid = ev.pointerId;
        hold.current = { x: x, y: y, el: el, t: setTimeout(function () {
          var hd = hold.current; hold.current = null;
          if (!hd) return;
          swallow.current = true;
          if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) { /* ignore */ } }
          var sel = window.getSelection && window.getSelection(); if (sel && sel.removeAllRanges) sel.removeAllRanges();
          setEditing(true);
          startDrag(hd.el, { clientX: x, clientY: y, pointerId: pid });
        }, HOLD_MS) };
      },
      onPointerMove: function (ev) {
        if (hold.current && Math.hypot(ev.clientX - hold.current.x, ev.clientY - hold.current.y) > SLOP) cancelHold();
        onMoveDrag(ev);
      },
      onPointerUp: function (ev) { cancelHold(); endDrag(ev); },
      onPointerCancel: function (ev) { cancelHold(); endDrag(ev); },
      onDragStart: function (ev) { if (editing) ev.preventDefault(); cancelHold(); }, /* a row dragged to Playground still works */
      onContextMenu: function (ev) { if (hold.current || editing) ev.preventDefault(); },
      onClickCapture: function (ev) {
        if (swallow.current) { swallow.current = false; ev.preventDefault(); ev.stopPropagation(); return; }
        if (editing && slotFrom(ev.target)) { ev.preventDefault(); ev.stopPropagation(); }
      }
    };

    function slotProps(slot) {
      if (!enabled) return {};
      var p = packed.pos[slot], z = st.size[slot];
      var style = { gridArea: (p.r + 1) + " / " + (p.c + 1) + " / span " + p.h + " / span " + p.w };
      var dragging = drag && drag.slot === slot;
      if (dragging) {
        var m = gridRef.current ? metrics(gridRef.current) : { step: 183 };
        style.transform = "translate(" + (drag.x - p.c * m.step).toFixed(1) + "px," + (drag.y - p.r * m.step).toFixed(1) + "px)";
      }
      var props = { "data-slot": slot, "data-size": z, style: style, "data-dragging": dragging ? "" : undefined };
      if (editing) {
        var canSize = ALLOWED[slot].length > 1;
        props.tabIndex = 0;
        props.role = "button";
        props["aria-roledescription"] = "movable card";
        props["aria-label"] = NAMES[slot] + ", " + SIZE_NAMES[z] + ". Arrow keys move it" + (canSize ? ", plus and minus resize it" : "") + ". Escape when done.";
        props.onKeyDown = function (ev) {
          var i = stRef.current.order.indexOf(slot);
          if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") { ev.preventDefault(); moveTo(slot, i - 1); }
          else if (ev.key === "ArrowRight" || ev.key === "ArrowDown") { ev.preventDefault(); moveTo(slot, i + 1); }
          else if (ev.key === "+" || ev.key === "=") { ev.preventDefault(); cycle(slot, 1); }
          else if (ev.key === "-" || ev.key === "_") { ev.preventDefault(); cycle(slot, -1); }
          else if (ev.key === "Enter") { ev.preventDefault(); exit(); }
          if (ev.key.indexOf("Arrow") === 0 || ev.key === "+" || ev.key === "=" || ev.key === "-") {
            var t = ev.currentTarget; requestAnimationFrame(function () { if (t.isConnected) t.focus({ preventScroll: true }); });
          }
        };
      }
      return props;
    }

    /* Corner arc for resizing, or a small lock on the profile */
    function handle(slot) {
      if (!enabled || !editing) return null;
      if (ALLOWED[slot].length < 2) {
        return h("span", { key: "eh", className: "cr-edit-lock", "aria-hidden": "true" },
          h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
            h("rect", { x: 5, y: 11, width: 14, height: 9, rx: 2 }), h("path", { d: "M8 11V8a4 4 0 0 1 8 0v3" })));
      }
      return h("span", { key: "eh", className: "cr-edit-handle", "aria-hidden": "true",
        onPointerDown: function (ev) { onHandleDown(slot, ev); }, onPointerMove: onHandleMove,
        onPointerUp: onHandleUp, onPointerCancel: onHandleUp },
        h("svg", { viewBox: "0 0 40 40", fill: "none" }, h("path", { d: "M33 9 A24 24 0 0 1 9 33", stroke: "currentColor", strokeWidth: 5, strokeLinecap: "round" })));
    }

    /* Done / Reset pill, only while editing (not on the top bar) */
    var bar = editing ? h("div", { className: "cr-edit-bar", role: "toolbar", "aria-label": "Edit board" },
      h("span", { className: "cr-edit-hint" }, "Drag to move, drag a corner to resize"),
      h("button", { type: "button", className: "cr-edit-btn", onClick: function (ev) { ev.stopPropagation(); reset(); } }, "Reset"),
      h("button", { type: "button", className: "cr-edit-btn cr-edit-btn--done", onClick: function (ev) { ev.stopPropagation(); exit(); } }, "Done")) : null;

    return {
      enabled: enabled, editing: editing, dragging: !!drag, order: enabled ? st.order : null, rows: enabled ? packed.rows : 3,
      gridProps: gridProps, slotProps: slotProps, handle: handle, bar: bar, exit: exit,
      gridClass: enabled ? (" is-packed" + (editing ? " is-editing" : "") + (drag ? " is-dragging" : "")) : ""
    };
  }

  window.CraftBoardEdit = { useBoardEdit: useBoardEdit, pack: pack, DEFAULT_ORDER: DEFAULT_ORDER };
})();
