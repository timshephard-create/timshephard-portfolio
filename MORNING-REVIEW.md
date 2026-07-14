# MORNING REVIEW — Flagship Homepage: "THE SIGNAL"

Branch: **`homepage-flagship`** (cut from main; main untouched, nothing pushed or deployed).
Route: **http://localhost:3000/flagship/** · Serve: `npx serve -l 3000 .` from the project root.

## The concept, and why it won the kill round

**The page is a broadcast.** One hand-written WebGL shader — an analog signal field of phosphor grain, scanlines, and a drifting head-switch band — carries the entire page. Scroll velocity feeds the shader (tracking error, brightness lines) and the display type (chromatic RGB-split that appears only while you move). Sections are channels: CH 01 IDENT → CH 02 THE REEL → CH 03 THE RECORD → CH 04 OFF AIR, with a static burst and a HUD channel flip at every boundary. A film-leader 3·2·1 loader opens; SMPTE bars close. All five work images were pre-processed through a custom halftone-duotone pipeline so every pixel obeys the ink/paper/orange palette.

Four concepts died for it: a 3D "master shot" walkthrough (too big to build excellently in one session), an NLE-timeline homepage (reads as software, not cinema), a viewfinder overlay (chrome as the only idea), a contact-sheet-with-loupe (tasteful — which was the failure mode this run banned). The Signal won because it's the one concept where Tim's actual record — 160,000+ PSA airings, a 4-billion-viewer broadcast he crewed inside — *is* the metaphor, and because the closing claim ("now directing AI") is proven by the page's own construction: raw WebGL, hand-rolled split-text, choreographed scroll, no framework.

## The central mechanic

One fragment shader (≈40 lines of GLSL, one fullscreen triangle, no three.js) with four uniforms: time, scroll velocity, channel-change burst, channel temperature. Everything else — type split, monitor-frame clip reveals, parallax, count-ups, magnetic CTAs, viewfinder cursor — orbits that signal so the page feels like one directed system, not a pile of effects.

## Screenshots

Committed in [`review-shots/`](review-shots/): `final-{375,768,1440}.png` (hero), `final-*-y1500.png` (the reel), `final-*-y9000.png` (off air).

## Cycle log (full detail in CRAFT-NOTES.md)

Five cycles, each: shoot 375/768/1440 → look → juror critique → fix → re-shoot. Highlights: a GSAP-vs-CSS transform-ownership bug that silently killed the hero name; Chrome refusing to ever load lazy images inside clipped containers; RGB-split shadows bleeding through stroke-only glyphs; inherited letter-spacing over-tightening the smaller headline line; HUD/content collisions. Every one was found by looking at pixels — none showed up in DOM-level checks. The mandated "fix your eyes first" gate paid for itself.

## Honest SOTD self-score (Awwwards 1–10)

- **Design 7.5** — disciplined palette, coherent chrome, strong type scale; the desktop hero's right half is quiet, and jurors may want one more compositional risk.
- **Usability 8** — 5-second test passes at every breakpoint (name, role, 15+ years, 160K+/$77.5M, Hire button, no scroll); keyboard order is clean with visible focus; reduced-motion gets a complete composed page; no-WebGL gets a CSS signal field; zero console errors.
- **Creativity 7** — *weakest area, named.* The signal mechanic is cohesive and ownable, but it's atmospheric rather than impossible. True SOTD winners usually do one thing that looks unbuildable; this page's shader whispers where a winner's would occasionally shout (e.g., the work imagery living inside the shader and dissolving between channels).
- **Content 8.5** — every number verified against the standing attribution rules (15+ years per live site; 4B labeled "the room he worked in"; $300M/11.9M labeled org outcomes — the labeling is itself a design feature).

## Facts honored

160K+ airings / $77.5M stated directly; $300M and 11.9M always labeled as KAB org outcomes during tenure; Athens 4B framed as scale worked within; 15+ years everywhere (matches live site — note the previous variants run used "20+" from that brief; this run's instruction to use 15+ is what's built).

## With 3 more hours

1. **Put the slates inside the shader** — image textures on the signal plane with static-burst dissolves between them: the channel-change metaphor completed on the work itself. This is the single change most likely to move creativity from 7 to 9.
2. **Sound design, muted by default** — low broadcast hum, a click + burst on channel change, tick on hover. With a visible ON/OFF in the HUD.
3. **Test-card easter egg** — press `T` for an SMPTE test card built from his stats (jurors love discoverable craft), plus OG/meta image and font subsetting for a faster leader.

## Housekeeping

- All work in `/flagship/` + `CRAFT-NOTES.md` + `review-shots/`; no existing page or shared file touched.
- Playwright/npm artifacts live in the session scratchpad, not the repo.
- The dev tooling discovered last run's blocker: the in-app preview pane never fires `requestAnimationFrame`, which is why its screenshots hang — Playwright is the verification path for this repo from now on.
