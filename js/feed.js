/* NIGHT CREW — Broadcast Feed grammar (B1).
   Verbs per /handoff/grammar-contract.md (normative):
   CUT=tap · DOLLY=native scroll (never intercepted) · RACK=hold 0.7s,
   release falls back at 2× · WIPE=right edge only · RETAKE=↻ (TAKE
   increments; no cut number, no edition stamp — B1 has no provenance
   store, so none is claimed). Leader black: 2 frames (83ms), one gap
   per 400ms window, omitted under prefers-reduced-motion. */
(function () {
  'use strict';

  var reel = document.getElementById('reel');
  var leader = document.getElementById('leader');
  var flat = document.getElementById('flat');
  var clapper = document.getElementById('clapper');
  var clapperTake = document.getElementById('clapper-take');
  var gate = document.getElementById('gate');
  var hudSlug = document.getElementById('hud-slug');
  var hudTake = document.getElementById('hud-take');
  var hudKey = document.getElementById('hud-key');
  var hudTc = document.getElementById('hud-tc');
  var textfeed = document.getElementById('textfeed');
  var rail = document.getElementById('wipe-rail');
  var tab = document.getElementById('wipe-tab');
  var retakeBtn = document.getElementById('retake');

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LEADER_MS = 83;      /* 2 frames @ 24fps */
  var LEADER_WINDOW = 400; /* one gap per window; cuts inside land hard */
  var RACK_MS = 700;
  var RAIL_MS = 400;
  var WIPE_MS = 420;
  var CLAPPER_MS = 333;    /* 8 frames */

  var lastLeader = 0;
  var current = null;      /* current frame element */
  var take = 1;
  var seed = 0;

  function track(name) { if (window.gtag) { window.gtag('event', name); } }

  /* verb legend (HUD element 3): each verb fades to 30% after its first
     use; any 10s of idle restores the full line */
  var verbsEl = document.getElementById('verbs');
  var verbIdle = null;
  function verbUsed(v) {
    if (!verbsEl) return;
    var s = verbsEl.querySelector('[data-verb="' + v + '"]');
    if (s) s.classList.add('spent');
    if (verbIdle) clearTimeout(verbIdle);
    verbIdle = setTimeout(function () {
      [].forEach.call(verbsEl.querySelectorAll('.spent'), function (x) { x.classList.remove('spent'); });
    }, 10000);
  }

  function frames() { return [].slice.call(reel.querySelectorAll('.frame')); }

  /* ---------- HUD: key label + honest timecode (the device clock) ---------- */

  hudKey.textContent = (document.documentElement.getAttribute('data-key') || 'morning').toUpperCase() + ' KEY';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tc() {
    var d = new Date();
    var ff = Math.floor(d.getMilliseconds() / (1000 / 24));
    hudTc.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + '·' + pad(ff);
  }
  tc();
  setInterval(tc, 125); /* the frame digits tick without a 60fps loop */

  /* ---------- current-frame tracking (slate re-registers) ----------
     Derived from scroll position (the shot under the gate line at
     mid-viewport) — no observers, verifiable everywhere. */

  var scroller = document.scrollingElement || document.documentElement;

  function updateCurrent() {
    var mid = scroller.scrollTop + window.innerHeight / 2;
    var list = frames(), next = list[0];
    for (var i = 0; i < list.length; i++) {
      if (list[i].offsetTop <= mid) next = list[i]; else break;
    }
    if (next !== current) {
      current = next;
      hudSlug.textContent = 'NIGHT CREW · ' + current.dataset.chapter;
      textfeed.href = current.dataset.ez || '/';
    }
  }
  updateCurrent();

  /* ---------- leader black (CUT) ---------- */

  var lastJump = 0;

  function jumpTo(frame) {
    if (!frame) return;
    /* 'instant', not 'auto': the root carries scroll-behavior:smooth,
       and a CUT is 0ms by contract */
    lastJump = performance.now();
    frame.scrollIntoView({ behavior: 'instant', block: 'start' });
    updateCurrent();
  }

  function cutTo(frame) {
    if (!frame) return;
    var now = performance.now();
    if (!RM && now - lastLeader > LEADER_WINDOW) {
      lastLeader = now;
      leader.classList.add('on');
      jumpTo(frame);
      setTimeout(function () { leader.classList.remove('on'); }, LEADER_MS);
    } else {
      jumpTo(frame); /* inside the window (or reduced motion): lands hard */
    }
    track('feed_cut');
    verbUsed('cut');
  }

  function neighbor(dir) {
    var list = frames();
    var i = list.indexOf(current);
    if (i < 0) i = 0;
    var j = i + dir;
    if (j < 0 || j >= list.length) return null;
    return list[j];
  }

  /* ---------- CUT = tap (not on links, buttons, cans, or the table) ---------- */

  var suppressCutUntil = 0;

  reel.addEventListener('click', function (e) {
    if (performance.now() < suppressCutUntil) return;
    if (e.target.closest('a, button, .can, .table, input, select, textarea')) return;
    if (String(window.getSelection && window.getSelection())) return;
    cutTo(neighbor(1));
  });

  /* ---------- RACK = hold (frame planes) + The Pull (cans) ---------- */

  function gateOn() { gate.classList.remove('drain'); gate.classList.add('on'); }
  function gateDrain() {
    gate.classList.add('drain');
    setTimeout(function () { gate.classList.remove('on', 'drain'); }, 350);
  }

  var rackArm = null, rackFrame = null, rackStartAt = 0, rackStartXY = null;

  reel.addEventListener('pointerdown', function (e) {
    var canEl = e.target.closest('.can');
    if (canEl) { pullDown(e, canEl); return; }
    if (e.target.closest('a, button, .table')) return;
    var frame = e.target.closest('.frame');
    if (!frame || frame.classList.contains('tabled')) return;
    rackStartXY = [e.clientX, e.clientY];
    /* arm after a beat so DOLLY (scroll) never reads as a rack */
    rackArm = setTimeout(function () {
      rackFrame = frame;
      rackStartAt = performance.now();
      frame.classList.add('racked');
      gateOn();
      track('feed_rack');
      verbUsed('rack');
    }, 120);
  });

  function rackRelease() {
    if (rackArm) { clearTimeout(rackArm); rackArm = null; }
    if (rackFrame) {
      rackFrame.classList.remove('racked'); /* falls back at 2× (0.35s CSS default) */
      gateDrain();
      if (performance.now() - rackStartAt > 250) {
        suppressCutUntil = performance.now() + 350; /* a hold is not a tap */
      }
      rackFrame = null;
    }
  }

  reel.addEventListener('pointermove', function (e) {
    if (rackArm && rackStartXY) {
      var dx = e.clientX - rackStartXY[0], dy = e.clientY - rackStartXY[1];
      if (dx * dx + dy * dy > 64) { clearTimeout(rackArm); rackArm = null; } /* it's a scroll */
    }
  });
  ['pointerup', 'pointercancel'].forEach(function (ev) {
    reel.addEventListener(ev, rackRelease);
  });

  /* ---------- The Pull: HOLD → RAIL-OUT → LIGHT TABLE → STRIP = TOC ---------- */

  var pullTimer = null, pullReady = false, pullFrame = null, pullCan = null;

  function pullDown(e, canEl) {
    e.preventDefault();
    pullFrame = canEl.closest('.frame');
    pullCan = canEl;
    pullReady = false;
    pullFrame.classList.add('isolated');
    gateOn();
    pullTimer = setTimeout(function () { pullReady = true; }, RACK_MS);
    canEl.addEventListener('pointerup', pullUp, { once: true });
    canEl.addEventListener('pointercancel', pullAbort, { once: true });
    try { canEl.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
    track('feed_pull');
    verbUsed('rack');
  }

  function pullAbort() {
    if (pullTimer) clearTimeout(pullTimer);
    if (pullFrame) pullFrame.classList.remove('isolated');
    gateDrain();
    pullFrame = null; pullCan = null; pullReady = false;
  }

  function pullUp() {
    if (pullTimer) clearTimeout(pullTimer);
    gateDrain();
    if (!pullFrame) return;
    if (!pullReady) { pullAbort(); return; } /* early release: falls back at 2× */
    var frame = pullFrame, id = pullCan.dataset.pull;
    frame.classList.add('railed');
    setTimeout(function () {
      frame.classList.add('tabled');
      var table = document.getElementById('tbl-' + id);
      if (table) {
        table.hidden = false;
        wireTable(table);
        var first = table.querySelector('.strip button');
        if (first) first.focus({ preventScroll: true });
      }
    }, RM ? 0 : RAIL_MS);
    pullFrame = null; pullCan = null; pullReady = false;
  }

  function reCan(frame) {
    var table = frame.querySelector('.table');
    frame.classList.remove('tabled');
    if (table) table.hidden = true;
    setTimeout(function () { frame.classList.remove('railed', 'isolated'); }, 20);
  }

  function wireTable(table) {
    if (table.dataset.wired) return;
    table.dataset.wired = '1';
    var beats = [].slice.call(table.querySelectorAll('.beat'));
    var btns = [].slice.call(table.querySelectorAll('.strip button'));
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var beat = beats[+b.dataset.beat];
        if (beat) beat.scrollIntoView({ behavior: 'auto', block: 'start' }); /* CUT: 0ms */
        btns.forEach(function (x) { x.removeAttribute('aria-current'); });
        b.setAttribute('aria-current', 'true');
        track('feed_cut');
      });
    });
  }

  /* ---------- WIPE — right edge only (22px rail + tab) ---------- */

  function wipe(dir) {
    var tabled = current && current.classList.contains('tabled');
    if (tabled) { reCan(current); track('feed_wipe'); verbUsed('wipe'); return; } /* WIPE re-cans */
    var target = neighbor(dir);
    if (!target) return;
    track('feed_wipe');
    verbUsed('wipe');
    if (RM) { jumpTo(target); return; }
    flat.classList.add('run');
    setTimeout(function () { jumpTo(target); }, WIPE_MS / 2); /* slate re-registers as the seam crosses */
    setTimeout(function () { flat.classList.remove('run'); }, WIPE_MS);
  }

  var railX = null;
  rail.addEventListener('pointerdown', function (e) { railX = e.clientX; });
  rail.addEventListener('pointermove', function (e) {
    if (railX !== null && railX - e.clientX > 24) { railX = null; wipe(1); }
  });
  ['pointerup', 'pointercancel'].forEach(function (ev) {
    rail.addEventListener(ev, function () { railX = null; });
  });
  tab.addEventListener('click', function () { wipe(1); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') wipe(1);
    if (e.key === 'ArrowLeft') wipe(-1);
  });

  /* ---------- RETAKE — honest, seeded, client-side ----------
     TAKE increments; the arrangement is a deterministic function of the
     seed. Nothing here claims composition, history, or an archive. */

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function applySeed(s) {
    if (!s) return; /* seed 0 = the natural order of the print */
    var rnd = mulberry32(s);
    var list = frames();
    var mid = list.filter(function (f) { return !f.dataset.fixed; });
    /* Fisher–Yates on the middle chapters */
    for (var i = mid.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = mid[i]; mid[i] = mid[j]; mid[j] = t;
    }
    var end = list.filter(function (f) { return f.dataset.fixed === 'end'; })[0];
    mid.forEach(function (f) { reel.insertBefore(f, end); });
    /* emphasis: seeded rotation of each stat band */
    frames().forEach(function (f) {
      var stats = f.querySelector('.fr-stats');
      if (!stats || stats.children.length < 2) return;
      var turns = Math.floor(rnd() * stats.children.length);
      for (var k = 0; k < turns; k++) stats.appendChild(stats.firstElementChild);
    });
  }

  function retake() {
    take += 1;
    seed = (Math.random() * 0x7FFFFFFF) | 0 || 1;
    try { sessionStorage.setItem('feed-take', JSON.stringify({ take: take, seed: seed })); } catch (err) {}
    hudTake.textContent = 'TAKE ' + take;
    clapperTake.textContent = 'TAKE ' + take;
    var stay = current; /* retake sticks close: the Nº of the shot you're on holds */
    var apply = function () {
      if (stay && stay.classList.contains('tabled')) reCan(stay);
      applySeed(seed);
      if (stay) stay.scrollIntoView({ behavior: 'auto', block: 'start' });
    };
    if (RM) { apply(); } else {
      clapper.classList.add('on');
      apply();
      setTimeout(function () { clapper.classList.remove('on'); }, CLAPPER_MS);
    }
    track('feed_retake');
    verbUsed('retake');
  }
  retakeBtn.addEventListener('click', retake);

  /* restore this session's take (a reload is not a new attempt) */
  try {
    var saved = JSON.parse(sessionStorage.getItem('feed-take') || 'null');
    if (saved && saved.take > 1) {
      take = saved.take; seed = saved.seed;
      hudTake.textContent = 'TAKE ' + take;
      applySeed(seed);
    }
  } catch (err) {}

  /* ---------- DOLLY parallax: BG ×0.2, MID ×0.6 (declared once) ---------- */

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      updateCurrent();
      /* a CUT/WIPE jump also scrolls — only hand-driven scroll is a DOLLY */
      if (performance.now() - lastJump > 400) verbUsed('dolly');
      if (RM) return; /* slate tracking always; parallax only with motion */
      var st = scroller.scrollTop, vh = window.innerHeight;
      frames().forEach(function (f) {
        var top = f.offsetTop - st;
        if (top > vh || top < -f.offsetHeight) return;
        var bw = f.querySelector('.backwall');
        var card = f.querySelector('.card');
        if (bw) bw.style.translate = '0 ' + (-top * 0.8).toFixed(1) + 'px';   /* BG rides at ×0.2 */
        if (card && !f.classList.contains('tabled')) {
          card.style.translate = '0 ' + (-top * 0.4).toFixed(1) + 'px';       /* MID rides at ×0.6 */
        }
      });
    });
  }, { passive: true }); /* DOLLY is never intercepted — listener is passive */

  /* belt-and-braces: some engines coalesce programmatic scrolls without
     events; the slate must re-register regardless */
  setInterval(updateCurrent, 300);

  /* text feed + QA hooks */
  textfeed.addEventListener('click', function () { track('feed_textfeed'); });
  window.__feed = { cutTo: cutTo, wipe: wipe, retake: retake, frames: frames, applySeed: applySeed, state: function () { return { take: take, seed: seed, chapter: current && current.dataset.chapter }; } };
})();
