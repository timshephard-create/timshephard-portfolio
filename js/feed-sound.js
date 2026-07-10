/* NIGHT CREW — feed sound (B1.5, gap 3).
   Grammar-contract sound cues, synthesized in WebAudio only — no audio
   files ship. Mag-splice chunk (CUT), rubber-wheel rumble with velocity
   pitch (DOLLY), follow-focus whir + felt stop (RACK), fabric sweep
   (WIPE), slate clap + room-tone rebuild (RETAKE). Mixed at room-tone
   level. Unlocked on first gesture; mute persists per session; fully
   silent under prefers-reduced-motion. */
(function () {
  'use strict';

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MUTE_KEY = 'feed-muted';

  function readMuted() {
    try { return sessionStorage.getItem(MUTE_KEY) === '1'; } catch (e) { return false; }
  }

  /* inert stub when motion (and therefore sound) is reduced */
  if (RM) {
    window.__feedSound = {
      reduced: true, muted: true,
      unlock: function () {}, toggle: function () { return true; },
      cut: function () {}, dolly: function () {}, rackStart: function () {},
      rackRelease: function () {}, wipe: function () {}, retake: function () {}
    };
    return;
  }

  var ctx = null, master = null, noiseBuf = null;
  var muted = readMuted();
  var rumble = null; /* persistent dolly voice: {src, filter, gain} */
  var whir = null;   /* active rack voice */

  function unlock() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.12; /* room-tone ceiling */
    master.connect(ctx.destination);
    var len = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  function setMuted(m) {
    muted = m;
    try { sessionStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch (e) {}
    if (master) master.gain.setTargetAtTime(m ? 0 : 0.12, ctx.currentTime, 0.02);
  }

  function noise(filterType, freq, q) {
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    var filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = freq;
    if (q) filter.Q.value = q;
    var g = ctx.createGain();
    g.gain.value = 0;
    src.connect(filter); filter.connect(g); g.connect(master);
    src.start();
    return { src: src, filter: filter, gain: g };
  }

  function burst(filterType, freq, q, peak, attack, decay) {
    if (!ctx) return;
    var v = noise(filterType, freq, q);
    var t = ctx.currentTime;
    v.gain.gain.setValueAtTime(0, t);
    v.gain.gain.linearRampToValueAtTime(peak, t + attack);
    v.gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    v.src.stop(t + attack + decay + 0.05);
  }

  function thump(freq, peak, dur) {
    if (!ctx) return;
    var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.5), t + dur);
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  /* CUT — mag-film splice: a dry chunk. Two frames long, like the leader. */
  function cut() {
    if (!ctx) return;
    burst('bandpass', 1400, 2.5, 0.5, 0.004, 0.05);
    thump(70, 0.35, 0.09);
  }

  /* DOLLY — low rubber-wheel rumble; pitch rises with speed. Call per
     scroll frame with px/ms velocity; the voice self-fades when calls stop. */
  function dolly(v) {
    if (!ctx) return;
    if (!rumble) rumble = noise('lowpass', 90, 0.8);
    var speed = Math.min(1, Math.abs(v) / 3); /* ~3 px/ms = flat out */
    var t = ctx.currentTime;
    rumble.filter.frequency.setTargetAtTime(80 + speed * 140, t, 0.06);
    rumble.gain.gain.setTargetAtTime(0.10 + speed * 0.30, t, 0.05);
    rumble.gain.gain.setTargetAtTime(0, t + 0.14, 0.09); /* dies unless refreshed */
  }

  /* RACK — follow-focus whir while the gate meter runs; felt stop on the
     pull landing; early release just lets the whir fall away. */
  function rackStart() {
    if (!ctx) return;
    rackRelease();
    var o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    var t = ctx.currentTime;
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(160, t);
    o.frequency.linearRampToValueAtTime(300, t + 0.7);
    f.type = 'lowpass'; f.frequency.value = 500;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.08);
    o.connect(f); f.connect(g); g.connect(master);
    o.start(t);
    var stopT = setTimeout(function () { /* the felt stop, on meter completion */
      burst('lowpass', 320, 1, 0.4, 0.003, 0.06);
    }, 700);
    whir = { osc: o, gain: g, stopT: stopT };
    o.stop(t + 1.4);
  }

  function rackRelease() {
    if (!whir) return;
    clearTimeout(whir.stopT);
    if (ctx) whir.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    whir = null;
  }

  /* WIPE — fabric sweep across the frame, 420ms like the flat */
  function wipe() {
    if (!ctx) return;
    var v = noise('bandpass', 400, 1.2);
    var t = ctx.currentTime;
    v.filter.frequency.setValueAtTime(400, t);
    v.filter.frequency.linearRampToValueAtTime(1900, t + 0.21);
    v.filter.frequency.linearRampToValueAtTime(550, t + 0.42);
    v.gain.gain.setValueAtTime(0, t);
    v.gain.gain.linearRampToValueAtTime(0.35, t + 0.10);
    v.gain.gain.linearRampToValueAtTime(0.0001, t + 0.42);
    v.src.stop(t + 0.5);
  }

  /* RETAKE — slate clap, then the room tone rebuilds under it */
  function retake() {
    if (!ctx) return;
    burst('highpass', 900, 1, 0.6, 0.002, 0.07); /* the clap */
    thump(120, 0.2, 0.05);
    var v = noise('lowpass', 140, 0.7);          /* room tone re-settling */
    var t = ctx.currentTime;
    v.gain.gain.setValueAtTime(0, t + 0.15);
    v.gain.gain.linearRampToValueAtTime(0.12, t + 0.45);
    v.gain.gain.linearRampToValueAtTime(0.0001, t + 1.2);
    v.src.stop(t + 1.3);
  }

  window.__feedSound = {
    reduced: false,
    get muted() { return muted; },
    unlock: unlock,
    toggle: function () { setMuted(!muted); return muted; },
    cut: cut, dolly: dolly, rackStart: rackStart, rackRelease: rackRelease,
    wipe: wipe, retake: retake
  };
})();
