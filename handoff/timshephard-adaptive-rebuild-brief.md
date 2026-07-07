# Creative Brief v3 — timshephard.co Rebuild
## "THE MASTER SHOT" — one continuous scene. You don't browse it, you edit it.

**Prepared for:** Tim Shephard, Creative Mind Ventures LLC
**Pipeline:** This brief → Claude Design (production design + grammar + styleframes) → Claude Fable 5 via Claude Code (build)
**Status:** Direction locked. Supersedes v2. Carries forward the Edition Engine content system; replaces flat composition with a fixed cinematic world + generated per-visitor cut.

---

## 1. The One-Liner

The entire site is one continuous 3D scene — Tim's career as a physical production floor — and the visitor navigates by **editing**: cut, dolly, rack focus, wipe. An AI director composes each visitor's personal cut of the master shot. The set is built once; the film is never the same twice.

**Public claim (literally true):** "No two people have ever seen the same cut of this site."

## 2. The Core Economic Insight

The world (expensive) is fixed. The experience (generated) is data:

- **THE SET** — one 3D scene, built once at design/build time. All the cost, all the craft, zero runtime spend.
- **THE CUT** — a per-visitor Edit Decision List: opening subject, sequence, pacing, framing, slate copy. A few hundred tokens of JSON from Haiku, driving the camera system. Pennies per visit; Fable 5 authors the direction system, not each cut.

## 3. Verified Landscape (July 2026)

Film/video portfolios are universally reels, grids, and scroll pages. Camera-path scrolling exists as a trend. **Editing-verbs-as-navigation does not exist anywhere; AI-directed per-visitor cinematography does not exist anywhere.** Bruno Simon-style "explore a 3D world" is saturated — this is not that: no free roaming, no WASD, no world to get lost in. The camera is always composed; the visitor's power is the editor's power, not the walker's. Concept-to-person fit is airtight: a creative director whose site you navigate by editing.

## 4. The Experience

### 4.1 The Set (fixed)
Tim's career as one physical space — a production floor:

- **The Monitor Wall** — Keep America Beautiful: a bank of CRTs/monitors running the PSA work. Approaching it surfaces the record: 160K+ airings, $77.5M earned media, 4.5M+ GIF views
- **The Records Wing** — federal communications: files, stamps, institutional light
- **The Stage** — global broadcast production: studio floor, rigging, tungsten
- **The Bench** — AI-native ventures mid-assembly (AI Daily Digest, The Other 1776, Candora as machines being built; one machine is visibly building *this site*)
- **The Front Office** — services: the audit desk and the brief desk (see 4.4)
- **The Archive** — shelved reels/tapes: every past visitor's cut, labeled and dated

### 4.2 The Grammar (fixed)
Navigation verbs are editing verbs — no scroll-to-read, no hamburger, no hotspot glow:

- **CUT** (click/tap) — hard cut to the next composed angle/subject
- **DOLLY** (scroll/pinch) — push in/out on the current subject; depth = detail
- **RACK FOCUS** (hover/hold) — pull a background element sharp to discover adjacent work
- **WIPE** (edge drag / key) — move between wings of the set
- **RETAKE** (persistent control) — the AI recomposes your entire cut, live

A persistent minimal HUD carries the slate: `CUT Nº 4,281 · ONE VIEWER · NO RETAKES*  (*unless you press it)` plus timecode and an always-visible "text feed" escape hatch. Grammar is taught by doing: the opening shot performs one cut, one dolly, one rack focus on itself before handing over the controls (≤8 seconds, skippable).

### 4.3 The Director (generated per visitor)
On arrival the engine composes the visitor's EDL: opening subject, sequence order, pacing profile, framing choices, slate copy. Light contextual input (referrer, optional one-line "what brought you here", behavior) steers it. RETAKE regenerates. Every cut is logged to the Archive with number + timestamp — the provenance system from v2 survives intact, now diegetic: the archive shelf IS the edition stamp made physical.

### 4.4 The Working Demos (the business — Fable 5's runtime moments)
Performed in-world at the Front Office, and mirrored as plain forms in Edition Zero:

- **The Audit Desk** — visitor drops their URL → Fable 5 returns a designed mini-audit ("dailies" report) on a set monitor + emailable one-pager. Lead captured with URL and problem attached; full audit is the paid upsell
- **The Brief Desk** — hirer/brand lead describes their challenge → first-take creative territory in Tim's methodology. Lead captured with brief attached
- Gated behind engagement, rate-limited, wired to Formspree → Brevo funnel

### 4.5 Interview Tim
Diegetic: an intercom/talkback channel on the HUD. Grounded in the verified fact base; suggested questions adapt per cut. Static FAQ lives in Edition Zero.

