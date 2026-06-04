/* ── CYOA + Decade Toggle experience ──────────────────────────────
   Mounts into #ts-adventure-root. Live AI personalization runs through
   the allowlisted /api/personalize endpoint; if that's unreachable it
   falls back to the 12 pre-written intros in COPY below, so the feature
   always renders. GA4 events fire on path/followup/decade selection. */
(function () {
  const root = document.getElementById('ts-adventure-root');
  if (!root) return;

  // ── CONFIG: allowlisted endpoint (server builds the prompt; client sends only path+followup) ──
  const ENDPOINT = '/api/personalize'; // falls back to local COPY if unreachable

  const PATHS = {
    recruiter: { label: "I'm looking for a creative leader", icon: '01', color: '#e8420a',
      q90s: 'I NEED A CREATIVE BOSS!!', q00s: 'Hiring / Recruiting', q10s: 'Hiring a Creative Leader' },
    brand: { label: 'I have a brand problem to solve', icon: '02', color: '#00d4ff',
      q90s: 'MY BRAND IS BROKEN HELP!!', q00s: 'Brand Strategy Help', q10s: 'Brand Problem to Solve' },
    agency: { label: "I'm exploring a partnership", icon: '03', color: '#7b2fff',
      q90s: 'LETS COLLAB OR SOMETHING!!', q00s: 'Partnership / Collab', q10s: 'Exploring a Partnership' },
    curious: { label: 'Someone sent me this link', icon: '04', color: '#2dba6a',
      q90s: 'IDK I JUST CLICKED A LINK!!', q00s: 'Just Browsing', q10s: 'Just Exploring' },
  };

  const FOLLOWUPS = {
    recruiter: { q: 'What matters most right now?', q90s: 'WHAT DO U NEED MOST??', q00s: "What's your priority?", q10s: 'What are you looking for?',
      options: [ {k:'scale',label:'Someone who can lead at scale'}, {k:'ai',label:'A creative who actually gets AI'}, {k:'brand',label:'Proven brand-building chops'} ] },
    brand: { q: 'Where are you stuck?', q90s: 'WHATS UR PROBLEM??', q00s: "Where's the pain point?", q10s: 'Where are you stuck?',
      options: [ {k:'clarity',label:'We know what we do — not how to say it'}, {k:'campaign',label:'We need a campaign, not just a logo'}, {k:'reach',label:"We're invisible and need presence"} ] },
    agency: { q: 'What kind of partnership?', q90s: 'WHAT KIND OF COLLAB??', q00s: 'What are you after?', q10s: 'What kind of partnership?',
      options: [ {k:'whiteLbl',label:'White-label creative capacity'}, {k:'consult',label:'Strategic creative consulting'}, {k:'aitools',label:'AI-powered creative tools or systems'} ] },
    curious: { q: 'What are you in the mood for?', q90s: 'WHAT DO U WANNA SEE??', q00s: 'Where do you want to start?', q10s: 'What are you in the mood for?',
      options: [ {k:'story',label:'The full origin story'}, {k:'work',label:'Just show me the work'}, {k:'ventures',label:'The entrepreneurship angle'} ] },
  };

  // ── Voice-pass intros (fallback + Option-B safety net). Stat attribution verified. ──
  const COPY = {
    'recruiter:scale': { headline: 'Leadership That Operates at Scale', intro: "Tim has spent fifteen years leading creative where the stakes are national. The Keep America Beautiful PSA campaign he directed earned $77.5M in media value across 160K+ airings — but what matters for a hire is the system he built to make that repeatable. He leads teams, not just projects." },
    'recruiter:ai': { headline: 'A Creative Director Who Ships AI', intro: "Most creative leaders talk about AI. Tim builds with it — this portfolio personalizes itself through a live model, and his ventures run on systems he architected himself. Fifteen years of campaign leadership, paired with real fluency in what these tools can and can't do yet." },
    'recruiter:brand': { headline: 'Brand Built on Real Track Record', intro: "Tim's brand work isn't theoretical. He led the PSA campaign for Keep America Beautiful that earned $77.5M in media value, and shaped messaging for federal agencies and SaaS companies in crowded markets. The through-line is taking something complex and making it land." },
    'brand:clarity': { headline: 'From What You Do to What You Say', intro: "The hardest part of brand isn't design — it's saying the true thing clearly. Tim has done this for federal agencies under strict governance, for SaaS products buried in jargon, and for a national movement that needed millions of people to act. He finds the line that makes people move." },
    'brand:campaign': { headline: 'Campaigns, Not Just Logos', intro: "A logo is where most studios stop. Tim builds the whole engine — the PSA campaign he led for Keep America Beautiful ran across 160K+ airings and earned $77.5M in media value because it was designed as a system. If you need work that actually moves numbers, that's it." },
    'brand:reach': { headline: "Presence That's Earned", intro: "Being invisible is usually a clarity problem before it's a budget problem. Tim has built visibility at every scale — including a national campaign whose movement reached 11.9 million participants. He'll help you find the message that earns attention rather than buying it." },
    'agency:whiteLbl': { headline: 'Senior Creative, On Demand', intro: "Tim works white-label with agencies needing senior creative direction without adding headcount. Fifteen years across nonprofit, federal, broadcast, and SaaS means he can step into most briefs and lead. Your client sees your name; you get a director who's led at national scale." },
    'agency:consult': { headline: 'Strategic Creative, Embedded', intro: "Sometimes you don't need more hands — you need a sharper strategy. Tim consults on the creative direction that's hard to staff for: positioning, campaign architecture, the call on what the work is actually trying to do. He's led it firsthand, so the advice is grounded." },
    'agency:aitools': { headline: 'Building the AI Creative Stack', intro: "Tim is actively building AI-powered creative systems through Creative Mind Ventures — a prospecting engine, an automated audit platform, tools that compress the manual parts of the work. If your agency wants a partner thinking about where creative and AI meet, let's talk." },
    'curious:story': { headline: 'Fifteen Years, One Throughline', intro: "Tim's path runs from global broadcast crews to a national civic movement to building AI ventures of his own. The throughline is creative that has to work at scale and under pressure. Start anywhere — it all connects back to making complex things land with real people." },
    'curious:work': { headline: 'Straight to the Work', intro: "No preamble, then. The Keep America Beautiful PSA campaign Tim led earned $77.5M in media value across 160K+ airings; the broader movement reached 11.9 million participants. There's federal, broadcast, and SaaS work below too — pick whatever pulls you." },
    'curious:ventures': { headline: 'The Builder Behind the Director', intro: "Beyond the creative direction, Tim builds. Through Creative Mind Ventures he's developing an AI-powered prospecting engine, a website audit platform, and consumer tools — creative direction meets product thinking. It's the part of the portfolio that's still being written." },
  };

  const WORK = [
    { id:'kab', title:'Keep America Beautiful', role:'Communications Lead', years:'2018–22', tag:'Nonprofit / National Campaign', stats:['11.9M reached (movement)','$77.5M media value (PSA)','160K+ PSA airings'], desc:'Led communications for a national civic movement. The PSA campaign Tim directed earned $77.5M in media value; the broader movement reached 11.9 million participants.', paths:['recruiter','brand','agency','curious'], url:'/nonprofit/' },
    { id:'federal', title:'Federal Communications', role:'Sr. Creative Director', years:'2015–18', tag:'Government / Public Affairs', stats:['Multi-agency','National audience','Strict governance'], desc:'Shaped public communications at the federal level — complex stakeholders, tight brand governance, audiences of millions.', paths:['recruiter','curious'], url:'/gov/' },
    { id:'broadcast', title:'Global Broadcast', role:'Creative / Crew', years:'2004–15', tag:'Broadcast / Media', stats:['Broadcast audience','Multi-continent','Live production'], desc:'Creative and production work on broadcast properties with global reach — scripting, visual identity, concept to air.', paths:['recruiter','brand','agency','curious'], url:'/entertainment/' },
    { id:'saas', title:'SaaS Brand & Marketing', role:'Brand Strategy Lead', years:'2022–', tag:'Tech / SaaS', stats:['B2B positioning','Product launches','Pipeline growth'], desc:'Built brand and go-to-market strategy for SaaS products — distilling complex software into propositions that converted.', paths:['recruiter','brand','agency'], url:'/tech/' },
    { id:'ventures', title:'AI-Powered Ventures', role:'Founder / Creative Director', years:'2023–', tag:'Entrepreneurship / AI', stats:['In progress','Automated systems','Scalable products'], desc:'Building through Creative Mind Ventures — a prospecting engine, an AI audit platform, consumer tools. Creative direction meets product thinking.', paths:['agency','curious'], url:'/projects/' },
  ];

  const DECADES = [
    { id:'90s', label:'1990s', sub:'GeoCities', flash:'#FF00FF' },
    { id:'00s', label:'2000s', sub:'Web 2.0', flash:'#4A8FD4' },
    { id:'10s', label:'2010s', sub:'Flat Design', flash:'#1ABC9C' },
    { id:'now', label:'Now', sub:'Current', flash:'#e8420a' },
  ];

  // ── state ──
  const state = { decade:'now', phase:'intro', path:null, followup:null, ai:null };

  // ── AI fetch (endpoint-first, local fallback) ──
  async function getPersonalization(path, followup) {
    try {
      const r = await fetch(ENDPOINT, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ path, followup }),
      });
      if (r.ok) { const d = await r.json(); if (d && d.intro) return d; }
    } catch (e) { /* fall through */ }
    return COPY[path + ':' + followup] || { headline:'Built for This Moment', intro:'Tim Shephard builds campaigns that scale, brands that stick, and systems that last. The work below was chosen with you in mind.' };
  }

  // ── typewriter ──
  let typeTimer = null;
  function typewrite(el, text, speed) {
    clearInterval(typeTimer);
    el.textContent = '';
    const cur = document.createElement('span'); cur.className = 'cursor'; cur.textContent = '▌';
    el.appendChild(cur);
    let i = 0;
    typeTimer = setInterval(function () {
      if (i < text.length) { cur.insertAdjacentText('beforebegin', text[i]); i++; }
      else clearInterval(typeTimer);
    }, speed || 18);
  }

  function visibleWork() {
    return state.path ? WORK.filter(function(w){ return w.paths.indexOf(state.path) > -1; }) : WORK;
  }

  // ── selection handlers ──
  function selectPath(k) {
    state.path = k; state.phase = 'q2';
    if (window.gtag) window.gtag('event', 'cyoa_path', { path: k });
    render();
  }
  async function selectFollowup(k) {
    state.followup = k; state.phase = 'generating';
    if (window.gtag) window.gtag('event', 'cyoa_followup', { path: state.path, followup: k });
    render();
    state.ai = await getPersonalization(state.path, k);
    state.phase = 'reveal'; render();
  }
  function reset() { state.phase = 'intro'; state.path = null; state.followup = null; state.ai = null; render(); }

  function switchDecade(id) {
    if (id === state.decade) return;
    if (window.gtag) window.gtag('event', 'cyoa_decade_switch', { decade: id });
    const flash = document.getElementById('tsa-flash');
    flash.style.background = (DECADES.find(function(d){return d.id===id;})||{}).flash || '#e8420a';
    flash.style.opacity = '1';
    setTimeout(function () { state.decade = id; render(); flash.style.opacity = '0'; }, 320);
  }

  // ══════════ RENDERERS ══════════

  function renderNow() {
    const fu = state.path ? FOLLOWUPS[state.path] : null;
    let inner = '';

    if (state.phase === 'intro') {
      inner = '<div class="kicker tsa-label">Portfolio — 2026</div>' +
        '<h1 class="tsa-display">What brought<br><span class="em">you here?</span></h1>' +
        '<p class="lede">This portfolio adapts to you. Choose a path and Tim’s work reorders around what you came for.</p>' +
        '<div class="tsa-path-list">' +
        Object.keys(PATHS).map(function (k, i) {
          return '<button class="tsa-path" data-path="' + k + '"><span class="num tsa-label">0' + (i+1) + '</span><span class="ptext">' + PATHS[k].label + '</span></button>';
        }).join('') +
        '</div>' +
        '<div class="tsa-skip"><button data-path="curious">Skip → just show me everything</button></div>';
    }
    else if (state.phase === 'q2' && fu) {
      inner = '<div class="q2-kicker tsa-label">' + PATHS[state.path].icon + ' — ' + PATHS[state.path].label + '</div>' +
        '<h2>' + fu.q + '</h2>' +
        '<div class="tsa-path-list">' +
        fu.options.map(function (o, i) {
          return '<button class="tsa-path" data-fu="' + o.k + '"><span class="num tsa-label">0' + (i+1) + '</span><span class="ptext">' + o.label + '</span></button>';
        }).join('') +
        '</div>';
    }
    else if (state.phase === 'generating') {
      inner = '<div class="tsa-gen"><div class="dot tsa-label">Curating your experience</div></div>';
    }
    else if (state.phase === 'reveal' && state.ai) {
      inner = '<div class="tsa-reveal-kicker tsa-label">' + (state.path ? PATHS[state.path].icon + ' — curated for you' : 'full portfolio') + '</div>' +
        '<div class="headline tsa-display">' + state.ai.headline + '</div>' +
        '<div class="tsa-intro" id="tsa-intro"></div>' +
        '<div class="tsa-work">' +
        visibleWork().map(function (w) {
          return '<div class="tsa-work-item" data-url="' + w.url + '"><div class="tsa-wi-row"><div style="flex:1">' +
            '<div class="tsa-wi-tag tsa-label">' + w.tag + '</div>' +
            '<div class="tsa-wi-title">' + w.title + '</div>' +
            '<div class="tsa-wi-desc">' + w.desc + '</div></div>' +
            '<div class="tsa-wi-stats">' + w.stats.map(function(s){return '<span class="tsa-label">'+s+'</span>';}).join('') + '</div>' +
            '</div></div>';
        }).join('') +
        '</div>' +
        '<div class="tsa-cta"><div><div class="big">Let’s talk.</div><div class="mail tsa-label">Tell Tim what you’re working on.</div></div>' +
        '<a href="/hire/">start a project →</a></div>';
    }

    return '<div class="tsa-now">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:8px;">' +
      '<div><div class="tsa-label" style="font-size:13px;color:rgba(10,9,8,0.55);">Tim Shephard</div>' +
      '<div class="tsa-label" style="font-size:10px;color:rgba(10,9,8,0.3);margin-top:3px;">Senior Creative Director</div></div>' +
      (state.phase !== 'intro' ? '<button id="tsa-reset" class="tsa-label" style="background:none;border:1px solid rgba(10,9,8,0.18);color:rgba(10,9,8,0.5);padding:6px 14px;font-size:11px;cursor:pointer;">← Start Over</button>' : '') +
      '</div>' + inner + '</div>';
  }

  // —— retro renderers return {bg, html} ——

  function renderNineties() {
    const fu = state.path ? FOLLOWUPS[state.path] : null;
    const btn = 'background:linear-gradient(180deg,#ccc,#888 50%,#555 51%,#999);border:3px outset #aaa;color:#000;font-family:\'Comic Sans MS\',cursive;font-size:12px;padding:5px 12px;cursor:pointer;font-weight:bold;width:100%;text-align:left;margin-bottom:6px;';
    let body = '';
    if (state.phase === 'intro') {
      body = '<div style="background:#000040;border:3px groove #FFFF00;padding:12px;">' +
        '<div style="color:#FFFF00;font-weight:bold;font-size:14px;margin-bottom:10px;">❓ WHO ARE U AND WHY R U HERE?? ❓</div>' +
        Object.keys(PATHS).map(function(k,i){return '<button class="tsa-path-90" data-path="'+k+'" style="'+btn+'">'+(i+1)+'. '+PATHS[k].q90s+'</button>';}).join('') +
        '<div style="margin-top:8px;border-top:1px dashed #FFFF00;padding-top:8px;"><button class="tsa-path-90" data-path="curious" style="'+btn+'font-size:10px;">SKIP → JUST SHOW ME STUFF!!</button></div></div>';
    } else if (state.phase === 'q2' && fu) {
      body = '<div style="background:#000040;border:3px groove #00FFFF;padding:12px;">' +
        '<div style="color:#00FFFF;font-weight:bold;font-size:14px;margin-bottom:10px;">❓ '+fu.q90s+' ❓</div>' +
        fu.options.map(function(o,i){return '<button class="tsa-fu-90" data-fu="'+o.k+'" style="'+btn+'">'+(i+1)+'. '+o.label.toUpperCase()+'</button>';}).join('') + '</div>';
    } else if (state.phase === 'generating') {
      body = '<div style="background:#000040;border:3px groove #FF00FF;padding:18px;text-align:center;color:#FFFF00;font-weight:bold;">⏳ LOADING YOUR PERSONALISED PAGE...<br><span style="color:#00FFFF;font-size:11px;">PLEASE WAIT!! DO NOT PRESS BACK!!</span></div>';
    } else if (state.phase === 'reveal' && state.ai) {
      body = '<div style="background:#000040;border:3px groove #FFFF00;padding:12px;margin-bottom:10px;">' +
        '<div style="color:#FF00FF;font-weight:bold;font-size:14px;margin-bottom:6px;">★ '+state.ai.headline.toUpperCase()+' ★</div>' +
        '<div id="tsa-intro" style="color:#fff;font-size:12px;line-height:1.7;"></div></div>' +
        '<div style="color:#FF00FF;font-weight:bold;margin-bottom:8px;">💼 MY WORKS!! 💼</div>' +
        visibleWork().map(function(w){return '<div data-url="'+w.url+'" style="background:#000040;border:3px groove #00FFFF;margin-bottom:8px;padding:8px;cursor:pointer;"><div style="color:#FFFF00;font-weight:bold;font-size:12px;">★ '+w.title+'</div><div style="color:#00FFFF;font-size:10px;">'+w.role+' — '+w.years+'</div><div style="color:#fff;font-size:11px;margin-top:4px;">'+w.desc+'</div><div style="color:#00FF00;font-size:10px;margin-top:4px;">'+w.stats.join(' · ')+'</div></div>';}).join('');
    }
    const reset = state.phase !== 'intro' ? '<button id="tsa-reset" style="'+btn+'width:auto;font-size:10px;margin:0;">← BACK TO START!!</button>' : '';
    const html = '<div style="font-family:\'Comic Sans MS\',\'Times New Roman\',serif;color:#FFFF00;padding:14px;min-height:600px;">' +
      '<div style="text-align:center;margin-bottom:12px;"><div style="font-size:clamp(20px,4vw,34px);color:#FF00FF;text-shadow:3px 3px 0 #000080,-1px -1px 0 #FFFF00;font-weight:bold;">★ TIM SHEPHARD’S PORTFOLIO!! ★</div></div>' +
      '<div style="background:linear-gradient(90deg,#F00,#F70,#FF0,#0F0,#00F,#80F);height:3px;margin-bottom:12px;"></div>' +
      '<div style="text-align:right;margin-bottom:8px;">'+reset+'</div>' + body +
      '<div style="text-align:center;margin-top:14px;font-size:10px;color:#666;">© 1999 Tim Shephard’s Homepage · Made with ♥ and Microsoft FrontPage</div></div>';
    return { bg:'#000080', html: html };
  }

  function renderAughts() {
    const fu = state.path ? FOLLOWUPS[state.path] : null;
    const row = function(active){return 'background:'+(active?'linear-gradient(180deg,#EBF2FA,#E0EAF6)':'linear-gradient(180deg,#fff,#F8FAFB)')+';border:1px solid #C0CCD8;border-radius:4px;padding:10px 14px;cursor:pointer;margin-bottom:8px;font-size:13px;color:#333;';};
    let body = '';
    if (state.phase === 'intro') {
      body = '<div style="font-size:16px;font-weight:bold;color:#2E68B0;margin-bottom:8px;">Welcome to Tim Shephard’s Portfolio 2.0</div>' +
        '<div style="color:#666;font-size:12px;margin-bottom:14px;">Tell me what brought you here and I’ll personalize your experience.</div>' +
        Object.keys(PATHS).map(function(k){return '<div class="tsa-path-00" data-path="'+k+'" style="'+row(false)+'">'+PATHS[k].q00s+'</div>';}).join('');
    } else if (state.phase === 'q2' && fu) {
      body = '<div style="font-size:15px;font-weight:bold;color:#2E68B0;margin-bottom:12px;">'+fu.q00s+'</div>' +
        fu.options.map(function(o){return '<div class="tsa-fu-00" data-fu="'+o.k+'" style="'+row(false)+'">'+o.label+'</div>';}).join('');
    } else if (state.phase === 'generating') {
      body = '<div style="text-align:center;padding:30px;color:#2E68B0;font-weight:bold;">Personalizing your experience...</div>';
    } else if (state.phase === 'reveal' && state.ai) {
      body = '<div style="font-size:20px;font-weight:bold;color:#2E68B0;margin-bottom:10px;">'+state.ai.headline+'</div>' +
        '<div id="tsa-intro" style="color:#555;font-size:13px;line-height:1.7;margin-bottom:14px;"></div>' +
        visibleWork().map(function(w){return '<div data-url="'+w.url+'" style="background:linear-gradient(180deg,#fff,#F5F7FA);border:1px solid #C0CCD8;border-radius:6px;padding:12px 14px;margin-bottom:8px;cursor:pointer;"><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.1em;">'+w.tag+'</div><div style="font-size:14px;font-weight:bold;color:#2E68B0;">'+w.title+'</div><div style="font-size:11px;color:#666;margin-top:4px;">'+w.desc+'</div><div style="margin-top:6px;padding-top:6px;border-top:1px solid #E0E8F0;font-size:10px;color:#999;">📊 '+w.stats.join(' · ')+'</div></div>';}).join('');
    }
    const reset = state.phase!=='intro'?'<button id="tsa-reset" style="background:linear-gradient(180deg,#f0f0f0,#d0d0d0 50%,#b8b8b8 51%,#e0e0e0);border:1px solid #999;border-radius:4px;padding:5px 12px;font-size:11px;cursor:pointer;font-weight:bold;">← Start Over</button>':'';
    const html = '<div style="font-family:\'Trebuchet MS\',Verdana,sans-serif;min-height:600px;">' +
      '<div style="background:linear-gradient(180deg,#4A8FD4,#2E68B0);padding:14px 16px;display:flex;align-items:center;box-shadow:0 3px 6px rgba(0,0,0,0.4);">' +
      '<div><div style="font-size:24px;font-weight:bold;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,0.5);">Tim Shephard</div>' +
      '<div style="color:rgba(255,255,255,0.75);font-size:12px;">Senior Creative Director <span style="background:#FF6600;color:#fff;padding:1px 6px;border-radius:8px;font-size:10px;font-weight:bold;">BETA</span></div></div>' +
      '<div style="margin-left:auto;">'+reset+'</div></div>' +
      '<div style="padding:16px;background:#E8EEF5;">' +
      '<div style="background:linear-gradient(180deg,#fff,#F0F4F8);border:1px solid #C0CCD8;border-radius:6px;padding:18px;">'+body+'</div></div>' +
      '<div style="text-align:center;padding:10px;background:#2E68B0;color:rgba(255,255,255,0.5);font-size:11px;">© 2007 Tim Shephard Creative · Powered by WordPress · Valid XHTML 1.0</div></div>';
    return { bg:'#E8EEF5', html: html };
  }

  function renderTens() {
    const fu = state.path ? FOLLOWUPS[state.path] : null;
    const A = '#1ABC9C';
    const card = 'background:#fff;border-radius:2px;padding:18px 16px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.08);text-align:center;';
    let body = '';
    if (state.phase === 'intro') {
      body = '<h2 style="font-size:24px;font-weight:900;color:#2C3E50;text-align:center;margin-bottom:20px;">What brought you here?</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">' +
        Object.keys(PATHS).map(function(k,i){return '<div class="tsa-path-10" data-path="'+k+'" style="'+card+'border-top:4px solid '+['#1ABC9C','#3498DB','#E74C3C','#F39C12'][i]+';"><div style="font-size:13px;font-weight:700;color:#2C3E50;">'+PATHS[k].q10s+'</div></div>';}).join('') + '</div>';
    } else if (state.phase === 'q2' && fu) {
      body = '<h2 style="font-size:22px;font-weight:900;color:#2C3E50;text-align:center;margin-bottom:20px;">'+fu.q10s+'</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">' +
        fu.options.map(function(o){return '<div class="tsa-fu-10" data-fu="'+o.k+'" style="'+card+'"><div style="font-size:13px;font-weight:700;color:#2C3E50;">'+o.label+'</div></div>';}).join('') + '</div>';
    } else if (state.phase === 'generating') {
      body = '<div style="text-align:center;padding:40px;color:#2C3E50;font-weight:700;">Curating your experience...</div>';
    } else if (state.phase === 'reveal' && state.ai) {
      body = '<div style="text-align:center;margin-bottom:28px;"><div style="width:48px;height:3px;background:'+A+';margin:0 auto 14px;"></div>' +
        '<h2 style="font-size:28px;font-weight:900;color:#2C3E50;margin:0 0 12px;">'+state.ai.headline+'</h2>' +
        '<div id="tsa-intro" style="font-size:14px;color:#7F8C8D;line-height:1.7;max-width:520px;margin:0 auto;"></div></div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;">' +
        visibleWork().map(function(w,i){return '<div data-url="'+w.url+'" style="background:#fff;border-radius:2px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;cursor:pointer;"><div style="height:5px;background:'+['#1ABC9C','#3498DB','#E74C3C','#F39C12','#9B59B6'][i%5]+';"></div><div style="padding:16px;"><div style="font-size:9px;text-transform:uppercase;letter-spacing:0.15em;color:#95A5A6;font-weight:700;">'+w.tag+'</div><div style="font-size:15px;font-weight:700;color:#2C3E50;margin:3px 0;">'+w.title+'</div><div style="font-size:11px;color:'+A+';font-weight:700;margin-bottom:8px;">'+w.role+' · '+w.years+'</div><div style="font-size:12px;color:#7F8C8D;line-height:1.6;">'+w.desc+'</div></div></div>';}).join('') + '</div>';
    }
    const reset = state.phase!=='intro'?'<button id="tsa-reset" style="background:transparent;border:2px solid #BDC3C7;color:#7F8C8D;padding:6px 14px;font-weight:700;cursor:pointer;border-radius:2px;text-transform:uppercase;letter-spacing:0.08em;font-size:11px;">← Start Over</button>':'';
    const html = '<div style="font-family:\'Lato\',\'Helvetica Neue\',sans-serif;min-height:600px;">' +
      '<nav style="background:#2C3E50;padding:0 24px;display:flex;align-items:center;height:56px;"><div style="color:#fff;font-weight:900;font-size:18px;flex:1;">Tim<span style="color:'+A+';">Shephard</span></div>'+reset+'</nav>' +
      '<div style="background:linear-gradient(135deg,#2C3E50,#34495E);padding:48px 24px;text-align:center;"><div style="width:48px;height:4px;background:'+A+';margin:0 auto 18px;border-radius:2px;"></div><h1 style="font-size:clamp(24px,4.5vw,42px);font-weight:300;color:#fff;margin:0;line-height:1.15;">Creative Direction.<br><span style="font-weight:900;">At National Scale.</span></h1></div>' +
      '<div style="background:'+A+';padding:16px 24px;display:flex;justify-content:space-around;flex-wrap:wrap;gap:8px;">' +
      [['$77.5M','PSA Media Value'],['160K+','PSA Airings'],['11.9M','Movement Reach'],['15+','Years']].map(function(s){return '<div style="text-align:center;"><div style="font-size:clamp(20px,3vw,30px);font-weight:900;color:#fff;">'+s[0]+'</div><div style="font-size:10px;color:rgba(255,255,255,0.75);text-transform:uppercase;letter-spacing:0.1em;">'+s[1]+'</div></div>';}).join('') + '</div>' +
      '<div style="max-width:900px;margin:0 auto;padding:32px 24px;background:#ECF0F1;">'+body+'</div>' +
      '<div style="text-align:center;padding:12px;background:#1A252F;color:#444;font-size:11px;">© 2015 Tim Shephard · Built with Bootstrap · Designed with ♥</div></div>';
    return { bg:'#ECF0F1', html: html };
  }

  // ── master render ──
  function render() {
    let stageHTML, stageBG;
    if (state.decade === 'now') { stageHTML = renderNow(); stageBG = '#f8f7f4'; }
    else {
      const r = state.decade === '90s' ? renderNineties() : state.decade === '00s' ? renderAughts() : renderTens();
      stageHTML = r.html; stageBG = r.bg;
    }

    const toggle = '<div class="tsa-toggle">' +
      DECADES.map(function (d) {
        const active = state.decade === d.id;
        const style = active ? 'background:' + d.flash + ';border-color:' + d.flash + ';color:' + (d.id==='90s'||d.id==='10s'?'#000':'#fff') + ';' : '';
        return '<button class="tsa-dec' + (active?' active':'') + '" data-dec="' + d.id + '" style="' + style + '">' + d.label + '</button>';
      }).join('') +
      '<span class="sub">' + (DECADES.find(function(d){return d.id===state.decade;})||{}).sub + '</span></div>';

    root.innerHTML =
      '<div class="tsa-flash" id="tsa-flash"></div>' +
      '<div class="tsa-stage" style="background:' + stageBG + ';">' + stageHTML + '</div>' +
      toggle;

    // wire events
    root.querySelectorAll('[data-path]').forEach(function (el) { el.addEventListener('click', function () { selectPath(el.getAttribute('data-path')); }); });
    root.querySelectorAll('[data-fu]').forEach(function (el) { el.addEventListener('click', function () { selectFollowup(el.getAttribute('data-fu')); }); });
    root.querySelectorAll('[data-dec]').forEach(function (el) { el.addEventListener('click', function () { switchDecade(el.getAttribute('data-dec')); }); });
    root.querySelectorAll('[data-url]').forEach(function (el) { el.addEventListener('click', function () { window.location.href = el.getAttribute('data-url'); }); });
    const rb = document.getElementById('tsa-reset'); if (rb) rb.addEventListener('click', reset);

    // typewriter on reveal
    if (state.phase === 'reveal' && state.ai) {
      const introEl = document.getElementById('tsa-intro');
      if (introEl) typewrite(introEl, state.ai.intro, 16);
    }
  }

  render();
})();
