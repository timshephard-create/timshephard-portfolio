/* ════════════════════════════════════════════════════════════════
   THE SIGNAL — flagship behavior
   One shader, one scroll choreography, one cursor. No framework.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var doc = document.documentElement;

  /* if GSAP failed to load, boot the fully static page and stop */
  if (!window.gsap || !window.ScrollTrigger) {
    doc.classList.remove('js');
    doc.classList.add('no-gl');
    var ld = document.getElementById('loader');
    if (ld) ld.style.display = 'none';
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var end = parseFloat(el.getAttribute('data-count'));
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      var s = dec ? end.toFixed(dec) : Math.round(end).toLocaleString('en-US');
      el.textContent = (el.getAttribute('data-prefix') || '') + s + (el.getAttribute('data-suffix') || '') + (el.id === 'psa-count' ? '+' : '');
    });
    return;
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer) doc.classList.add('fine-pointer');

  /* ────────────────────────────────────────────────
     THE SIGNAL SHADER (raw WebGL, one quad)
     uniforms: uVel (scroll velocity), uBurst (channel
     change), uTint (channel temperature)
     ──────────────────────────────────────────────── */
  var gl = null, glProg = null, glCanvas = document.getElementById('signal');
  var uni = {};
  var sig = { vel: 0, velTarget: 0, burst: 0, tint: [1.0, 0.42, 0.18], tintNow: [1.0, 0.42, 0.18] };

  function initGL() {
    try { gl = glCanvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); } catch (e) {}
    if (!gl) { doc.classList.add('no-gl'); return false; }

    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var fs = [
      'precision mediump float;',
      'uniform vec2 uRes;uniform float uTime;uniform float uVel;uniform float uBurst;uniform vec3 uTint;',
      'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'void main(){',
      '  vec2 uv=gl_FragCoord.xy/uRes;',
      '  float t=uTime;',
      // tracking error: rows shear horizontally with velocity
      '  float row=floor(gl_FragCoord.y/3.0);',
      '  float jitter=(hash(vec2(row,floor(t*24.0)))-0.5);',
      '  vec2 suv=uv+vec2(jitter*0.09*min(abs(uVel),1.2)+jitter*0.006*uBurst*8.0,0.0);',
      // base ink
      '  vec3 col=vec3(0.040,0.036,0.032);',
      // carrier wave: slow warm gradient drifting — channel temperature
      '  float carrier=0.5+0.5*sin(suv.y*4.2-t*0.35+suv.x*1.3);',
      '  col+=uTint*carrier*0.055;',
      // phosphor grain
      '  float g=hash(gl_FragCoord.xy+vec2(fract(t)*217.0,fract(t*0.7)*131.0));',
      '  col+=vec3(g)*0.045;',
      // scanlines
      '  col-=vec3(0.020)*(0.5+0.5*sin(gl_FragCoord.y*2.094));',
      // head-switch band drifting down
      '  float band=exp(-pow((fract(suv.y+t*0.05)-0.5)*9.0,2.0));',
      '  col+=uTint*band*0.030;',
      // velocity brightness lines
      '  float vline=exp(-pow((fract(suv.y*3.0-t*1.2)-0.5)*14.0,2.0));',
      '  col+=vec3(vline)*min(abs(uVel)*0.10,0.10);',
      // channel-change static burst
      '  float burstN=hash(gl_FragCoord.xy*0.7+vec2(t*997.0));',
      '  col+=vec3(burstN)*uBurst*0.34;',
      '  col-=vec3(0.05)*uBurst*(0.5+0.5*sin(gl_FragCoord.y*0.8+t*90.0));',
      // vignette
      '  float d=distance(uv,vec2(0.5,0.46));',
      '  col*=smoothstep(1.05,0.30,d)*0.85+0.15;',
      '  gl_FragColor=vec4(col,1.0);',
      '}'
    ].join('\n');

    function shader(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { return null; }
      return s;
    }
    var v = shader(gl.VERTEX_SHADER, vs), f = shader(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) { doc.classList.add('no-gl'); gl = null; return false; }
    glProg = gl.createProgram();
    gl.attachShader(glProg, v); gl.attachShader(glProg, f); gl.linkProgram(glProg);
    if (!gl.getProgramParameter(glProg, gl.LINK_STATUS)) { doc.classList.add('no-gl'); gl = null; return false; }
    gl.useProgram(glProg);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(glProg, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    ['uRes', 'uTime', 'uVel', 'uBurst', 'uTint'].forEach(function (n) { uni[n] = gl.getUniformLocation(glProg, n); });
    resizeGL();
    window.addEventListener('resize', resizeGL);
    return true;
  }

  function resizeGL() {
    if (!gl) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    glCanvas.width = Math.round(innerWidth * dpr);
    glCanvas.height = Math.round(innerHeight * dpr);
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    gl.uniform2f(uni.uRes, glCanvas.width, glCanvas.height);
  }

  function drawGL(t) {
    if (!gl) return;
    sig.vel += (sig.velTarget - sig.vel) * 0.06;
    sig.burst *= 0.92;
    for (var i = 0; i < 3; i++) sig.tintNow[i] += (sig.tint[i] - sig.tintNow[i]) * 0.04;
    gl.uniform1f(uni.uTime, t);
    gl.uniform1f(uni.uVel, sig.vel);
    gl.uniform1f(uni.uBurst, sig.burst);
    gl.uniform3f(uni.uTint, sig.tintNow[0], sig.tintNow[1], sig.tintNow[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  var hasGL = initGL();

  /* channel temperatures (stay in orange family — palette discipline) */
  var TINTS = {
    '01': [1.0, 0.42, 0.18],
    '02': [1.0, 0.34, 0.10],
    '03': [0.95, 0.50, 0.28],
    '04': [1.0, 0.30, 0.06]
  };

  /* ────────────────────────────────────────────────
     SPLIT TYPE (hand-rolled)
     ──────────────────────────────────────────────── */
  function splitEl(el) {
    var text = el.textContent;
    el.setAttribute('aria-label', text);
    var frag = document.createDocumentFragment();
    text.split(' ').forEach(function (word, wi, arr) {
      var w = document.createElement('span');
      w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < word.length; i++) {
        var c = document.createElement('span');
        c.className = 'c'; c.textContent = word[i];
        w.appendChild(c);
      }
      frag.appendChild(w);
      if (wi < arr.length - 1) frag.appendChild(document.createTextNode(' '));
    });
    el.textContent = '';
    el.appendChild(frag);
    return el.querySelectorAll('.c');
  }

  var splitTargets = {};
  document.querySelectorAll('[data-split]').forEach(function (el, i) {
    if (reduced) { return; }
    splitTargets['s' + i] = splitEl(el);
    el.setAttribute('data-sid', 's' + i);
  });

  function riseChars(el, delay) {
    var chars = splitTargets[el.getAttribute('data-sid')];
    if (!chars) return;
    gsap.to(chars, {
      yPercent: 0, duration: 1.1, ease: 'power4.out',
      stagger: 0.032, delay: delay || 0, overwrite: true
    });
  }
  /* initial offset set by gsap only, after wrapping — data-sid then reveals the parent */
  if (!reduced) {
    Object.keys(splitTargets).forEach(function (k) { gsap.set(splitTargets[k], { yPercent: 115 }); });
  }

  /* ────────────────────────────────────────────────
     LOADER — film leader 3·2·1 (skips: reduced motion,
     repeat visit this session)
     ──────────────────────────────────────────────── */
  var loader = document.getElementById('loader');
  var seen = false;
  try { seen = sessionStorage.getItem('ts-leader') === '1'; } catch (e) {}

  function startPage() {
    /* hero entrance */
    if (!reduced && window.gsap) {
      document.querySelectorAll('#ident [data-split]').forEach(function (el) { riseChars(el, 0.1); });
      gsap.to('#ident [data-rise]', {
        opacity: 1, y: 0, duration: 1.0, ease: 'expo.out',
        stagger: 0.09, delay: 0.5, overwrite: true
      });
    }
  }

  if (!reduced && !seen && window.gsap) {
    loader.classList.add('on');
    loader.setAttribute('aria-hidden', 'true');
    try { sessionStorage.setItem('ts-leader', '1'); } catch (e) {}
    var num = loader.querySelector('.leader-num');
    var sweep = loader.querySelector('.sweep');
    var tl = gsap.timeline({
      onComplete: function () {
        gsap.fromTo(loader,
          { clipPath: 'inset(0 0 0% 0)' },
          {
            clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'expo.inOut',
            onComplete: function () { loader.style.display = 'none'; startPage(); }
          });
      }
    });
    [3, 2, 1].forEach(function (n, i) {
      tl.call(function () { num.textContent = n; }, null, i * 0.42)
        .fromTo(sweep, { strokeDashoffset: 289 }, { strokeDashoffset: 0, duration: 0.4, ease: 'none' }, i * 0.42);
    });
    tl.to({}, { duration: 0.12 });
  } else {
    loader.style.display = 'none';
    startPage();
  }

  /* ────────────────────────────────────────────────
     SMOOTH SCROLL + SCROLL CHOREOGRAPHY
     ──────────────────────────────────────────────── */
  var lenis = null;
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    if (!reduced && window.Lenis) {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.0 });
      lenis.on('scroll', function (e) {
        ScrollTrigger.update();
        sig.velTarget = Math.max(-1.6, Math.min(1.6, e.velocity / 60));
      });
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
      /* smooth anchor scroll (skip-link stays instant for a11y) */
      document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach(function (a) {
        a.addEventListener('click', function (ev) {
          var target = document.querySelector(a.getAttribute('href'));
          if (target) { ev.preventDefault(); lenis.scrollTo(target, { offset: 0, duration: 1.4 }); }
        });
      });
    }

    /* shader tick on gsap's ticker (single rAF owner) */
    if (hasGL && !reduced) {
      gsap.ticker.add(function (time) { drawGL(time); });
    } else if (hasGL) {
      /* reduced motion: draw a single calm frame */
      drawGL(10.0);
    }

    /* velocity → type rgb-split (offset AND alpha ride velocity) */
    if (!reduced) {
      gsap.ticker.add(function () {
        var s = Math.min(Math.abs(sig.vel) * 6, 7);
        doc.style.setProperty('--split', s.toFixed(2));
        doc.style.setProperty('--splita', Math.min(s * 0.09, 0.45).toFixed(3));
      });
    }

    /* HUD: channel switching + burst */
    var sections = document.querySelectorAll('[data-ch]');
    var chNum = document.getElementById('ch-num');
    var chName = document.getElementById('ch-name');
    sections.forEach(function (sec) {
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: function (st) {
          if (!st.isActive) return;
          var ch = sec.getAttribute('data-ch');
          chNum.textContent = 'CH ' + ch + ' / 04';
          chName.textContent = sec.getAttribute('data-name');
          sig.tint = TINTS[ch] || TINTS['01'];
          if (!reduced) {
            sig.burst = 1.0;
            if (chNum.animate) chNum.animate(
              [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
              { duration: 320, easing: 'cubic-bezier(0.19,1,0.22,1)' }
            );
          }
        }
      });
    });

    /* section title chars + rises */
    if (!reduced) {
      document.querySelectorAll('main section:not(#ident) [data-split]').forEach(function (el) {
        ScrollTrigger.create({
          trigger: el, start: 'top 88%', once: true,
          onEnter: function () { riseChars(el, 0); }
        });
      });
      gsap.utils.toArray('main section:not(#ident) [data-rise]').forEach(function (el) {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 1.0, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        });
      });
      /* monitor reveals: clip up + settle */
      gsap.utils.toArray('[data-clip]').forEach(function (el) {
        var wrap = el.querySelector('.mon-img-wrap');
        gsap.to(wrap, {
          clipPath: 'inset(0% 0 0 0)', duration: 1.25, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true }
        });
      });
      /* image parallax drift (scrub) */
      gsap.utils.toArray('[data-plx]').forEach(function (img) {
        gsap.fromTo(img, { yPercent: -5 }, {
          yPercent: 5, ease: 'none',
          scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
        });
      });
    } else {
      /* reduced motion: everything visible (CSS handles), counters final */
    }

    /* count-ups */
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var end = parseFloat(el.getAttribute('data-count'));
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      var pre = el.getAttribute('data-prefix') || '';
      var suf = el.getAttribute('data-suffix') || '';
      var isPsa = el.id === 'psa-count';
      function fmt(v) {
        var s = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
        return pre + s + suf;
      }
      if (reduced) {
        el.textContent = isPsa ? Math.round(end).toLocaleString('en-US') + '+' : fmt(end);
        return;
      }
      var o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: function () {
          gsap.to(o, {
            v: end, duration: 1.6, ease: 'power2.out',
            onUpdate: function () {
              el.textContent = isPsa ? Math.round(o.v).toLocaleString('en-US') + '+' : fmt(o.v);
            }
          });
        }
      });
    });
  }

  /* ────────────────────────────────────────────────
     TIMECODE (scroll-driven, 25fps over 90s)
     ──────────────────────────────────────────────── */
  var tc = document.getElementById('tc');
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  var tcTick = false;
  function updateTC() {
    tcTick = false;
    var max = doc.scrollHeight - innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, (window.scrollY || window.pageYOffset) / max)) : 0;
    var fr = Math.round(p * 90 * 25);
    tc.textContent = 'TC 00:' + pad(Math.floor(fr / 1500)) + ':' + pad(Math.floor(fr / 25) % 60) + ':' + pad(fr % 25);
  }
  window.addEventListener('scroll', function () {
    if (!tcTick) { tcTick = true; requestAnimationFrame(updateTC); }
  }, { passive: true });
  updateTC();

  /* ────────────────────────────────────────────────
     CURSOR + MAGNETIC
     ──────────────────────────────────────────────── */
  if (finePointer && !reduced) {
    var cur = document.getElementById('cursor');
    var tag = cur.querySelector('.tag');
    var cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      cur.classList.add('is-live');
    }, { passive: true });
    gsap.ticker.add(function () {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      cur.style.transform = 'translate(' + (cx - 22) + 'px,' + (cy - 22) + 'px)';
    });
    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cur.classList.add('is-hover');
        tag.textContent = el.getAttribute('data-cursor') || '';
      });
      el.addEventListener('mouseleave', function () {
        cur.classList.remove('is-hover');
        tag.textContent = '';
      });
    });

    /* magnetic CTAs */
    document.querySelectorAll('[data-magnet]').forEach(function (el) {
      var strength = 12;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: mx / r.width * strength * 2, y: my / r.height * strength, duration: 0.4, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
      });
    });
  }

  /* pause shader when tab hidden (gsap ticker keeps running otherwise) */
  document.addEventListener('visibilitychange', function () {
    if (!window.gsap) return;
    if (document.hidden) gsap.ticker.sleep();
    else gsap.ticker.wake();
  });
})();