## 5. The Degradation Ladder (non-negotiable)

1. **The Master Shot** — full 3D set + grammar. Desktop and capable mobile, opt-in ("ENTER THE SET") from a fast-loading front door, streamed progressively
2. **The Broadcast Feed** — a designed 2D cinematic cut of the same content and the same EDL: full-bleed frames, hard cuts between sections, slate chrome, same verbs mapped to tap/swipe. Default for mobile, reduced-motion, and low-power. This is a first-class designed experience, not a fallback apology
3. **Edition Zero** — the complete static HTML site. All content, all funnel paths, all service pages. Serves crawlers, no-JS, and anyone who taps "text feed." Owns SEO entirely

## 6. Cost Architecture (verified rates, July 2026)

Fable 5 $10/$50 per MTok · Haiku 4.5 $1/$5 · cache reads 10% of input · batch 50% off.

| Layer | Model | When | ~Cost |
|---|---|---|---|
| Direction system, grammar logic, set build, guardrails | Fable 5 | Build time | One-time |
| Per-visitor EDL (cut composition + slate copy) | Haiku 4.5, cached prefix | Human visits | <$0.01–0.02/visit |
| Pre-generated cut pool | Haiku batch | Nightly | 50% of above |
| Audit Desk / Brief Desk | Fable 5 | Lead events only | $0.10–0.30/event |
| Crawlers/bots | None — Edition Zero | Always | $0 |

Controls: caching, per-session caps, daily ceiling, bot routing, everything behind the locked-down proxy. **Target: $15–40/month at ~1,000 human visits.** Fable 5 runtime spend scales only with leads.

## 7. Attribution Guardrails (enforced in every generation call)

Directly attributable, stated confidently: **160K+ airings, $77.5M earned media, 4.5M+ GIF views**. Organizational outcomes, always labeled: **$300M economic impact, 11.9M participants**. Never the 745M+ impressions figure. KAB never attributed to National CleanUp Day. Gaming = transferable skills and intent only — though this build itself becomes the strongest evidence for the gaming/interactive ambition. Slate copy may rephrase, never invent.

## 8. Design Deliverables (input to Claude Design)

Claude Design's job is **production design**, not page design:

1. **Set styleframes** — the look of each wing: materials, light, atmosphere, camera height. Filmic, tungsten-and-daylight, broadcast-real; not game-y, not low-poly-cute
2. **The grammar spec** — each verb's camera behavior, easing, duration, and sound cue described in film terms
3. **HUD/chrome system** — slate, timecode, verbs legend, RETAKE, talkback; typography does the heavy lifting
4. **The Broadcast Feed** — full 2D design, every section
5. **Edition Zero** — complete static site design
6. Current site system is reference only — full license to reinvent; anything retained must earn its place. Anti-patterns list stands (no gradient blobs, uniform grids, purple-blue, emoji markers)

## 9. Technical Architecture

- Edition Zero: static HTML on existing repo/Vercel — paints first, always
- The Set: Three.js/WebGL behind explicit opt-in; progressive streaming; asset budget disciplined (target <8MB initial set payload, DRACO/KTX2 compression); 60fps target on mid-tier hardware, quality tiers
- EDL service + demos behind the locked proxy (**Phase 0 prerequisite**)
- Cut provenance store (number, timestamp, EDL record) feeding the Archive
- Analytics: GA4 + verb usage, cut records, demo inputs — the demo inputs are market research

## 10. Phasing (each ships independently)

- **0 — Foundation:** proxy lockdown. Claude Design production-design sprint. Fact base compiled
- **1 — Edition Zero:** complete static site, live and effective alone
- **2 — The Broadcast Feed:** the 2D cinematic experience + EDL engine + stamp/archive. *This alone is already an award-caliber, never-seen site*
- **3 — The Set:** the 3D master shot on top of the proven EDL system
- **4 — The Desks + The Run:** working demos, awards submissions, press ("the site you edit")

## 11. Honest Risk Flags

- **Phase 3 is a real production.** A convincing set needs real assets — PSA footage/stills for the monitor wall, textures, sound. Budget scope like a short film, not a webpage. Phases 1–2 de-risk it: the concept, engine, and press claim all work before a single polygon ships
- Set assets requiring KAB footage need usage rights confirmed
- Squarespace CDN images must migrate before any of this references them

## 12. Not Building

Free-roam 3D worlds · WASD/joystick movement · loading screens (streaming + front door instead) · content locked inside canvas · Fable 5 on per-visit duty · scroll-jacking that fights the grammar
