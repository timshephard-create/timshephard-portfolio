# Tim Shephard Portfolio Rebuild — locked production design

PRODUCTION DESIGN (LOCKED): "Night Crew" — a network production floor as the whole site. The floor is a TIME AXIS: the visitor's local clock drives the lighting state (5 keys: dawn 06:58 / morning 09:00 / midday 12:30 / golden 18:40 / overnight 02:40), blended as renderer parameters (smoothstep over solar elevation), never baked per-state. SC.04 THE BENCH is grafted cold from "The Lab": instrument light constant across all keys, steel + engraved plates, Saira Condensed + Fragment Mono, no tape/handwriting inside the boundary line.

TYPE: Big Shoulders 800–900 caps (painted/stenciled display), Courier Prime (all crew data/HUD), Big Shoulders Stencil (crates only). Bench corner only: Saira Condensed + Fragment Mono.

PALETTE: #0B0805 soot, #14100A floor, #F4E9D3 tungsten paper, #FFB45C lamp amber, #6E2C1F oxblood, #B08A4A brass, #FF3B21 tally (signal only, event-driven — means recording, never decorates). Phosphor green #9FE8B4 for screen content only. Daylight ambients: #C7D4E2 dawn, #D9DDD3 morning, #EDEADF midday, #E0A96B golden.

STANDING RULE 1 — GRIT IS INVARIANT: working-floor grit (cables, paper tape, chalk hit-marks, coffee rings, sandbags) survives every lighting state. Daylight reveals it, never cleans it.

STANDING RULE 2 — HUD LIGHT LAW: one ambient-lux threshold, declared once. Below it: HUD renders tungsten-paper/phosphor on dark. At/above it: typed ink on paper/plaster. Tally red invariant across states, event-driven only. Apply everywhere (frames, storyboards, mobile feed, paperwork).

STANDING RULE 3 — TYPE LAW: every glyph is LIVE TYPE (anything the visitor must read — renders as real DOM text in build, never baked) or TEXTURE TYPE (ambient set paint — may bake). LT = all Courier Prime / Fragment Mono / Saira, all phosphor screen content, and any painted-looking figure carrying data (archive counter, stat headlines, title cards, leader frames). TX = Big Shoulders painted wing titles, Stencil crate marks, chalk/tape set dressing. Every frame caption carries a coarse LT/TX index; role table at t4 §4c governs. Hard build requirement; ships in handoff bundle as per-frame manifest.

STANDING RULE 4 — RETAKE NUMBERING: the CUT Nº is the visit; the TAKE is the attempt. RETAKE increments TAKE, never Nº. Old “new cut number” wording struck retroactively from both t1 grammar tables (t5).

FICTION: cut Nº increments per visit; composed overnight (02:00), print struck ~06:51, ships at open; one viewer, no reruns; archive shelves every overnight cut. Interaction verbs: CUT=click, DOLLY=scroll, RACK=hold, WIPE=edge, RETAKE=↻.

GRAMMAR (formalized t4): five verbs boarded as BEFORE→MECHANIC→AFTER contract — CUT=click (0ms, 2 frames leader black, slate re-registers), DOLLY=scroll (scroll=track position, parallax BG ×0.2 / MID ×0.6 / FG ×1.2 declared once), RACK=hold (0.7s film-gate meter, 2 planes per shot, release = fall back at 2×), WIPE=edge (physical flat pushed, 420ms ease-in-out, slate re-registers at seam), RETAKE=↻ (TAKE increments, CUT Nº holds, tally only while tape runs). LEADER BLACK EDGE RULES (t5): 2 frames fixed, never stacks — one gap per 400ms window, cuts inside land hard; omitted entirely under prefers-reduced-motion. THE PULL = STANDARD CASE-STUDY OPEN (t4 §4b): HOLD(rack) → RAIL-OUT (400ms) → LIGHT TABLE → LEADER STRIP = TOC → CUT to play / WIPE to re-can; no modals/rings/scrollbars. PLANE-TAG MAP (t5 §5a, ships in handoff): every dressed element in all six wings carries exactly one parallax tag — FG ×1.2 / MID ×0.6 / BG ×0.2; RACK's two planes per shot are two adjacent tags; The Pull: can MID → rail to FG → light table MID.

BROADCAST FEED (t5 §5b–c): 375×812, the default experience — designed as the film of the site, never a fallback. Overnight = live rushes (tungsten/phosphor), day = the printed edition of the 06:51 print (ink on paper). Five keys express as palette temperature ONLY (no rendered light at 375). Verbs remap to thumb: CUT=tap, DOLLY=scroll (rail at frame right = track), RACK=hold, WIPE=edge swipe (RIGHT edge only — 22px rail + visible tab; left edge yielded to the iOS system back-swipe, never contested), RETAKE one-handed inside bottom-right reach arc. 44px minimum targets. Reel scroll: native momentum + CSS scroll-snap at slate boundaries only — wheel/touch events never intercepted.

FLATS: assets/og-1200x630.png (OG card, recomposed, rim-struck title) + assets/press-still-1920x1080.png (2.39 letterboxed, matte slate) struck from GH-01 via export-og.html / export-press.html (tile-capture + stitch, viewport is ~909×525 so captures must be tiled).

Canvas doc: `Production Designs.dc.html`, turns stack newest-on-top as <section id="tN">. Frames are 768-wide boxes containing 1920-scale sets at transform:scale(.4). Share via super_inline_html → "Production Designs - Review Copy.html".

ROADMAP (in order): 1 depth pass ✓(t3) · 2 grammar storyboard ✓(t4) · 3 broadcast feed ✓(t5) · 4 Edition Zero (paperwork static site).
