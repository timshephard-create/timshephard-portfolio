# CRAFT NOTES — Flagship Homepage

Branch: `homepage-flagship`. Route: `/flagship/`. One concept, all craft.

## The bar (studied)

Sources: Codrops breakdowns of Corentin Bernadou's SOTD portfolio (Swiss grid + WebGL geometry + Lenis + GSAP `power3.out` discipline, grid-rules easter egg), Roman/"creative process" WebGL portfolio (velocity-driven vertex distortion, portal FBOs, `back.out(1.2)` pop-ins, canvas-rendered morphs for 60fps), Joseph Santamaria's scroll-as-camera 3D world, plus Awwwards SOTD portfolio collections. The recurring formula: **one strong art direction + directed motion (never default easing) + performance on real devices.** Winners have a single central mechanic executed obsessively, mono-space annotation layers, custom cursors, loaders with personality, and velocity-aware motion (the page responds to *how* you scroll, not just where).

## Techniques stolen, and where they land here

1. **Single fullscreen shader as art direction** (Bernadou/Samsy) → a raw-WebGL analog-broadcast "signal field": phosphor noise, scanlines, slow drift, vignette. It's the whole page's skin.
2. **Velocity-driven distortion** (Roman's stretch-on-scroll) → scroll velocity feeds a `uVel` uniform: horizontal tracking-error displacement + brightness banding, decaying with ease-out. Motion answers the hand.
3. **Channel-change transition** (section transitions as camera cuts) → entering a new section fires a static burst + vertical-hold roll in the shader and flips the HUD channel counter. Scroll = channel surfing.
4. **Split-char kinetic type** (SOTD staple) → hand-rolled SplitText: chars rise from a masked line with `power4.out` stagger on load and on scroll-enter.
5. **Custom easing discipline** (Bernadou) → nothing linear, nothing default: `power4.out` for type, `expo.out` for panels, `back.out(1.4)` for chips, custom cubic-bezier for CSS.
6. **Loader with personality** → 1.2s SMPTE film-leader countdown (sweep + "3·2·1") that irises out; skipped entirely under reduced-motion; never blocks longer than assets need.
7. **Custom cursor + magnetic CTAs** → viewfinder crosshair cursor; primary CTAs magnetize within 80px, `power3.out` release.
8. **Mono annotation layer** (Swiss/editorial) → fixed HUD: timecode driven by scroll, REC dot, CH 0x / section name, corner brackets. DM Mono, uppercase, tracked.
9. **Art-directed imagery, not stock-dropped** → the Squarespace photos are pre-processed offline into orange-on-ink halftone duotones (canvas pipeline), so every image obeys the palette.

## Concept kill round (5 → 1)

- **A. The Master Shot** — one continuous 3D camera move through rooms of his career. Killed: full 3D set dressing in one session = mediocre everywhere.
- **B. The Signal** — the page is a broadcast: signal-field shader, channels for sections, HUD chrome, halftone imagery, OFF AIR ending. **WINNER.**
- **C. The Edit** — homepage as an NLE timeline with a scrubbing playhead. Killed: reads as software UI, not cinema; niche metaphor.
- **D. The Viewfinder** — everything through a camera HUD with rack-focus. Killed: weaker content structure; the chrome would be the only idea.
- **E. The Proof Sheet** — photographic contact sheet + loupe cursor. Killed: quiet, tasteful — and tasteful is failure this time.

**Why The Signal is true:** Tim's record *is* broadcast — 160,000+ PSA airings, a 4-billion-viewer broadcast he crewed inside, creative that held a signal across 50 states. And the claim "now directing AI" is proven by the page's own construction: a hand-rolled shader, choreographed scroll, zero framework — directed by a CD, built with an AI crew. The page ends OFF AIR, because the next broadcast is the recruiter's.

## Build architecture

- `/flagship/index.html` + `/flagship/assets/{css,js,vendor,fonts,img}`
- Raw WebGL (no three.js — one quad, one fragment shader, ~100 lines), GSAP + ScrollTrigger + Lenis self-hosted in `vendor/`.
- Fonts self-hosted (Barlow Condensed 900i/700, DM Mono 400/500 woff2).
- Fallbacks: no-WebGL → CSS scanline gradient; reduced-motion → static composed page, no Lenis, no loader, no distortion; mobile → same shader, DPR-capped.

## Craft loop log

**Cycle 1** — First shots (Playwright, 375/768/1440, top + scrolled). Verdict: shader field, HUD, proof line all read; **hero name entirely missing**. Diagnosed via DOM probe: not a timing issue — chars frozen at their offset.

**Cycle 2** — Root causes found and fixed:
- *GSAP/CSS transform ownership bug:* the CSS `translateY(115%)` initial state was parsed by GSAP as a pixel `y`, so `yPercent` tweens were no-ops. GSAP now owns `.c` transforms exclusively (set + tween both in JS); CSS only gates visibility pre-split.
- *Images never loaded:* Chrome defers `loading="lazy"` images inside a fully clipped ancestor indefinitely. Local art-directed assets → eager fetch + `decoding="async"`.
- *Ghost-line bleed:* the velocity RGB-split text-shadows sat at 0-offset behind the transparent-fill stroked "SHEPHARD" and showed through as muddy fill. Shadow **alpha** now rides velocity too — fully transparent at rest.
- AA: buttons and HUD hire chip switched to ink-on-hot-orange (5.9:1 at mono sizes). Name scaled to 16.2vw. Custom cursor hidden until first real mousemove.

**Cycle 3** — Typography + chrome:
- *"TIM" chars mashed:* inherited `letter-spacing` computes against the **parent's** font-size (-6.5px meant for 233px type applied to the 135px line). Re-declared locally on the smaller line.
- HUD nav/logo got ink backdrop pills — legible over passing content instead of colliding with it.
- REC indicator hidden ≤900px (collided with nav on mobile).

**Cycle 4** — Full-page verification: PSA count-up lands exactly on 160,000+; channel HUD tracks CH 01→04; off-air SMPTE bars & footer composed at all 3 breakpoints. Fallback battery: reduced-motion = full static composed page (loader skipped, counters final); no-WebGL = CSS scanline field, content intact; keyboard order = skip-link → HUD → CTAs → slates, orange focus rings. Portrait re-encoded 865→419KB.

**Cycle 5** — Hover interference glitch on monitor frames (steps() transform jump — the signal reacts to touch). Full-scroll exercise across every trigger: **zero JS errors, zero failed requests**. Final screenshots committed to `review-shots/`.
