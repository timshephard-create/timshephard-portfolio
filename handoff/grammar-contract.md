# NIGHT CREW — GRAMMAR CONTRACT
Boards: Production Designs.dc.html t4 (desktop) + t5 (feed). This file is normative; boards are illustrative.

## The five verbs (BEFORE → MECHANIC → AFTER)
- CUT = click/tap. 0 ms. No easing, crossfade or zoom-thru, ever. 2 frames of leader black (83 ms) between any two shots; slate re-registers; TC advances exactly 2 frames.
- DOLLY = scroll. Scroll position IS track position — direct drive, no easing, no snap points on the floor. Parallax rates declared once: BG ×0.2 / MID ×0.6 / FG ×1.2 (see plane-tag-map.json).
- RACK = hold. 0.7 s film-gate meter (brass, never a ring). Exactly two planes per shot (adjacent plane tags). Release early → focus falls back at 2× speed. Soft plane stays at 85% — nothing disappears.
- WIPE = edge. A physical flat pushed across frame: hard seam, drop shadow, 420 ms ease-in-out. Slate re-registers the moment the seam crosses it. Scene order = the floor plan.
- RETAKE = ↻. Sticks close, TAKE increments, CUT Nº holds (Rule 4 — the Nº is the visit, the take is the attempt). Tally red only while tape runs (Rule 2). Clapper interruption: 8 frames.

## Leader-black edge rules
2 frames, fixed, never stacks: one leader gap per 400 ms window; cuts inside the window land hard. Under prefers-reduced-motion the leader is omitted entirely.

## The Pull — standard case-study open (no exceptions)
1 HOLD (RACK isolates the can: neighbors 45%, brass rim) → 2 RAIL-OUT (release; 400 ms ease-out; paper tag = checkout metadata; no modal) → 3 LIGHT TABLE (lid off; only self-lit paper surface) → 4 LEADER STRIP = TOC (CUT a frame to play that chapter) → 5 RUN / RE-CAN (WIPE re-cans; abandoned reels re-shelve at the 02:00 compose).
No modals, no progress rings, no scrollbars.

## Broadcast feed (375×812 — the default experience)
CUT=tap · DOLLY=scroll · RACK=hold · WIPE=edge swipe, RIGHT edge ONLY (22px rail + visible tab; left edge yielded to the iOS system back-swipe, never contested) · RETAKE one-handed inside the bottom-right reach arc. 44px minimum targets.
Reel scroll: native momentum + CSS scroll-snap at slate boundaries only — wheel/touch events never intercepted.
Five lighting keys express as palette temperature ONLY at 375 (no rendered light). Overnight = live rushes (tungsten/phosphor); day = the printed edition of the 06:51 print (ink on paper).

## Light law (Rule 2)
One ambient threshold: 120 lux, declared once. Below: tungsten paper / phosphor on dark. At/above: typed ink on paper/plaster. Tally red (#FF3B21) is event-driven only — it means recording. Email is off the floor: always ink.
